/* ═════════════════════════════════════════════════════════
   progress.js — progress + review store shared by every page.

   Two things are remembered, both in this browser only:
     • done    which units have been completed (shows a ✓ on the
               home tile)
     • misses  items answered wrong in any game, replayed by the
               Review page

   Every page just calls the API below; none of them touch
   localStorage directly. If storage is blocked (private window,
   some file:// setups) everything still works for the current
   page view — it simply isn't remembered.

   API  (window.TeluguProgress)
     complete(unitId, {accuracy, attempts})  mark a unit done
     isComplete(unitId)  → boolean
     doneIds()           → [unitId, …]
     miss({game, key, prompt, answer, note}) record a wrong answer
     review(game, key, gotIt)  Review result; two "got it" in a
                               row clears the item. → {cleared}
     misses()            → items, most-missed first
     missCount()         → number
     clearMisses()       forget all misses
     reset()             forget everything
     onChange(fn)        fn() runs when anything changes (also
                         when another tab / frame changed it)
     persistent          → false if storage is unavailable
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const KEY          = 'telugu.progress.v1';
  const CLEAR_STREAK = 2;           // consecutive "got it" answers that clear a miss

  let memory = null;                // fallback when localStorage is unavailable
  let persistent = true;

  const blank = () => ({ v: 1, done: {}, misses: {} });

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      const s = raw ? JSON.parse(raw) : blank();
      if (!s || typeof s !== 'object' || !s.done || !s.misses) return blank();
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
  // the home page, a game iframe and the Review page never overwrite each other.
  function update(fn) {
    const s = load();
    const out = fn(s);
    save(s);
    return out;
  }

  const idOf = (game, key) => game + '|' + key;

  const api = {
    complete(unitId, info = {}) {
      update(s => {
        const prev = s.done[unitId] || { runs: 0, best: 0 };
        const acc  = Number.isFinite(info.accuracy) ? info.accuracy : null;
        s.done[unitId] = {
          at:   Date.now(),
          runs: prev.runs + 1,
          best: acc === null ? prev.best : Math.max(prev.best, acc),
        };
      });
    },
    isComplete(unitId) { return !!load().done[unitId]; },
    doneIds()          { return Object.keys(load().done); },

    miss({ game, key, prompt, answer, note = '' }) {
      if (!game || key === undefined || key === '') return;
      update(s => {
        const id   = idOf(game, key);
        const prev = s.misses[id];
        s.misses[id] = {
          game, key: String(key), prompt: String(prompt), answer: String(answer), note,
          count:  (prev ? prev.count : 0) + 1,
          streak: 0,
          last:   Date.now(),
        };
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
    reset()       { save(blank()); },

    onChange(fn) {
      root.addEventListener('telugu-progress', fn);   // same page
      root.addEventListener('storage', e => { if (!e.key || e.key === KEY) fn(); });   // other tab / frame
    },

    get persistent() { load(); return persistent; },
    CLEAR_STREAK,
  };

  root.TeluguProgress = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
