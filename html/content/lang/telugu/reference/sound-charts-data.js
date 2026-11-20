/* ═════════════════════════════════════════════════════════
   sound-charts-data.js — what the Sound Charts page adds to
   telugu-data.js: where each sound sits on the two IPA charts,
   and the English sounds drawn beside the Telugu ones.
   Needs ../telugu-data.js loaded first.

   The Telugu letters and their IPA are NOT repeated here. A
   letter is placed by looking its IPA (from telugu-data.js) up
   in the tables below, so a letter added there appears on the
   charts as soon as its symbol has a place here. A letter whose
   symbol is missing stops the page with an error.

   ENGLISH is General American, the accent most US dictionaries
   describe. Other accents move some vowels and drop or add a few.
   Vowels are drawn where the IPA chart puts each symbol, which is
   a convention: a real vowel is a region, not a point.

   CONSONANT GRID  (the layout of the IPA pulmonic chart)
     PLACES    [place, group]      columns, lips → throat
     MANNERS   rows
     WHERE     ipa → [place, manner, voiced]
               An aspirated or breathy stop (kʰ, ɡʱ) shares its
               plain partner's box.
     ENGLISH_CONSONANTS   [ipa, key word]   the letters between
               | | are the ones that spell the sound: 's|k|y'
               [ipa, key word, phoneme]   a VARIANT: a sound
               English speakers make in certain positions without
               hearing it as different from `phoneme` (the puff of
               air in pin, the tap in butter). The page writes a
               variant in square brackets and the rest in slashes.
               A variant is here because it is common in English
               and bears on Telugu: either Telugu has a letter for
               it (pʰ = ఫ) or a learner will carry it over.
     OFF_GRID  letters with no single box

   VOWEL CHART
     SPOTS     ipa → [back, open, side]
               back  0 front … 1 back
               open  0 close … 1 open
               side  where its label goes: l, r, a(bove), b(elow)
     ENGLISH_VOWELS       [ipa, key word]
     DIPHTHONGS, OFF_CHART   listed under the chart
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const TD = root.TeluguData || (typeof require === 'function' ? require('../telugu-data.js') : null);
  if (!TD) throw new Error('sound-charts-data: load telugu-data.js first');

  const ENGLISH = 'General American';
  const D = TD.DENT;                 // ̪  dental, as telugu-data.js writes త థ ద ధ

  /* ── Consonants ───────────────────────────────────────── */
  const PLACES = [
    ['Bilabial', 'Labial'], ['Labiodental', 'Labial'], ['Linguolabial', 'Labial'],
    ['Dental', 'Coronal'], ['Alveolar', 'Coronal'], ['Postalveolar', 'Coronal'], ['Retroflex', 'Coronal'],
    ['Palatal', 'Dorsal'], ['Velar', 'Dorsal'], ['Uvular', 'Dorsal'],
    ['Pharyngeal', 'Laryngeal'], ['Glottal', 'Laryngeal'],
  ];
  const MANNERS = ['Nasal', 'Plosive', 'Affricate', 'Sibilant fricative', 'Non-sibilant fricative',
                   'Approximant', 'Tap or flap', 'Trill', 'Lateral fricative', 'Lateral approximant', 'Lateral tap or flap'];

  const V = true, U = false;         // voiced, unvoiced
  const WHERE = {
    // Nasals
    'm': ['Bilabial', 'Nasal', V], 'n': ['Alveolar', 'Nasal', V], 'ɳ': ['Retroflex', 'Nasal', V],
    'ɲ': ['Palatal', 'Nasal', V],  'ŋ': ['Velar', 'Nasal', V],
    // Plosives: plain, then aspirated (voiceless) or breathy (voiced)
    'p': ['Bilabial', 'Plosive', U],       'pʰ': ['Bilabial', 'Plosive', U],
    'b': ['Bilabial', 'Plosive', V],       'bʱ': ['Bilabial', 'Plosive', V],
    ['t' + D]: ['Dental', 'Plosive', U],   ['t' + D + 'ʰ']: ['Dental', 'Plosive', U],
    ['d' + D]: ['Dental', 'Plosive', V],   ['d' + D + 'ʱ']: ['Dental', 'Plosive', V],
    't': ['Alveolar', 'Plosive', U],       'tʰ': ['Alveolar', 'Plosive', U],
    'd': ['Alveolar', 'Plosive', V],
    'ʈ': ['Retroflex', 'Plosive', U],      'ʈʰ': ['Retroflex', 'Plosive', U],
    'ɖ': ['Retroflex', 'Plosive', V],      'ɖʱ': ['Retroflex', 'Plosive', V],
    'k': ['Velar', 'Plosive', U],          'kʰ': ['Velar', 'Plosive', U],
    'ɡ': ['Velar', 'Plosive', V],          'ɡʱ': ['Velar', 'Plosive', V],
    'ʔ': ['Glottal', 'Plosive', U],
    // Affricates (a stop released into a fricative)
    'ts': ['Alveolar', 'Affricate', U],     'dz': ['Alveolar', 'Affricate', V],     // the old letters ౘ ౙ
    'tʃ': ['Postalveolar', 'Affricate', U], 'tʃʰ': ['Postalveolar', 'Affricate', U],
    'dʒ': ['Postalveolar', 'Affricate', V], 'dʒʱ': ['Postalveolar', 'Affricate', V],
    // Fricatives
    's': ['Alveolar', 'Sibilant fricative', U],     'z': ['Alveolar', 'Sibilant fricative', V],
    'ʃ': ['Postalveolar', 'Sibilant fricative', U], 'ʒ': ['Postalveolar', 'Sibilant fricative', V],
    'ʂ': ['Retroflex', 'Sibilant fricative', U],
    'f': ['Labiodental', 'Non-sibilant fricative', U], 'v': ['Labiodental', 'Non-sibilant fricative', V],
    'θ': ['Dental', 'Non-sibilant fricative', U],      'ð': ['Dental', 'Non-sibilant fricative', V],
    'h': ['Glottal', 'Non-sibilant fricative', U],     'ɦ': ['Glottal', 'Non-sibilant fricative', V],
    // Approximants, tap, trill, laterals
    'ʋ': ['Labiodental', 'Approximant', V], 'ɹ': ['Alveolar', 'Approximant', V], 'j': ['Palatal', 'Approximant', V],
    'w': ['Velar', 'Approximant', V],      // labial-velar: the lips round as well (see the note); drawn where the tongue is
    'ɾ': ['Alveolar', 'Tap or flap', V],   'ɽ': ['Retroflex', 'Tap or flap', V],
    'l': ['Alveolar', 'Lateral approximant', V], 'ɫ': ['Alveolar', 'Lateral approximant', V],   // ɫ: l with the back of the tongue raised
    'ɭ': ['Retroflex', 'Lateral approximant', V],
  };

  // The 24 consonants General American tells apart, then (third entry) the common variants of p, t, k, and l.
  const ENGLISH_CONSONANTS = [
    ['m', '|m|an'], ['n', '|n|ot'], ['ŋ', 'si|ng|'],
    ['p', 's|p|in'], ['pʰ', '|p|in', 'p'], ['b', '|b|in'],
    ['t', 's|t|op'], ['tʰ', '|t|in', 't'], ['d', '|d|in'],
    ['k', 's|k|in'], ['kʰ', '|k|in', 'k'], ['ɡ', '|g|ive'],
    ['ʔ', 'bu|tt|on', 't'],                                   // the catch in the throat, also the middle of uh-oh
    ['tʃ', '|ch|in'], ['dʒ', '|j|am'],
    ['s', '|s|it'], ['z', '|z|oo'], ['ʃ', '|sh|ip'], ['ʒ', 'vi|si|on'],
    ['f', '|f|an'], ['v', '|v|an'], ['θ', '|th|in'], ['ð', '|th|is'], ['h', '|h|at'],
    ['ɹ', '|r|ed'], ['j', '|y|es'], ['w', '|w|et'],
    ['ɾ', 'bu|tt|er', 't'],                                   // the quick tap
    ['l', '|l|et'], ['ɫ', 'fu|ll|', 'l'],                     // light l, dark l
  ];

  // Letters with no single box on the grid
  const OFF_GRID = [
    { lang: 'te', ch: 'క్ష',
      why: 'a conjunct counted as a letter: two sounds, k then ʂ, each of which has its own box' },
  ];

  /* ── Vowels ───────────────────────────────────────────── */
  const SPOTS = {
    'i': [0, 0, 'l'],       'u': [1, 0, 'r'],
    'ɪ': [0.18, 0.17, 'r'], 'ʊ': [0.82, 0.17, 'l'],
    'e': [0, 1 / 3, 'l'],   'o': [1, 1 / 3, 'r'],
    'ə': [0.5, 0.5, 'b'],
    'ɛ': [0, 2 / 3, 'l'],   'ʌ': [0.84, 2 / 3, 'a'], 'ɔ': [1, 2 / 3, 'r'],
    'æ': [0, 0.84, 'l'],
    'ɐ': [0.5, 0.84, 'r'],
    'a': [0.5, 1, 'b'],     'ɑ': [1, 1, 'r'],
  };
  // Telugu ఆ is written a, a symbol IPA draws at the FRONT of the open row. It is an open
  // central vowel, so that is where a sits here. అ (ɐ) is shorter and a little higher, so
  // the two get separate dots. (English has neither.)

  const ENGLISH_VOWELS = [
    ['i', 'f|ee|t'], ['ɪ', 's|i|t'], ['ɛ', 'b|e|d'], ['æ', 'c|a|t'],
    ['ə', '|a|bout'], ['ʌ', 'c|u|t'],
    ['u', 'm|oo|n'], ['ʊ', 'p|u|t'], ['ɔ', 's|aw|'], ['ɑ', 'f|a|ther'],
  ];

  // Vowels that glide from one position to another: listed, not plotted
  const DIPHTHONGS = {
    te: ['ai', 'au'],                                   // looked up among the letters
    en: [['eɪ', 's|ay|'], ['aɪ', '|eye|'], ['ɔɪ', 'b|oy|'], ['aʊ', 'c|ow|'], ['oʊ', 'g|o|']],
  };

  // Telugu letters filed with the vowels that are not plain vowels, by IPA
  const OFF_CHART = [
    { ipa: ['ru', 'ruː', 'lu', 'luː'],
      why: 'vowels from Sanskrit, once a syllabic r and l: Telugu says them as r or l followed by u' },
    { ipa: [TD.INHERENT + 'm', TD.INHERENT + 'ʰ'],
      why: 'అ followed by ం or ః: a vowel and then a nasal (m on its own; the nasal of the next consonant inside a word) or a breath' },
  ];
  const OFF_CHART_EN = [
    { ipa: 'ɚ', word: 'b|ir|d', why: 'ə with an r coloring' },
  ];

  /* ── Notes ────────────────────────────────────────────── */
  const NOTES = [
    { id: 'aspiration', title: 'English p, t, and k come in two kinds',
      text: 'At the start of a word (pin, tin, kin) they come with a puff of air: [pʰ] and [kʰ] are the sounds of ఫ and ఖ. After s (spin, stop, skin) the puff is gone, and p and k are the sounds of ప and క. English hears each pair as one sound; Telugu writes them with different letters.' },
    { id: 'variants', title: 'Slashes and square brackets',
      text: 'Slashes mark a sound English tells apart from its others, like /t/. Square brackets mark a variant English speakers make without hearing a difference: the tt of butter is a single quick tap [ɾ], the tt of button (and the middle of uh-oh) a catch in the throat [ʔ], and the ll of full a dark l [ɫ], with the back of the tongue raised. Telugu ల is the light l of let. ర is a single tap [ɾ], the tt of butter or the r of Spanish pero, so it shares a box with that English variant.' },
    { id: 'coronals', title: 'English t and d sit between two Telugu pairs',
      text: 'English t and d are made on the ridge behind the teeth (alveolar). Telugu has no stop there: త ద touch the teeth (dental), and ట డ curl the tongue tip back (retroflex).' },
    { id: 'th', title: 'English th is not థ',
      text: 'θ and ð (thin, this) are fricatives: the air hisses past the tongue. థ and ధ are stops, like త and ద with a puff of air.' },
    { id: 'v', title: 'వ is between v and w',
      text: 'వ is made where English v is, lip against teeth, but with no friction: the air flows freely, as in w.' },
    { id: 'w', title: 'w is made in two places at once',
      text: 'For w the back of the tongue rises, which is why it is in the Velar column, while the lips round. Telugu has no w; వ is the nearest letter.' },
    { id: 'h', title: 'హ and h share a box',
      text: 'Both are made in the throat. English h is voiceless; Telugu హ is voiced, a breathy version of the same sound.' },
    { id: 'length', title: 'Most Telugu vowel pairs differ only in length',
      text: 'ఇ ఈ, ఉ ఊ, ఎ ఏ, and ఒ ఓ are each one tongue position held short or long, so each pair shares a dot. అ ఆ are the exception: short అ (ɐ) is a little higher than long ఆ (aː), so they have a dot each. English pairs like sit / feet and put / moon differ in tongue position, so they have separate dots.' },
    { id: 'eo', title: 'English has no steady e or o',
      text: 'ఎ ఏ and ఒ ఓ stay in one place. The nearest English vowels, in say and go, start there and glide away (they are listed with the diphthongs).' },
  ];

  /* ── Placing the Telugu letters ───────────────────────── */
  const quality = ipa => ipa.replace(/ː$/, '');                    // ఆ aː sits where అ a does
  const offChart = new Set(OFF_CHART.flatMap(o => o.ipa));
  const offGrid  = new Set(OFF_GRID.filter(o => o.ch).map(o => o.ch));

  // Every consonant letter: its box, or the off-grid list
  const teluguConsonants = [...TD.consonants, ...TD.conjunctLetters].filter(l => !offGrid.has(l.ch));
  // Every vowel letter: a spot, a diphthong, or the off-chart list
  const teluguVowels     = TD.vowels.filter(l => SPOTS[quality(l.ipa)]);
  const teluguDiphthongs = TD.vowels.filter(l => DIPHTHONGS.te.includes(l.ipa));
  const teluguOffChart   = OFF_CHART.map(o => ({ why: o.why, letters: TD.vowels.filter(l => o.ipa.includes(l.ipa)) }));

  /* Guard: nothing may fall through the tables */
  (function check() {
    const bad = [];
    const places = new Set(PLACES.map(p => p[0])), manners = new Set(MANNERS);
    Object.entries(WHERE).forEach(([ipa, [p, m]]) => { if (!places.has(p) || !manners.has(m)) bad.push('WHERE ' + ipa); });
    teluguConsonants.forEach(l => { if (!WHERE[l.ipa]) bad.push('no box for ' + l.ch + ' /' + l.ipa + '/'); });
    ENGLISH_CONSONANTS.forEach(([ipa]) => { if (!WHERE[ipa]) bad.push('no box for English ' + ipa); });
    const phonemes = new Set(ENGLISH_CONSONANTS.filter(e => !e[2]).map(e => e[0]));
    ENGLISH_CONSONANTS.forEach(([ipa, , of]) => { if (of && !phonemes.has(of)) bad.push('English ' + ipa + ' is a variant of ' + of + ', which is not listed'); });
    if (new Set(ENGLISH_CONSONANTS.map(e => e[0])).size !== ENGLISH_CONSONANTS.length) bad.push('an English consonant is listed twice');
    ENGLISH_VOWELS.forEach(([ipa]) => { if (!SPOTS[ipa]) bad.push('no spot for English ' + ipa); });
    TD.vowels.forEach(l => {
      const n = (SPOTS[quality(l.ipa)] ? 1 : 0) + (DIPHTHONGS.te.includes(l.ipa) ? 1 : 0) + (offChart.has(l.ipa) ? 1 : 0);
      if (n !== 1) bad.push('vowel ' + l.ch + ' /' + l.ipa + '/ is placed ' + n + ' times');
    });
    [...TD.consonants, ...TD.conjunctLetters].forEach(l => { if (offGrid.has(l.ch) && WHERE[l.ipa]) bad.push(l.ch + ' is both on and off the grid'); });
    if (bad.length) throw new Error('sound-charts-data: ' + bad.join(', '));
  })();

  const data = Object.freeze({
    ENGLISH, PLACES, MANNERS, WHERE, ENGLISH_CONSONANTS, OFF_GRID,
    SPOTS, ENGLISH_VOWELS, DIPHTHONGS, OFF_CHART_EN, NOTES,
    quality, teluguConsonants, teluguVowels, teluguDiphthongs, teluguOffChart,
  });
  root.SoundChartsData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
