# Telugu Suite

Open `index.html` in a browser. Everything is static: no build step, no server needed (a plain double-click works). Opened that way there is no logging in: progress is kept in that browser only.

## Layout

| Folder | Holds | Home-page section |
|---|---|---|
| `reference/` | External Links, Rosetta Stone, Signs & Conjuncts, Sound Charts, idioms, dictionary, verbs | Reference |
| `training/` | Review (replay of missed items), Lookalike Builder, Lookalikes | Training |
| `alphabet/` | Phonemes, Diacritics, Conjuncts, Words | Alphabet |
| `grammar/` | Sentence, nouns, cases, … | Grammar |
| `vocabulary/` | Greetings, numbers, home, … | Vocabulary |
| `advanced-grammar/` | Expressions, commands, tenses, … | Advanced Grammar |

At the top level: `index.html` (the tile launcher, with the Profile button and the Settings menu at its top right), `profile.html` (each practice game's sessions over time, and a Danger Zone with "Reset statistics"), `lesson-template.html`, and the shared files:

| File | What it is |
|---|---|
| `settings.js` | App-wide choices, remembered in this browser. One so far: how sounds are written, IPA (`/k/`) or ISO 15919 (`ka`), chosen in the home page's Settings menu (☰). Loaded first on every page. Each change is stamped with its time, so a later choice made on another device wins when the two are synced. |
| `units.js` | The one list of sections and tiles. The home page, Review, and the "Coming soon" pages all read it. |
| `telugu-data.js`, `lookalikes-data.js` | Letters, signs, digits, clusters, and lookalike groups, each sound in both IPA and ISO; `notation` (which of the two to show), `read()` (the sound of any Telugu character), and `syllables()` (a whole word split into its characters, each with the sounds it spells); the CSV reader the Lookalikes game and the Lookalike Builder share. |
| `progress.js` | Missed items and every session a game finished (this browser only; Lookalikes, a training tool with no chart, keeps none). The sessions are what the Profile page charts; "Reset statistics" there erases both. A missed character is stored as the character, so Review can show it in either notation. Two copies of the store (this browser's and an account's) can be merged without losing anything: each change carries its time, and what Review cleared or "Reset statistics" erased stays erased ("SYNCING" at the top of the file). |
| `sync.js` | Logging in, and keeping progress and settings the same on every device. Runs on the home page only, and only when the app comes from the website: it keeps this browser's copy and the account's in step (merging them, so nothing is lost), and the home page shows who is logged in, with Log In / Log Out, at its top right. The accounts are kept by PocketBase on the same site, at `/api/` (`pocketbase/` at the top of the website repo). |
| `vendor/` | Other people's code, each file with its version in its name and its license beside it: the PocketBase client (`pocketbase-0.29.0.umd.js`), which `sync.js` uses. |
| `game-core.js`, `game-menu.js` | The round every game plays (deck, counters, complete screen), and the keyboard options plus the ⋮ menu of a game that has one. |
| `game-setup.js` | The popup a game opens before a session. It holds every option the game has (direction, number of rounds, the mistake that is game over, and its checkboxes, among them whether missed guesses reappear), so a game that uses it has no ⋮ menu. Used by Phonemes, Diacritics, Conjuncts, and Words; Lookalikes keeps its ⋮ menu. |
| `lesson-shell.js` | The frame for lesson pages and the "Coming soon" placeholders. |
| `base.css` | Fonts, reset, and color tokens. Defined here only. |
| `fonts/` | The font files `base.css` loads (Inter, Noto Sans, Noto Sans Telugu, and the Lookalike Builder's two extra Telugu faces), each with its license. No font comes from another site. They are built by `tools/build-telugu-fonts.sh` at the top of the website repo; a rebuilt font gets a new file name. |
| `home.css`, `game.css`, `shell.css`, `reference.css` | One stylesheet per kind of page: home (and the External Links page, which is laid out as tiles), games, lessons/placeholders/Review, and the Reference pages (on top of `game.css`). |

## Conventions

- Pages are named `NN_name.html`, numbered in the order their tiles appear on the home page.
- A page in a section folder links the top-level files as `../…` (for example `../game.css`). Data that belongs to one page sits next to it (`reference/rosetta-data.js`, `reference/signs-conjuncts-data.js`, `reference/sound-charts-data.js`, `alphabet/words-data.js`: the Words game's 250 words and their meanings).
- Tile ids in `units.js` never change when a file is renamed, so saved progress is kept.
- A page's title, description, and placeholder text are written once, in its tile in `units.js`.
- To build a lesson: copy `lesson-template.html` over the placeholder in its folder (and put `../` in front of its six links), then delete the `soon` block from its tile in `units.js`.
- To build a game: start from `alphabet/01_phonemes.html`. `GameCore.create({ id, pool, render, … })` runs the round; the page draws its card and keyboard and calls `game.judge(right, …)`. All five games are built this way. Words, whose card takes one answer for every sound of a word, calls `game.step(right, …)` for each and `game.judge()` when the word is done, so mistakes are counted by the sound.
- A page never prints `.ipa` or `.iso` itself, or adds slashes. It asks `TeluguData.notation`: `notation.wrap(notation.letter(l))` gives `/k/` or `ka`, whichever the reader chose. Answers are still compared by `ipa`, which is each letter's key whatever is on screen. Rosetta Stone is the exception: it always shows both.
- A page only gets a `<style>` block for layout that is its own. Colors and fonts are never set in a page.
