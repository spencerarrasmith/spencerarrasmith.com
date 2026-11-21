/* ═════════════════════════════════════════════════════════
   sync.js — logging in, and keeping this browser's progress
   and settings in step with the account's copy, so they are the
   same on every device.

   Load it after progress.js and settings.js, and after the
   PocketBase client (vendor/pocketbase-*.umd.js). It runs only
   in the top window (the home page, which holds every other page
   in its iframe), and only when the app comes from a web server:
   opened as a file, inside a frame, or without the PocketBase
   client, it does nothing and window.TeluguSync is not defined.
   Pages carry on exactly as before; nothing is synced.

   The account server is PocketBase, on the same site at /api/
   (pocketbase/ at the top of the website repo). It keeps one
   record per user in the "progress" collection:
     data  { progress: <TeluguProgress.snapshot()>,
             settings: <TeluguSettings.snapshot()> }

   HOW A SYNC GOES
     read the account's copy → absorb() it into this browser's
     (progress.js and settings.js merge; nothing is lost) → if
     this browser now holds anything the account does not, send
     the whole merged copy back.
   A sync runs: when the page opens, when you log in, 3 seconds
   after any change (a game finished, a Review answer, a setting),
   when the page is shown again, and when the device comes back
   online. Only one runs at a time, across all open tabs. One that
   fails changes nothing here; the next one catches up.

   WHOSE DATA IS IN THIS BROWSER
   telugu.sync.v1 remembers { owner, synced, dirty }: the account
   this browser's data belongs to, when it last synced, and whether
   it has changes the account has not had yet. Logging in merges
   this browser's data into the account, unless it belongs to a
   different account; then it is set aside (forget()) first.
   Logging out empties this browser (the account keeps everything);
   when it still has changes the account has not had, logOut()
   says so and leaves the choice to the page.

   API  (window.TeluguSync)
     loggedIn      true while an account is logged in here
     status        'out' | 'syncing' | 'synced' | 'offline' | 'error'
     name          the name to show: the account's name, or its
                   email when it has none ('' when logged out)
     email
     synced        when the last sync finished (ms; 0 if never)
     logInWith(provider, popup)   'google' … popup: a window the
                   click handler opened with window.open(), before
                   anything else, so no popup blocker stops it
     sendCode(email)              → otpId: a 6-digit code is emailed
     enterCode(otpId, code)       log in with that code
     logOut({ force })            → true once logged out; false if
                   there are changes not yet in the account (call
                   again with force to log out anyway)
     onChange(fn)  fn() runs when the status or the account changes
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  if (root.top !== root || !/^https?:$/.test(root.location.protocol)) return;
  if (!root.PocketBase || !root.TeluguProgress || !root.TeluguSettings) return;

  const P = root.TeluguProgress, S = root.TeluguSettings;
  const META      = 'telugu.sync.v1';
  const DELAY     = 3000;            // ms after a change before it is sent
  const RETRY     = [15e3, 60e3, 300e3];   // after a failed sync: wait this long, then longer

  let pb;
  try { pb = new root.PocketBase(root.location.origin); } catch (e) { return; }   // storage blocked: no logging in
  pb.autoCancellation(false);        // the client would otherwise cancel a request that repeats one still running

  let status = 'out', timer = null, retryTimer = null, failures = 0, applying = false;
  let loggingIn = false;             // a login from this page is under way: adopt() decides what joins the account

  const readMeta  = () => { try { return JSON.parse(root.localStorage.getItem(META)) || {}; } catch (e) { return {}; } };
  const writeMeta = m => { try { root.localStorage.setItem(META, JSON.stringify(m)); } catch (e) { /* nothing to remember it in */ } };
  const patchMeta = m => writeMeta(Object.assign(readMeta(), m));

  const user = () => (pb.authStore.isValid ? pb.authStore.record : null);
  // JSON with every object's keys sorted: the server sends records back that way, so two copies
  // that hold the same thing compare as the same text
  const canon = v => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(n => [n, x[n]])) : x));
  const announce = () => { try { root.dispatchEvent(new root.Event('telugu-sync')); } catch (e) { /* no window */ } };
  const setStatus = s => { if (s !== status) { status = s; } announce(); };

  async function syncNow() {
    const me = user();
    if (!me) { setStatus('out'); return; }
    setStatus('syncing');
    try {
      const col = pb.collection('progress');
      const rec = (await col.getList(1, 1, { skipTotal: true })).items[0];    // the rules hand out only this user's record
      if (rec && rec.data) {
        applying = true;                                                   // these saves are not new changes to send
        try { P.absorb(rec.data.progress); S.absorb(rec.data.settings); } finally { applying = false; }
      }
      const data = { progress: P.snapshot(), settings: S.snapshot() };
      if (!rec) await col.create({ user: me.id, data });
      else if (canon({ progress: P.merge(rec.data && rec.data.progress, null), settings: (rec.data && rec.data.settings) || {} }) !== canon(data))
        await col.update(rec.id, { data });                              // only when the account is missing something
      patchMeta({ owner: me.id, synced: Date.now(), dirty: false });
      failures = 0;
      setStatus('synced');
    } catch (e) {
      applying = false;
      if (e && e.status === 401) { pb.authStore.clear(); setStatus('out'); return; }   // the login has expired
      setStatus(root.navigator.onLine === false ? 'offline' : 'error');
      clearTimeout(retryTimer);
      retryTimer = setTimeout(sync, RETRY[Math.min(failures++, RETRY.length - 1)]);
    }
  }
  // One sync at a time, in all tabs together. A second one waiting behind the first finds nothing new.
  const sync = () => (root.navigator.locks ? root.navigator.locks.request('telugu-sync', syncNow) : syncNow()).catch(() => {});

  function changed() {                                // something was saved here: send it soon
    if (applying) return;
    if (user()) patchMeta({ dirty: true });
    clearTimeout(timer);
    timer = setTimeout(() => { timer = null; sync(); }, DELAY);
  }
  P.onChange(changed);                                // this page, the game in the iframe, and other tabs
  S.onChange(changed);
  root.document.addEventListener('visibilitychange', () => {
    if (!user()) return;
    if (root.document.hidden) { if (timer) { clearTimeout(timer); timer = null; sync(); } }   // leaving: send what is waiting
    else sync();                                                                          // back: fetch what other devices did
  });
  root.addEventListener('online', () => { if (user()) sync(); });
  // A login or logout in another tab. One from this page is left to adopt() and logOut(): a sync
  // started here, the moment the login lands, would send this browser's data to the account before
  // adopt() has checked whose data it is.
  pb.authStore.onChange(() => { announce(); if (loggingIn) return; if (user()) sync(); else setStatus('out'); });

  // Just logged in: this browser's data joins the account, unless it is another account's.
  async function adopt() {
    loggingIn = false;
    const me = user(), owner = readMeta().owner;
    if (owner && owner !== me.id) { applying = true; try { P.forget(); S.forget(); } finally { applying = false; } }
    patchMeta({ owner: me.id, dirty: true });
    announce();
    await sync();
  }

  // An email address gets an account the first time it asks for a code: a code can only log in
  // to an account that already exists. The password is never used (password log-in is off)
  // and never seen; PocketBase only insists that the account has one. At most 71 characters.
  const unusedPassword = () => root.crypto.randomUUID();

  const api = {
    get loggedIn() { return !!user(); },
    get status() { return status; },
    get name()   { const u = user(); return u ? (u.name || u.email || '') : ''; },
    get email()  { const u = user(); return u ? u.email || '' : ''; },
    get synced() { return readMeta().synced || 0; },

    logInWith(provider, popup) {
      if (!popup) return Promise.reject(Object.assign(new Error('The login window was blocked.'), { code: 'blocked' }));
      loggingIn = true;
      const done = pb.collection('users').authWithOAuth2({ provider, urlCallback: url => { popup.location.href = url; } });
      let watch;
      const shut = new Promise((_, reject) => {                       // the window closed without finishing
        watch = setInterval(() => {
          if (!popup.closed) return;
          clearInterval(watch);
          setTimeout(() => reject(Object.assign(new Error('The login window was closed.'), { code: 'closed' })), 5000);
        }, 500);
      });
      const stop = () => { clearInterval(watch); try { popup.close(); } catch (e) { /* already closed */ } };
      return Promise.race([done, shut]).then(() => { stop(); return adopt(); }, e => {
        stop(); loggingIn = false;
        done.then(() => { if (user()) adopt(); }, () => {});            // Google finished after all, just after the window shut
        throw e;
      });
    },

    async sendCode(email) {
      const pw = unusedPassword();
      try { await pb.collection('users').create({ email, password: pw, passwordConfirm: pw }); }
      catch (e) { if (!e || e.status !== 400) throw e; }               // 400: it exists already, or the address is not valid
      return (await pb.collection('users').requestOTP(email)).otpId;
    },
    async enterCode(otpId, code) {
      loggingIn = true;
      try { await pb.collection('users').authWithOTP(otpId, String(code).trim()); }
      catch (e) { loggingIn = false; throw e; }
      await adopt();
    },

    async logOut({ force = false } = {}) {
      if (!user()) return true;
      if (!force && readMeta().dirty) {
        clearTimeout(timer); timer = null;
        await sync();
        if (readMeta().dirty) return false;                            // still not in the account: let the page ask
      }
      clearTimeout(timer); clearTimeout(retryTimer); timer = retryTimer = null;
      pb.authStore.clear();
      applying = true;
      try { P.forget(); S.forget(); } finally { applying = false; }
      writeMeta({});
      setStatus('out');
      return true;
    },

    onChange(fn) { root.addEventListener('telugu-sync', fn); },
  };
  root.TeluguSync = api;

  // Opening the page: renew the login (it lasts 30 days from the last visit), then sync.
  (async () => {
    if (!user()) { setStatus('out'); return; }
    try { await pb.collection('users').authRefresh(); }
    catch (e) { if (e && (e.status === 401 || e.status === 404)) { pb.authStore.clear(); setStatus('out'); return; } }
    sync();
  })();
})(window);
