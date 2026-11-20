/* ═════════════════════════════════════════════════════════
   lookalikes-data.js — the lookalike groups: letters (and letters
   with a vowel sign) that are written alike but sound different.
   Needs telugu-data.js loaded first. Used by training/02_lookalike-builder.html and training/03_lookalikes.html.

   BUILT-IN GROUPS   Edit GROUPS below, once. One string per group;
                     spaces are ignored and each item is a letter plus
                     its vowel sign (వు, బౌ) or a conjunct (క్ష), so
                     ఘమవుపు is ఘ · మ · వు · పు.

   YOUR OWN GROUPS   parseCsv(text) reads the file training/02_lookalike-builder.html
                     exports: one group per row, characters separated by
                     commas. A row of two is just a pair.
                     clean(cell) and rows(text) are the reading steps on
                     their own; the builder's import uses them too.

   WHAT AN ITEM IS   { text, ipa, iso, rare, core }
     ipa   its sound. A letter keeps its Phonemes sound (క → k); a
           letter with a sign adds the sign (కా → kaː).
     iso   its ISO 15919 spelling (క → ka, కా → kā). The game shows
           whichever of the two the reader chose on the home page.
     rare  from telugu-data.js: the letter, sign, or cluster is flagged
           rare there (ఙ ఞ ఋ ౠ …), so the badge never needs hand-flagging.
     core  false for extras (ఱ ఌ ౡ ౢ ౣ) and uncommon clusters: the game
           hides these unless "Include extra letters" is checked.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const TD = root.TeluguData || (typeof require === 'function' ? require('./telugu-data.js') : null);
  if (!TD) throw new Error('lookalikes-data: load telugu-data.js first');

  const GROUPS = [
    'అఆలత',
    'ఒఓ బఙ',
    'ఙఞ',
    'చబట',
    'ఔ బౌ',
    'ఇఐణఞ',
    'ళశఖ',
    'నసవప',
    'రఠథద',
    'ఘమవుపు',
    'జ ఓ ఙ',
    'య ఝ రు',
  ];

  const letterBy  = new Map(TD.letters.map(l => [l.ch, l]));
  const isMark    = ch => /[ఀ-ఄా-్ౕౖౢౣ]/.test(ch);
  const isLetter  = ch => { const l = letterBy.get(ch); return !!l && l.kind === 'consonant'; };

  // "వుపు" → ["వు", "పు"]: each mark attaches to the letter before it, and a
  // letter right after a virama joins that letter's cluster (క్ష stays whole).
  function split(str) {
    const out = [];
    let prev = '';
    for (const ch of str.replace(/\s+/g, '')) {
      if (out.length && (isMark(ch) || (prev === TD.VIRAMA && isLetter(ch)))) out[out.length - 1] += ch;
      else out.push(ch);
      prev = ch;
    }
    return out;
  }

  // One character → { text, ipa, iso, rare, core }, or null if we can't give it a
  // sound (digits, stray marks, two vowel signs on one letter, a stack that isn't in
  // the cluster list …). The reading itself is TeluguData.read, shared with Review
  // and the Lookalike Builder; `ipa` and `iso` are the sound in each notation.
  function item(text) {
    const r = TD.read(text);
    return r ? { text: r.text, ipa: r.ipa, iso: r.iso, rare: r.rare, core: r.core } : null;
  }

  // Unique items, in the order given. `skipped` collects what couldn't be read.
  function makeItems(texts, skipped) {
    const seen = new Set(), out = [];
    texts.forEach(t => {
      if (!t || seen.has(t)) return;
      const it = item(t);
      if (it) { seen.add(t); out.push(it); }
      else if (skipped && !skipped.includes(t)) skipped.push(t);
    });
    return out;
  }

  const groups = GROUPS.map((g, i) => {
    const skipped = [], items = makeItems(split(g), skipped);
    if (skipped.length) throw new Error('lookalikes-data: no sound for ' + skipped.join(' ') + ' in group ' + (i + 1));
    return { id: i + 1, items };
  });

  // The builder's CSV → groups. Cells that aren't a letter, letter + sign or
  // conjunct are skipped (and reported); a row that ends up with fewer than two
  // characters is dropped.
  // One CSV cell, cleaned up: spaces, quotes, stray commas, markup characters, and a
  // BOM removed, and the letters in one normal form (NFC) so the same character
  // always compares equal.
  const clean = s => { const t = String(s).replace(/[\s,"'<>&﻿]/g, ''); return t.normalize ? t.normalize('NFC') : t; };
  // A CSV as rows of clean cells; empty cells and blank rows are dropped.
  // Shared with the Lookalike Builder's import, so both read a file the same way.
  const rows = text => String(text).split(/\r?\n/)
    .map(line => line.split(',').map(clean).filter(Boolean))
    .filter(cells => cells.length);
  function parseCsv(text) {
    const skipped = [], out = [];
    const all = rows(text);
    all.forEach(cells => {
      const items = makeItems(cells, skipped);
      if (items.length >= 2) out.push({ id: out.length + 1, items });
    });
    return { groups: out, skipped, rows: all.length };
  }

  const data = Object.freeze({ GROUPS, groups, split, item, clean, rows, parseCsv });
  root.LookalikeData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
