/* ═════════════════════════════════════════════════════════
   lookalikes-data.js — the lookalike groups: letters (and letters
   with a vowel sign) that are written alike but sound different.
   Needs telugu-data.js loaded first. Used by alphabet/04_lookalike-builder.html and alphabet/05_lookalikes.html.

   BUILT-IN GROUPS   Edit GROUPS below, once. One string per group;
                     spaces are ignored and each item is a letter plus
                     its vowel sign (వు, బౌ) or a conjunct (క్ష), so
                     ఘమవుపు is ఘ · మ · వు · పు.

   YOUR OWN GROUPS   parseCsv(text) reads the file alphabet/04_lookalike-builder.html
                     exports: one group per row, characters separated by
                     commas. A row of two is just a pair.

   WHAT AN ITEM IS   { text, ipa, rare, core }
     ipa   the sound the game shows. A letter keeps its Phonemes sound
           (క → k); a letter with a sign adds the sign (కా → kaː).
     rare  from telugu-data.js: the letter, sign or cluster is flagged
           rare there (ఙ ఞ ఋ ౠ …), so the badge never needs hand-flagging.
     core  false for extras (ఱ ఌ ౡ ౢ ౣ) and uncommon clusters: the game
           hides these unless "Include extra letters" is ticked.
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
  const clusterBy = new Map(TD.clusters.map(c => [c.glyph, c]));
  const signBy    = new Map(TD.signs.filter(s => s.sign !== '').map(s => [s.sign, s]));
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

  // One character → { text, ipa, rare, core }, or null if we can't give it a sound
  // (digits, stray marks, two vowel signs on one letter …).
  function item(text) {
    const chars = [...text];
    for (let k = chars.length; k >= 1; k--) {                 // longest known letter / cluster first
      const base = chars.slice(0, k).join('');
      const letter = letterBy.get(base), cluster = letter ? null : clusterBy.get(base);
      if (!letter && !cluster) continue;
      const rest = chars.slice(k);
      if (rest.length > 1) return null;
      const sign = rest.length ? signBy.get(rest[0]) : null;
      if (rest.length && !sign) return null;
      if (sign && letter && letter.kind === 'vowel') return null;     // a vowel can't take a sign
      const bare = letter ? letter.ipa : cluster.sound;               // క → k   ·   క్ష letter → kʂ   ·   cluster → kʂa
      const stem = (!letter && sign) ? bare.replace(/a$/, '') : bare;
      return {
        text,
        ipa:  stem + (sign ? sign.sound : ''),
        rare: !!(letter || cluster).rare || !!(sign && sign.rare),
        core: !!(letter || cluster).core && (!sign || sign.core),
      };
    }
    return null;
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
  const clean = s => { const t = String(s).replace(/[\s"'<>&﻿]/g, ''); return t.normalize ? t.normalize('NFC') : t; };
  function parseCsv(text) {
    const skipped = [], out = [];
    let rows = 0;
    String(text).split(/\r?\n/).forEach(line => {
      const cells = line.split(',').map(clean).filter(Boolean);
      if (!cells.length) return;
      rows++;
      const items = makeItems(cells, skipped);
      if (items.length >= 2) out.push({ id: out.length + 1, items });
    });
    return { groups: out, skipped, rows };
  }

  const data = Object.freeze({ GROUPS, groups, split, item, parseCsv });
  root.LookalikeData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
