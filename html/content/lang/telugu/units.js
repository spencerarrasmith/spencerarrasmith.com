/* ═════════════════════════════════════════════════════════
   units.js — the list of everything in the app: sections,
   their tiles (Review among them, first in Training), and the
   pages that are not tiles (Profile). Edit it HERE, once.
   Exposes window.TeluguUnits.

   Read by
     index.html        draws the home page and routes #/<id>
     profile.html      charts the games marked `stats`
                       (load settings.js before this file there and in
                       training/01_review.html: Review names follow the notation)
     training/01_review.html   names each game in the Review list
     lesson-shell.js   the "Coming soon" pages, and a lesson's
                       section and title when it doesn't give them

   ADD A SECTION   push a new { title, tiles: [...] }.
   ADD A TILE      push a new object into a section's tiles.

   TILE FIELDS
     id      unique slug: the URL (#/phonemes) and the key saved
             progress is stored under. Never change one, even when
             the file is renamed, or its history is lost.
     icon    shown on the tile. A short Telugu string where the page is about
             the script (క, కా, అఆ): at most two letters, to fit the box.
             Otherwise a plain object or symbol emoji (📕 🔍 🏠); no faces
             or playful ones (👀 👋 🎯).
     title   tile heading, and the page's heading
     desc    one-line description
     src     path to the page, from this folder
     soon    { learn, practice, fits } → the page is a placeholder.
             The three lines are what its "Coming soon" page says.
             The tile still opens, and is drawn dashed with a "Soon"
             badge.
             Delete the whole `soon` block when the real page
             replaces the placeholder.
     stats   true → a practice game whose sessions are recorded
             (game-core.js) and charted on the Profile page. A game
             without it (Lookalikes, a self-guided training tool)
             tells game-core.js not to keep its sessions: record: false
     review  { gameId: 'Name' } → names for the Review list, keyed
             by the id a page records its misses under. Only needed
             where the tile's own id and title won't do: a second
             direction (phonemes-reverse) or a longer name.
             {sound} in a name becomes IPA or ISO, whichever the reader
             chose on the home page (settings.js).
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const sections = [
    {
      title: "Reference",
      tiles: [
        { id: "links", icon: "🔗", title: "External Links",
          desc: "Resources and references on external sites",
          src: "reference/00_external.html" },
        { id: "rosetta", icon: "అa", title: "Rosetta Stone",
          desc: "Every letter with its IPA and ISO sounds, a Telugu word, and an English word",
          src: "reference/01_rosetta.html" },
        { id: "signs-conjuncts", icon: "శ్రీ", title: "Signs & Conjuncts",
          desc: "Every letter with each vowel sign, and as the second letter of a conjunct",
          src: "reference/02_signs-conjuncts.html" },
        { id: "sound-charts", icon: "ఇఉ", title: "Sound Charts",
          desc: "Telugu and English sounds side by side on the vowel and consonant charts",
          src: "reference/03_sound-charts.html" },
        { id: "reference-idioms", icon: "📜", title: "Idioms & Proverbs",
          desc: "Sayings and what they mean",
          src: "reference/04_idioms.html",
          soon: {
            learn:    "Common idioms and proverbs, their literal meaning, and when they are used",
            practice: "Match saying to meaning; a browsable list",
            fits:     "Linked from lessons where a saying fits" } },
        { id: "reference-dictionary", icon: "📕", title: "Dictionary",
          desc: "Search words in English and Telugu",
          src: "reference/05_dictionary.html",
          soon: {
            learn:    "A searchable word list covering the vocabulary units",
            practice: "Look up a word; tap to see its sound and sample use",
            fits:     "Grows as vocabulary units are built" } },
        { id: "reference-verbs", icon: "⚡", title: "Important Verbs",
          desc: "The verbs you will use most.",
          src: "reference/06_verbs.html",
          soon: {
            learn:    "A compact table of high-frequency verbs and their main forms",
            practice: "Browse and quiz yourself on forms",
            fits:     "Supports the tense units" } },
      ],
    },
    {
      title: "Training",
      tiles: [
        // Review: the home page shows how many items are waiting on this tile, and
        // highlights it (and the section's arrow) while there are any
        { id: "review", icon: "🔁", title: "Review",
          desc: "Replay the items you missed in any game",
          src: "training/01_review.html" },
        { id: "lookalike-builder", icon: "ం", title: "Lookalike Builder",
          desc: "Generate a CSV dataset for Lookalike practice",
          src: "training/02_lookalike-builder.html" },
        { id: "lookalikes", icon: "ఒబ", title: "Lookalikes",
          desc: "Customized training from Lookalike CSV files",
          src: "training/03_lookalikes.html",
          review: { lookalikes: "Lookalikes ({sound} → Telugu)" } },
      ],
    },
    {
      title: "Alphabet",
      tiles: [
        { id: "phonemes", icon: "క", title: "Phonemes",
          desc: "Match each Telugu character to its sound",
          src: "alphabet/01_phonemes.html", stats: true,
          review: { "phonemes-reverse": "Phonemes ({sound} → Telugu)" } },
        { id: "diacritics", icon: "కా", title: "Diacritics",
          desc: "Match the consonant and vowel sound of each character",
          src: "alphabet/02_diacritics.html", stats: true,
          review: { "diacritics-reverse": "Diacritics ({sound} → Diacritics)" } },
        { id: "conjuncts", icon: "క్ష", title: "Conjuncts",
          desc: "Match the consonants in combined characters",
          src: "alphabet/03_conjuncts.html", stats: true,
          review: { "conjuncts-reverse": "Conjuncts ({sound} → Conjuncts)" } },
        { id: "words", icon: "పద", title: "Words",
          desc: "Spell out whole words, one sound at a time",
          src: "alphabet/04_words.html", stats: true },
      ],
    },
    {
      title: "Grammar",
      tiles: [
        { id: "grammar-sentence", icon: "🧱", title: "Sentence Skeleton",
          desc: "The basic shape of a Telugu sentence.",
          src: "grammar/01_sentence.html",
          soon: {
            learn:    "Where subject, object, and verb sit, and how that differs from English word order.",
            practice: "Rebuild jumbled sentences and fill in the missing piece.",
            fits:     "Returns in Advanced Grammar when sentences get longer." } },
        { id: "grammar-nouns", icon: "🏷️", title: "Nouns: Gender & Number",
          desc: "Genders, plurals, and how nouns change.",
          src: "grammar/02_nouns.html",
          soon: {
            learn:    "How Telugu sorts nouns by gender, how plurals are formed, and which nouns behave differently.",
            practice: "Sort nouns by gender, build plurals, and match singular to plural.",
            fits:     "Revisited with case endings and again in verb agreement." } },
        { id: "grammar-cases", icon: "🔗", title: "Case Endings",
          desc: "Endings that mark the role of a noun.",
          src: "grammar/03_cases.html",
          soon: {
            learn:    "The endings that say who does what to whom, where, and with what, and how they attach to nouns.",
            practice: "Choose the right ending for a sentence and decline sample nouns.",
            fits:     "Revisited with pronouns and in Advanced Grammar." } },
        { id: "grammar-pronouns", icon: "👤", title: "Pronouns",
          desc: "I, you, he, she, it, and their forms.",
          src: "grammar/04_pronouns.html",
          soon: {
            learn:    "Personal pronouns, the inclusive/exclusive “we”, respect levels, and how pronouns take case endings.",
            practice: "Match pronoun to role, then swap pronouns inside short sentences.",
            fits:     "Revisited in Commands and Questions." } },
        { id: "grammar-adjectives", icon: "🎨", title: "Adjectives",
          desc: "Describing words and how they attach.",
          src: "grammar/05_adjectives.html",
          soon: {
            learn:    "How adjectives sit before nouns, which ones change form, and how comparisons are made.",
            practice: "Pair adjectives with nouns and build simple comparisons.",
            fits:     "Revisited in the Vocabulary units." } },
        { id: "grammar-verbs", icon: "⚙️", title: "Verb Basics",
          desc: "Verb roots, endings, and agreement.",
          src: "grammar/06_verbs.html",
          soon: {
            learn:    "How a verb is built from a root plus endings, and how it agrees with the person doing the action.",
            practice: "Attach endings to roots and pick the form that matches the subject.",
            fits:     "Expanded in the three tense units under Advanced Grammar." } },
        { id: "grammar-tenses", icon: "⏳", title: "Tenses",
          desc: "Overview of past, present, and future.",
          src: "grammar/07_tenses.html",
          soon: {
            learn:    "A first look at how time is marked on verbs, before the detailed tense units.",
            practice: "Sort sentences by time and convert between simple tenses.",
            fits:     "Each tense gets its own unit under Advanced Grammar." } },
        { id: "grammar-indeclinables", icon: "📌", title: "Indeclinables",
          desc: "Words that never change form.",
          src: "grammar/08_indeclinables.html",
          soon: {
            learn:    "Particles, conjunctions, postpositions, and other words that stay the same whatever the sentence.",
            practice: "Choose the right linking word and complete sentences.",
            fits:     "Revisited in Useful expressions." } },
      ],
    },
    {
      title: "Vocabulary",
      tiles: [
        { id: "vocab-greetings", icon: "🙏", title: "Greetings",
          desc: "Hello, goodbye, and polite openers.",
          src: "vocabulary/01_greetings.html",
          soon: {
            learn:    "Everyday greetings and farewells, with the polite and casual versions.",
            practice: "Match, recall, and type the phrase for a situation.",
            fits:     "Reused in Useful expressions." } },
        { id: "vocab-numbers", icon: "౧", title: "Numbers",
          desc: "Counting, digits, and amounts.",
          src: "vocabulary/02_numbers.html",
          soon: {
            learn:    "Telugu numerals and number words, and how to say quantities and ordinals.",
            practice: "Read, hear-and-pick, and write numbers.",
            fits:     "Reused in Shopping and Time." } },
        { id: "vocab-home", icon: "🏠", title: "At Home",
          desc: "Rooms, furniture, and household words.",
          src: "vocabulary/03_home.html",
          soon: {
            learn:    "Names for things around the house and the family.",
            practice: "Picture-to-word and word-to-picture rounds.",
            fits:     "Reused in sentence units." } },
        { id: "vocab-shopping", icon: "🛒", title: "Shopping",
          desc: "Markets, prices, and bargaining.",
          src: "vocabulary/04_shopping.html",
          soon: {
            learn:    "Words for buying, paying, and asking prices.",
            practice: "Match words and rebuild short exchanges.",
            fits:     "Reused with Numbers." } },
        { id: "vocab-craftsmen", icon: "🔨", title: "Craftsmen",
          desc: "Trades and the people who do them.",
          src: "vocabulary/05_craftsmen.html",
          soon: {
            learn:    "Names of common trades and what each one does.",
            practice: "Match trade to job and complete sentences.",
            fits:     "Reused in Questions." } },
        { id: "vocab-food", icon: "🍛", title: "Food & Drink",
          desc: "Meals, ingredients, and ordering.",
          src: "vocabulary/06_food.html",
          soon: {
            learn:    "Everyday foods, tastes, and drinks.",
            practice: "Word recall rounds and short ordering scenarios.",
            fits:     "Reused in Hotel & restaurant." } },
        { id: "vocab-hotel", icon: "🏨", title: "Hotel & Restaurant",
          desc: "Booking, ordering, and asking for help.",
          src: "vocabulary/07_hotel.html",
          soon: {
            learn:    "Phrases for rooms, tables, menus, and bills.",
            practice: "Role-play style fill-in-the-blank exchanges.",
            fits:     "Builds on Food & drink." } },
        { id: "vocab-post", icon: "📮", title: "Post Office · Phone · Bank",
          desc: "Everyday services and errands.",
          src: "vocabulary/08_post.html",
          soon: {
            learn:    "Words for sending, calling, and handling money.",
            practice: "Match words to services and complete short requests.",
            fits:     "Reused in Questions." } },
        { id: "vocab-travel", icon: "🚌", title: "Traveling",
          desc: "Transportation, directions, and tickets.",
          src: "vocabulary/09_travel.html",
          soon: {
            learn:    "Vehicles, places, directions, and asking how to get somewhere.",
            practice: "Direction drills and short exchanges.",
            fits:     "Reused in Commands." } },
        { id: "vocab-health", icon: "🩺", title: "Health & Hygiene",
          desc: "Body, symptoms, and care.",
          src: "vocabulary/10_health.html",
          soon: {
            learn:    "Parts of the body and words for feeling sick or asking for help.",
            practice: "Match words and rebuild short exchanges.",
            fits:     "Reused in Commands." } },
        { id: "vocab-weather", icon: "⛅", title: "Weather",
          desc: "Seasons, sky, and temperature.",
          src: "vocabulary/11_weather.html",
          soon: {
            learn:    "Words for weather and seasons and how to talk about them.",
            practice: "Word recall and describe-the-picture rounds.",
            fits:     "Reused in tense units." } },
        { id: "vocab-time", icon: "🕒", title: "Time",
          desc: "Hours, days, and dates.",
          src: "vocabulary/12_time.html",
          soon: {
            learn:    "Telling time and naming days, months, and dates.",
            practice: "Read and say the time; order days and months.",
            fits:     "Builds on Numbers." } },
      ],
    },
    {
      title: "Advanced Grammar",
      tiles: [
        { id: "advanced-expressions", icon: "💬", title: "Useful Expressions",
          desc: "Ready-made phrases for daily use.",
          src: "advanced-grammar/01_expressions.html",
          soon: {
            learn:    "Set phrases for thanking, apologizing, asking, and agreeing, and how they are built.",
            practice: "Choose the right phrase for a situation.",
            fits:     "Draws on Indeclinables and Greetings." } },
        { id: "advanced-commands", icon: "📣", title: "Commands",
          desc: "Requests, orders, and polite forms.",
          src: "advanced-grammar/02_commands.html",
          soon: {
            learn:    "How commands are formed and softened for politeness.",
            practice: "Turn statements into commands and pick the polite form.",
            fits:     "Builds on Verb basics." } },
        { id: "advanced-present", icon: "▶️", title: "Present Tense",
          desc: "Saying what is happening now.",
          src: "advanced-grammar/03_present.html",
          soon: {
            learn:    "Forming the present, including the habitual and the continuous.",
            practice: "Conjugate verbs and complete sentences.",
            fits:     "Builds on Tenses." } },
        { id: "advanced-future", icon: "⏭️", title: "Future Tense",
          desc: "Saying what will happen.",
          src: "advanced-grammar/04_future.html",
          soon: {
            learn:    "Forming the future and expressing plans and likelihood.",
            practice: "Convert present to future and complete sentences.",
            fits:     "Builds on Tenses." } },
        { id: "advanced-past", icon: "⏮️", title: "Past Tense",
          desc: "Saying what has happened.",
          src: "advanced-grammar/05_past.html",
          soon: {
            learn:    "Forming the past, including completed actions and past continuous.",
            practice: "Conjugate verbs and rebuild short stories.",
            fits:     "Builds on Tenses." } },
        { id: "advanced-questions", icon: "❓", title: "Questions",
          desc: "Asking who, what, where, and why.",
          src: "advanced-grammar/06_questions.html",
          soon: {
            learn:    "Question words and the yes/no question marker, and where they sit in a sentence.",
            practice: "Form questions from statements and answer them.",
            fits:     "Builds on Pronouns." } },
        { id: "advanced-negatives", icon: "🚫", title: "Negatives",
          desc: "Saying no and not.",
          src: "advanced-grammar/07_negatives.html",
          soon: {
            learn:    "How negation works in each tense and with commands.",
            practice: "Turn positive sentences negative and spot the mistake.",
            fits:     "Builds on all three tense units." } },
        { id: "advanced-voice", icon: "🔄", title: "Voice & Causatives",
          desc: "Passive forms and “make or let someone do”.",
          src: "advanced-grammar/08_voice.html",
          soon: {
            learn:    "Passive-style constructions and how to express causing or allowing an action.",
            practice: "Convert sentences between forms and pick the right one.",
            fits:     "Comes last: it uses almost everything above." } },
      ],
    },
  ];

  // Pages that are not tiles: reached from the top right of the home page, opened the same way (#/<id>).
  const pages = [
    { id: "profile", title: "Profile", src: "profile.html" },     // each practice game's sessions over time
  ];

  const tiles = sections.flatMap(s => s.tiles);        // every tile, in home-page order
  const all   = tiles;                                 // the same list (Review used to sit outside the sections)

  // Catch typos while editing the list (a duplicate id breaks routing and progress).
  const byId = new Map(), sectionById = new Map(), labels = new Map();
  all.forEach(t => {
    if (byId.has(t.id)) throw new Error('units: duplicate tile id ' + t.id);
    byId.set(t.id, t);
  });
  pages.forEach(p => { if (byId.has(p.id)) throw new Error('units: a page and a tile share the id ' + p.id); });
  sections.forEach(s => s.tiles.forEach(t => sectionById.set(t.id, s)));
  all.forEach(t => Object.entries(t.review || {}).forEach(([game, name]) => {
    if (labels.has(game)) throw new Error('units: two names for review id ' + game);
    labels.set(game, name);
  }));

  // "IPA" or "ISO": how the reader has sounds written (IPA when settings.js isn't loaded)
  const soundName = () => (root.TeluguSettings ? root.TeluguSettings.label('notation') : 'IPA');

  const pretty = id => String(id).replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());

  const api = Object.freeze({
    sections, tiles, all, pages,
    get:       id => byId.get(id) || null,
    sectionOf: id => sectionById.get(id) || null,
    // Name of a game in the Review list: its `review` name, else its tile's
    // title, else the id cleaned up (a game that has no tile yet).
    label:     game => (labels.get(game) || (byId.has(game) ? byId.get(game).title : pretty(game))).replace('{sound}', soundName()),
  });

  root.TeluguUnits = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
