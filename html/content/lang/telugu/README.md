# Telugu Suite

Open `index.html` in a browser. Everything is static: no build step, no server needed (a plain double-click works).

## Layout

| Folder | Holds | Home-page section |
|---|---|---|
| `reference/` | Rosetta Stone, Signs & Conjuncts, idioms, dictionary, verbs | Resources |
| `alphabet/` | Phonemes, Diacritics, Conjuncts, Lookalike Builder, Lookalikes, … | Alphabet |
| `grammar/` | Sentence, nouns, cases, … | Grammar |
| `vocabulary/` | Greetings, numbers, home, … | Vocabulary |
| `advanced-grammar/` | Expressions, commands, tenses, … | Advanced Grammar |

At the top level: `index.html` (the tile launcher), `review.html` (replay of missed items), `lesson-template.html`, and the shared files:

| File | What it is |
|---|---|
| `units.js` | The one list of sections and tiles. The home page, Review and the "Coming soon" pages all read it. |
| `telugu-data.js`, `lookalikes-data.js` | Letters, signs, clusters, lookalike groups. |
| `progress.js` | Completed units and missed items (this browser only). |
| `game-core.js`, `game-menu.js` | The round every game plays (deck, counters, complete screen) and the ⋮ menu. |
| `lesson-shell.js` | The frame for lesson pages and the "Coming soon" placeholders. |
| `base.css` | Fonts, reset and colour tokens. Defined here only. |
| `home.css`, `game.css`, `shell.css`, `reference.css` | One stylesheet per kind of page: home, games, lessons/placeholders/Review, and the Resources pages (on top of `game.css`). |

## Conventions

- Pages are named `NN_name.html`, numbered in the order their tiles appear on the home page.
- A page in a section folder links the top-level files as `../…` (for example `../game.css`). Data that belongs to one page sits next to it (`reference/rosetta-data.js`, `reference/signs-conjuncts-data.js`).
- Tile ids in `units.js` never change when a file is renamed, so saved progress is kept.
- A page's title, description and placeholder text are written once, in its tile in `units.js`.
- To build a lesson: copy `lesson-template.html` over the placeholder in its folder (and put `../` in front of its five links), then delete the `soon` block from its tile in `units.js`.
- To build a game: start from `alphabet/01_phonemes.html`. `GameCore.create({ id, pool, render, … })` runs the round; the page draws its card and keyboard and calls `game.judge(right, …)`. The other three games still carry their own copy of the round and move onto `game-core.js` one at a time.
- A page only gets a `<style>` block for layout that is its own. Colours and fonts are never set in a page.
