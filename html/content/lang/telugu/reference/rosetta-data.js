/* ═════════════════════════════════════════════════════════
   rosetta-data.js — the content of the Rosetta Stone page:
   for every letter and vowel sign, a Telugu word that uses it and
   an English word that sounds like it.
   The IPA, the ISO 15919 spelling, the letter list and the
   categories come from telugu-data.js (single source of truth);
   this file only adds what that file doesn't have. Needs
   telugu-data.js loaded first.

   ENTRY
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
  const TD = root.TeluguData || (typeof require === 'function' ? require('../telugu-data.js') : null);
  if (!TD) throw new Error('rosetta-data: load telugu-data.js first');

  const R = 'r̥', RR = 'r̥̄', L = 'l̥', LL = 'l̥̄';   // ring below, as ISO 15919 writes it

  /* ── Letters (keyed by the letter, as in telugu-data.js) ─ */
  const letters = {
    // Vowels
    'అ': { word: ['అమ్మ', 'amma', 'mother'],         eng: ['cut',    'short, open vowel, like the u of cup, not the a of cat'] },
    'ఆ': { word: ['ఆవు', 'āvu', 'cow'],              eng: ['father', 'the same vowel, held twice as long'] },
    'ఇ': { word: ['ఇల్లు', 'illu', 'house'],         eng: ['sit',    'short i'] },
    'ఈ': { word: ['ఈగ', 'īga', 'fly'],              eng: ['feet',   'long ee'] },
    'ఉ': { word: ['ఉడుత', 'uḍuta', 'squirrel'],      eng: ['put',    'short u, never the u of cup'] },
    'ఊ': { word: ['ఊరు', 'ūru', 'town, village'],    eng: ['moon',   'long oo'] },
    'ఋ': { word: ['ఋషి', R + 'ṣi', 'sage, seer'],     eng: ['rookie', 'a Sanskrit vowel; spoken in Telugu much like “ru”, classically a syllabic r'],
           note: 'Found in Sanskrit loanwords.' },
    'ౠ': { word: null, eng: null,
           note: 'The long form of ఋ. It belongs to Sanskrit grammar tables and a few Sanskrit names; no everyday Telugu word uses it.' },
    'ఌ': { word: null, eng: null,
           note: 'A syllabic l, in the script and in Sanskrit grammar only. No Telugu word uses it, so there is no example to give.' },
    'ౡ': { word: null, eng: null,
           note: 'The long form of ఌ. Theoretical: it appears in letter tables, not in any word.' },
    'ఎ': { word: ['ఎలుక', 'eluka', 'mouse, rat'],     eng: ['bed',    'short e'] },
    'ఏ': { word: ['ఏనుగు', 'ēnugu', 'elephant'],     eng: ['say',    'long e, pure: stop before the y-glide English adds'] },
    'ఐ': { word: ['ఐదు', 'aidu', 'five'],            eng: ['eye',    'a diphthong, a gliding into i'] },
    'ఒ': { word: ['ఒకటి', 'okaṭi', 'one'],           eng: ['obey',   'short, pure o, with no w-glide'] },
    'ఓ': { word: ['ఓడ', 'ōḍa', 'boat, ship'],        eng: ['go',     'long o, pure: drop the w-glide of English go'] },
    'ఔ': { word: ['ఔషధం', 'auṣadhaṁ', 'medicine'],   eng: ['cow',    'a diphthong, gliding into u'] },
    'అం': { word: ['అంగడి', 'aṁgaḍi', 'shop'],        eng: ['sang',   'ం nasalises the vowel; before గ and క it sounds like the ng of sang'] },
    'అః': { word: ['దుఃఖం', 'duḥkhaṁ', 'sorrow'],      eng: ['ahh',    'a light puff of breath after the vowel'],
            note: 'ః appears in Sanskrit-origin words.' },

    // Velars
    'క': { word: ['కాకి', 'kāki', 'crow'],           eng: ['sky',    'k with no puff of air after it'] },
    'ఖ': { word: ['ముఖం', 'mukhaṁ', 'face'],         eng: ['kit',    'k with a puff of air'] },
    'గ': { word: ['గాడిద', 'gāḍida', 'donkey'],      eng: ['go',     'plain g'] },
    'ఘ': { word: ['ఘంట', 'ghaṁṭa', 'bell'],          eng: ['doghouse', 'g with a breathy release: say “dog house” in one breath'] },
    'ఙ': { word: ['అఙ్గము', 'aṅgamu', 'limb, part'],  eng: ['sing',   'the ng sound'],
           note: 'Classical spelling: modern Telugu writes అంగము with ం, so ఙ is rare on its own.' },
    // Palatals
    'చ': { word: ['చేప', 'cēpa', 'fish'],            eng: ['church', 'before a, o and u it is often said more like “ts”'] },
    'ఛ': { word: ['ఛాయ', 'chāya', 'shade, shadow'],   eng: ['catch her', 'ch with a puff of air'] },
    'జ': { word: ['జింక', 'jiṁka', 'deer'],          eng: ['jug',    'before a, o and u it is often said more like “dz”'] },
    'ఝ': { word: ['ఝరి', 'jhari', 'stream, waterfall'], eng: ['hedgehog', 'j with a breathy release: “hedge hog” in one breath'] },
    'ఞ': { word: ['అఞ్జలి', 'añjali', 'offering with cupped hands'], eng: ['canyon', 'the ny sound'],
           note: 'Classical spelling: modern Telugu writes అంజలి with ం.' },
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
    'థ': { word: ['కథ', 'katha', 'story'],           eng: ['hothead', 'త with a puff of air, tongue against the teeth'] },
    'ద': { word: ['దారి', 'dāri', 'road, path'],     eng: ['day',    'tongue against the teeth'] },
    'ధ': { word: ['ధనం', 'dhanaṁ', 'wealth'],        eng: ['good hat', 'ద with a breathy release'] },
    'న': { word: ['నీరు', 'nīru', 'water'],          eng: ['noon',   'plain n'] },
    // Labials
    'ప': { word: ['పిల్లి', 'pilli', 'cat'],          eng: ['spin',   'p with no puff of air'] },
    'ఫ': { word: ['ఫలం', 'phalaṁ', 'fruit'],         eng: ['pin',    'p with a puff of air; not an f'] },
    'బ': { word: ['బంతి', 'baṁti', 'ball'],          eng: ['bat',    'plain b'] },
    'భ': { word: ['భూమి', 'bhūmi', 'earth, land'],   eng: ['clubhouse', 'b with a breathy release'] },
    'మ': { word: ['మామిడి', 'māmiḍi', 'mango'],       eng: ['mom',    'plain m'] },
    // Approximants
    'య': { word: ['యాత్ర', 'yātra', 'journey, pilgrimage'], eng: ['yes', 'plain y'] },
    'ర': { word: ['రాత్రి', 'rātri', 'night'],        eng: ['butter', 'a quick tap of the tongue, like the tt of American butter'] },
    'ల': { word: ['లోతు', 'lōtu', 'depth'],          eng: ['leaf',   'a light l'] },
    'వ': { word: ['వంద', 'vaṁda', 'hundred'],        eng: ['wave',   'between English w and v: lips barely touch the teeth'] },
    // Fricatives
    'శ': { word: ['శరీరం', 'śarīraṁ', 'body'],        eng: ['ship',   'sh'] },
    'ష': { word: ['కష్టం', 'kaṣṭaṁ', 'hardship, difficulty'], eng: ['ship', 'sh with the tongue curled back; in everyday speech it sounds like శ'] },
    'స': { word: ['సూర్యుడు', 'sūryuḍu', 'sun'],      eng: ['sun',    'plain s'] },
    'హ': { word: ['హంస', 'haṁsa', 'swan'],           eng: ['behind', 'a light, voiced h'] },
    // Conjunct counted as a letter
    'క్ష': { word: ['పక్షి', 'pakṣi', 'bird'],        eng: ['bookshop', 'k and sh run together'] },
  };

  /* ── Vowel signs (keyed by the sign; '' is "no sign") ───── */
  const signs = {
    '':       { word: ['కల', 'kala', 'dream'],                 eng: ['cut',   'with no sign, the consonant carries a short a'] },
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

  const data = Object.freeze({ letters: nfc(letters), signs: nfc(signs) });
  root.RosettaData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
