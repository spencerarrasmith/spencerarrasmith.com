/* ═════════════════════════════════════════════════════════
   game-core.js — the round every practice game plays:
   a shuffled deck of cards, one shown at a time; a right
   answer clears the card, a wrong one sends it back into the
   deck; counters and the progress bar follow; when the deck
   is empty the complete screen shows and the unit gets its ✓.
   Exposes window.GameCore. Pairs with game.css, game-menu.js
   and progress.js (load progress.js first).

   A game page keeps only what is its own: how a card is drawn,
   its keyboard, and how an answer is checked.

   The page supplies the markup (ids matter):
     #s-rem  #s-done  #s-total  #prog-fill    counters + progress bar
     #g-main                                  the playing area
     #char-card  #feedback                    the card and the line under it
     #g-complete                              empty: the core fills it in

   Usage:
     const game = GameCore.create({
       id: 'phonemes',                  // the tile id in units.js: gets the ✓
       pool:     () => [cards…],        // the cards of a new round
       render:   card => { … },         // draw this card
       onStart:  game => { … },         // optional: a round was just dealt (build the keyboard)
       doneText: game => 'All … done.', // the sentence on the complete screen
       okMs: 500, errMs: 1000,          // optional: pause before the next card
     });
     game.start();                      // deal a round (also what "Practice Again" does)

   In the page's answer handler:
     if (game.locked) return;           // the last answer is still showing
     const card = game.current;
     game.judge(isRight, {
       feedback: '✗  /k/',              // the line under the card
       te:   true,                      // optional: that line is Telugu
       miss: { key, prompt, answer, note },   // wrong answers go to Review
                                        // (add game: '…' to file it under another id)
       after() { … },                   // optional: runs just before the next card is drawn
     });

   State, read-only from outside:
     game.deck  game.current  game.total  game.completed  game.attempts  game.locked
   Also:
     game.render()       redraw the current card (an option changed)
     game.front(pred)    bring the first card matching pred to the front and
                         draw it; used by the tests to pick a card
     GameCore.current    the game most recently created on this page

   Helpers the games share:
     GameCore.$(id)  GameCore.shuffle(array)  GameCore.esc(text)
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const $ = id => document.getElementById(id);

  // A shuffled copy (Fisher–Yates); the array passed in is left alone.
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const COMPLETE_HTML = `
    <div class="trophy">🏆</div>
    <div class="c-title">Session Complete!</div>
    <div class="c-sub" id="c-sub"></div>
    <div class="c-stats">
      <div class="c-stat">
        <span class="c-stat-val" id="c-attempts">—</span>
        <span class="c-stat-lbl">Total Attempts</span>
      </div>
      <div class="c-stat">
        <span class="c-stat-val" id="c-accuracy">—</span>
        <span class="c-stat-lbl">Accuracy</span>
      </div>
      <div class="c-stat">
        <span class="c-stat-val" id="c-errors">—</span>
        <span class="c-stat-lbl">Errors</span>
      </div>
    </div>
    <button class="retry-btn" id="retry-btn" type="button">Practice Again</button>`;

  function create(opts) {
    const { id, pool, render, onStart, doneText, okMs = 500, errMs = 1000 } = opts || {};
    if (!id || typeof pool !== 'function' || typeof render !== 'function') {
      throw new Error('game-core: create() needs id, pool() and render()');
    }
    // Progress is optional: without progress.js the game plays, it just isn't remembered.
    const Progress = root.TeluguProgress || { miss() {}, complete() {} };

    let deck = [], total = 0, completed = 0, attempts = 0, locked = false;

    function updateProgress() {
      $('s-rem').textContent   = deck.length;
      $('s-done').textContent  = completed;
      $('s-total').textContent = total;
      $('prog-fill').style.width = (total ? completed / total * 100 : 0).toFixed(1) + '%';
    }

    // Clear the last answer's marks, then let the page draw the card.
    function draw() {
      if (!deck.length) return;
      $('feedback').textContent = '';
      $('feedback').className   = 'feedback';
      $('char-card').className  = 'char-card';
      render(deck[0], game);
    }

    function showComplete() {
      const accuracy = Math.round(total / attempts * 100);
      $('g-main').style.display = 'none';
      $('g-complete').classList.add('show');
      $('c-sub').textContent      = doneText ? doneText(game) : `All ${total} cards cleared.`;
      $('c-attempts').textContent = attempts;
      $('c-accuracy').textContent = accuracy + '%';
      $('c-errors').textContent   = attempts - total;
      Progress.complete(id, { accuracy, attempts });
    }

    function start() {
      const cards = pool();
      deck      = shuffle(cards);
      total     = cards.length;
      completed = 0;
      attempts  = 0;
      locked    = false;

      $('g-complete').classList.remove('show');
      $('g-main').style.display = '';
      if (onStart) onStart(game);
      updateProgress();
      draw();
    }

    function judge(ok, info = {}) {
      if (locked || !deck.length) return;
      locked = true;
      attempts++;

      const { feedback = ok ? '✓  Correct!' : '✗', te = false, miss, after } = info;
      $('feedback').textContent = feedback;
      $('feedback').className   = 'feedback ' + (ok ? 'ok' : 'err') + (te ? ' te' : '');
      $('char-card').classList.add(ok ? 'correct' : 'wrong');

      if (ok) {
        deck.shift();
        completed++;
        updateProgress();
      } else {
        if (miss) Progress.miss(Object.assign({ game: id }, miss));
        // Back into the deck at a random position (never straight back to the front)
        const card = deck.shift();
        deck.splice(Math.max(1, Math.floor(Math.random() * (deck.length + 1))), 0, card);
      }

      setTimeout(() => {
        if (after) after();
        if (deck.length === 0) showComplete();
        else { draw(); locked = false; }
      }, ok ? okMs : errMs);
    }

    function front(pred) {
      const i = deck.findIndex(pred);
      if (i < 0) throw new Error('game-core: no card matches');
      deck.unshift(deck.splice(i, 1)[0]);
      draw();
    }

    const game = {
      id, start, judge, front,
      render: draw,
      get deck()      { return deck; },
      get current()   { return deck[0] || null; },
      get total()     { return total; },
      get completed() { return completed; },
      get attempts()  { return attempts; },
      get locked()    { return locked; },
    };

    const done = $('g-complete');
    if (done && !$('c-sub')) done.innerHTML = COMPLETE_HTML;
    if ($('retry-btn')) $('retry-btn').addEventListener('click', start);

    api.current = game;
    return game;
  }

  const api = { create, shuffle, esc, $, current: null };

  root.GameCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
