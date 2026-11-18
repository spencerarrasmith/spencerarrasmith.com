# Telugu Suite

Open `index.html` in a browser. Everything is static: no build step, no server needed (a plain double-click works).

## Layout

| Folder | Holds | Home-page section |
|---|---|---|
| `reference/` | External Links, Rosetta Stone, Signs & Conjuncts, Sound Charts, idioms, dictionary, verbs | Reference |
| `alphabet/` | Phonemes, Diacritics, Conjuncts, Lookalike Builder, Lookalikes, … | Alphabet |
| `grammar/` | Sentence, nouns, cases, … | Grammar |
| `vocabulary/` | Greetings, numbers, home, … | Vocabulary |
| `advanced-grammar/` | Expressions, commands, tenses, … | Advanced Grammar |

At the top level: `index.html` (the tile launcher), `review.html` (replay of missed items), `lesson-template.html`, and the shared files:

| File | What it is |
|---|---|
| `settings.js` | App-wide choices, remembered in this browser. One so far: how sounds are written, IPA (`/k/`) or ISO 15919 (`ka`), chosen on the home page. Loaded first on every page. |
| `units.js` | The one list of sections and tiles. The home page, Review, and the "Coming soon" pages all read it. |
| `telugu-data.js`, `lookalikes-data.js` | Letters, signs, digits, clusters, and lookalike groups, each sound in both IPA and ISO; `notation` (which of the two to show) and `read()` (the sound of any Telugu character); the CSV reader the Lookalikes game and the Lookalike Builder share. |
| `progress.js` | Completed units and missed items (this browser only). A missed character is stored as the character, so Review can show it in either notation. |
| `game-core.js`, `game-menu.js` | The round every game plays (deck, counters, complete screen) and the ⋮ menu. |
| `lesson-shell.js` | The frame for lesson pages and the "Coming soon" placeholders. |
| `base.css` | Fonts, reset, and color tokens. Defined here only. |
| `home.css`, `game.css`, `shell.css`, `reference.css` | One stylesheet per kind of page: home (and the External Links page, which is laid out as tiles), games, lessons/placeholders/Review, and the Reference pages (on top of `game.css`). |

## Conventions

- Pages are named `NN_name.html`, numbered in the order their tiles appear on the home page.
- A page in a section folder links the top-level files as `../…` (for example `../game.css`). Data that belongs to one page sits next to it (`reference/rosetta-data.js`, `reference/signs-conjuncts-data.js`, `reference/sound-charts-data.js`).
- Tile ids in `units.js` never change when a file is renamed, so saved progress is kept.
- A page's title, description, and placeholder text are written once, in its tile in `units.js`.
- To build a lesson: copy `lesson-template.html` over the placeholder in its folder (and put `../` in front of its six links), then delete the `soon` block from its tile in `units.js`.
- To build a game: start from `alphabet/01_phonemes.html`. `GameCore.create({ id, pool, render, … })` runs the round; the page draws its card and keyboard and calls `game.judge(right, …)`. All four games are built this way.
- A page never prints `.ipa` or `.iso` itself, or adds slashes. It asks `TeluguData.notation`: `notation.wrap(notation.letter(l))` gives `/k/` or `ka`, whichever the reader chose. Answers are still compared by `ipa`, which is each letter's key whatever is on screen. Rosetta Stone is the exception: it always shows both.
- A page only gets a `<style>` block for layout that is its own. Colors and fonts are never set in a page.
