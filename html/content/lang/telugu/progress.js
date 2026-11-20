/* ═════════════════════════════════════════════════════════
   progress.js — progress + review store shared by every page.

   Two things are remembered, both in this browser only:
     • misses  items answered wrong in any game, replayed by the
               Review page
     • runs    every session a game finished, with how it went
               (the statistics charted on the Profile page)

   Every page just calls the API below; none of them touch
   localStorage directly. If storage is blocked (private window,
   some file:// setups) everything still works for the current
   page view — it simply isn't remembered.

   API  (window.TeluguProgress)
     miss({game, key, ask, syllable, note})  record a wrong answer
                         about a Telugu character (see A MISS)
     miss({game, key, prompt, answer, note}) …or about anything else
     review(game, key, gotIt)  Review result; two "got it" in a
                               row clears the item. → {cleared}
     misses()            → items, most-missed first
     missCount()         → number
     clearMisses()       forget all misses
     run(game, {total, correct, attempts, misses, ended, variant})
                         record a finished session (see A RUN)
     runs(game)          → that game's runs, oldest first
     runs()              → { game: [run, …], … }
     runCount()          → number of runs, all games together
     reset()             forget everything, runs and misses alike
                         (the Profile page's "Reset statistics")
     onChange(fn)        fn() runs when anything changes (also
                         when another tab / frame changed it)
     persistent          → false if storage is unavailable

   A MISS  is stored as WHAT was asked, not as the text that was
   on screen, so Review can show it in whichever notation (IPA or
   ISO) the reader has chosen since:
     key       the Telugu character: క, కా, క్ష …
     ask       'telugu'  the card showed the character, the answer
                         is its sound
               'sound'   the card showed the sound, the answer is
                         the character
     syllable  true when the character was shown as a syllable, with
               its own a (Diacritics: క is /ka/; Conjuncts: క్ష is
               /kʂa/), not as the letter (/k/, /kʂ/)
     note      a hint shown with the card (its category)
   Review turns key into a sound with TeluguData.read().
   A whole word (the Words game) is stored the same way: key is the
   word, ask is 'word', note is its meaning. Review writes its sound
   with TeluguData.syllables().
   A lesson whose items are not single characters stores the two
   texts instead: prompt and answer, shown as they are.

   A RUN  is one session played to its end: every card cleared, or
   ended by game over. A session left half way is
   not a run. Stored, oldest first, the last RUN_CAP per game:
     t      when it ended (ms)
     n      cards in the session
     ok     cards cleared (correct answers)
     tries  answers given; tries − ok of them were wrong
     miss   wrong answers, kept only when that is not tries − ok: a
            game whose cards take several answers each (Words: one
            for every sound of a word)
     end    'done' (every card cleared) or 'out' (game over)
     dir    the game's own name for how it was played, if it has
            more than one way ('reverse'); absent otherwise

   STORED FORMAT  v2. v1 kept every miss as prompt/answer text
   ("/k/"); those from the four script games are converted the
   first time they are read. Lesson misses are left as they are.
   Stores written before November 2026 also hold `done` (which
   units had been "completed", for a ✓ on the home page). Nothing
   reads it any more; it is dropped the next time anything is saved.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const KEY          = 'telugu.progress.v1';
  const CLEAR_STREAK = 2;           // consecutive "got it" answers that clear a miss
  const RUN_CAP      = 100;         // runs kept per game (the oldest go first)

  let memory = null;                // fallback when localStorage is unavailable
  let persistent = true;

  const VERSION = 2;
  const blank = () => ({ v: VERSION, misses: {}, runs: {} });

  // v1 → v2: what each script game was asking, by the id it filed misses under.
  // [ask, syllable]
  const V1_GAMES = {
    'phonemes':           ['telugu'],
    'phonemes-reverse':   ['sound'],
    'diacritics':         ['telugu', true],
    'diacritics-reverse': ['sound',  true],
    'conjuncts':          ['telugu', true],
    'conjuncts-reverse':  ['sound',  true],
    'lookalikes':         ['sound'],
  };
  function upgrade(s) {
    Object.values(s.misses).forEach(m => {
      const how = V1_GAMES[m.game];
      if (!how || m.ask) return;
      m.ask = how[0];
      if (how[1]) m.syllable = true;
      delete m.prompt;
      delete m.answer;
    });
    s.v = VERSION;
  }

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      const s = raw ? JSON.parse(raw) : blank();
      if (!s || typeof s !== 'object' || !s.misses || typeof s.misses !== 'object') return blank();
      if (!s.runs || typeof s.runs !== 'object') s.runs = {};         // stored before runs were kept
      delete s.done;                                                   // the ✓ marks of an older version
      if (s.v !== VERSION) {
        upgrade(s);
        root.localStorage.setItem(KEY, JSON.stringify(s));     // once; nothing visible changed, so no event
      }
      return s;
    } catch (e) {
      persistent = false;
      return memory || (memory = blank());
    }
  }

  function save(s) {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(s));
      persistent = true;
    } catch (e) {
      persistent = false;
      memory = s;
    }
    try { root.dispatchEvent(new root.Event('telugu-progress')); } catch (e) { /* no window */ }
  }

  // read → change → write, always against the freshest copy so that
  // the home page, a game iframe, and the Review page never overwrite each other.
  function update(fn) {
    const s = load();
    const out = fn(s);
    save(s);
    return out;
  }

  const idOf = (game, key) => game + '|' + key;

  const api = {
    miss({ game, key, ask, syllable, prompt, answer, note = '' }) {
      if (!game || key === undefined || key === '') return;
      update(s => {
        const id   = idOf(game, key);
        const prev = s.misses[id];
        const m = {
          game, key: String(key), note,
          count:  (prev ? prev.count : 0) + 1,
          streak: 0,
          last:   Date.now(),
        };
        if (ask === 'telugu' || ask === 'sound' || ask === 'word') {   // Telugu text: Review figures out the sound
          m.ask = ask;
          if (syllable) m.syllable = true;
        } else {                                               // anything else: the two texts, as given
          m.prompt = String(prompt);
          m.answer = String(answer);
        }
        s.misses[id] = m;
      });
    },

    review(game, key, gotIt) {
      return update(s => {
        const id = idOf(game, key);
        const m  = s.misses[id];
        if (!m) return { cleared: true };
        if (!gotIt) { m.streak = 0; return { cleared: false }; }
        m.streak++;
        if (m.streak >= CLEAR_STREAK) { delete s.misses[id]; return { cleared: true }; }
        return { cleared: false };
      });
    },

    misses() {
      return Object.values(load().misses)
        .sort((a, b) => b.count - a.count || b.last - a.last);
    },
    missCount()   { return Object.keys(load().misses).length; },
    clearMisses() { update(s => { s.misses = {}; }); },

    run(game, { total, correct, attempts, misses, ended = 'done', variant = '' } = {}) {
      const whole = v => Number.isFinite(v) && v >= 0 ? Math.floor(v) : null;
      const n = whole(total), ok = whole(correct), tries = whole(attempts), wrong = whole(misses);
      if (!game || n === null || ok === null || !tries) return;       // nothing was answered: not a run
      update(s => {
        const r = { t: Date.now(), n, ok: Math.min(ok, tries), tries, end: ended === 'out' ? 'out' : 'done' };
        if (wrong !== null && wrong !== r.tries - r.ok) r.miss = Math.min(wrong, tries);
        if (variant) r.dir = String(variant);
        const list = (Array.isArray(s.runs[game]) ? s.runs[game] : []).concat(r);
        s.runs[game] = list.slice(-RUN_CAP);
      });
    },
    runs(game) {
      const all = load().runs;
      const list = g => (Array.isArray(all[g]) ? all[g].slice() : []);
      if (game !== undefined) return list(game);
      return Object.fromEntries(Object.keys(all).map(g => [g, list(g)]));
    },
    runCount()    { return Object.values(load().runs).reduce((n, l) => n + (Array.isArray(l) ? l.length : 0), 0); },

    reset()       { save(blank()); },

    onChange(fn) {
      root.addEventListener('telugu-progress', fn);   // same page
      root.addEventListener('storage', e => { if (!e.key || e.key === KEY) fn(); });   // other tab / frame
    },

    get persistent() { load(); return persistent; },
    CLEAR_STREAK, RUN_CAP,
  };

  root.TeluguProgress = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
