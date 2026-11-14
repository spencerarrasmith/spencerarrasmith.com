/* ═════════════════════════════════════════════════════════
   telugu-data.js — the single source of truth for letters,
   vowel signs and conjunct clusters. Every page loads this
   file with a script tag (src="telugu-data.js") instead of
   keeping its own copy. Edit data HERE, once.

   FLAGS (one model for the whole app)
     inBook  true if the letter is in the book's set (default).
             false → "extra": ఌ ౡ ఱ and the signs ౢ ౣ.
     rare    true if it is rare in modern Telugu → shows the
             "rare" badge. Independent of inBook: ఋ ౠ ఙ ఞ are in
             the book AND rare.
     core    derived. true → part of the DEFAULT practice set.
             Letters/signs: core = inBook.
             Clusters:      core = inBook && !rare.
             Pages show items with core:false only when their
             "Include extra letters/clusters" box is ticked.

   KEYBOARD  buildKeyboard() draws the letter keyboard (IPA or Telugu
   face) in alphabet order, so pages share one layout.

   Row syntax for letters:  [glyph, ipa, flags?]  flags is a
   string containing 'rare' and/or 'extra'.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // IPA combining marks, spelled out so they survive any editor
  const DENT   = '\u032A';   // ̪  dental
  const SYL    = '\u0329';   // ̩  syllabic
  const NAS    = '\u0303';   // ̃  nasalised
  const VIRAMA = '\u0C4D';   // ్  joins consonants / marks a pure consonant

  const hasFlag = (f, name) => (f || '').split(/\s+/).includes(name);
  const finish  = (o, f) => {
    o.inBook = !hasFlag(f, 'extra');
    o.rare   = hasFlag(f, 'rare');
    o.core   = o.inBook;
    return o;
  };

  /* ── Letters ─────────────────────────────────────────── */
  const L = (kind, cat, rows) =>
    rows.map(([ch, ipa, f]) => finish({ ch, ipa, cat, kind }, f));

  const letters = [
  // Vowels (అచ్చులు)
  ...L('vowel', 'Vowel', [
    ['అ', 'a'],
    ['ఆ', 'aː'],
    ['ఇ', 'i'],
    ['ఈ', 'iː'],
    ['ఉ', 'u'],
    ['ఊ', 'uː'],
    ['ఋ', 'r' + SYL, 'rare'],
    ['ౠ', 'r' + SYL + 'ː', 'rare'],
    ['ఌ', 'l' + SYL, 'rare extra'],
    ['ౡ', 'l' + SYL + 'ː', 'rare extra'],
    ['ఎ', 'e'],
    ['ఏ', 'eː'],
    ['ఐ', 'ai'],
    ['ఒ', 'o'],
    ['ఓ', 'oː'],
    ['ఔ', 'au'],
    ['అం', 'a' + NAS],
    ['అః', 'aʰ'],
  ]),
  // Velars (కంఠ్య)
  ...L('consonant', 'Velar', [
    ['క', 'k'],
    ['ఖ', 'kʰ'],
    ['గ', 'ɡ'],
    ['ఘ', 'ɡʱ'],
    ['ఙ', 'ŋ', 'rare'],
  ]),
  // Palatals (తాలవ్య)
  ...L('consonant', 'Palatal', [
    ['చ', 'tʃ'],
    ['ఛ', 'tʃʰ'],
    ['జ', 'dʒ'],
    ['ఝ', 'dʒʱ'],
    ['ఞ', 'ɲ', 'rare'],
  ]),
  // Retroflexes (మూర్ధన్య)
  ...L('consonant', 'Retroflex', [
    ['ట', 'ʈ'],
    ['ఠ', 'ʈʰ'],
    ['డ', 'ɖ'],
    ['ఢ', 'ɖʱ'],
    ['ణ', 'ɳ'],
    ['ళ', 'ɭ'],
    ['ఱ', 'ɽ', 'rare extra'],
  ]),
  // Dentals (దంత్య)
  ...L('consonant', 'Dental', [
    ['త', 't' + DENT],
    ['థ', 't' + DENT + 'ʰ'],
    ['ద', 'd' + DENT],
    ['ధ', 'd' + DENT + 'ʱ'],
    ['న', 'n'],
  ]),
  // Labials (ఓష్ఠ్య)
  ...L('consonant', 'Labial', [
    ['ప', 'p'],
    ['ఫ', 'pʰ'],
    ['బ', 'b'],
    ['భ', 'bʱ'],
    ['మ', 'm'],
  ]),
  // Approximants (అంతస్థలు)
  ...L('consonant', 'Approx.', [
    ['య', 'j'],
    ['ర', 'r'],
    ['ల', 'l'],
    ['వ', 'ʋ'],
  ]),
  // Fricatives / glottal (ఉష్మలు)
  ...L('consonant', 'Fricative', [
    ['శ', 'ʃ'],
    ['ష', 'ʂ'],
    ['స', 's'],
    ['హ', 'ɦ'],
  ]),
  // The book's 35th consonant: a conjunct (క + ష) counted as a letter
  ...L('conjunct', 'Conjunct', [
    ['\u0C15\u0C4D\u0C37', 'kʂ'],
  ]),
  ];

  /* ── Vowel signs (diacritics) ────────────────────────────
     [sign, ipa key, group, flags?, sound?]
       sign ''    no diacritic (the inherent "a")
       sign ్     virama: a pure consonant, no vowel (key ∅)
       sound      what the sign adds to a syllable; defaults to
                  the ipa key ('' for the pure consonant)        */
  const SIGN_ROWS = [
    ['', 'a', 'Short'],
    ['\u0C3F', 'i', 'Short'],
    ['\u0C41', 'u', 'Short'],
    ['\u0C46', 'e', 'Short'],
    ['\u0C4A', 'o', 'Short'],
    ['\u0C3E', 'aː', 'Long'],
    ['\u0C40', 'iː', 'Long'],
    ['\u0C42', 'uː', 'Long'],
    ['\u0C47', 'eː', 'Long'],
    ['\u0C4B', 'oː', 'Long'],
    ['\u0C48', 'ai', 'Diphthong'],
    ['\u0C4C', 'au', 'Diphthong'],
    ['\u0C43', 'r' + SYL, 'Vocalic', 'rare'],
    ['\u0C44', 'r' + SYL + 'ː', 'Vocalic', 'rare'],
    ['\u0C62', 'l' + SYL, 'Vocalic', 'rare extra'],
    ['\u0C63', 'l' + SYL + 'ː', 'Vocalic', 'rare extra'],
    ['\u0C02', 'a' + NAS, 'Nasal · aspirate'],
    ['\u0C03', 'aʰ', 'Nasal · aspirate'],
    ['\u0C4D', '∅', 'Pure consonant', '', ''],
  ];
  const signs = SIGN_ROWS.map(([sign, ipa, grp, f, sound]) =>
    finish({ sign, ipa, grp, sound: sound === undefined ? ipa : sound }, f));

  /* ── Conjunct clusters ───────────────────────────────────
     Source rows live in CLUSTER_SETS; clusters are built from
     the single consonants above.                              */
  /* Cluster list — edit freely.
     Each row is [category, ...clusters]. A cluster is its consonants
     separated by spaces, so "క ష" is క్ష. A leading * marks it uncommon
     (modern Telugu normally writes these nasal clusters with anusvara ం).
     "= sound" adds a note on how the cluster is usually SPOKEN when that
     differs from its letters (the picks always follow the written letters). */
  const CLUSTER_SETS = [
    ['Double',
      'క క', 'గ గ', 'చ చ', 'జ జ', 'ట ట', 'డ డ', 'త త', 'ద ద', 'న న',
      'ప ప', 'బ బ', 'మ మ', 'ల ల', 'వ వ', 'య య', 'ళ ళ', 'స స'],
    ['Stop + stop',
      'క త', 'ప త', 'ద ధ', 'త థ', 'చ ఛ'],
    ['Stop + sibilant',
      'క ష', 'త స'],
    ['Sibilant + stop',
      'ష ట', 'స త', 'స థ', 'శ చ', 'స క', 'స ప', 'ష ప', 'ష క'],
    ['Nasal',
      'గ న', 'ద మ', 'త మ', 'స న', 'స మ', 'శ న', 'ష ణ', 'హ మ',
      'జ ఞ = ɡɲa',
      '*మ ప', '*మ బ', '*న త', '*న ద', '*ఙ క', '*ఙ గ', '*ఞ చ', '*ఞ జ'],
    ['+ య (ya)',
      'క య', 'గ య', 'త య', 'ద య', 'న య', 'మ య', 'ల య', 'వ య', 'శ య', 'స య', 'హ య'],
    ['+ ర (ra)',
      'క ర', 'గ ర', 'త ర', 'ద ర', 'ప ర', 'బ ర', 'శ ర', 'భ ర'],
    ['+ ల (la)',
      'క ల', 'గ ల', 'ప ల', 'బ ల'],
    ['+ వ (va)',
      'క వ', 'త వ', 'ద వ', 'న వ', 'శ వ', 'స వ'],
    ['ర్ + C (reph)',
      'ర మ', 'ర థ', 'ర త', 'ర గ', 'ర భ', 'ర ష', 'ర వ', 'ర య'],
    ['Three letters',
      'స త ర', 'ష ట ర', 'క ష మ', 'క ష య', 'త స య', '*న ద ర'],
  ];

  const vowels          = letters.filter(l => l.kind === 'vowel');
  const consonants      = letters.filter(l => l.kind === 'consonant');
  const conjunctLetters = letters.filter(l => l.kind === 'conjunct');
  const byCh = new Map(consonants.map(c => [c.ch, c]));

  const clusters = CLUSTER_SETS.flatMap(([cat, ...specs]) => specs.map(spec => {
    const [written, spoken] = spec.split('=').map(s => s.trim());
    const rare  = written.startsWith('*');
    const parts = written.replace('*', '').trim().split(/\s+/).map(ch => {
      const c = byCh.get(ch);
      if (!c) throw new Error('telugu-data: unknown consonant "' + ch + '" in cluster: ' + spec);
      return c;
    });
    const inBook = parts.every(p => p.inBook);
    return {
      parts, cat, rare, inBook,
      glyph:  parts.map(p => p.ch).join(VIRAMA),
      sound:  parts.map(p => p.ipa).join('') + 'a',   // as written
      spoken: spoken || null,                          // as usually said, if different
      core:   inBook && !rare,
    };
  }));

  /* ── Helpers ─────────────────────────────────────────── */

  // Default practice set, or everything when the page's "include extra" box is ticked.
  const pool = (items, includeExtra) => includeExtra ? items : items.filter(i => i.core);

  // Keyboard groups for the letter keyboard, in alphabet order:
  // vowels, then each place of articulation. `letters` holds the items
  // themselves, `ipa` just their phoneme strings.
  const letterGroups = [];
  letters.forEach(l => {
    const lbl = l.cat === 'Vowel' ? 'Vowels' : l.cat;
    let g = letterGroups.find(x => x.lbl === lbl);
    if (!g) letterGroups.push(g = { lbl, ipa: [], letters: [] });
    g.ipa.push(l.ipa);
    g.letters.push(l);
  });

  /* ── Letter keyboard ─────────────────────────────────────
     One keyboard, two faces, built from letterGroups so every
     page lays the alphabet out the same way:

       buildKeyboard(container, {
         face:    'ipa' | 'telugu',     what is printed on the keys
         visible: Set | fn(letter)      letters to show (default: all);
                                        the rest are rendered hidden
         grouped: true | false          true (default): one labelled group
                                        per place of articulation.
                                        false: a single unlabelled block,
                                        like an ordinary keyboard, still
                                        in alphabet order
         onPick:  fn(letter, button)
       })

     Markup:  .kb-group > .kb-label + .kb-row > button.kb-btn
              (Telugu face adds .te; ungrouped has one .kb-group and
              no .kb-label). Each key carries data-ipa and data-ch.
              Styling is left to the page.
     Returns  the buttons, in alphabet order.                      */
  function buildKeyboard(container, opts = {}) {
    const { face = 'ipa', visible, onPick, grouped = true } = opts;
    const doc    = container.ownerDocument;
    const isShown = visible instanceof Set ? l => visible.has(l)
                  : typeof visible === 'function' ? visible
                  : () => true;
    const buttons = [];
    container.innerHTML = '';
    const blocks = grouped ? letterGroups
                           : [{ lbl: null, letters: letterGroups.flatMap(g => g.letters) }];
    blocks.forEach(grp => {
      const g = doc.createElement('div');
      g.className = 'kb-group';
      if (grp.lbl !== null) {
        const lbl = doc.createElement('div');
        lbl.className   = 'kb-label';
        lbl.textContent = grp.lbl;
        g.appendChild(lbl);
      }
      const row = doc.createElement('div');
      row.className = 'kb-row';
      grp.letters.forEach(l => {
        const btn = doc.createElement('button');
        btn.type        = 'button';
        btn.className   = 'kb-btn' + (face === 'telugu' ? ' te' : '');
        btn.textContent = face === 'telugu' ? l.ch : l.ipa;
        btn.dataset.ipa = l.ipa;
        btn.dataset.ch  = l.ch;
        if (!isShown(l)) btn.style.display = 'none';
        btn.addEventListener('click', () => { if (onPick) onPick(l, btn); });
        row.appendChild(btn);
        buttons.push(btn);
      });
      g.appendChild(row);
      container.appendChild(g);
    });
    return buttons;
  }

  // Catch typos while editing the data.
  (function check() {
    const dup = (arr, f, what) => {
      const seen = new Set();
      arr.forEach(x => { const k = f(x); if (seen.has(k)) throw new Error('telugu-data: duplicate ' + what + ' ' + k); seen.add(k); });
    };
    dup(letters, l => l.ch,  'letter');
    dup(letters, l => l.ipa, 'letter ipa');
    dup(signs,   s => s.ipa, 'sign ipa');
    dup(clusters, c => c.glyph, 'cluster');
  })();

  const data = Object.freeze({
    VIRAMA, DENT, SYL, NAS,
    letters, vowels, consonants, conjunctLetters,
    signs, clusterSets: CLUSTER_SETS, clusters,
    letterGroups, pool, buildKeyboard,
  });

  root.TeluguData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);