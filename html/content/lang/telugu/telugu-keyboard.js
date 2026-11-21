/* ═════════════════════════════════════════════════════════
   telugu-keyboard.js — the Telugu keyboard layout, laid out and
   behaving like Gboard's Telugu keyboard, in two forms:

     create()  a keyboard that TYPES Telugu into a text box, for
               pages where the learner writes (the grammar pages,
               to come). Its workbench is training/04_keyboard.html.
               Needs telugu-keyboard.css.
     board()   the answer keys of a practice game (Phonemes,
               Diacritics, Conjuncts, Words), laid out the same way
               so the layout becomes familiar. It is always the
               whole Telugu keyboard, both pages: the game's keys
               where their letters sit, and every other key (the
               vowels in Conjuncts, the digits, space, ⌫ …) drawn
               dimmed and disabled, so the keyboard always looks the
               same. Or, with "Group keyboard phonetically", only the
               game's keys, in labeled groups by sound.
               Styled by game.css (section 5).

   Both need telugu-data.js for the letters, their rare flags,
   and the conjuncts.

   THE LAYOUT  (ROWS): five rows of ten, vowels first, then the
   consonants class by class, as Gboard has them. A letter with no
   place on that page (ఞ, ఁ) is on the second page, behind the
   ౧౨౩ key, with the digits. Both pages keep the same height.
   The extra letters (ఌ ౡ ఱ ౘ ౙ and their signs) are not on the
   keyboard at all: they are bookish or obsolete, and have a
   Reference page of their own.

   HOW create() TYPES  (Unicode is written as it is spelled: a
   consonant, then its vowel sign; ్ joins two consonants)
     • Consonant keys type the consonant (క).
     • Vowel keys type the vowel (అ ఆ ఇ …), unless the text just
       before the caret ends in a consonant with no vowel sign yet.
       Then they type its vowel SIGN, and show the syllable it
       makes: after క the row reads క్ కా కి కీ … (the అ key
       becomes ్, the pure consonant). So కి is క then ఇ.
     • ం and ః always type the sign; their keys show it on the
       letter before (కం), or on a dotted circle (◌ం).
     • A conjunct: క, then ్ (the అ key), then శ gives క్శ. Or
       long-press శ right after క, and choose క్శ from the popup.
       After క్ the consonant keys show the conjunct each makes
       (క్క క్ఖ … క్శ …).
     "Keyboard shows syllables" (the app setting; see
     syllables() below) turns the syllables and conjuncts on the
     keys on; off, the keys keep their own letters and the vowel
     signs show on a dotted circle (◌ి).
   LONG PRESS (a popup above the key; slide to a choice and let go,
   or let go on the key and then tap a choice)
     a consonant   joined to the consonant before the caret (క్శ,
                   when the text ends in క), the consonant on its
                   own with ్ (శ్), and the common conjuncts that
                   start with it (telugu-data.js: శ్న శ్య శ్ర శ్వ …)
     ్ (అ key)     ్ + ZWNJ: a visible ్ that does NOT join, as in
                   ఆన్‌లైన్ (online)
     ⌫             (hold) keeps deleting

   API
     TeluguKeyboard.syllables()
       → the app setting "Keyboard shows syllables" (settings.js;
         true when there is none). Games that print Telugu on their
         keys follow it too, with board()'s relabel().

     TeluguKeyboard.create({ mount, target, longPress, syllableFaces })
       mount          the element the keyboard is drawn in
       target         the <textarea>/<input> it types into
       longPress      ms to hold for a popup (default 300, as Gboard)
       syllableFaces  keys show what they make: vowel keys the
                      syllable (కి), as Gboard does, and after ్ the
                      consonant keys the conjunct (క్శ); false: the
                      bare sign (◌ి) and the letter (శ).
                      Default: syllables()
     → { el, refresh(), set(options), type(text), backspace(), popup }

     TeluguKeyboard.board(container, { keys, grouped, groups, faces, onBack })
       keys     [{ te, label, onPick(key, button), … }], each:
                  te      the letter whose place the key takes on the
                          Telugu keyboard (క, అ, ం, ఞ …). One with no
                          place on either page (క్ష; a game's own key,
                          like Diacritics' ∅) takes the first free
                          symbol place on the second page, after ఁ
                  label   what is printed on the key
                  group   its group when grouped ("Velar", "Vowels" …)
                  vowel   true: drawn in the vowel color
                  telugu  true: a Telugu face (bigger, Telugu font)
                  hidden  true: not in play. Drawn dimmed and disabled
                          at its place; grouped, it is left out
                  data    { name: value } copied onto the button's
                          data- attributes
                  aria    an aria-label, if the face says too little
                  cls     more classes for the button (the page's own styling)
       faces    'telugu' (default) | 'sound': how a dimmed key that is
                not one of the game's (a vowel in Conjuncts) is written:
                its letter, or its sound in the reader's notation, as
                the game's own keys are
       onBack   fn(): makes ⌫ (both pages) a key of the game's, to take
                back the last pick. It is dimmed and does nothing until
                the game turns it on with back(true). Without onBack,
                ⌫ is dimmed for good. (Grouped, there is no ⌫.)
       grouped  false (default): the Telugu keyboard, both pages.
                true: one labeled group per `group`, in `groups` order
                (default: the order the keys first name them), keys
                the same size as in the layout; groups share a line
                while they fit in ten keys
     → { el, buttons, reveal(button), relabel(fn), back(on) }
       reveal   shows the page a button is on (a key lit as the right
                answer may be on the second page)
       relabel  fn(key) → the face to print on it for now, or null for
                its own label (a game's syllable in the making: after
                a first pick క, the keys read క్క క్ఖ …); relabel()
                puts every label back
       back     on: true turns ⌫ on (something to take back), false off
     TeluguKeyboard.reveal(button)   the same, from the button alone

     TeluguKeyboard.context(textBeforeCaret)
       → the consonant (or conjunct) the vowel keys would put a sign
         on, or '' (pure: easy to test)
     TeluguKeyboard.longPressFor(key, textBeforeCaret)
       → [{ face, insert, kind }] the popup's choices
     TeluguKeyboard.ROWS, PAGE2, NUM_ROWS, SIGN_OF
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const VIRAMA = '్', ZWNJ = '‌', DOTTED = '◌';
  const ANUSVARA = 'ం', VISARGA = 'ః', CANDRABINDU = 'ఁ';

  /* ── LAYOUT — Gboard's Telugu page, row by row ── */
  const ROWS = [
    ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ', 'ఎ', 'ఏ'],
    ['ఐ', 'ఒ', 'ఓ', 'ఔ', ANUSVARA, VISARGA, 'క', 'ఖ', 'గ', 'ఘ'],
    ['ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ'],
    ['త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ'],
    ['య', 'ర', 'ల', 'వ', 'ళ', 'శ', 'ష', 'స', 'హ', 'BACK'],
    ['NUM', ',', 'SPACE', '.', 'ENTER'],
  ];
  // The letters with no place on the first page: on the second, with the digits
  const PAGE2 = ['ఞ', CANDRABINDU];
  // Its last two rows are the first page's: ⌫ in the same place, and the same bottom row,
  // with ? and ! just above , and .
  const NUM_ROWS = [
    ['౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯', '౦'],
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    [...PAGE2, '@', '#', '%', '&', '+', '*', '"', "'"],
    ['-', '/', '?', ':', ';', '(', ')', '!', '₹', 'BACK'],
    ['ABC', ',', 'SPACE', '.', 'ENTER'],
  ];
  // What a vowel key types after a consonant. అ adds no sign (the consonant already says a):
  // its key becomes ్, the consonant with no vowel at all.
  const SIGN_OF = {
    'అ': VIRAMA, 'ఆ': 'ా', 'ఇ': 'ి', 'ఈ': 'ీ', 'ఉ': 'ు', 'ఊ': 'ూ',
    'ఋ': 'ృ', 'ౠ': 'ౄ',
    'ఎ': 'ె', 'ఏ': 'ే', 'ఐ': 'ై', 'ఒ': 'ొ', 'ఓ': 'ో', 'ఔ': 'ౌ',
  };
  const LABEL = { NUM: '౧౨౩', ABC: 'అఆ', SPACE: 'తెలుగు', ENTER: '⏎', BACK: '⌫' };

  /* ── TEXT RULES ── */
  const CONS = '[క-హౘ-ౚ]';
  const isConsonant = ch => new RegExp('^' + CONS + '$').test(ch);
  const SYLLABLE_BASE = new RegExp('(?:' + CONS + VIRAMA + ')*' + CONS + '$');
  // A letter (a vowel, or a consonant or conjunct) and its vowel sign, if any, at the end of the text
  const LETTER_END = new RegExp('(?:[అ-ఔౠౡ]|(?:' + CONS + VIRAMA + ')*' + CONS + '[ా-ౌౢౣ]?)$');

  // A consonant (or conjunct) waiting for the next one: the text ends in ్, with no ZWNJ after it
  const JOIN_END = new RegExp('(?:' + CONS + VIRAMA + ')+$');

  // The consonant or conjunct a vowel key would sign: the end of the text, if it is a consonant
  // with nothing after it (కశ → శ; క్శ → క్శ; కా → nothing; క్ → nothing: a vowel can't follow ్).
  function context(before) {
    const m = SYLLABLE_BASE.exec(before || '');
    return m ? m[0] : '';
  }

  const isVowelKey = k => Object.prototype.hasOwnProperty.call(SIGN_OF, k);
  const T = () => root.TeluguData;
  const rareSet = () => {
    const set = new Set();
    const D = T();
    if (D) [...D.letters, ...D.signs].forEach(x => { if (x.rare) set.add(x.ch || x.sign); });
    return set.add(VISARGA).add(CANDRABINDU);
  };

  // The popup's choices for a key held down, given the text before the caret.
  function longPressFor(key, before) {
    const base = context(before), out = [], seen = new Set();
    const add = (face, insert, kind) => { if (!seen.has(face)) { seen.add(face); out.push({ face, insert, kind }); } };
    if (isConsonant(key)) {
      if (base) add(base + VIRAMA + key, VIRAMA + key, 'join');                       // క + శ → క్శ
      add(key + VIRAMA, key + VIRAMA, 'pure');                                       // శ్
      const D = T();
      if (D) D.clusters.filter(c => c.parts[0].ch === key && c.core).forEach(c => add(c.glyph, c.glyph, 'cluster'));
    } else if (key === 'అ' && base) {
      add(base + VIRAMA + ZWNJ, VIRAMA + ZWNJ, 'zwnj');
    }
    return out;
  }

  // What a key types, and how it looks, given the text before the caret
  function keyAction(key, before, syllableFaces) {
    const base = context(before);
    if (isVowelKey(key)) {
      if (!base) return { face: key, insert: key, sign: false };
      const s = SIGN_OF[key];
      return { face: syllableFaces ? base + s : DOTTED + s, insert: s, sign: true };   // the whole syllable: క్శా (the second letter sits under the first)
    }
    if (key === ANUSVARA || key === VISARGA || key === CANDRABINDU) {   // on the letter before, with its vowel sign: కం, కాం, అం
      const on = syllableFaces && (LETTER_END.exec(before || '') || [''])[0];
      return { face: (on || DOTTED) + key, insert: key, sign: true };
    }
    if (syllableFaces && isConsonant(key)) {                            // after క్: the conjunct, క్శ
      const j = JOIN_END.exec(before || '');
      if (j) return { face: j[0] + key, insert: key, sign: false, join: true };
    }
    return { face: key, insert: key, sign: false };
  }

  // The app setting "Keyboard shows syllables" (settings.js): on unless it was turned off
  const syllables = () => !root.TeluguSettings || root.TeluguSettings.get('syllables') !== 'off';

  /* ── THE TYPING KEYBOARD ── */
  function create(opts) {
    const o = Object.assign({ longPress: 300, syllableFaces: syllables() }, opts || {});
    const doc = o.mount.ownerDocument, win = doc.defaultView, target = o.target;
    const RARE = rareSet();
    let layer = 'letters';

    const el = doc.createElement('div');
    el.className = 'tkb';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Telugu keyboard');
    const pages = doc.createElement('div');
    pages.className = 'tkb-pages';
    const pop = doc.createElement('div');
    pop.className = 'tkb-pop';
    pop.hidden = true;
    const preview = doc.createElement('div');
    preview.className = 'tkb-preview';
    preview.hidden = true;
    el.append(pages, pop, preview);
    o.mount.appendChild(el);

    const before = () => target.value.slice(0, target.selectionStart ?? target.value.length);

    // Both pages are drawn, one over the other, so the keyboard is as tall on either; the
    // second page's keys keep their height, and its last two rows (⌫, and the bottom row)
    // sit where the first's do.
    function drawPage(name, rows) {
      const page = doc.createElement('div');
      page.className = 'tkb-page tkb-' + name;
      page.dataset.layer = name;
      rows.forEach((row, r) => {
        const line = doc.createElement('div');
        line.className = 'tkb-row' + (r === rows.length - 1 ? ' tkb-bottom' : '');
        row.forEach(key => {
          const b = doc.createElement('button');
          b.type = 'button';
          b.className = 'tkb-key';
          b.dataset.key = key;
          if (LABEL[key]) { b.classList.add('tkb-fn', 'tkb-' + key.toLowerCase()); b.setAttribute('aria-label', { NUM: 'Digits and more letters', ABC: 'Letters', SPACE: 'Space', ENTER: 'New line', BACK: 'Delete' }[key]); }
          else if (isVowelKey(key) || key === ANUSVARA || key === VISARGA || key === CANDRABINDU) b.classList.add('tkb-vowel');
          if (RARE.has(key)) b.classList.add('tkb-rare');
          line.appendChild(b);
        });
        page.appendChild(line);
      });
      return page;
    }
    pages.append(drawPage('letters', ROWS), drawPage('digits', NUM_ROWS));

    function showLayer() {
      pages.querySelectorAll('.tkb-page').forEach(p => {
        const on = p.dataset.layer === layer;
        p.classList.toggle('on', on);
        p.setAttribute('aria-hidden', String(!on));
        p.querySelectorAll('button').forEach(b => { b.tabIndex = on ? 0 : -1; });
      });
      el.dataset.layer = layer;
    }

    // Each key's face for the text before the caret (vowel keys turn into signs after a consonant)
    function refresh() {
      const b4 = before();
      el.classList.toggle('tkb-signs', !!context(b4));
      el.classList.toggle('tkb-joins', !!(o.syllableFaces && JOIN_END.test(b4)));
      el.querySelectorAll('.tkb-key').forEach(b => {
        const k = b.dataset.key;
        b.textContent = LABEL[k] || keyAction(k, b4, o.syllableFaces).face;
        if (!LABEL[k]) b.setAttribute('aria-label', b.textContent);
      });
    }

    // Type text at the caret (replacing any selection), as a real keystroke would
    function type(text) {
      const s = target.selectionStart ?? target.value.length, e = target.selectionEnd ?? s;
      target.setRangeText(text, s, e, 'end');
      target.dispatchEvent(new win.Event('input', { bubbles: true }));
      refresh();
    }
    // Delete back one code point (a sign, then its letter: as Gboard does), or the selection
    function backspace() {
      const s = target.selectionStart ?? target.value.length, e = target.selectionEnd ?? s;
      if (s !== e) target.setRangeText('', s, e, 'end');
      else if (s > 0) {
        const cut = target.value.codePointAt(s - 2) > 0xFFFF && s >= 2 ? 2 : 1;    // a surrogate pair goes whole
        target.setRangeText('', s - cut, s, 'end');
      }
      target.dispatchEvent(new win.Event('input', { bubbles: true }));
      refresh();
    }

    function press(key) {
      if (key === 'BACK') return backspace();
      if (key === 'NUM' || key === 'ABC') { layer = key === 'NUM' ? 'digits' : 'letters'; return showLayer(); }
      if (key === 'SPACE') return type(' ');
      if (key === 'ENTER') return type('\n');
      type(keyAction(key, before(), o.syllableFaces).insert);
    }

    /* the popup */
    let choices = [], active = -1, tapMode = false;
    function openPopup(btn, list) {
      choices = list; active = 0; tapMode = false;
      pop.innerHTML = list.map((c, i) => `<button type="button" class="tkb-choice${c.kind === 'join' ? ' tkb-join' : ''}" data-i="${i}">${c.face}</button>`).join('');
      pop.style.setProperty('--cols', Math.min(list.length, 6));
      pop.hidden = false;
      const kb = el.getBoundingClientRect(), k = btn.getBoundingClientRect();
      const w = pop.offsetWidth, h = pop.offsetHeight;
      const left = Math.max(0, Math.min(k.left + k.width / 2 - w / 2 - kb.left, kb.width - w));
      pop.style.left = left + 'px';
      pop.style.top = (k.top - kb.top - h - 6) + 'px';
      mark(0);
    }
    function closePopup() { pop.hidden = true; choices = []; active = -1; tapMode = false; }
    function mark(i) {
      active = i;
      pop.querySelectorAll('.tkb-choice').forEach((c, n) => c.classList.toggle('on', n === i));
    }
    function choose(i) { const c = choices[i]; closePopup(); if (c) type(c.insert); }
    const choiceAt = (x, y) => { const hit = doc.elementFromPoint(x, y); return hit && hit.closest && hit.closest('.tkb-choice'); };

    /* the key under the finger, enlarged above it */
    function showPreview(btn) {
      if (btn.classList.contains('tkb-fn')) return;
      preview.textContent = btn.textContent;
      preview.hidden = false;
      const kb = el.getBoundingClientRect(), k = btn.getBoundingClientRect();
      preview.style.left = (k.left - kb.left + k.width / 2) + 'px';
      preview.style.top = (k.top - kb.top) + 'px';
    }

    let held = null, timer = null, repeat = null, popped = false, startX = 0, startY = 0;
    el.addEventListener('pointerdown', e => {
      const choice = e.target.closest('.tkb-choice');
      if (choice) { e.preventDefault(); choose(+choice.dataset.i); return; }              // a tap on a choice (popup left open)
      const btn = e.target.closest('.tkb-key');
      if (!btn || !btn.closest('.tkb-page.on')) return;
      e.preventDefault();                                                                 // keep the caret (and focus) in the text
      if (!pop.hidden) closePopup();
      held = btn; popped = false; startX = e.clientX; startY = e.clientY;
      btn.classList.add('down');
      try { btn.setPointerCapture(e.pointerId); } catch (x) { /* a synthetic event */ }
      const key = btn.dataset.key;
      if (key === 'BACK') {                                                               // hold to keep deleting
        backspace();
        timer = win.setTimeout(() => { repeat = win.setInterval(backspace, 70); }, 450);
        return;
      }
      showPreview(btn);
      const list = layer === 'letters' ? longPressFor(key, before()) : [];
      if (list.length) timer = win.setTimeout(() => { popped = true; preview.hidden = true; openPopup(btn, list); }, o.longPress);
    });
    el.addEventListener('pointermove', e => {
      if (!held || !popped) return;
      const c = choiceAt(e.clientX, e.clientY);
      if (c) { mark(+c.dataset.i); tapMode = false; }
    });
    const end = e => {
      if (!held) return;
      const btn = held, key = btn.dataset.key;
      held = null;
      btn.classList.remove('down');
      win.clearTimeout(timer); win.clearInterval(repeat); timer = repeat = null;
      preview.hidden = true;
      if (e.type === 'pointercancel') { closePopup(); return; }
      if (key === 'BACK') return;
      if (!popped) return press(key);
      const c = choiceAt(e.clientX, e.clientY);
      if (c) return choose(+c.dataset.i);
      const still = Math.hypot(e.clientX - startX, e.clientY - startY) < 12;
      if (still) { tapMode = true; return; }                                             // let go on the key: the popup stays for a tap
      closePopup();                                                                      // slid away from the choices: nothing typed
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    doc.addEventListener('pointerdown', e => { if (!pop.hidden && !el.contains(e.target)) closePopup(); });
    doc.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) closePopup(); });
    el.addEventListener('contextmenu', e => e.preventDefault());                          // a long press is ours, not the browser's

    ['input', 'select', 'click', 'keyup', 'focus'].forEach(t => target.addEventListener(t, () => refresh()));
    doc.addEventListener('selectionchange', () => { if (doc.activeElement === target) refresh(); });

    showLayer();
    refresh();
    return {
      el, refresh, type, backspace,
      set(next) { Object.assign(o, next); refresh(); },
      get popup() { return pop.hidden ? null : { choices: choices.slice(), active, tapMode }; },
    };
  }

  /* ── A GAME'S ANSWER KEYS ── */
  // The places a game's key can take: every letter and sign on the two pages (not the digits,
  // the symbols, or the frame: ⌫ , space . ⏎ ౧౨౩)
  const SPOT2 = new Set([...ROWS.slice(0, 5).flat(), ...PAGE2].filter(k => k !== 'BACK'));

  function board(container, opts) {
    const o = Object.assign({ grouped: false }, opts || {});
    const doc = container.ownerDocument;
    const buttons = [], keyOf = new Map();
    container.innerHTML = '';
    // Print other faces on the keys for now (a syllable in the making: కా, క్శ): fn(key) → a face,
    // or null to keep the key's own label. relabel() with no fn puts every label back.
    const relabel = fn => buttons.forEach(b => {
      const k = keyOf.get(b), face = fn ? fn(k) : null;
      b.textContent = face == null ? k.label : face;
    });
    const el = doc.createElement('div');
    el.className = 'gkb';
    el.dataset.mode = o.grouped ? 'grouped' : 'layout';

    function keyButton(k) {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'kb-btn' + (k.vowel ? ' vk' : '') + (k.telugu ? ' te' : '') + (k.cls ? ' ' + k.cls : '');
      b.textContent = k.label;
      Object.entries(k.data || {}).forEach(([n, v]) => { b.dataset[n] = v; });
      if (k.aria) b.setAttribute('aria-label', k.aria);
      b.addEventListener('click', () => { if (k.onPick) k.onPick(k, b); });
      buttons.push(b);
      keyOf.set(b, k);
      return b;
    }
    // A key of the Telugu keyboard that does nothing in this game: dimmed and disabled, there so
    // the keyboard looks the same everywhere. fn: a frame key (⌫, space …), drawn as the Telugu keyboard draws it
    const off = (fn, face, ch) => {
      const b = doc.createElement('span');
      const vowel = !fn && (isVowelKey(ch) || /[\u0C01-\u0C03]/.test(ch));
      b.className = 'kb-btn gkb-off' + (fn ? ' gkb-fn gkb-' + fn.toLowerCase() : '') + (vowel ? ' vk' : '') + (!fn && o.faces !== 'sound' && /[\u0C00-\u0C7F]/.test(face) ? ' te' : '');
      b.textContent = fn ? LABEL[fn] : face;
      b.setAttribute('aria-hidden', 'true');
      return b;
    };
    const line = cls => { const r = doc.createElement('div'); r.className = 'kb-row' + (cls ? ' ' + cls : ''); return r; };

    if (o.grouped) {
      const order = o.groups ? o.groups.slice() : [];
      o.keys.forEach(k => { if (!k.hidden && !order.includes(k.group)) order.push(k.group); });
      order.forEach(name => {
        const list = o.keys.filter(k => !k.hidden && k.group === name);
        if (!list.length) return;
        const g = doc.createElement('div');
        g.className = 'kb-group';
        g.style.setProperty('--k', Math.min(list.length, 10));      // its width, in keys (game.css)
        const lbl = doc.createElement('div');
        lbl.className = 'kb-label';
        lbl.textContent = name;
        lbl.title = name;                                           // in full, if a narrow group cuts it short
        const row = line('gkb-wrap');
        list.forEach(k => row.appendChild(keyButton(k)));
        g.append(lbl, row);
        el.appendChild(g);
      });
      container.appendChild(el);
      el.__gkb = { reveal() {} };
      return { el, buttons, reveal() {}, relabel, back() {} };
    }

    // The Telugu keyboard, both pages, every place filled: the game's key, or a dimmed one
    const at = new Map(), spare = [];
    o.keys.forEach(k => { if (SPOT2.has(k.te) && !at.has(k.te)) at.set(k.te, k); else spare.push(k); });
    const extras = spare.filter(k => !k.hidden);
    const spareSpots = NUM_ROWS[2].slice(PAGE2.length).concat(NUM_ROWS[3].filter(k => k !== 'BACK'));   // @ # % … then - / ? …
    if (extras.length > spareSpots.length) throw new Error('telugu-keyboard: too many keys with no place: ' + extras.map(k => k.label).join(' '));
    const extraAt = new Map(extras.map((k, i) => [spareSpots[i], k]));
    // A dimmed key's face: its letter (a sign on a dotted circle), or that letter's sound
    const D = T(), bare = ch => (/^[\u0C01-\u0C03]$/.test(ch) ? DOTTED + ch : ch);
    const soundOf = ch => {
      const l = D && (D.letters.find(x => x.ch === ch) || D.letters.find(x => x.ch === 'అ' + ch));   // ం ః: as అం అః
      return l ? D.notation.letter(l) : null;
    };
    const fill = ch => (o.faces === 'sound' && soundOf(ch)) || bare(ch);
    const pages = doc.createElement('div');
    pages.className = 'gkb-pages';
    const flips = [], backs = [];
    let page1, page2;
    const drawPage = (rows, isFirst) => {
      const page = doc.createElement('div');
      page.className = 'gkb-page ' + (isFirst ? 'gkb-letters' : 'gkb-digits');
      rows.forEach((row, r) => {
        const isBottom = r === rows.length - 1;
        const ln = line(isBottom ? 'gkb-bottom' : '');
        row.forEach(ch => {
          if (ch === 'NUM' || ch === 'ABC') {                  // between the pages: the only frame key that works
            const f = doc.createElement('button');
            f.type = 'button';
            f.className = 'kb-btn gkb-fn gkb-flip';
            f.textContent = LABEL[ch];
            f.setAttribute('aria-label', ch === 'NUM' ? 'More keys' : 'Back to the letters');
            f.addEventListener('click', () => show(isFirst ? page2 : page1));
            flips.push(f);
            return ln.appendChild(f);
          }
          if (ch === 'BACK' && o.onBack) {                      // the game's own ⌫: takes back the last pick
            const d = doc.createElement('button');
            d.type = 'button';
            d.className = 'kb-btn gkb-fn gkb-back';
            d.textContent = LABEL.BACK;
            d.setAttribute('aria-label', 'Take back the last pick');
            d.disabled = true;
            d.addEventListener('click', () => o.onBack());
            backs.push(d);
            return ln.appendChild(d);
          }
          const k = (!isFirst && extraAt.get(ch)) || at.get(ch);
          if (k && !k.hidden) return ln.appendChild(keyButton(k));
          ln.appendChild(off(LABEL[ch] ? ch : null, k ? k.label : fill(ch), ch));
        });
        page.appendChild(ln);
      });
      return page;
    };
    page1 = drawPage(ROWS, true);
    page2 = drawPage(NUM_ROWS, false);
    pages.append(page1, page2);
    el.appendChild(pages);
    const anyOn2 = !!page2.querySelector('button:not(.gkb-flip)');
    flips.forEach(f => { f.disabled = !anyOn2; });        // nothing of the game's behind ౧౨౩: it stays, but does nothing

    function show(page) {
      [page1, page2].forEach(p => {
        const on = p === page;
        p.classList.toggle('on', on);
        p.setAttribute('aria-hidden', String(!on));
        p.querySelectorAll('button').forEach(b => { b.tabIndex = on ? 0 : -1; });
      });
    }
    show(page1);
    const reveal = b => { const p = b && b.closest('.gkb-page'); if (p && !p.classList.contains('on')) show(p); };
    el.__gkb = { reveal };
    container.appendChild(el);
    const back = on => backs.forEach(d => { d.disabled = !on; });
    return { el, buttons, reveal, relabel, back };
  }
  const reveal = b => { const g = b && b.closest && b.closest('.gkb'); if (g && g.__gkb) g.__gkb.reveal(b); };

  root.TeluguKeyboard = { create, board, reveal, syllables, context, longPressFor, keyAction, ROWS, PAGE2, NUM_ROWS, SIGN_OF };
  if (typeof module !== 'undefined') module.exports = root.TeluguKeyboard;
})(typeof window !== 'undefined' ? window : globalThis);
