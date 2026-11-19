/* ═════════════════════════════════════════════════════════
   game-setup.js — the popup a practice game opens before a
   session. It holds every option the game has, top to bottom:
   which direction to play, how many rounds, how many mistakes
   are allowed, and the game's checkboxes (show categories,
   shuffle the keyboard, …). A game that uses it has no ⋮ menu.
   Exposes window.GameSetup. Pairs with game.css (section
   "Session setup"), game-core.js and game-menu.js.

   Usage (create it BEFORE GameMenu.init: the checkboxes live
   in the popup, and game-menu.js looks two of them up by id):

     const setup = GameSetup.create({
       title: 'Phonemes',
       home:  '../index.html',          // where Cancel goes when the page was opened on its own
       direction: ['Telugu → IPA', 'IPA → Telugu'],   // optional: the game plays both ways (forward, reversed)
       options: [                       // the checkboxes, top to bottom; the page reads them by id
         { id: 'show-cat', label: 'Show categories', checked: true,
           note: { id: 'cat-note', text: 'Off while keyboard is shuffled' } },   // a line under the label, hidden to begin with
         { id: 'shuffle-kb', label: 'Shuffle keyboard' },
       ],
       max: () => pool().length,        // how many cards a session can have right now (the slider's top end);
                                        // asked again whenever a checkbox changes
       rounds: () => 40,                // optional: where the slider starts when that is not the top end
                                        // (a game whose usual session is a sample of its cards)
       onStart(v) { reversed = v.reversed; game.start({ size: v.rounds, misses: v.misses }); },
     });
     setup.open({ leave: true });

   open({ leave })
     leave   true the first time: nothing has been played yet, so Cancel leaves
             the lesson (back to Home). Otherwise Cancel only closes the popup.

   onStart(v)
     v.reversed true when the 🔀 button has turned the direction around
     v.rounds   a number, or null for "all of them" (the slider at its top end)
     v.misses   how many mistakes the session allows (3 = the fourth ends it, 0 = the first does),
                or null for unlimited (the slider at its top end)
     All three are remembered for the next open() on this page.
     The checkboxes are ordinary inputs: the page reads $('shuffle-kb').checked as it always did.

   Cancel puts everything back as it was when the popup opened: the direction, the
   sliders, and each checkbox (a checkbox that goes back fires "change", so
   whatever follows it follows it back).

   The popup's parts (ids matter to the tests and to game-menu.js):
     #setup  #setup-cancel  #setup-start
     #setup-dir  #rev-btn                  the direction, and the 🔀 button that turns it around
     #setup-rounds  #setup-rounds-n        slider + text box, kept in step
     #setup-misses  #setup-misses-out      slider + what it says
     #setup-misses-note                    the line under it: "Ends on the 4th mistake"
     the option ids the page gave          one checkbox each, at the right of its row

   GameSetup.current    the popup most recently created on this page
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const MISS_STOPS = 20;                 // the mistakes slider runs 0 … 20, then one more stop: Unlimited

  const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 2nd, 3rd, 4th … 11th, 12th, 13th … 21st
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');

  // One checkbox row: the label on the left, the box at the right edge (under the 🔀 button)
  const optionHTML = o => `
        <label class="menu-opt setup-opt"><span class="menu-txt"><span>${esc(o.label)}</span>${o.note ? `<span class="menu-note" id="${esc(o.note.id)}" hidden>${esc(o.note.text)}</span>` : ''}</span><input type="checkbox" id="${esc(o.id)}"${o.checked ? ' checked' : ''}></label>`;

  const HTML = options => `
    <div class="setup-box" role="dialog" aria-modal="true" aria-labelledby="setup-title">
      <div class="setup-head">
        <button type="button" class="setup-btn" id="setup-cancel">Cancel</button>
        <h2 class="setup-title" id="setup-title"></h2>
        <button type="button" class="setup-btn start" id="setup-start">Start</button>
      </div>
      <div class="setup-body">
        <div class="setup-row" id="setup-dir-row">
          <span class="setup-label" id="setup-dir-label">Direction</span>
          <div class="setup-slide">
            <span class="setup-dir" id="setup-dir" aria-live="polite"></span>
            <button class="rev-btn" id="rev-btn" type="button" aria-pressed="false" aria-label="Reverse direction" title="Reverse direction">🔀</button>
          </div>
        </div>
        <div class="setup-row">
          <label class="setup-label" for="setup-rounds">Number of rounds</label>
          <div class="setup-slide">
            <input type="range" id="setup-rounds" min="1" step="1">
            <input type="number" class="setup-num" id="setup-rounds-n" min="1" step="1" inputmode="numeric" aria-label="Number of rounds">
          </div>
        </div>
        <div class="setup-row">
          <label class="setup-label" for="setup-misses">Allowed mistakes</label>
          <div class="setup-slide">
            <input type="range" id="setup-misses" min="0" max="${MISS_STOPS + 1}" step="1">
            <output class="setup-out" id="setup-misses-out" for="setup-misses"></output>
          </div>
          <div class="setup-note" id="setup-misses-note"></div>
        </div>
        <div class="setup-opts" id="setup-opts">${options.map(optionHTML).join('')}
        </div>
      </div>
    </div>`;

  function create(opts) {
    const { title = '', home = '../index.html', direction = null, options = [], max = () => 1, rounds: usual = null, onStart = () => {} } = opts || {};
    const $ = id => document.getElementById(id);

    const el = document.createElement('div');
    el.className = 'setup';
    el.id = 'setup';
    el.hidden = true;
    el.innerHTML = HTML(options);
    document.body.appendChild(el);
    $('setup-title').textContent = title;
    if (!options.length) $('setup-opts').remove();

    const rounds = $('setup-rounds'), roundsN = $('setup-rounds-n'), misses = $('setup-misses');
    const boxes = options.map(o => $(o.id));
    const values = { reversed: false, rounds: null, misses: null };     // null = all / unlimited
    let chosen = false;                                                 // has Start been pressed yet? Until then the rounds slider shows the usual number
    let leave = false, before = null, rev = false;                      // rev: the direction shown in the popup, not yet started
    let boxesAtOpen = [];

    // Direction: only for a game that plays both ways. 🔀 turns it around; Start makes it so.
    const showDirection = () => {
      if (!direction) return;
      $('setup-dir').textContent = direction[rev ? 1 : 0];
      $('rev-btn').setAttribute('aria-pressed', String(rev));
    };
    if (direction) $('rev-btn').addEventListener('click', () => { rev = !rev; showDirection(); });
    else $('setup-dir-row').remove();

    const top = () => Math.max(1, Math.floor(max()) || 1);
    const clamp = n => Math.min(Number(rounds.max), Math.max(1, Math.round(n) || 1));
    // The number is how many mistakes are let go; the line under the slider says what that
    // means: 0 → "Ends on the first mistake", 3 → "Ends on the 4th mistake".
    const showMisses = () => {
      const n = Number(misses.value), unlimited = n > MISS_STOPS;
      const note = unlimited ? 'Never ends early' : `Ends on the ${n === 0 ? 'first' : ordinal(n + 1)} mistake`;
      $('setup-misses-out').textContent  = unlimited ? 'Unlimited' : misses.value;
      $('setup-misses-note').textContent = note;
      misses.setAttribute('aria-valuetext', `${unlimited ? 'Unlimited' : misses.value}: ${note.toLowerCase()}`);
    };
    // The slider's top end follows the game (a checkbox can add cards). At the top, "all" stays "all".
    function setTop() {
      const was = Number(rounds.max), now = top(), all = Number(rounds.value) >= was;
      rounds.max = roundsN.max = now;
      rounds.value = roundsN.value = all ? now : Math.min(Number(rounds.value), now);
    }

    // The slider and the text box are one value: moving either sets the other.
    rounds.addEventListener('input', () => { roundsN.value = rounds.value; });
    roundsN.addEventListener('input', () => { if (roundsN.value !== '') rounds.value = clamp(Number(roundsN.value)); });
    roundsN.addEventListener('change', () => { roundsN.value = rounds.value = clamp(Number(roundsN.value)); });   // settle on leaving the box
    misses.addEventListener('input', showMisses);
    boxes.forEach(b => b.addEventListener('change', () => { if (!el.hidden) setTop(); }));

    function close() {
      el.hidden = true;
      document.removeEventListener('keydown', onKey, true);
      if (before && before.focus && document.contains(before)) before.focus();
    }

    function start() {
      const n = clamp(Number(roundsN.value === '' ? rounds.value : roundsN.value)), m = Number(misses.value);
      values.reversed = rev;
      values.rounds = n >= Number(rounds.max) ? null : n;
      values.misses = m > MISS_STOPS ? null : m;
      chosen = true;
      close();
      onStart({ reversed: values.reversed, rounds: values.rounds, misses: values.misses });
    }

    function cancel() {
      // Each checkbox back as it was: all of them first, then the news, so that a rule
      // the page keeps between two boxes sees them both restored.
      const changed = boxes.filter((b, i) => b.checked !== boxesAtOpen[i]);
      boxes.forEach((b, i) => { b.checked = boxesAtOpen[i]; });
      changed.forEach(b => b.dispatchEvent(new Event('change', { bubbles: true })));
      close();
      if (!leave) return;
      // Nothing was started: leave the lesson. Inside the app that is the home view of the page around this one.
      if (root.parent && root.parent !== root) { try { root.parent.location.hash = '#/'; return; } catch (e) { /* another site's frame */ } }
      root.location.href = home;
    }

    // Escape cancels and Enter starts; Tab stays inside the popup.
    function onKey(e) {
      if (el.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancel(); }
      else if (e.key === 'Enter' && e.target !== $('setup-cancel') && e.target !== $('rev-btn')) { e.preventDefault(); start(); }
      else if (e.key === 'Tab') {
        const stops = [...el.querySelectorAll('button, input')].filter(x => !x.disabled);
        const first = stops[0], last = stops[stops.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    $('setup-start').addEventListener('click', start);
    $('setup-cancel').addEventListener('click', cancel);

    function open(o) {
      const now = top();
      leave = !!(o && o.leave);
      rounds.max = roundsN.max = now;
      const first = !chosen && usual ? Math.max(1, Math.floor(usual()) || now) : now;      // nothing chosen yet: the game's usual number
      rounds.value = roundsN.value = Math.min(chosen && values.rounds !== null ? values.rounds : first, now);
      misses.value = values.misses === null ? MISS_STOPS + 1 : Math.min(values.misses, MISS_STOPS);
      showMisses();
      rev = values.reversed;
      showDirection();
      boxesAtOpen = boxes.map(b => b.checked);
      before = document.activeElement;
      el.hidden = false;
      document.addEventListener('keydown', onKey, true);
      $('setup-start').focus();                        // Enter starts with what is shown
    }

    const setup = { open, close, el, values, get isOpen() { return !el.hidden; } };
    api.current = setup;
    return setup;
  }

  const api = { create, MISS_STOPS, current: null };
  root.GameSetup = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
