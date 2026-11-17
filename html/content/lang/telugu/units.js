/* ═════════════════════════════════════════════════════════
   units.js — the list of everything in the app: sections,
   their tiles, and the Review tile. Edit it HERE, once.
   Exposes window.TeluguUnits.

   Read by
     index.html        draws the home page and routes #/<id>
     review.html       names each game in the Review list
     lesson-shell.js   the "Coming soon" pages, and a lesson's
                       section and title when it doesn't give them

   ADD A SECTION   push a new { title, tiles: [...] }.
   ADD A TILE      push a new object into a section's tiles.

   TILE FIELDS
     id      unique slug: the URL (#/phonemes) and the key saved
             progress is stored under. Never change one, even when
             the file is renamed, or its ✓ is lost.
     icon    shown on the tile. A short Telugu string where the page is about
             the script (క, కా, అఆ): at most two letters, to fit the box.
             Otherwise a plain object or symbol emoji (📕 🔍 🏠); no faces
             or playful ones (👀 👋 🎯).
     title   tile heading, and the page's heading
     desc    one-line description
     src     path to the page, from this folder
     soon    { learn, practise, fits } → the page is a placeholder.
             The three lines are what its "Coming soon" page says.
             The tile still opens, is drawn dashed with a "Soon"
             badge and is left out of the section's "ready" count.
             Delete the whole `soon` block when the real page
             replaces the placeholder.
     review  { gameId: 'Name' } → names for the Review list, keyed
             by the id a page records its misses under. Only needed
             where the tile's own id and title won't do: a second
             direction (phonemes-reverse) or a longer name.
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const sections = [
    {
      title: "Resources",
      tiles: [
        { id: "rosetta", icon: "అa", title: "Rosetta Stone",
          desc: "Every letter with its IPA and ISO sounds, a Telugu word and an English word.",
          src: "reference/01_rosetta.html" },
        { id: "signs-conjuncts", icon: "శ్రీ", title: "Signs & conjuncts",
          desc: "Every letter with each vowel sign, and as the second letter of a conjunct.",
          src: "reference/02_signs-conjuncts.html" },
        { id: "reference-idioms", icon: "📜", title: "Idioms & proverbs",
          desc: "Sayings and what they mean.",
          src: "reference/03_idioms.html",
          soon: {
            learn:    "Common idioms and proverbs, their literal meaning and when they are used.",
            practise: "Match saying to meaning; a browsable list.",
            fits:     "Linked from lessons where a saying fits." } },
        { id: "reference-dictionary", icon: "📕", title: "Dictionary",
          desc: "Search words in English and Telugu.",
          src: "reference/04_dictionary.html",
          soon: {
            learn:    "A searchable word list covering the vocabulary units.",
            practise: "Look up a word; tap to see its sound and sample use.",
            fits:     "Grows as vocabulary units are built." } },
        { id: "reference-verbs", icon: "⚡", title: "Important verbs",
          desc: "The verbs you will use most.",
          src: "reference/05_verbs.html",
          soon: {
            learn:    "A compact table of high-frequency verbs and their main forms.",
            practise: "Browse and quiz yourself on forms.",
            fits:     "Supports the tense units." } },
      ],
    },
    {
      title: "Alphabet",
      tiles: [
        { id: "phonemes", icon: "క", title: "Phonemes",
          desc: "Match each Telugu letter to its IPA phoneme.",
          src: "alphabet/01_phonemes.html",
          review: { "phonemes-reverse": "Phonemes (IPA → Telugu)" } },
        { id: "diacritics", icon: "కా", title: "Diacritics",
          desc: "Pick the consonant and the vowel sound of each syllable.",
          src: "alphabet/02_diacritics.html",
          review: { "diacritics-reverse": "Diacritics (IPA → Diacritics)" } },
        { id: "conjuncts", icon: "క్ష", title: "Conjuncts",
          desc: "Pick every consonant in a combined letter.",
          src: "alphabet/03_conjuncts.html",
          review: { "conjuncts-reverse": "Conjuncts (IPA → Conjuncts)" } },
        { id: "lookalike-builder", icon: "🛠️", title: "Lookalike Builder",
          desc: "Mark which characters look alike and export a CSV.",
          src: "alphabet/04_lookalike-builder.html" },
        { id: "lookalikes", icon: "ఒబ", title: "Lookalikes",
          desc: "Hear the sound, pick the right lookalike.",
          src: "alphabet/05_lookalikes.html",
          review: { lookalikes: "Lookalikes (IPA → Telugu)" } },
        { id: "spelling", icon: "🔍", title: "Spelling pitfalls",
          desc: "Common mistakes when writing Telugu words.",
          src: "alphabet/06_spelling.html",
          soon: {
            learn:    "The spots where learners most often misspell: look-alike letters, doubled consonants, long versus short vowels and misplaced signs.",
            practise: "Spot-the-error and choose-the-correct-spelling drills.",
            fits:     "Slips here will feed the Review page." } },
        { id: "writing", icon: "✍️", title: "Writing",
          desc: "Trace and write letters from memory.",
          src: "alphabet/07_writing.html",
          soon: {
            learn:    "Stroke order and proportions for each letter, vowel sign and common conjunct.",
            practise: "Trace first, then write from memory and compare against the model.",
            fits:     "Letters you find hardest will come back more often." } },
        { id: "alphabet-chart", icon: "అఆ", title: "Alphabet Chart",
          desc: "Every letter grouped by how it is made.",
          src: "alphabet/08_alphabet-chart.html",
          soon: {
            learn:    "The full set laid out by place of articulation, so the pattern behind the order is visible.",
            practise: "A reference page to browse; tap a letter to see its sound and its flags (rare, extra).",
            fits:     "Linked from the lessons wherever a letter appears." } },
      ],
    },
    {
      title: "Grammar",
      tiles: [
        { id: "grammar-sentence", icon: "🧱", title: "Sentence skeleton",
          desc: "The basic shape of a Telugu sentence.",
          src: "grammar/01_sentence.html",
          soon: {
            learn:    "Where subject, object and verb sit, and how that differs from English word order.",
            practise: "Rebuild jumbled sentences and fill in the missing piece.",
            fits:     "Returns in Advanced Grammar when sentences get longer." } },
        { id: "grammar-nouns", icon: "🏷️", title: "Nouns: gender & number",
          desc: "Genders, plurals and how nouns change.",
          src: "grammar/02_nouns.html",
          soon: {
            learn:    "How Telugu sorts nouns by gender, how plurals are formed and which nouns behave differently.",
            practise: "Sort nouns by gender, build plurals and match singular to plural.",
            fits:     "Revisited with case endings and again in verb agreement." } },
        { id: "grammar-cases", icon: "🔗", title: "Case endings",
          desc: "Endings that mark the role of a noun.",
          src: "grammar/03_cases.html",
          soon: {
            learn:    "The endings that say who does what to whom, where and with what, and how they attach to nouns.",
            practise: "Choose the right ending for a sentence and decline sample nouns.",
            fits:     "Revisited with pronouns and in Advanced Grammar." } },
        { id: "grammar-pronouns", icon: "👤", title: "Pronouns",
          desc: "I, you, he, she, it and their forms.",
          src: "grammar/04_pronouns.html",
          soon: {
            learn:    "Personal pronouns, the inclusive/exclusive “we”, respect levels and how pronouns take case endings.",
            practise: "Match pronoun to role, then swap pronouns inside short sentences.",
            fits:     "Revisited in Commands and Questions." } },
        { id: "grammar-adjectives", icon: "🎨", title: "Adjectives",
          desc: "Describing words and how they attach.",
          src: "grammar/05_adjectives.html",
          soon: {
            learn:    "How adjectives sit before nouns, which ones change form and how comparisons are made.",
            practise: "Pair adjectives with nouns and build simple comparisons.",
            fits:     "Revisited in the Vocabulary units." } },
        { id: "grammar-verbs", icon: "⚙️", title: "Verb basics",
          desc: "Verb roots, endings and agreement.",
          src: "grammar/06_verbs.html",
          soon: {
            learn:    "How a verb is built from a root plus endings, and how it agrees with the person doing the action.",
            practise: "Attach endings to roots and pick the form that matches the subject.",
            fits:     "Expanded in the three tense units under Advanced Grammar." } },
        { id: "grammar-tenses", icon: "⏳", title: "Tenses",
          desc: "Overview of past, present and future.",
          src: "grammar/07_tenses.html",
          soon: {
            learn:    "A first look at how time is marked on verbs, before the detailed tense units.",
            practise: "Sort sentences by time and convert between simple tenses.",
            fits:     "Each tense gets its own unit under Advanced Grammar." } },
        { id: "grammar-indeclinables", icon: "📌", title: "Indeclinables",
          desc: "Words that never change form.",
          src: "grammar/08_indeclinables.html",
          soon: {
            learn:    "Particles, conjunctions, postpositions and other words that stay the same whatever the sentence.",
            practise: "Choose the right linking word and complete sentences.",
            fits:     "Revisited in Useful expressions." } },
      ],
    },
    {
      title: "Vocabulary",
      tiles: [
        { id: "vocab-greetings", icon: "🙏", title: "Greetings",
          desc: "Hello, goodbye and polite openers.",
          src: "vocabulary/01_greetings.html",
          soon: {
            learn:    "Everyday greetings and farewells, with the polite and casual versions.",
            practise: "Match, recall and type the phrase for a situation.",
            fits:     "Reused in Useful expressions." } },
        { id: "vocab-numbers", icon: "౧", title: "Numbers",
          desc: "Counting, digits and amounts.",
          src: "vocabulary/02_numbers.html",
          soon: {
            learn:    "Telugu numerals and number words, and how to say quantities and ordinals.",
            practise: "Read, hear-and-pick and write numbers.",
            fits:     "Reused in Shopping and Time." } },
        { id: "vocab-home", icon: "🏠", title: "At home",
          desc: "Rooms, furniture and household words.",
          src: "vocabulary/03_home.html",
          soon: {
            learn:    "Names for things around the house and the family.",
            practise: "Picture-to-word and word-to-picture rounds.",
            fits:     "Reused in sentence units." } },
        { id: "vocab-shopping", icon: "🛒", title: "Shopping",
          desc: "Markets, prices and bargaining.",
          src: "vocabulary/04_shopping.html",
          soon: {
            learn:    "Words for buying, paying and asking prices.",
            practise: "Match words and rebuild short exchanges.",
            fits:     "Reused with Numbers." } },
        { id: "vocab-craftsmen", icon: "🔨", title: "Craftsmen",
          desc: "Trades and the people who do them.",
          src: "vocabulary/05_craftsmen.html",
          soon: {
            learn:    "Names of common trades and what each one does.",
            practise: "Match trade to job and complete sentences.",
            fits:     "Reused in Questions." } },
        { id: "vocab-food", icon: "🍛", title: "Food & drink",
          desc: "Meals, ingredients and ordering.",
          src: "vocabulary/06_food.html",
          soon: {
            learn:    "Everyday foods, tastes and drinks.",
            practise: "Word recall rounds and short ordering scenarios.",
            fits:     "Reused in Hotel & restaurant." } },
        { id: "vocab-hotel", icon: "🏨", title: "Hotel & restaurant",
          desc: "Booking, ordering and asking for help.",
          src: "vocabulary/07_hotel.html",
          soon: {
            learn:    "Phrases for rooms, tables, menus and bills.",
            practise: "Role-play style fill-in-the-gap exchanges.",
            fits:     "Builds on Food & drink." } },
        { id: "vocab-post", icon: "📮", title: "Post office · phone · bank",
          desc: "Everyday services and errands.",
          src: "vocabulary/08_post.html",
          soon: {
            learn:    "Words for sending, calling and handling money.",
            practise: "Match words to services and complete short requests.",
            fits:     "Reused in Questions." } },
        { id: "vocab-travel", icon: "🚌", title: "Travelling",
          desc: "Transport, directions and tickets.",
          src: "vocabulary/09_travel.html",
          soon: {
            learn:    "Vehicles, places, directions and asking the way.",
            practise: "Direction drills and short exchanges.",
            fits:     "Reused in Commands." } },
        { id: "vocab-health", icon: "🩺", title: "Health & hygiene",
          desc: "Body, symptoms and care.",
          src: "vocabulary/10_health.html",
          soon: {
            learn:    "Parts of the body and words for feeling unwell or asking for help.",
            practise: "Match words and rebuild short exchanges.",
            fits:     "Reused in Commands." } },
        { id: "vocab-weather", icon: "⛅", title: "Weather",
          desc: "Seasons, sky and temperature.",
          src: "vocabulary/11_weather.html",
          soon: {
            learn:    "Words for weather and seasons and how to talk about them.",
            practise: "Word recall and describe-the-picture rounds.",
            fits:     "Reused in tense units." } },
        { id: "vocab-time", icon: "🕒", title: "Time",
          desc: "Hours, days and dates.",
          src: "vocabulary/12_time.html",
          soon: {
            learn:    "Telling the time and naming days, months and dates.",
            practise: "Read and say the time; order days and months.",
            fits:     "Builds on Numbers." } },
      ],
    },
    {
      title: "Advanced Grammar",
      tiles: [
        { id: "advanced-expressions", icon: "💬", title: "Useful expressions",
          desc: "Ready-made phrases for daily use.",
          src: "advanced-grammar/01_expressions.html",
          soon: {
            learn:    "Set phrases for thanking, apologising, asking and agreeing, and how they are built.",
            practise: "Choose the right phrase for a situation.",
            fits:     "Draws on Indeclinables and Greetings." } },
        { id: "advanced-commands", icon: "📣", title: "Commands",
          desc: "Requests, orders and polite forms.",
          src: "advanced-grammar/02_commands.html",
          soon: {
            learn:    "How commands are formed and softened for politeness.",
            practise: "Turn statements into commands and pick the polite form.",
            fits:     "Builds on Verb basics." } },
        { id: "advanced-present", icon: "▶️", title: "Present tense",
          desc: "Saying what is happening now.",
          src: "advanced-grammar/03_present.html",
          soon: {
            learn:    "Forming the present, including the habitual and the continuous.",
            practise: "Conjugate verbs and complete sentences.",
            fits:     "Builds on Tenses." } },
        { id: "advanced-future", icon: "⏭️", title: "Future tense",
          desc: "Saying what will happen.",
          src: "advanced-grammar/04_future.html",
          soon: {
            learn:    "Forming the future and expressing plans and likelihood.",
            practise: "Convert present to future and complete sentences.",
            fits:     "Builds on Tenses." } },
        { id: "advanced-past", icon: "⏮️", title: "Past tense",
          desc: "Saying what has happened.",
          src: "advanced-grammar/05_past.html",
          soon: {
            learn:    "Forming the past, including completed actions and past continuous.",
            practise: "Conjugate verbs and rebuild short stories.",
            fits:     "Builds on Tenses." } },
        { id: "advanced-questions", icon: "❓", title: "Questions",
          desc: "Asking who, what, where and why.",
          src: "advanced-grammar/06_questions.html",
          soon: {
            learn:    "Question words and the yes/no question marker, and where they sit in a sentence.",
            practise: "Form questions from statements and answer them.",
            fits:     "Builds on Pronouns." } },
        { id: "advanced-negatives", icon: "🚫", title: "Negatives",
          desc: "Saying no and not.",
          src: "advanced-grammar/07_negatives.html",
          soon: {
            learn:    "How negation works in each tense and with commands.",
            practise: "Turn positive sentences negative and spot the mistake.",
            fits:     "Builds on all three tense units." } },
        { id: "advanced-voice", icon: "🔄", title: "Voice & causatives",
          desc: "Passive forms and “make or let someone do”.",
          src: "advanced-grammar/08_voice.html",
          soon: {
            learn:    "Passive-style constructions and how to express causing or allowing an action.",
            practise: "Convert sentences between forms and pick the right one.",
            fits:     "Comes last: it uses almost everything above." } },
      ],
    },
  ];

  // Pinned above the sections (not part of the learning path). Same tile fields.
  const featured = [
    { id: "review", icon: "🔁", title: "Review",
      desc: "Replay the items you missed in any game.",
      src: "review.html" },
  ];

  const tiles = sections.flatMap(s => s.tiles);        // the learning path, in home-page order
  const all   = [...featured, ...tiles];               // everything that has a route

  // Catch typos while editing the list (a duplicate id breaks routing and progress).
  const byId = new Map(), sectionById = new Map(), labels = new Map();
  all.forEach(t => {
    if (byId.has(t.id)) throw new Error('units: duplicate tile id ' + t.id);
    byId.set(t.id, t);
  });
  sections.forEach(s => s.tiles.forEach(t => sectionById.set(t.id, s)));
  all.forEach(t => Object.entries(t.review || {}).forEach(([game, name]) => {
    if (labels.has(game)) throw new Error('units: two names for review id ' + game);
    labels.set(game, name);
  }));

  const pretty = id => String(id).replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());

  const api = Object.freeze({
    sections, featured, tiles, all,
    get:       id => byId.get(id) || null,
    sectionOf: id => sectionById.get(id) || null,
    // Name of a game in the Review list: its `review` name, else its tile's
    // title, else the id tidied up (a game that has no tile yet).
    label:     game => labels.get(game) || (byId.has(game) ? byId.get(game).title : pretty(game)),
  });

  root.TeluguUnits = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
