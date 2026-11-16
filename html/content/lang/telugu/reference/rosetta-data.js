/* ═════════════════════════════════════════════════════════
   rosetta-data.js — the content of the Rosetta Stone page:
   for every letter and vowel sign, its ISO 15919 spelling, a
   Telugu word that uses it, and an English word that sounds like it.
   The IPA, the letter list and the categories come from
   telugu-data.js (single source of truth); this file only adds what
   that file doesn't have. Needs telugu-data.js loaded first.

   ENTRY
     iso     ISO 15919 transliteration of the letter or sign
     word    [Telugu, ISO 15919, English meaning]   or null
     eng     [English word, short note]             or null
     note    what to know about this one (rarity, spelling), or ''

   WORDS ARE ONLY GIVEN WHERE THEY EXIST
     A few letters are theoretical or archaic: they are in the script and in
     Sanskrit grammar tables but no everyday Telugu word spells with them.
     Those have word: null and a note saying so, rather than an invented
     example. Words marked "classical spelling" are real words whose modern
     spelling uses ం instead of ఙ / ఞ.

   ISO 15919 follows the letters, not the sound: ం is ṁ even where it is said
   as n, ṅ or m. The "eng" matches are approximate; English has no exact
   equivalent for the aspirates, retroflexes or the dental stops.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const TD = root.TeluguData || (typeof require === 'function' ? require('./telugu-data.js') : null);
  if (!TD) throw new Error('rosetta-data: load telugu-data.js first');

  const R = 'r̥', RR = 'r̥̄', L = 'l̥', LL = 'l̥̄';   // ring below, as ISO 15919 writes it

  /* ── Letters (keyed by the letter, as in telugu-data.js) ─ */
  const letters = {
    // Vowels
    'అ': { iso: 'a',  word: ['అమ్మ', 'amma', 'mother'],         eng: ['cut',    'short, open vowel, like the u of cup, not the a of cat'] },
    'ఆ': { iso: 'ā',  word: ['ఆవు', 'āvu', 'cow'],              eng: ['father', 'the same vowel, held twice as long'] },
    'ఇ': { iso: 'i',  word: ['ఇల్లు', 'illu', 'house'],         eng: ['sit',    'short i'] },
    'ఈ': { iso: 'ī',  word: ['ఈగ', 'īga', 'fly'],              eng: ['feet',   'long ee'] },
    'ఉ': { iso: 'u',  word: ['ఉడుత', 'uḍuta', 'squirrel'],      eng: ['put',    'short u, never the u of cup'] },
    'ఊ': { iso: 'ū',  word: ['ఊరు', 'ūru', 'town, village'],    eng: ['moon',   'long oo'] },
    'ఋ': { iso: R,    word: ['ఋషి', R + 'ṣi', 'sage, seer'],     eng: ['rookie', 'a Sanskrit vowel; spoken in Telugu much like “ru”, classically a syllabic r'],
           note: 'Found in Sanskrit loanwords.' },
    'ౠ': { iso: RR,   word: null, eng: null,
           note: 'The long form of ఋ. It belongs to Sanskrit grammar tables and a few Sanskrit names; no everyday Telugu word uses it.' },
    'ఌ': { iso: L,    word: null, eng: null,
           note: 'A syllabic l, in the script and in Sanskrit grammar only. No Telugu word uses it, so there is no example to give.' },
    'ౡ': { iso: LL,   word: null, eng: null,
           note: 'The long form of ఌ. Theoretical: it appears in letter tables, not in any word.' },
    'ఎ': { iso: 'e',  word: ['ఎలుక', 'eluka', 'mouse, rat'],     eng: ['bed',    'short e'] },
    'ఏ': { iso: 'ē',  word: ['ఏనుగు', 'ēnugu', 'elephant'],     eng: ['say',    'long e, pure: stop before the y-glide English adds'] },
    'ఐ': { iso: 'ai', word: ['ఐదు', 'aidu', 'five'],            eng: ['eye',    'a diphthong, a gliding into i'] },
    'ఒ': { iso: 'o',  word: ['ఒకటి', 'okaṭi', 'one'],           eng: ['obey',   'short, pure o, with no w-glide'] },
    'ఓ': { iso: 'ō',  word: ['ఓడ', 'ōḍa', 'boat, ship'],        eng: ['go',     'long o, pure: drop the w-glide of English go'] },
    'ఔ': { iso: 'au', word: ['ఔషధం', 'auṣadhaṁ', 'medicine'],   eng: ['cow',    'a diphthong, gliding into u'] },
    'అం': { iso: 'aṁ', word: ['అంగడి', 'aṁgaḍi', 'shop'],        eng: ['sang',   'ం nasalises the vowel; before గ and క it sounds like the ng of sang'] },
    'అః': { iso: 'aḥ', word: ['దుఃఖం', 'duḥkhaṁ', 'sorrow'],      eng: ['ahh',    'a light puff of breath after the vowel'],
            note: 'ః appears in Sanskrit-origin words.' },

    // Velars
    'క': { iso: 'k',  word: ['కాకి', 'kāki', 'crow'],           eng: ['sky',    'k with no puff of air after it'] },
    'ఖ': { iso: 'kh', word: ['ముఖం', 'mukhaṁ', 'face'],         eng: ['kit',    'k with a puff of air'] },
    'గ': { iso: 'g',  word: ['గాడిద', 'gāḍida', 'donkey'],      eng: ['go',     'plain g'] },
    'ఘ': { iso: 'gh', word: ['ఘంట', 'ghaṁṭa', 'bell'],          eng: ['doghouse', 'g with a breathy release: say “dog house” in one breath'] },
    'ఙ': { iso: 'ṅ',  word: ['అఙ్గము', 'aṅgamu', 'limb, part'],  eng: ['sing',   'the ng sound'],
           note: 'Classical spelling: modern Telugu writes అంగము with ం, so ఙ is rare on its own.' },
    // Palatals
    'చ': { iso: 'c',  word: ['చేప', 'cēpa', 'fish'],            eng: ['church', 'before a, o and u it is often said more like “ts”'] },
    'ఛ': { iso: 'ch', word: ['ఛాయ', 'chāya', 'shade, shadow'],   eng: ['catch her', 'ch with a puff of air'] },
    'జ': { iso: 'j',  word: ['జింక', 'jiṁka', 'deer'],          eng: ['jug',    'before a, o and u it is often said more like “dz”'] },
    'ఝ': { iso: 'jh', word: ['ఝరి', 'jhari', 'stream, waterfall'], eng: ['hedgehog', 'j with a breathy release: “hedge hog” in one breath'] },
    'ఞ': { iso: 'ñ',  word: ['అఞ్జలి', 'añjali', 'offering with cupped hands'], eng: ['canyon', 'the ny sound'],
           note: 'Classical spelling: modern Telugu writes అంజలి with ం.' },
    // Retroflexes
    'ట': { iso: 'ṭ',  word: ['టోపీ', 'ṭōpī', 'hat, cap'],       eng: ['top',    'curl the tongue tip back; English t is the nearest sound'] },
    'ఠ': { iso: 'ṭh', word: ['ఠీవి', 'ṭhīvi', 'stately bearing'], eng: ['hothouse', 'ట with a puff of air, tongue still curled back'] },
    'డ': { iso: 'ḍ',  word: ['డబ్బు', 'ḍabbu', 'money'],         eng: ['dog',    'tongue tip curled back'] },
    'ఢ': { iso: 'ḍh', word: ['ఢంకా', 'ḍhaṁkā', 'large drum'],    eng: ['mad house', 'డ with a breathy release, tongue curled back'] },
    'ణ': { iso: 'ṇ',  word: ['వీణ', 'vīṇa', 'veena (a stringed instrument)'], eng: ['barn', 'n with the tongue tip curled back; no exact English match'] },
    'ళ': { iso: 'ḷ',  word: ['కళ్ళు', 'kaḷḷu', 'eyes'],          eng: ['bell',   'an l with the tongue curled back; no exact English match'] },
    'ఱ': { iso: 'ṟ',  word: null, eng: ['butter', 'a rolled or tapped r, like ర'],
           note: 'Found only in older printed texts; modern Telugu writes ర. No modern word to give.' },
    // Dentals
    'త': { iso: 't',  word: ['తల', 'tala', 'head'],             eng: ['tea',    'tongue against the teeth, no puff of air'] },
    'థ': { iso: 'th', word: ['కథ', 'katha', 'story'],           eng: ['hothead', 'త with a puff of air, tongue against the teeth'] },
    'ద': { iso: 'd',  word: ['దారి', 'dāri', 'road, path'],     eng: ['day',    'tongue against the teeth'] },
    'ధ': { iso: 'dh', word: ['ధనం', 'dhanaṁ', 'wealth'],        eng: ['good hat', 'ద with a breathy release'] },
    'న': { iso: 'n',  word: ['నీరు', 'nīru', 'water'],          eng: ['noon',   'plain n'] },
    // Labials
    'ప': { iso: 'p',  word: ['పిల్లి', 'pilli', 'cat'],          eng: ['spin',   'p with no puff of air'] },
    'ఫ': { iso: 'ph', word: ['ఫలం', 'phalaṁ', 'fruit'],         eng: ['pin',    'p with a puff of air; not an f'] },
    'బ': { iso: 'b',  word: ['బంతి', 'baṁti', 'ball'],          eng: ['bat',    'plain b'] },
    'భ': { iso: 'bh', word: ['భూమి', 'bhūmi', 'earth, land'],   eng: ['clubhouse', 'b with a breathy release'] },
    'మ': { iso: 'm',  word: ['మామిడి', 'māmiḍi', 'mango'],       eng: ['mom',    'plain m'] },
    // Approximants
    'య': { iso: 'y',  word: ['యాత్ర', 'yātra', 'journey, pilgrimage'], eng: ['yes', 'plain y'] },
    'ర': { iso: 'r',  word: ['రాత్రి', 'rātri', 'night'],        eng: ['butter', 'a quick tap of the tongue, like the tt of American butter'] },
    'ల': { iso: 'l',  word: ['లోతు', 'lōtu', 'depth'],          eng: ['leaf',   'a light l'] },
    'వ': { iso: 'v',  word: ['వంద', 'vaṁda', 'hundred'],        eng: ['wave',   'between English w and v: lips barely touch the teeth'] },
    // Fricatives
    'శ': { iso: 'ś',  word: ['శరీరం', 'śarīraṁ', 'body'],        eng: ['ship',   'sh'] },
    'ష': { iso: 'ṣ',  word: ['కష్టం', 'kaṣṭaṁ', 'hardship, difficulty'], eng: ['ship', 'sh with the tongue curled back; in everyday speech it sounds like శ'] },
    'స': { iso: 's',  word: ['సూర్యుడు', 'sūryuḍu', 'sun'],      eng: ['sun',    'plain s'] },
    'హ': { iso: 'h',  word: ['హంస', 'haṁsa', 'swan'],           eng: ['behind', 'a light, voiced h'] },
    // Conjunct counted as a letter
    'క్ష': { iso: 'kṣ', word: ['పక్షి', 'pakṣi', 'bird'],        eng: ['bookshop', 'k and sh run together'] },
  };

  /* ── Vowel signs (keyed by the sign; '' is "no sign") ───── */
  const signs = {
    '':       { iso: 'a',  word: ['కల', 'kala', 'dream'],                 eng: ['cut',   'with no sign, the consonant carries a short a'] },
    'ి': { iso: 'i',  word: ['కిటికీ', 'kiṭikī', 'window'],           eng: ['sit',   'short i'] },
    'ు': { iso: 'u',  word: ['కుక్క', 'kukka', 'dog'],                eng: ['put',   'short u'] },
    'ె': { iso: 'e',  word: ['కెరటం', 'keraṭaṁ', 'wave'],             eng: ['bed',   'short e'] },
    'ొ': { iso: 'o',  word: ['కొండ', 'koṁḍa', 'hill'],                eng: ['obey',  'short, pure o'] },
    'ా': { iso: 'ā',  word: ['కాకి', 'kāki', 'crow'],                 eng: ['father', 'long a'] },
    'ీ': { iso: 'ī',  word: ['చీమ', 'cīma', 'ant'],                   eng: ['feet',  'long ee'] },
    'ూ': { iso: 'ū',  word: ['కూర', 'kūra', 'curry, vegetable dish'], eng: ['moon',  'long oo'] },
    'ే': { iso: 'ē',  word: ['కేక', 'kēka', 'shout, cry'],            eng: ['say',   'long e, pure'] },
    'ో': { iso: 'ō',  word: ['కోడి', 'kōḍi', 'hen'],                  eng: ['go',    'long o, pure'] },
    'ై': { iso: 'ai', word: ['మైదానం', 'maidānaṁ', 'ground, field'],   eng: ['eye',   'a diphthong'] },
    'ౌ': { iso: 'au', word: ['గౌరవం', 'gauravaṁ', 'respect'],          eng: ['cow',   'a diphthong'] },
    'ృ': { iso: R,    word: ['కృష్ణుడు', 'k' + R + 'ṣṇuḍu', 'Krishna'], eng: ['rookie', 'said “kru” in Telugu'],
                note: 'Found in Sanskrit loanwords and names.' },
    'ౄ': { iso: RR,   word: null, eng: null,
                note: 'The long form of ృ. Theoretical: it appears in tables of signs, not in everyday words.' },
    'ౢ': { iso: L,    word: null, eng: null,
                note: 'The sign form of ఌ. Theoretical: no word uses it.' },
    'ౣ': { iso: LL,   word: null, eng: null,
                note: 'The sign form of ౡ. Theoretical: no word uses it.' },
    'ం': { iso: 'ṁ',  word: ['చందమామ', 'caṁdamāma', 'the moon'],       eng: ['candy', 'ం becomes the nasal of the next consonant: n before ద, ng before క or గ, m before ప or బ'] },
    'ః': { iso: 'ḥ',  word: ['దుఃఖం', 'duḥkhaṁ', 'sorrow'],            eng: ['ahh',   'a light puff of breath after the vowel'],
                note: 'ః appears in Sanskrit-origin words.' },
    '్': { iso: '',   word: ['సత్యం', 'satyaṁ', 'truth'],              eng: null,
                note: 'The virama has no sound of its own: it removes the vowel so the next consonant joins on (త్య in సత్యం).' },
  };

  // Every character in telugu-data.js must have an entry, and no entry may be left over.
  (function check() {
    const miss = [];
    TD.letters.forEach(l => { if (!letters[l.ch]) miss.push(l.ch); });
    TD.signs.forEach(s => { if (!signs[s.sign]) miss.push('sign ' + (s.sign || '(none)')); });
    const known = new Set(TD.letters.map(l => l.ch)), knownS = new Set(TD.signs.map(s => s.sign));
    Object.keys(letters).forEach(k => { if (!known.has(k)) miss.push('unknown letter ' + k); });
    Object.keys(signs).forEach(k => { if (!knownS.has(k)) miss.push('unknown sign ' + k); });
    if (miss.length) throw new Error('rosetta-data: ' + miss.join(', '));
  })();

  const nfc = o => (typeof o === 'string') ? o.normalize('NFC')
    : Array.isArray(o) ? o.map(nfc)
    : (o && typeof o === 'object') ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, nfc(v)]))
    : o;

  const data = Object.freeze({ letters: nfc(letters), signs: nfc(signs) });
  root.RosettaData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
