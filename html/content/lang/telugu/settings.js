/* ═════════════════════════════════════════════════════════
   settings.js — app-wide choices, remembered in this browser.
   Exposes window.TeluguSettings. Load it FIRST on a page
   (before units.js and telugu-data.js, which read it).

   The choices are made on the home page (index.html). Every
   other page reads them once, as it loads, so a page opened
   after a change shows the new choice.

   SETTINGS
     notation   how a sound is written everywhere in the app
                  'ipa'  the sound, between slashes      /k/  /kaː/
                  'iso'  the ISO 15919 spelling, plain    ka   kā
                telugu-data.js turns this into TeluguData.notation,
                which is what pages actually use.

   API
     get(name)           → the current value (the default if
                           nothing valid is stored)
     set(name, value)    remember a value; unknown names and
                           values are refused (→ false)
     label(name)         → the short name of the current value
                           ('IPA' / 'ISO')
     options(name)       → [{ value, label, hint, example }, …]
     onChange(fn)        fn() runs when a setting changes (also
                           when another tab or frame changed it)
     persistent          → false if storage is unavailable
     snapshot()          → a copy of every stored choice, to send
     absorb(stored)      take another device's choices if they were
                           made later than this browser's → true if
                           anything here changed
     forget()            back to the defaults, in this browser only
                           (signing out)

   STORED  { notation, _t }. _t is when a choice was last made; a
   store from before it was kept counts as older than any that has
   one, but newer than none at all.

   If storage is blocked (private window, some file:// setups)
   a change lasts for the current page view only.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const KEY = 'telugu.settings.v1';

  // name → { default, options: { value: [label, hint, example] } }
  const SETTINGS = {
    notation: {
      default: 'ipa',
      options: {
        ipa: ['IPA', 'The sound, in the International Phonetic Alphabet, between slashes', '/k/'],
        iso: ['ISO', 'The letter as ISO 15919 spells it in Latin letters', 'ka'],
      },
    },
  };

  let memory = null;                // fallback when localStorage is unavailable
  let persistent = true;

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      const s = raw ? JSON.parse(raw) : {};
      return s && typeof s === 'object' ? s : {};
    } catch (e) {
      persistent = false;
      return memory || (memory = {});
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
    try { root.dispatchEvent(new root.Event('telugu-settings')); } catch (e) { /* no window */ }
  }

  // when the choices in s were made: _t, or 1 for choices stored before _t was kept, or 0 for none
  const stamp = s => (Number.isFinite(+s._t) && +s._t > 0 ? +s._t : Object.keys(s).some(k => k !== '_t') ? 1 : 0);

  const valid = (name, value) => !!SETTINGS[name] && Object.prototype.hasOwnProperty.call(SETTINGS[name].options, value);

  const api = {
    get(name) {
      if (!SETTINGS[name]) return undefined;
      const v = load()[name];
      return valid(name, v) ? v : SETTINGS[name].default;
    },
    set(name, value) {
      if (!valid(name, value)) return false;
      const s = load();
      s[name] = value;
      s._t = Date.now();
      save(s);
      return true;
    },
    label(name) {
      return SETTINGS[name] ? SETTINGS[name].options[api.get(name)][0] : '';
    },
    options(name) {
      return SETTINGS[name]
        ? Object.entries(SETTINGS[name].options).map(([value, [label, hint, example]]) => ({ value, label, hint, example }))
        : [];
    },
    onChange(fn) {
      root.addEventListener('telugu-settings', fn);   // same page
      root.addEventListener('storage', e => { if (!e.key || e.key === KEY) fn(); });   // other tab / frame
    },
    get persistent() { load(); return persistent; },

    snapshot() { return JSON.parse(JSON.stringify(load())); },
    absorb(other) {
      if (!other || typeof other !== 'object' || Array.isArray(other) || stamp(other) <= stamp(load())) return false;
      save(JSON.parse(JSON.stringify(other)));
      return true;
    },
    forget() { save({}); },
  };

  root.TeluguSettings = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
