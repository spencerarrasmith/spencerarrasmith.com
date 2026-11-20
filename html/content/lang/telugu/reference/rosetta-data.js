/* ═════════════════════════════════════════════════════════
   rosetta-data.js — the content of the Rosetta Stone page:
   for every letter and vowel sign, a Telugu word that uses it and
   an English word that sounds like it.
   The IPA, the ISO 15919 spelling, the letter list, and the
   categories come from telugu-data.js (single source of truth);
   this file only adds what that file doesn't have. Needs
   telugu-data.js loaded first.

   ENTRY
     word    [Telugu, ISO 15919, English meaning]   or null
     eng     [English word, short note]             or null
     note    what to know about this one (rarity, spelling, how it is
             often said), or ''

   WORDS ARE ONLY GIVEN WHERE THEY EXIST
     A few letters are theoretical or archaic: they are in the script and in
     Sanskrit grammar tables but no everyday Telugu word spells with them.
     Those have word: null and a note saying so, rather than an invented
     example. Words marked "classical spelling" are real words whose modern
     spelling uses ం instead of ఙ / ఞ.

   ISO 15919 follows the letters, not the sound: ం is ṁ even where it is said
   as n, ṅ, or m. The "eng" matches are approximate; English has no exact
   equivalent for the aspirates, retroflexes, or the dental stops.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const TD = root.TeluguData || (typeof require === 'function' ? require('../telugu-data.js') : null);
  if (!TD) throw new Error('rosetta-data: load telugu-data.js first');

  const R = 'r̥', RR = 'r̥̄', L = 'l̥', LL = 'l̥̄';   // ring below, as ISO 15919 writes it

  /* ── Letters (keyed by the letter, as in telugu-data.js) ─ */
  const letters = {
    // Vowels
    'అ': { word: ['అమ్మ', 'amma', 'mother'],         eng: ['cut',    'short vowel, like the u of cup, not the a of cat'] },
    'ఆ': { word: ['ఆవు', 'āvu', 'cow'],              eng: ['father', 'long and more open than అ, not just అ held longer'],
           note: 'In some words and dialects it is said like the a of cat, held long [æː]. English loanwords write that sound ్యా: బ్యాగ్ (bag).' },
    'ఇ': { word: ['ఇల్లు', 'illu', 'house'],         eng: ['sit',    'short i'],
           note: 'At the start of a word it is often said with a y-glide in front: [ji].' },
    'ఈ': { word: ['ఈగ', 'īga', 'fly'],              eng: ['feet',   'long ee'],
           note: 'At the start of a word it is often said with a y-glide in front: [jiː].' },
    'ఉ': { word: ['ఉడుత', 'uḍuta', 'squirrel'],      eng: ['put',    'short u, never the u of cup'],
           note: 'At the start of a word it is often said with a v/w-glide in front: [ʋu].' },
    'ఊ': { word: ['ఊరు', 'ūru', 'town, village'],    eng: ['moon',   'long oo'],
           note: 'At the start of a word it is often said with a v/w-glide in front: [ʋuː].' },
    'ఋ': { word: ['ఋషి', R + 'ṣi', 'sage, seer'],     eng: ['rookie', 'said “ru”; in Sanskrit it was a syllabic r'],
           note: 'Found in Sanskrit loanwords, many of them everyday words (ఋణం, ఋతువు).' },
    'ౠ': { word: null, eng: null,
           note: 'The long form of ఋ. It belongs to Sanskrit grammar tables and a few Sanskrit names; no everyday Telugu word uses it.' },
    'ఌ': { word: null, eng: null,
           note: 'A syllabic l, in the script and in Sanskrit grammar only. No Telugu word uses it, so there is no example to give.' },
    'ౡ': { word: null, eng: null,
           note: 'The long form of ఌ. Theoretical: it appears in letter tables, not in any word.' },
    'ఎ': { word: ['ఎలుక', 'eluka', 'mouse, rat'],     eng: ['bed',    'short e'],
           note: 'At the start of a word it is often said with a y-glide in front: [je].' },
    'ఏ': { word: ['ఏనుగు', 'ēnugu', 'elephant'],     eng: ['say',    'long e, pure: stop before the y-glide English adds'],
           note: 'At the start of a word it is often said with a y-glide in front: [jeː]. (That glide comes before the vowel; the one English adds in say comes after it.)' },
    'ఐ': { word: ['ఐదు', 'aidu', 'five'],            eng: ['eye',    'a diphthong, a gliding into i'] },
    'ఒ': { word: ['ఒకటి', 'okaṭi', 'one'],           eng: ['obey',   'short, pure o, with no w-glide after it'],
           note: 'At the start of a word it is often said with a v/w-glide in front: [ʋo].' },
    'ఓ': { word: ['ఓడ', 'ōḍa', 'boat, ship'],        eng: ['go',     'long o, pure: drop the w-glide that ends English go'],
           note: 'At the start of a word it is often said with a v/w-glide in front: [ʋoː]. (That glide comes before the vowel; the one English adds in go comes after it.)' },
    'ఔ': { word: ['ఔషధం', 'auṣadhaṁ', 'medicine'],   eng: ['cow',    'a diphthong, gliding into u'] },
    'అం': { word: ['అంగడి', 'aṁgaḍi', 'store'],        eng: ['sang',   'ం is the nasal of the next consonant: ng before గ and క, as in sang'],
            note: 'On its own, or at the end of a word, ం is said m.' },
    'అః': { word: ['దుఃఖం', 'duḥkhaṁ', 'sorrow'],      eng: ['ahh',    'a light puff of breath after the vowel'],
            note: 'ః appears only in a few Sanskrit-origin words.' },

    // Velars
    'క': { word: ['కాకి', 'kāki', 'crow'],           eng: ['sky',    'k with no puff of air after it'] },
    'ఖ': { word: ['ముఖం', 'mukhaṁ', 'face'],         eng: ['kit',    'k with a puff of air'] },
    'గ': { word: ['గాడిద', 'gāḍida', 'donkey'],      eng: ['go',     'plain g'] },
    'ఘ': { word: ['ఘంట', 'ghaṁṭa', 'bell'],          eng: ['doghouse', 'g with a breathy release: say “dog house” in one breath'] },
    'ఙ': { word: ['అఙ్గము', 'aṅgamu', 'limb, part'],  eng: ['sing',   'the ng sound'],
           note: 'Classical spelling: modern Telugu writes అంగము with ం, so ఙ is rare on its own.' },
    // Palatals
    'చ': { word: ['చేప', 'cēpa', 'fish'],            eng: ['church', 'before a, o, and u it is often said more like “ts”'],
           note: 'Telugu once wrote that ts with a letter of its own, ౘ.' },
    'ఛ': { word: ['ఛాయ', 'chāya', 'shade, shadow'],   eng: ['catch her', 'ch with a puff of air'] },
    'జ': { word: ['జింక', 'jiṁka', 'deer'],          eng: ['jug',    'before a, o, and u it is often said more like “dz”'],
           note: 'In English loanwords it also writes z. Telugu once wrote the dz with a letter of its own, ౙ.' },
    'ఝ': { word: ['ఝరి', 'jhari', 'stream, waterfall'], eng: ['hedgehog', 'j with a breathy release: “hedge hog” in one breath'] },
    'ఞ': { word: ['జ్ఞానం', 'jñānaṁ', 'knowledge'], eng: ['canyon', 'the ny sound'],
           note: 'Nearly always written after జ, in జ్ఞ, the way q comes in qu. జ్ఞ is usually said “gny”.' },
    'ౘ': { word: null, eng: ['cats', 'the ts of cats'],
           note: 'An old letter for ts, no longer written: modern Telugu writes చ, often said ts before a, o, and u.' },
    'ౙ': { word: null, eng: ['adze', 'the dz of adze'],
           note: 'An old letter for dz, no longer written: modern Telugu writes జ, often said dz before a, o, and u.' },
    // Retroflexes
    'ట': { word: ['టోపీ', 'ṭōpī', 'hat, cap'],       eng: ['top',    'curl the tongue tip back; English t is the nearest sound'] },
    'ఠ': { word: ['ఠీవి', 'ṭhīvi', 'stately bearing'], eng: ['hothouse', 'ట with a puff of air, tongue still curled back'] },
    'డ': { word: ['డబ్బు', 'ḍabbu', 'money'],         eng: ['dog',    'tongue tip curled back'] },
    'ఢ': { word: ['ఢంకా', 'ḍhaṁkā', 'large drum'],    eng: ['mad house', 'డ with a breathy release, tongue curled back'] },
    'ణ': { word: ['వీణ', 'vīṇa', 'veena (a stringed instrument)'], eng: ['barn', 'n with the tongue tip curled back; no exact English match'] },
    'ళ': { word: ['కళ్ళు', 'kaḷḷu', 'eyes'],          eng: ['bell',   'an l with the tongue curled back; no exact English match'] },
    'ఱ': { word: null, eng: ['butter', 'a rolled or tapped r, like ర'],
           note: 'Found only in older printed texts; modern Telugu writes ర. No modern word to give.' },
    // Dentals
    'త': { word: ['తల', 'tala', 'head'],             eng: ['tea',    'tongue against the teeth, no puff of air'] },
    'థ': { word: ['కథ', 'katha', 'story'],           eng: ['hothead', 'త with a puff of air, tongue against the teeth'],
           note: 'In everyday speech often said like ధ, a breathy d [d̪ʱ].' },
    'ద': { word: ['దారి', 'dāri', 'road, path'],     eng: ['day',    'tongue against the teeth'] },
    'ధ': { word: ['ధనం', 'dhanaṁ', 'wealth'],        eng: ['good hat', 'ద with a breathy release'] },
    'న': { word: ['నీరు', 'nīru', 'water'],          eng: ['noon',   'plain n'] },
    // Labials
    'ప': { word: ['పిల్లి', 'pilli', 'cat'],          eng: ['spin',   'p with no puff of air'] },
    'ఫ': { word: ['ఫలం', 'phalaṁ', 'fruit'],         eng: ['pin',    'p with a puff of air; not an f'],
           note: 'In loanwords it also writes f: ఫోన్ (phone).' },
    'బ': { word: ['బంతి', 'baṁti', 'ball'],          eng: ['bat',    'plain b'] },
    'భ': { word: ['భూమి', 'bhūmi', 'earth, land'],   eng: ['clubhouse', 'b with a breathy release'] },
    'మ': { word: ['మామిడి', 'māmiḍi', 'mango'],       eng: ['mom',    'plain m'] },
    // Approximants
    'య': { word: ['యాత్ర', 'yātra', 'journey, pilgrimage'], eng: ['yes', 'plain y'] },
    'ర': { word: ['రాత్రి', 'rātri', 'night'],        eng: ['butter', 'a single tap of the tongue, like the tt of American butter or the r of Spanish pero'] },
    'ల': { word: ['లోతు', 'lōtu', 'depth'],          eng: ['leaf',   'a light l'] },
    'వ': { word: ['వంద', 'vaṁda', 'hundred'],        eng: ['wave',   'between English w and v: lips barely touch the teeth'] },
    // Fricatives
    'శ': { word: ['శరీరం', 'śarīraṁ', 'body'],        eng: ['ship',   'sh'],
           note: 'With ా it is often said with the a of cat: శా [ʃæː].' },
    'ష': { word: ['కష్టం', 'kaṣṭaṁ', 'hardship, difficulty'], eng: ['ship', 'sh with the tongue curled back; in everyday speech it sounds like శ'] },
    'స': { word: ['సూర్యుడు', 'sūryuḍu', 'sun'],      eng: ['sun',    'plain s'] },
    'హ': { word: ['హంస', 'haṁsa', 'swan'],           eng: ['behind', 'a light, voiced h'] },
    // Conjunct counted as a letter
    'క్ష': { word: ['పక్షి', 'pakṣi', 'bird'],        eng: ['bookshop', 'k and sh run together'] },
  };

  /* ── Historical marks ────────────────────────────────────
     Signs that are in the script but no longer said, so telugu-data.js
     (and with it every game) leaves them out. Shown on this page only,
     with their own sound and spelling.                              */
  const historical = {
    'ఁ': { name: 'ardhanusvara', ipa: '∅', iso: 'm̐', word: null, eng: null,
           note: 'A half circle that once marked a nasal vowel. It is found in older and classical texts and is silent in modern Telugu, which leaves it out.' },
  };

  /* ── Vowel signs (keyed by the sign; '' is "no sign") ───── */
  const signs = {
    '':       { word: ['కల', 'kala', 'dream'],                 eng: ['cut',   'with no sign, the consonant carries the short vowel of అ'] },
    'ి': { word: ['కిటికీ', 'kiṭikī', 'window'],           eng: ['sit',   'short i'] },
    'ు': { word: ['కుక్క', 'kukka', 'dog'],                eng: ['put',   'short u'] },
    'ె': { word: ['కెరటం', 'keraṭaṁ', 'wave'],             eng: ['bed',   'short e'] },
    'ొ': { word: ['కొండ', 'koṁḍa', 'hill'],                eng: ['obey',  'short, pure o'] },
    'ా': { word: ['కాకి', 'kāki', 'crow'],                 eng: ['father', 'long a'] },
    'ీ': { word: ['చీమ', 'cīma', 'ant'],                   eng: ['feet',  'long ee'] },
    'ూ': { word: ['కూర', 'kūra', 'curry, vegetable dish'], eng: ['moon',  'long oo'] },
    'ే': { word: ['కేక', 'kēka', 'shout, cry'],            eng: ['say',   'long e, pure'] },
    'ో': { word: ['కోడి', 'kōḍi', 'hen'],                  eng: ['go',    'long o, pure'] },
    'ై': { word: ['మైదానం', 'maidānaṁ', 'ground, field'],   eng: ['eye',   'a diphthong'] },
    'ౌ': { word: ['గౌరవం', 'gauravaṁ', 'respect'],          eng: ['cow',   'a diphthong'] },
    'ృ': { word: ['కృష్ణుడు', 'k' + R + 'ṣṇuḍu', 'Krishna'], eng: ['rookie', 'said “kru” in Telugu'],
                note: 'Found in Sanskrit loanwords and names.' },
    'ౄ': { word: null, eng: null,
                note: 'The long form of ృ. Theoretical: it appears in tables of signs, not in everyday words.' },
    'ౢ': { word: null, eng: null,
                note: 'The sign form of ఌ. Theoretical: no word uses it.' },
    'ౣ': { word: null, eng: null,
                note: 'The sign form of ౡ. Theoretical: no word uses it.' },
    'ం': { word: ['చందమామ', 'caṁdamāma', 'the moon'],       eng: ['candy', 'ం becomes the nasal of the next consonant: n before ద, ng before క or గ, m before ప or బ'] },
    'ః': { word: ['దుఃఖం', 'duḥkhaṁ', 'sorrow'],            eng: ['ahh',   'a light puff of breath after the vowel'],
                note: 'ః appears in Sanskrit-origin words.' },
    '్': { word: ['సత్యం', 'satyaṁ', 'truth'],              eng: null,
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

  const data = Object.freeze({ letters: nfc(letters), signs: nfc(signs), historical: nfc(historical) });
  root.RosettaData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
