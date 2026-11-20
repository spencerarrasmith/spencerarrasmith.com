/* ═════════════════════════════════════════════════════════
   telugu-data.js — the single source of truth for letters,
   vowel signs and conjunct clusters. Every page loads this
   file with a script tag (src="telugu-data.js") instead of
   keeping its own copy. Edit data HERE, once.

   FLAGS (one model for the whole app)
     inBook  true if the letter is in the book's set (default).
             false → "extra": ఌ ౡ ఱ ౘ ౙ and the signs ౢ ౣ.
     rare    true if it is rare in modern Telugu → shows the
             "rare" badge. Independent of inBook: ౠ ఙ and ః are in
             the book AND rare.
     core    derived. true → part of the DEFAULT practice set.
             Letters/signs: core = inBook.
             Clusters:      core = inBook && !rare.
             Pages show items with core:false only when their
             "Include extra letters/clusters" box is checked.

   TWO WAYS TO WRITE A SOUND
     ipa   the sound, in IPA: క is k, కా is kaː, క as a syllable is
           kɐ (the inherent vowel is ɐ; ఆ is the open aː). Also the KEY a
           letter or sign is known by inside the games (answers
           are compared by it), whatever is shown on screen.
     iso   the ISO 15919 spelling: క is ka, కా is kā.
   Which one a page SHOWS is the reader's choice on the home page
   (settings.js). Pages never print .ipa or .iso themselves: they
   ask TeluguData.notation, e.g. notation.wrap(notation.letter(l))
   gives "/k/" or "ka". See NOTATION below.

   READING   read(text) gives both spellings of any Telugu character
   (a letter, a letter with a sign, a conjunct), so anything that
   stores a character can show its sound later, in either notation.

   A WORD    syllables(text) splits a whole word into its characters as
   written (అమ్మ is అ + మ్మ), each with the sounds it spells, in order
   (the Words game asks for them one by one). notation.word() writes the
   whole word's sound.

   KEYBOARD  buildKeyboard() draws the letter keyboard (sound or
   Telugu face) in alphabet order, so pages share one layout.

   Row syntax for letters:  [glyph, ipa, iso, flags?]
     iso    for a consonant, the consonant alone (k): the letter's
            own spelling adds the inherent a (ka)
     flags  a string containing 'rare' and/or 'extra'.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  // IPA combining marks, spelled out so they survive any editor
  const DENT   = '\u032A';   // ̪  dental
  // The vowel every consonant carries when it has no sign (క is kɐ): short and
  // higher than ఆ's aː, so the two are not one vowel at two lengths.
  const INHERENT = 'ɐ';
  const VIRAMA = '\u0C4D';   // ్  joins consonants / marks a pure consonant
  // ISO 15919 combining marks. ISO follows the letters; IPA follows the sound,
  // so ఋ is r̥ in ISO but ru in IPA (how Telugu speakers say it).
  const RING   = '\u0325';   // ̥  ring below (r̥, l̥: the vocalic r and l)
  const MACRON = '\u0304';   // ̄  long (r̥̄, l̥̄)

  const hasFlag = (f, name) => (f || '').split(/\s+/).includes(name);
  const finish  = (o, f) => {
    o.inBook = !hasFlag(f, 'extra');
    o.rare   = hasFlag(f, 'rare');
    o.core   = o.inBook;
    return o;
  };

  /* ── Letters ─────────────────────────────────────────── */
  // iso      the letter as ISO 15919 spells it on its own: a, ā … ka, kha … kṣa
  // isoStem  a consonant without its inherent a (k), for building syllables
  //          and clusters; the same as iso for a vowel
  const L = (kind, cat, rows) =>
    rows.map(([ch, ipa, stem, f]) =>
      finish({ ch, ipa, iso: kind === 'vowel' ? stem : stem + 'a', isoStem: stem, cat, kind }, f));

  const letters = [
  // Vowels (అచ్చులు)
  ...L('vowel', 'Vowel', [
    ['అ', INHERENT, 'a'],
    ['ఆ', 'aː', 'ā'],
    ['ఇ', 'i', 'i'],
    ['ఈ', 'iː', 'ī'],
    ['ఉ', 'u', 'u'],
    ['ఊ', 'uː', 'ū'],
    // Taught and written as vowels, said as r or l followed by u
    ['ఋ', 'ru', 'r' + RING],
    ['ౠ', 'ruː', 'r' + RING + MACRON, 'rare'],
    ['ఌ', 'lu', 'l' + RING, 'rare extra'],
    ['ౡ', 'luː', 'l' + RING + MACRON, 'rare extra'],
    ['ఎ', 'e', 'e'],
    ['ఏ', 'eː', 'ē'],
    ['ఐ', 'ai', 'ai'],
    ['ఒ', 'o', 'o'],
    ['ఓ', 'oː', 'ō'],
    ['ఔ', 'au', 'au'],
    // ం is said as the nasal of the consonant after it; on its own (here, and
    // at the end of a word) as m. See NASAL_BEFORE.
    ['అం', INHERENT + 'm', 'aṁ'],
    ['అః', INHERENT + 'ʰ', 'aḥ', 'rare'],
  ]),
  // Velars (కంఠ్య)
  ...L('consonant', 'Velar', [
    ['క', 'k', 'k'],
    ['ఖ', 'kʰ', 'kh'],
    ['గ', 'ɡ', 'g'],
    ['ఘ', 'ɡʱ', 'gh'],
    ['ఙ', 'ŋ', 'ṅ', 'rare'],
  ]),
  // Palatals (తాలవ్య)
  ...L('consonant', 'Palatal', [
    ['చ', 'tʃ', 'c'],
    ['ఛ', 'tʃʰ', 'ch'],
    ['జ', 'dʒ', 'j'],
    ['ఝ', 'dʒʱ', 'jh'],
    ['ఞ', 'ɲ', 'ñ'],                     // nearly always in జ్ఞ, the way q comes in qu
    // Old letters for ts and dz, no longer written (చ and జ took over)
    ['ౘ', 'ts', 'ts', 'rare extra'],
    ['ౙ', 'dz', 'dz', 'rare extra'],
  ]),
  // Retroflexes (మూర్ధన్య)
  ...L('consonant', 'Retroflex', [
    ['ట', 'ʈ', 'ṭ'],
    ['ఠ', 'ʈʰ', 'ṭh'],
    ['డ', 'ɖ', 'ḍ'],
    ['ఢ', 'ɖʱ', 'ḍh'],
    ['ణ', 'ɳ', 'ṇ'],
    ['ళ', 'ɭ', 'ḷ'],
    ['ఱ', 'ɽ', 'ṟ', 'rare extra'],
  ]),
  // Dentals (దంత్య)
  ...L('consonant', 'Dental', [
    ['త', 't' + DENT, 't'],
    ['థ', 't' + DENT + 'ʰ', 'th'],
    ['ద', 'd' + DENT, 'd'],
    ['ధ', 'd' + DENT + 'ʱ', 'dh'],
    ['న', 'n', 'n'],
  ]),
  // Labials (ఓష్ఠ్య)
  ...L('consonant', 'Labial', [
    ['ప', 'p', 'p'],
    ['ఫ', 'pʰ', 'ph'],
    ['బ', 'b', 'b'],
    ['భ', 'bʱ', 'bh'],
    ['మ', 'm', 'm'],
  ]),
  // Approximants (అంతస్థలు)
  ...L('consonant', 'Approx.', [
    ['య', 'j', 'y'],
    ['ర', 'ɾ', 'r'],                     // a single tap, as in Spanish pero
    ['ల', 'l', 'l'],
    ['వ', 'ʋ', 'v'],
  ]),
  // Fricatives / glottal (ఉష్మలు)
  ...L('consonant', 'Fricative', [
    ['శ', 'ʃ', 'ś'],
    ['ష', 'ʂ', 'ṣ'],
    ['స', 's', 's'],
    ['హ', 'ɦ', 'h'],
  ]),
  // The book's 35th consonant: a conjunct (క + ష) counted as a letter
  ...L('conjunct', 'Conjunct', [
    ['\u0C15\u0C4D\u0C37', 'kʂ', 'kṣ'],
  ]),
  ];

  /* ── Vowel signs (diacritics) ────────────────────────────
     [sign, ipa key, iso, group, flags?, sound?]
       sign ''    no diacritic (the inherent vowel, ɐ)
       sign ్     virama: a pure consonant, no vowel (key ∅)
       iso        the sign's own ISO 15919 spelling (ā, ṁ)
       sound      what the sign adds to a syllable, in IPA; defaults
                  to the ipa key ('' for the pure consonant)
     Each sign also gets isoSound, what it adds to a syllable in ISO.
     That is its iso, except for ం and ః: they are written after the
     consonant's own a, so కం is k + aṁ. In IPA ం is kɐm on its own; inside
     a word it takes the place of the next consonant (see NASAL_BEFORE).
     ఁ (the ardhanusvara) is not here: it is silent in modern Telugu and
     shown only on the Reference pages.                               */
  const SIGN_ROWS = [
    ['', INHERENT, 'a', 'Short'],
    ['\u0C3F', 'i', 'i', 'Short'],
    ['\u0C41', 'u', 'u', 'Short'],
    ['\u0C46', 'e', 'e', 'Short'],
    ['\u0C4A', 'o', 'o', 'Short'],
    ['\u0C3E', 'aː', 'ā', 'Long'],
    ['\u0C40', 'iː', 'ī', 'Long'],
    ['\u0C42', 'uː', 'ū', 'Long'],
    ['\u0C47', 'eː', 'ē', 'Long'],
    ['\u0C4B', 'oː', 'ō', 'Long'],
    ['\u0C48', 'ai', 'ai', 'Diphthong'],
    ['\u0C4C', 'au', 'au', 'Diphthong'],
    ['\u0C43', 'ru', 'r' + RING, 'Vocalic'],
    ['\u0C44', 'ruː', 'r' + RING + MACRON, 'Vocalic', 'rare'],
    ['\u0C62', 'lu', 'l' + RING, 'Vocalic', 'rare extra'],
    ['\u0C63', 'luː', 'l' + RING + MACRON, 'Vocalic', 'rare extra'],
    ['\u0C02', INHERENT + 'm', 'ṁ', 'Nasal · aspirate'],
    ['\u0C03', INHERENT + 'ʰ', 'ḥ', 'Nasal · aspirate', 'rare'],
    ['\u0C4D', '∅', '', 'Pure consonant', '', ''],
  ];
  const AFTER_A = '\u0C02\u0C03';       // ం ః
  const signs = SIGN_ROWS.map(([sign, ipa, iso, grp, f, sound]) =>
    finish({ sign, ipa, iso, grp,
             sound:    sound === undefined ? ipa : sound,
             isoSound: sign && AFTER_A.includes(sign) ? 'a' + iso : iso }, f));

  // Each short vowel and its long partner, by IPA. Written out because అ and ఆ differ in
  // quality as well as length (ɐ, aː): a long vowel is not always the short one + ː.
  const LONG_MARK = 'ː';
  const LONG_OF = Object.freeze({
    [INHERENT]: 'aː', 'i': 'iː', 'u': 'uː', 'e': 'eː', 'o': 'oː', 'ru': 'ruː', 'lu': 'luː',
  });
  const longOf = ipa => LONG_OF[ipa] || null;

  // The order of a vowel keyboard: each long vowel right after its short one (a ā · i ī · u ū ·
  // e ē · o ō), as the alphabet itself runs (అ ఆ ఇ ఈ …). SIGN_ROWS lists the five short signs
  // and then the five long ones; the rest (diphthongs, vocalic, ం ః, the pollu) keep their order.
  function shortThenLong(list) {
    const out = [];
    list.forEach(v => {
      if (v.grp === 'Long') return;                       // placed after its short vowel, below
      out.push(v);
      const long = v.grp === 'Short' && list.find(x => x.grp === 'Long' && x.ipa === longOf(v.ipa));
      if (long) out.push(long);
    });
    list.forEach(v => { if (!out.includes(v)) out.push(v); });      // a long vowel with no short one in play
    return out;
  }

  /* ── Digits ──────────────────────────────────────────────
     ౦ – ౯. No game drills them yet; the Lookalike Builder offers
     them as characters to compare.                            */
  const digits = Array.from({ length: 10 }, (_, n) =>
    ({ ch: String.fromCharCode(0x0C66 + n), value: n, kind: 'digit' }));

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
      'జ ఞ = ɡɲɐ',
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

  // How a cluster is described on a card: the class of each consonant, in order
  // ("Nasal + Velar" for ఙ్క). The five class nasals are called Nasal; every other
  // consonant goes by its keyboard group. The set name (cat) can't be shown
  // instead: "+ య (ya)" names one of the letters to be picked.
  const NASALS  = 'ఙఞణనమ';
  const classOf = c => NASALS.includes(c.ch) ? 'Nasal' : c.cat;

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
      classes: parts.map(classOf).join(' + '),
      glyph:  parts.map(p => p.ch).join(VIRAMA),
      sound:  parts.map(p => p.ipa).join('') + INHERENT,   // as written, in IPA
      iso:    parts.map(p => p.isoStem).join('') + 'a',   // as written, in ISO 15919
      spoken: spoken || null,                          // as usually said (IPA), if different
      core:   inBook && !rare,
    };
  }));

  /* ── Helpers ─────────────────────────────────────────── */

  // Default practice set, or everything when the page's "include extra" box is checked.
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

  /* ── NOTATION ────────────────────────────────────────────
     How a sound is written on screen: IPA or ISO 15919. `notation`
     is the one the reader chose on the home page (settings.js; IPA
     when nothing is chosen, or when settings.js isn't loaded).
     notationFor('ipa' | 'iso') gives either one explicitly.

       notation.id     'ipa' | 'iso'
       notation.name   'IPA' | 'ISO'      for titles: "Telugu → IPA"

     The bare text of a sound (no slashes):
       letter(l)        a letter on its own               k      ka
       part(l)          a consonant as one piece of a     k      k
                        syllable or cluster
       inherent         the vowel a bare consonant has    ɐ      a
       sign(g)          what a sign adds to a syllable    aː     ā     ('' for ్)
       syllable(l, g)   consonant + sign                  kaː    kā
       cluster(c)       a conjunct, as written            kʂɐ    kṣa
       piece(p)         one sound of a word (a part from  k  aː     k  ā
                        syllables()). ం is its own key,   ṁ  ◌ʰ    ṁ  ḥ
                        ṁ in both; once a word places it, IPA shows the
                        nasal it is said as (ŋ in పంగ). ః is a mark with
                        nothing under it
       word(syls)       a whole word, from syllables()    ɐmmɐ   amma
       of(x)            anything carrying both spellings: a read() result
                        or a lookalike item

     Ready to show:
       wrap(text)       IPA goes between slashes, ISO is left plain:
                        "/kaː/"  ·  "kā"
       html(text)       the same for a card face, escaped, with the
                        slashes in their own dimmer spans                 */
  const escHtml = s => String(s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function notationFor(id) {
    const iso = id === 'iso';
    return Object.freeze({
      id:       iso ? 'iso' : 'ipa',
      name:     iso ? 'ISO' : 'IPA',
      letter:   l => iso ? l.iso : l.ipa,
      part:     l => iso ? l.isoStem : l.ipa,
      inherent: iso ? 'a' : INHERENT,
      sign:     g => iso ? g.isoSound : g.sound,
      syllable: (l, g) => iso ? l.isoStem + g.isoSound : l.ipa + g.sound,
      cluster:  c => iso ? c.iso : c.sound,
      piece:    p => p.kind === 'c' ? (iso ? p.item.isoStem : p.item.ipa)
                   : p.kind === 'v' ? (iso ? p.item.isoSound : p.item.sound) || '∅'
                   : iso || p.item.sign === ANUSVARA ? (iso ? p.item.iso : p.sound || p.item.iso)
                   : HOLDER + p.item.sound.slice(1),
      word:     syls => syls.map(s => iso ? s.iso : s.ipa).join(''),
      of:       x => iso ? x.iso : x.ipa,
      wrap:     t => iso ? t : '/' + t + '/',
      html:     t => iso ? escHtml(t)
                         : '<span class="sl">/</span>' + escHtml(t) + '<span class="sl">/</span>',
    });
  }
  const chosen   = root.TeluguSettings && root.TeluguSettings.get('notation');
  const notation = notationFor(chosen === 'iso' ? 'iso' : 'ipa');

  /* ── READING A CHARACTER ─────────────────────────────────
     read(text, opts?) → { text, ipa, iso, rare, core, listed, spoken }
                         or null if it can't be given a sound (digits,
                         stray marks, a vowel with a sign, two signs …).

     text   one Telugu character: a letter (క, అం, క్ష), a letter with a
            sign (కా, క్), a conjunct (క్య) or a conjunct with a sign.
     opts.syllable   read a bare consonant as the syllable it is written
                     as: క → kɐ. Without it క is the letter, k (as the
                     Phonemes game shows it). ISO is ka either way.
     opts.any        also read a stack that isn't in the cluster list
                     (three consonants, …), built from its consonants.

     listed  false for such an unlisted stack
     spoken  how a listed cluster is usually said (IPA), when that
             differs from its letters                                */
  const letterBy  = new Map(letters.map(l => [l.ch, l]));
  const clusterBy = new Map(clusters.map(c => [c.glyph, c]));
  const signBy    = new Map(signs.filter(g => g.sign !== '').map(g => [g.sign, g]));

  function read(text, opts = {}) {
    const chars = [...String(text)];
    for (let k = chars.length; k >= 1; k--) {                 // longest known letter / cluster first
      const base = chars.slice(0, k).join('');
      const letter = letterBy.get(base), cluster = letter ? null : clusterBy.get(base);
      if (!letter && !cluster) continue;
      const rest = chars.slice(k);
      if (rest.length > 1) break;
      const sign = rest.length ? signBy.get(rest[0]) : null;
      if (rest.length && !sign) break;
      if (sign && letter && letter.kind === 'vowel') return null;     // a vowel can't take a sign
      const it = letter || cluster;
      let ipa, iso;
      if (letter && !sign) {                                          // క → k · ka   (syllable: kɐ · ka)
        ipa = letter.ipa + (opts.syllable && letter.kind !== 'vowel' ? INHERENT : '');
        iso = letter.iso;
      } else if (letter) {                                            // కా → kaː · kā
        ipa = letter.ipa + sign.sound;
        iso = letter.isoStem + sign.isoSound;
      } else if (!sign) {                                             // క్య → kjɐ · kya
        ipa = cluster.sound;
        iso = cluster.iso;
      } else {                                                        // క్యా → kjaː · kyā
        ipa = cluster.sound.slice(0, -INHERENT.length) + sign.sound;
        iso = cluster.iso.replace(/a$/, '') + sign.isoSound;
      }
      return {
        text: String(text), ipa, iso,
        rare: !!it.rare || !!(sign && sign.rare),
        core: !!it.core && (!sign || sign.core),
        listed: true,
        spoken: cluster && !sign ? cluster.spoken : null,
      };
    }
    if (!opts.any) return null;

    // An unlisted stack: consonants joined by ్, then at most one sign or a final ్
    const parts = [];
    let sign = null, virama = false;
    for (const ch of chars) {
      const l = letterBy.get(ch);
      if (l && l.kind === 'consonant' && !sign && (virama || !parts.length)) { parts.push(l); virama = false; }
      else if (ch === VIRAMA && parts.length && !sign && !virama) virama = true;
      else if (signBy.has(ch) && parts.length && !sign && !virama) sign = signBy.get(ch);
      else return null;
    }
    if (!parts.length) return null;
    return {
      text: String(text),
      ipa:  parts.map(p => p.ipa).join('')     + (sign ? sign.sound    : virama ? '' : INHERENT),
      iso:  parts.map(p => p.isoStem).join('') + (sign ? sign.isoSound : virama ? '' : 'a'),
      rare: parts.some(p => p.rare) || !!(sign && sign.rare),
      core: parts.every(p => p.core) && (!sign || sign.core),
      listed: false,
      spoken: null,
    };
  }

  /* ── READING A WORD ──────────────────────────────────────
     syllables(text) → [{ text, parts, ipa, iso }, …], one entry per
                       character as it is written, or null when the text
                       holds anything that can't be read (a digit, a
                       stray sign, a space).

     A written character (an akshara) is a vowel letter, or one or more
     consonants joined by ్ (a conjunct) with their vowel; either can
     carry ం or ః after it. So అమ్మ is అ + మ్మ, పుస్తకం is పు + స్త + కం.

     parts  the sounds the character spells, in the order they are said:
              { kind: 'c', key, item }   a consonant (item: its letter)
              { kind: 'v', key, item }   the vowel   (item: its SIGN; the
                                         consonant's own a is the sign '';
                                         a vowel letter gives the sign of
                                         the same sound; a final ్ gives
                                         the pollu, key ∅: no vowel)
              { kind: 'm', key, item, sound? }   ం or ః  (item: its sign;
                                         for ం, sound is the nasal it is
                                         said as here, in IPA)
            key is the item's ipa: what a keyboard key is known by.
            క్ష is two consonants here (k, ʂ), as on the Conjuncts page.
     ipa, iso   the whole character's sound in each notation. ం is said as
            the nasal of the next character's first consonant (NASAL_BEFORE:
            పంగ is pɐŋ + gɐ, పండు pɐɳ + ɖu), and as m before any other sound
            or at the end of the word (కొం → kom). ISO writes ṁ for all of them. */
  const HOLDER   = '\u25CC';                                   // ◌  stands in for the vowel under a mark shown alone
  const ANUSVARA = '\u0C02';                                   // ం
  const MARKS    = new Set(AFTER_A);                           // ం ః

  // The nasal ం is said as before each consonant: the one made in the same place. Before
  // any other letter (య ర ల వ శ ష స హ ళ ఱ), or with nothing after it, ం is m.
  const NASAL_BEFORE = new Map(Object.entries({
    'ŋ': 'కఖగఘఙ', 'ɲ': 'చఛజఝఞ', 'ɳ': 'టఠడఢణ', 'n': 'తథదధనౘౙ', 'm': 'పఫబభమ',
  }).flatMap(([nasal, cs]) => [...cs].map(c => [c, nasal])));
  const nasalBefore = c => (c && NASAL_BEFORE.get(c.ch)) || 'm';
  const noSign   = signs.find(g => g.sign === '');             // the consonant's own a
  const pollu    = signs.find(g => g.sign === VIRAMA);
  const signFor  = new Map(signs.filter(g => g !== pollu && !MARKS.has(g.sign)).map(g => [g.ipa, g]));   // by sound
  const vowelCh  = new Map(vowels.filter(l => [...l.ch].length === 1).map(l => [l.ch, signFor.get(l.ipa)]));

  // A vowel's sound with its marks after it: ం as the nasal it is said as, ః as a breath (ʰ)
  const marked = (sound, marks, nasal) => marks.reduce((t, m) =>
    t + (m.sign === ANUSVARA ? nasal : m.sound.slice(INHERENT.length)), sound);

  function syllables(text) {
    const chars = [...String(text)];
    const out = [];
    let i = 0;
    while (i < chars.length) {
      const start = i, cons = [];
      let vowel = null;
      if (vowelCh.has(chars[i])) vowel = vowelCh.get(chars[i++]);            // a vowel letter stands alone
      else {
        while (byCh.has(chars[i])) {                                         // consonant (్ consonant)*
          cons.push(byCh.get(chars[i++]));
          if (chars[i] === VIRAMA && byCh.has(chars[i + 1])) i++; else break;
        }
        if (!cons.length) return null;
        if (chars[i] === VIRAMA) { vowel = pollu; i++; }
        else if (signBy.has(chars[i]) && !MARKS.has(chars[i])) vowel = signBy.get(chars[i++]);
        else vowel = noSign;
      }
      const marks = [];
      while (MARKS.has(chars[i]) && vowel !== pollu) marks.push(signBy.get(chars[i++]));
      if (!vowel || marks.length > 2) return null;
      out.push({ text: chars.slice(start, i).join(''), cons, vowel, marks });
    }
    if (!out.length) return null;

    // Now that the next character is known, ం can be given the nasal it is said as
    return out.map(({ text, cons, vowel, marks }, k) => {
      const nasal = nasalBefore(out[k + 1] && out[k + 1].cons[0]);
      return {
        text,
        parts: [
          ...cons.map(c => ({ kind: 'c', key: c.ipa, item: c })),
          { kind: 'v', key: vowel.ipa, item: vowel },
          ...marks.map(m => m.sign === ANUSVARA ? { kind: 'm', key: m.ipa, item: m, sound: nasal }
                                                : { kind: 'm', key: m.ipa, item: m }),
        ],
        ipa:  cons.map(c => c.ipa).join('')     + marked(vowel.sound, marks, nasal),
        iso:  cons.map(c => c.isoStem).join('') + vowel.iso + marks.map(m => m.iso).join(''),
      };
    });
  }

  /* ── Letter keyboard ─────────────────────────────────────
     One keyboard, two faces, built from letterGroups so every
     page lays the alphabet out the same way:

       buildKeyboard(container, {
         face:    'sound' | 'telugu',   what is printed on the keys.
                                        'sound' is the letter in the
                                        reader's notation (k · ka);
                                        'ipa' still works and means
                                        the same
         text:    fn(letter)            optional: print this instead
                                        (e.g. notation.part for keys
                                        that are pieces of a syllable)
         visible: Set | fn(letter)      letters to show (default: all);
                                        the rest are rendered hidden
         grouped: true | false          true (default): one labeled group
                                        per place of articulation.
                                        false: a single unlabeled block,
                                        like an ordinary keyboard, still
                                        in alphabet order
         order:   [letter, …]           only with grouped:false: the order
                                        to lay the keys out in (e.g. a
                                        shuffled copy of letters). Default:
                                        alphabet order
         skipHidden: true | false       false (default): letters that are
                                        not `visible` are still rendered,
                                        just display:none. true: they are
                                        left out entirely, and a group left
                                        with no keys is dropped (so a page
                                        can show e.g. consonants only)
         onPick:  fn(letter, button)
       })

     Markup:  .kb-group > .kb-label + .kb-row > button.kb-btn
              (Telugu face adds .te; ungrouped has one .kb-group and
              no .kb-label). Each key carries data-ipa and data-ch.
              Styling is left to the page.
     Returns  the buttons, in alphabet order.                      */
  function buildKeyboard(container, opts = {}) {
    const { face = 'sound', text, visible, onPick, grouped = true, order, skipHidden = false } = opts;
    const label = text || (face === 'telugu' ? l => l.ch : notation.letter);
    const doc    = container.ownerDocument;
    const isShown = visible instanceof Set ? l => visible.has(l)
                  : typeof visible === 'function' ? visible
                  : () => true;
    const buttons = [];
    container.innerHTML = '';
    const blocks = grouped ? letterGroups
                           : [{ lbl: null, letters: order || letterGroups.flatMap(g => g.letters) }];
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
        if (skipHidden && !isShown(l)) return;
        const btn = doc.createElement('button');
        btn.type        = 'button';
        btn.className   = 'kb-btn' + (face === 'telugu' ? ' te' : '');
        btn.textContent = label(l);
        btn.dataset.ipa = l.ipa;
        btn.dataset.ch  = l.ch;
        if (!isShown(l)) btn.style.display = 'none';
        btn.addEventListener('click', () => { if (onPick) onPick(l, btn); });
        row.appendChild(btn);
        buttons.push(btn);
      });
      if (skipHidden && !row.childNodes.length) return;   // nothing to show in this group
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
    // ISO has to tell everything apart too, or a sound shown in ISO would have two answers
    dup(letters, l => l.iso, 'letter iso');
    dup(signs,   g => g.isoSound, 'sign iso');
    dup(clusters, c => c.sound, 'cluster sound');
    dup(clusters, c => c.iso,   'cluster iso');
    // (క్ష is both a cluster and a letter: the same character, so the same spelling is right.
    // ౘ and త్స are both tsa: kept for now, as they are never drilled in the same game.)
    const SAME_ISO = new Set(['\u0C24\u0C4D\u0C38']);         // త్స
    const single = new Map(letters.map(l => [l.iso, l.ch]));
    clusters.forEach(c => { if (single.has(c.iso) && single.get(c.iso) !== c.glyph && !SAME_ISO.has(c.glyph)) throw new Error('telugu-data: cluster ' + c.glyph + ' is spelled like the letter ' + single.get(c.iso) + ' in ISO: ' + c.iso); });
  })();

  const data = Object.freeze({
    VIRAMA, DENT, RING, MACRON, LONG_MARK, INHERENT, ANUSVARA,
    letters, vowels, consonants, conjunctLetters,
    signs, longOf, shortThenLong, nasalBefore, digits, clusterSets: CLUSTER_SETS, clusters,
    notation, notationFor, read, syllables,
    letterGroups, pool, buildKeyboard,
  });

  root.TeluguData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
