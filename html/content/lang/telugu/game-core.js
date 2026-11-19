/* ═════════════════════════════════════════════════════════
   game-core.js — the round every practice game plays:
   a shuffled deck of cards, one shown at a time; a right
   answer clears the card, a wrong one sends it back into the
   deck; counters and the progress bar follow; when the deck
   is empty the complete screen shows. Each session played to
   its end is recorded (progress.js), for the Profile page.
   A session can be given a length and a number of mistakes
   it allows (game-setup.js asks for them); one mistake more
   than that ends it early.
   Exposes window.GameCore. Pairs with game.css, game-menu.js,
   game-setup.js and progress.js (load progress.js first).

   A game page keeps only what is its own: how a card is drawn,
   its keyboard, and how an answer is checked.

   The page supplies the markup (ids matter):
     #s-rem  #s-done  #s-total  #prog-fill    counters + progress bar
     #s-lives                                 optional: the mistakes left, as hearts, shown while a
                                              limit is set:  ❤️×20 … ❤️×4  💚🤍🧡  🤍🧡  🧡  ⭕
                                              (the last three are green, white, orange; orange goes last;
                                              the empty ring means none are left)
     #g-main                                  the playing area
     #char-card  #feedback                    the card and the line under it
     #g-complete                              empty: the core fills it in

   Usage:
     const game = GameCore.create({
       id: 'phonemes',                  // the tile id in units.js: its sessions are kept under it
       pool:     () => [cards…],        // the cards of a new round
       render:   card => { … },         // draw this card
       size:     40,                    // optional: play at most this many cards a round,
                                        //           picked at random from the pool
       onStart:  game => { … },         // optional: a round was just dealt (build the keyboard)
       onEmpty:  game => { … },         // optional: the pool was empty (say so in the page)
       onRetry:  game => { … },         // optional: "Practice Again" was pressed. Without it the
                                        //           button deals a new round; with it the page
                                        //           decides (open the setup popup, say)
       variant:  game => 'reverse',     // optional: how this session is being played, when the game has
                                        //           more than one way ('' for the usual one). Kept with
                                        //           the session's result (progress.js, "A RUN")
       doneText: game => 'All … done.', // the sentence on the complete screen
       okMs: 500, errMs: 1000,          // optional: pause before the next card
     });
     game.start();                      // deal a round (also what "Practice Again" does)
     game.start({ size: 10, misses: 3 });   // deal a session of 10 cards that allows 3 mistakes:
                                        // the 4th ends it (misses: 0 → the first one does).
                                        // size: null → the usual length; misses: null → no limit.
                                        // Both stay in force for later start() calls until set again.

   In the page's answer handler:
     if (game.locked) return;           // the last answer is still showing
     const card = game.current;
     game.judge(isRight, {
       feedback: '✗  /k/',              // the line under the card (the games put what was picked here)
       te:   true,                      // optional: that line is Telugu
       miss: { key, prompt, answer, note },   // wrong answers go to Review
                                        // (add game: '…' to file it under another id)
       after() { … },                   // optional: runs just before the next card is drawn
     });

   State, read-only from outside:
     game.deck  game.current  game.total  game.completed  game.attempts  game.locked
     game.misses  game.limit (mistakes allowed; null = no limit)  game.left (mistakes still allowed)
     game.over (ended by one mistake too many)
   Also:
     game.render()       redraw the current card (an option changed)
     game.front(pred)    bring the first card matching pred to the front and
                         draw it; used by the tests to pick a card
     game.put(card)      put a card on top of the deck and draw it; used by the
                         tests to play a card the round didn't deal (the
                         total is left as it was)
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

  const HEART = '\u2764\uFE0F';                              // ❤️  four or more mistakes left: ❤️×20
  const LAST  = ['\u{1F49A}', '\u{1F90D}', '\u{1F9E1}'];       // 💚 🤍 🧡  the last three, lost left to right
  const NONE  = '\u2B55';                                    // ⭕  none left: an empty red ring

  const COMPLETE_HTML = `
    <div class="trophy" id="c-trophy">🏆</div>
    <div class="c-title" id="c-title">Session Complete!</div>
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
    const { id, pool, render, size, onStart, onEmpty, onRetry, variant, doneText, okMs = 500, errMs = 1000 } = opts || {};
    if (!id || typeof pool !== 'function' || typeof render !== 'function') {
      throw new Error('game-core: create() needs id, pool() and render()');
    }
    // Progress is optional: without progress.js the game plays, it just isn't remembered.
    const Progress = root.TeluguProgress || { miss() {}, run() {} };

    let deck = [], total = 0, completed = 0, attempts = 0, locked = false;
    // This session's own settings (start({ size, misses })), and how it is going
    let want = null;            // cards asked for; null = the usual length
    let limit = null;           // mistakes allowed (3 = the fourth ends the session); null = no limit
    let misses = 0, over = false;

    // Mistakes still allowed (null when there is no limit), and how the header shows them:
    // "❤️×20" down to "❤️×4"; then a heart each, 💚🤍🧡 → 🤍🧡 → 🧡; an empty ring, ⭕, when there are none.
    const left   = () => limit === null ? null : Math.max(0, limit - misses);
    const hearts = n => n > 3 ? `${HEART}×${n}` : n > 0 ? LAST.slice(-n).join('') : NONE;

    function updateProgress() {
      $('s-rem').textContent   = deck.length;
      $('s-done').textContent  = completed;
      $('s-total').textContent = total;
      $('prog-fill').style.width = (total ? completed / total * 100 : 0).toFixed(1) + '%';
      const lives = $('s-lives');
      if (lives) {
        const n = left();
        lives.hidden      = n === null;
        lives.textContent = n === null ? '' : hearts(n);
        lives.classList.toggle('out', n === 0);                      // none left: the next mistake ends the session
        if (n === null) lives.removeAttribute('aria-label');
        else lives.setAttribute('aria-label', `Mistakes left: ${n}`);
        lives.title = n === null ? '' : `Mistakes left: ${n}`;
      }
    }

    // Clear the last answer's marks, then let the page draw the card.
    function draw() {
      if (!deck.length) return;
      $('feedback').textContent = '';
      $('feedback').className   = 'feedback';
      $('char-card').className  = 'char-card';
      render(deck[0], game);
    }

    // The end of a session: every card cleared, or (over) one mistake more than the session allows.
    function showComplete() {
      const accuracy = Math.round((over ? completed : total) / attempts * 100);
      $('g-main').style.display = 'none';
      $('g-complete').classList.add('show');
      if ($('c-title')) {
        $('c-trophy').hidden       = over;
        $('c-title').textContent   = over ? 'Out of mistakes' : 'Session Complete!';
      }
      $('c-sub').textContent      = over ? `${completed} of ${total} cleared. ${limit === 0 ? 'No mistakes were' : limit === 1 ? '1 mistake was' : limit + ' mistakes were'} allowed.`
                                  : doneText ? doneText(game) : `All ${total} cards cleared.`;
      $('c-attempts').textContent = attempts;
      $('c-accuracy').textContent = accuracy + '%';
      $('c-errors').textContent   = over ? misses : attempts - total;
      // Every session played to its end is kept for the Profile page, whatever its length
      if (Progress.run) Progress.run(id, { total, correct: completed, attempts, ended: over ? 'out' : 'done', variant: variant ? variant(game) : '' });
    }

    function start(o) {
      // (start is also used directly as an event handler: an Event has neither property)
      if (o && 'size' in o)   want  = o.size > 0 ? Math.floor(o.size) : null;
      if (o && 'misses' in o) limit = o.misses === null || !(o.misses >= 0) || o.misses === Infinity ? null : Math.floor(o.misses);

      const all    = shuffle(pool());
      const usual  = size > 0 ? Math.min(size, all.length) : all.length;      // the game's own session length
      const n      = want === null ? usual : Math.min(want, all.length);
      deck      = all.slice(0, n);
      total     = deck.length;
      completed = 0;
      attempts  = 0;
      misses    = 0;
      over      = false;
      locked    = false;

      $('g-complete').classList.remove('show');
      $('g-main').style.display = '';
      if (onStart) onStart(game);
      updateProgress();
      if (deck.length) draw();
      else if (onEmpty) onEmpty(game);
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
        misses++;
        if (limit !== null && misses > limit) over = true;       // one more than the session allows
        updateProgress();
        if (miss) Progress.miss(Object.assign({ game: id }, miss));
        // Back into the deck at a random position (never straight back to the front)
        const card = deck.shift();
        deck.splice(Math.max(1, Math.floor(Math.random() * (deck.length + 1))), 0, card);
      }

      setTimeout(() => {
        if (after) after();
        if (over || deck.length === 0) showComplete();
        else { draw(); locked = false; }
      }, ok ? okMs : errMs);
    }

    function front(pred) {
      const i = deck.findIndex(pred);
      if (i < 0) throw new Error('game-core: no card matches');
      deck.unshift(deck.splice(i, 1)[0]);
      draw();
    }

    function put(card) {
      deck.unshift(card);
      draw();
    }

    const game = {
      id, start, judge, front, put,
      render: draw,
      get deck()      { return deck; },
      get current()   { return deck[0] || null; },
      get total()     { return total; },
      get completed() { return completed; },
      get attempts()  { return attempts; },
      get locked()    { return locked; },
      get misses()    { return misses; },
      get limit()     { return limit; },
      get left()      { return left(); },
      get over()      { return over; },
    };

    const done = $('g-complete');
    if (done && !$('c-sub')) done.innerHTML = COMPLETE_HTML;
    if ($('retry-btn')) $('retry-btn').addEventListener('click', () => { if (onRetry) onRetry(game); else start(); });

    api.current = game;
    return game;
  }

  const api = { create, shuffle, esc, $, current: null };

  root.GameCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
