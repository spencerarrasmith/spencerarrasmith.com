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

At the top level: `index.html` (the tile launcher), `review.html` (replay of missed items), the stylesheets (`base.css`, `game.css`, `shell.css`), the shared scripts (`telugu-data.js`, `lookalikes-data.js`, `progress.js`, `game-menu.js`, `lesson-shell.js`) and `lesson-template.html`.

## Conventions

- Pages are named `NN_name.html`, numbered in the order their tiles appear on the home page.
- A page in a section folder links the top-level files as `../…` (for example `../game.css`). Data that belongs to one page sits next to it (`reference/rosetta-data.js`, `reference/signs-conjuncts-data.js`).
- Tile ids in `index.html` never change when a file is renamed, so saved progress is kept.
- To build a lesson: copy `lesson-template.html` over the placeholder in its folder (and put `../` in front of its four links), then delete `soon: true` from its tile in `index.html`.
