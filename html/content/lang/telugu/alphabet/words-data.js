/* ═════════════════════════════════════════════════════════
   words-data.js — the word list of the Words game
   (04_words.html, beside it): short, real Telugu words, each
   with its meaning in English. Edit the list HERE.
   Needs ../telugu-data.js loaded first. Exposes window.TeluguWords.

   ROW   'word': 'meaning'
     word     as modern Telugu writes it (పుస్తకం, not the older
              పుస్తకము). At most MAX_CHARACTERS characters as written:
              పుస్తకం is three (పు · స్త · కం).
     meaning  short; the game shows it above the card the whole time

   Only the word and its meaning are kept here. How a word is
   split into characters, and the sounds each one spells, come
   from TeluguData.syllables(), so they can't disagree with the
   rest of the app. A word that can't be read, is too long, or
   is listed twice stops the page with an error (see the check
   at the bottom).

   WHERE THE WORDS COME FROM
     Everyday vocabulary, picked by hand, then checked:
     · 241 of the 250 appear in C. P. Brown's Telugu-English
       dictionary (which writes the older -ము for today's -ం): 213 as
       headwords, whose definitions were compared with the meanings
       here, and 28 only inside other entries (వైద్యుడు, కుర్చీ, వాక్యం …),
       which confirms the spelling but not always the meaning.
     · The other nine are modern words or forms it does not list
       (నాన్న, ఎలా, ఉంది, తెలుసు, కావాలి, ధన్యవాదాలు, ఉదాహరణ, భారతదేశం,
       సంస్కృతి). Their spellings appear in a frequency list of Telugu
       subtitles; their meanings are not from a dictionary.
     Where a word has several senses the commonest today is given
     (నువ్వు: you, నిజం: truth), two where both are everyday
     (ఉత్తరం: letter, north).

   EACH WORD   { te, en, syllables, sounds }
     te         the word
     en         its meaning
     syllables  TeluguData.syllables(te): its characters, each with
                the sounds it spells, in order
     sounds     how many sounds that is in all (అమ్మ: 4)
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const TD = root.TeluguData || (typeof require === 'function' ? require('../telugu-data.js') : null);
  if (!TD) throw new Error('words-data: load telugu-data.js first');

  const MAX_CHARACTERS = 5;

  const LIST = {
    // People
    'అమ్మ': 'mother', 'నాన్న': 'father', 'అన్న': 'elder brother', 'అక్క': 'elder sister',
    'తమ్ముడు': 'younger brother', 'తాత': 'grandfather', 'భార్య': 'wife', 'భర్త': 'husband',
    'కొడుకు': 'son', 'కూతురు': 'daughter', 'కుటుంబం': 'family', 'మనిషి': 'person',
    'స్త్రీ': 'woman', 'స్నేహితుడు': 'friend', 'రాజు': 'king', 'రైతు': 'farmer',
    'గురువు': 'teacher, guide', 'ఉపాధ్యాయుడు': 'teacher', 'విద్యార్థి': 'student',
    'వైద్యుడు': 'doctor', 'దేవుడు': 'god',

    // The body
    'తల': 'head', 'కన్ను': 'eye', 'చెవి': 'ear', 'ముక్కు': 'nose', 'నోరు': 'mouth',
    'నాలుక': 'tongue', 'చేయి': 'hand', 'కాలు': 'leg', 'కడుపు': 'stomach', 'గుండె': 'heart',
    'ముఖం': 'face', 'శరీరం': 'body', 'హృదయం': 'heart, mind',

    // Animals
    'కుక్క': 'dog', 'పిల్లి': 'cat', 'ఆవు': 'cow', 'మేక': 'goat', 'గుర్రం': 'horse',
    'ఏనుగు': 'elephant', 'సింహం': 'lion', 'పులి': 'tiger', 'ఎలుగుబంటి': 'bear', 'గాడిద': 'donkey',
    'కుందేలు': 'rabbit', 'ఉడుత': 'squirrel', 'పాము': 'snake', 'చేప': 'fish', 'పక్షి': 'bird',
    'నెమలి': 'peacock', 'చిలుక': 'parrot', 'గుడ్లగూబ': 'owl',

    // The world outside
    'నీరు': 'water', 'గాలి': 'wind, air', 'నిప్పు': 'fire', 'భూమి': 'earth', 'ఆకాశం': 'sky',
    'సూర్యుడు': 'sun', 'చంద్రుడు': 'moon', 'నక్షత్రం': 'star', 'మేఘం': 'cloud', 'వర్షం': 'rain',
    'నది': 'river', 'సముద్రం': 'sea', 'పర్వతం': 'mountain', 'అడవి': 'forest', 'చెట్టు': 'tree',
    'పువ్వు': 'flower', 'పండు': 'fruit', 'ఫలం': 'fruit, result', 'చీకటి': 'darkness',
    'ఋతువు': 'season', 'ప్రకృతి': 'nature', 'ప్రపంచం': 'world',

    // Food
    'అన్నం': 'cooked rice', 'పప్పు': 'lentils', 'కూర': 'curry', 'ఉప్పు': 'salt', 'చక్కెర': 'sugar',
    'పాలు': 'milk', 'పెరుగు': 'yogurt', 'గుడ్డు': 'egg', 'మామిడి': 'mango', 'కొబ్బరి': 'coconut',
    'ద్రాక్ష': 'grape', 'నిమ్మకాయ': 'lemon', 'ఉల్లిపాయ': 'onion', 'వెల్లుల్లి': 'garlic',
    'మిరపకాయ': 'chili pepper', 'చింతపండు': 'tamarind', 'ఆహారం': 'food',

    // Home and things
    'ఇల్లు': 'house', 'గది': 'room', 'తలుపు': 'door', 'కిటికీ': 'window', 'కుర్చీ': 'chair',
    'దీపం': 'lamp', 'గడియారం': 'clock', 'గొడుగు': 'umbrella', 'బట్టలు': 'clothes', 'చొక్కా': 'shirt',
    'పుస్తకం': 'book', 'కాగితం': 'paper', 'ఉత్తరం': 'letter, north', 'బహుమతి': 'gift',
    'డబ్బు': 'money', 'బంగారం': 'gold', 'ఖర్చు': 'expense', 'ఋణం': 'debt',

    // Places
    'వీధి': 'street', 'ఊరు': 'village, town', 'నగరం': 'city', 'రాష్ట్రం': 'state', 'దేశం': 'country',
    'భారతదేశం': 'India', 'బడి': 'school', 'పాఠశాల': 'school (formal)', 'తూర్పు': 'east', 'దక్షిణం': 'south',

    // Language and learning
    'తెలుగు': 'Telugu', 'భాష': 'language', 'లిపి': 'script', 'వర్ణమాల': 'alphabet',
    'అక్షరం': 'letter of the alphabet', 'అచ్చు': 'vowel', 'హల్లు': 'consonant', 'పదం': 'word',
    'వాక్యం': 'sentence', 'అర్థం': 'meaning', 'ఉచ్చారణ': 'pronunciation', 'ఉదాహరణ': 'example',
    'అభ్యాసం': 'practice', 'పాఠం': 'lesson', 'పరీక్ష': 'exam', 'ప్రశ్న': 'question',
    'సమాధానం': 'answer', 'పేరు': 'name', 'కథ': 'story', 'పాట': 'song', 'సంగీతం': 'music',
    'సంస్కృతి': 'culture', 'పండుగ': 'festival',

    // Time and number
    'రోజు': 'day', 'రాత్రి': 'night', 'ఉదయం': 'morning', 'సాయంత్రం': 'evening', 'రేపు': 'tomorrow',
    'నెల': 'month', 'సంవత్సరం': 'year', 'నిమిషం': 'minute', 'క్షణం': 'moment', 'సమయం': 'time',
    'ఆదివారం': 'Sunday', 'సోమవారం': 'Monday', 'ఇప్పుడు': 'now', 'అప్పుడు': 'then', 'ఎప్పుడు': 'when',
    'ఒకటి': 'one', 'రెండు': 'two', 'మూడు': 'three', 'నాలుగు': 'four', 'ఐదు': 'five', 'ఆరు': 'six',
    'ఏడు': 'seven', 'ఎనిమిది': 'eight', 'తొమ్మిది': 'nine', 'పది': 'ten',

    // Colors and qualities
    'ఎరుపు': 'red', 'నలుపు': 'black', 'తెలుపు': 'white', 'పసుపు': 'turmeric, yellow',
    'ఆకుపచ్చ': 'green', 'పెద్ద': 'big', 'చిన్న': 'small', 'మంచి': 'good',

    // Feelings and ideas
    'నిజం': 'truth', 'అబద్ధం': 'lie', 'కష్టం': 'difficulty', 'ఇష్టం': 'liking',
    'సంతోషం': 'happiness', 'దుఃఖం': 'sorrow', 'భయం': 'fear', 'ప్రేమ': 'love', 'నిద్ర': 'sleep',
    'ఆరోగ్యం': 'health', 'శక్తి': 'power', 'ధైర్యం': 'courage', 'జ్ఞానం': 'knowledge',
    'శ్రద్ధ': 'care, attention', 'ఆలోచన': 'thought', 'అనుభవం': 'experience', 'అవకాశం': 'opportunity',
    'అదృష్టం': 'luck', 'జీవితం': 'life', 'సహాయం': 'help', 'ప్రయాణం': 'journey', 'విషయం': 'matter, subject',
    'వ్యవసాయం': 'farming', 'కృషి': 'effort', 'దృష్టి': 'sight', 'యుద్ధం': 'war', 'స్వర్గం': 'heaven',
    'మౌనం': 'silence',

    // Small words
    'నేను': 'I', 'నువ్వు': 'you', 'మీరు': 'you (plural or polite)', 'మేము': 'we (not you)',
    'అతను': 'he', 'ఆమె': 'she', 'అది': 'that one, it', 'ఇది': 'this one', 'ఎవరు': 'who',
    'ఏమి': 'what', 'ఎక్కడ': 'where', 'ఎందుకు': 'why', 'ఎలా': 'how', 'అవును': 'yes',
    'కాదు': 'no, not', 'లేదు': 'is not', 'ఉంది': 'is', 'ఇక్కడ': 'here', 'అక్కడ': 'there',
    'లోపల': 'inside', 'బయట': 'outside', 'చాలా': 'very, a lot', 'కొంచెం': 'a little',
    'మళ్ళీ': 'again', 'ఒక': 'a, one', 'నా': 'my', 'నీ': 'your', 'మా': 'our (not yours)',
    'మీ': 'your (plural or polite)', 'ఈ': 'this', 'ఆ': 'that', 'ఏ': 'which', 'పూ': 'flower (short form)',

    // Doing
    'రా': 'come', 'పో': 'go', 'తిను': 'eat', 'తాగు': 'drink', 'చూడు': 'look', 'విను': 'listen',
    'చెప్పు': 'say', 'పాడు': 'sing', 'అడుగు': 'ask, step', 'చదువు': 'study', 'తెలుసు': 'known',
    'కావాలి': 'wanted', 'నమస్కారం': 'greetings, hello', 'ధన్యవాదాలు': 'thanks',
  };

  const seen = new Set();
  const words = Object.entries(LIST).map(([te, en]) => {
    const syllables = TD.syllables(te);
    if (!syllables) throw new Error('words-data: cannot read the word ' + te);
    if (syllables.length > MAX_CHARACTERS) throw new Error('words-data: ' + te + ' is longer than ' + MAX_CHARACTERS + ' characters');
    if (!en) throw new Error('words-data: ' + te + ' has no meaning');
    if (seen.has(te)) throw new Error('words-data: ' + te + ' is listed twice');
    seen.add(te);
    return Object.freeze({ te, en, syllables, sounds: syllables.reduce((n, s) => n + s.parts.length, 0) });
  });

  const api = Object.freeze({ words, MAX_CHARACTERS, get: te => words.find(w => w.te === te) || null });

  root.TeluguWords = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
