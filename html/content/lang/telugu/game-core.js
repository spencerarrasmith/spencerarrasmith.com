/* ═════════════════════════════════════════════════════════
   game-core.js — the round every practice game plays:
   a shuffled deck of cards, one shown at a time; a right
   answer clears the card, a wrong one sends it back into the
   deck; counters and the progress bar follow; when the deck
   is empty the complete screen shows. Each session played to
   its end is recorded (progress.js), for the Profile page
   (unless the game asks for none to be kept: record: false).
   A session can be given a length and a "game over": the
   mistake that ends it early (game-setup.js asks for both). It can also be told not to bring
   missed cards back: a wrong answer then drops the card, and
   every card is shown exactly once.
   Exposes window.GameCore. Pairs with game.css, game-menu.js,
   game-setup.js and progress.js (load progress.js first).

   A game page keeps only what is its own: how a card is drawn,
   its keyboard, and how an answer is checked.

   The page supplies the markup (ids matter):
     #s-rem  #s-done  #s-total  #prog-fill    counters + progress bar
     #s-lives                                 optional: the mistakes left, as hearts:
                                              ❤️×♾️ (no limit)  ❤️×20 … ❤️×4  💚🤍🧡  🤍🧡  🧡  ⭕
                                              (the last three are green, white, orange; orange goes last;
                                              the empty ring means none are left). Always shown, so
                                              that corner of the header never stands empty
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
       record:   false,                 // optional: keep no record of this game's sessions (a game
                                        //           that is not charted on the Profile page: no
                                        //           `stats` on its tile in units.js). Misses still go to Review.
       variant:  game => 'reverse',     // optional: how this session is being played, when the game has
                                        //           more than one way ('' for the usual one). Kept with
                                        //           the session's result (progress.js, "A RUN")
       doneText: game => 'All … done.', // the sentence on the complete screen
       okMs: 500, errMs: 1000,          // optional: pause before the next card
     });
     game.start();                      // deal a round (also what "Practice Again" does)
     game.start({ size: 10, misses: 3 });   // deal a session of 10 cards that is game over at 3
                                        // mistakes: the 3rd ends it (misses: 1, the least, → the first does).
                                        // size: null → the usual length; misses: null → no limit.
     game.start({ again: false });      // missed cards do not come back: a wrong answer drops the card
                                        // (again: true, the default, sends it back into the deck).
                                        // All three stay in force for later start() calls until set again.

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

   A card that takes several answers (Words: its sounds, one pick each):
     game.step(isRight, { feedback, te, miss, after() { … } });
                                        // one answer of the card. It is counted, and a wrong one is
                                        // a mistake like any other (it can be game over), but the
                                        // card stays up. A wrong answer's line under the card clears
                                        // by itself; a right one clears it at once.
                                        // after: for a wrong answer. The game is held (locked) for
                                        // errMs with the answer on screen, then after() runs and
                                        // play goes on. Not called when that mistake was game over.
     game.judge(clean, { counted: true, feedback });
                                        // when the card is finished. Nothing more is counted (step()
                                        // counted every answer): `clean` says whether the card got
                                        // through without a mistake. If not, it looks wrong and comes
                                        // back later like any missed card (or is dropped, when missed
                                        // cards do not come back).

   State, read-only from outside:
     game.deck  game.current  game.total  game.completed  game.attempts  game.locked
     game.misses  game.limit (the mistake that is game over; null = no limit)
     game.left (mistakes left before game over)  game.over (it is game over)
     game.again (do missed cards come back?)  game.dropped (cards missed and not shown again)
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
  const EVER  = '\u267E\uFE0F';                              // ♾️  no limit: ❤️×♾️

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
    const { id, pool, render, size, onStart, onEmpty, onRetry, variant, doneText, record = true, okMs = 500, errMs = 1000 } = opts || {};
    if (!id || typeof pool !== 'function' || typeof render !== 'function') {
      throw new Error('game-core: create() needs id, pool() and render()');
    }
    // Progress is optional: without progress.js the game plays, it just isn't remembered.
    const Progress = root.TeluguProgress || { miss() {}, run() {} };

    let deck = [], total = 0, completed = 0, attempts = 0, locked = false;
    // This session's own settings (start({ size, misses })), and how it is going
    let want = null;            // cards asked for; null = the usual length
    let limit = null;           // the mistake that is game over (3 = the third ends the session); null = no limit
    let misses = 0, over = false;
    let again = true;           // do missed cards come back into the deck?
    let dropped = 0;            // cards missed and not shown again (only when they do not)
    let fading = null;          // the timer that clears a wrong step()'s line under the card
    let holding = null;         // the timer of a wrong step() that holds the game before going on (its `after`)

    // Mistakes left before game over (null when there is no limit), and how the header shows them:
    // "❤️×♾️" when there is no limit; "❤️×20" down to "❤️×4"; then a heart each, 💚🤍🧡 → 🤍🧡 → 🧡;
    // an empty ring, ⭕, when there are none (game over).
    const left   = () => limit === null ? null : Math.max(0, limit - misses);
    const hearts = n => n === null ? `${HEART}×${EVER}` : n > 3 ? `${HEART}×${n}` : n > 0 ? LAST.slice(-n).join('') : NONE;

    function updateProgress() {
      // Remaining and Correct keep room for as many digits as the total has, so the stats are as wide
      // at 9 as at 10: a title that only just fits beside them does not wrap, and move the game down
      const digits = String(total).length + 'ch';
      $('s-rem').textContent   = deck.length;
      $('s-done').textContent  = completed;
      $('s-total').textContent = total;
      $('s-rem').style.minWidth = $('s-done').style.minWidth = digits;
      $('prog-fill').style.width = (total ? Math.min(1, (completed + dropped) / total) * 100 : 0).toFixed(1) + '%';      // cards dealt with, right or not
      const lives = $('s-lives');
      if (lives) {
        const n = left(), said = `Mistakes left: ${n === null ? 'unlimited' : n}`;
        lives.hidden      = false;
        lives.textContent = hearts(n);
        lives.classList.toggle('out', n === 0);                      // none left: game over
        lives.setAttribute('aria-label', said);
        lives.title = said;
      }
    }

    // Clear the last answer's marks (the line under the card, the card's own color)
    function clearMarks() {
      clearTimeout(fading);
      fading = null;
      $('feedback').textContent = '';
      $('feedback').className   = 'feedback';
      $('char-card').classList.remove('correct', 'wrong');
    }

    // Clear the last answer's marks, then let the page draw the card.
    function draw() {
      if (!deck.length) return;
      clearMarks();
      $('char-card').className  = 'char-card';
      render(deck[0], game);
    }

    // The end of a session: every card cleared, or (over) the mistake that is game over.
    function showComplete() {
      const accuracy = Math.round((attempts - misses) / attempts * 100);      // right answers out of all answers
      $('g-main').style.display = 'none';
      $('g-complete').classList.add('show');
      if ($('c-title')) {
        $('c-trophy').hidden       = over;
        $('c-title').textContent   = over ? 'Game Over' : 'Session Complete!';
      }
      $('c-sub').textContent      = over ? `${completed} of ${total} cleared. Game over at ${limit} ${limit === 1 ? 'mistake' : 'mistakes'}.`
                                  : dropped ? `${completed} of ${total} correct. The ${dropped} missed ${dropped === 1 ? 'was' : 'were'} not shown again.`
                                  : doneText ? doneText(game) : `All ${total} cards cleared.`;
      $('c-attempts').textContent = attempts;
      $('c-accuracy').textContent = accuracy + '%';
      $('c-errors').textContent   = misses;
      // Every session played to its end is kept for the Profile page, whatever its length
      if (record && Progress.run) Progress.run(id, { total, correct: completed, attempts, misses, ended: over ? 'out' : 'done', variant: variant ? variant(game) : '' });
    }

    function start(o) {
      // (start is also used directly as an event handler: an Event has neither property)
      if (o && 'size' in o)   want  = o.size > 0 ? Math.floor(o.size) : null;
      if (o && 'misses' in o) limit = o.misses === null || !(o.misses >= 0) || o.misses === Infinity ? null : Math.max(1, Math.floor(o.misses));
      if (o && 'again' in o)  again = o.again !== false;

      clearTimeout(holding);                                     // a wrong answer still on hold belongs to the last round
      holding = null;
      const all    = shuffle(pool());
      const usual  = size > 0 ? Math.min(size, all.length) : all.length;      // the game's own session length
      const n      = want === null ? usual : Math.min(want, all.length);
      deck      = all.slice(0, n);
      total     = deck.length;
      completed = 0;
      attempts  = 0;
      misses    = 0;
      dropped   = 0;
      over      = false;
      locked    = false;

      $('g-complete').classList.remove('show');
      $('g-main').style.display = '';
      if (onStart) onStart(game);
      updateProgress();
      if (deck.length) draw();
      else if (onEmpty) onEmpty(game);
    }

    // One answer of a card that takes several. The card stays; see the header.
    function step(ok, info = {}) {
      if (locked || !deck.length) return;
      attempts++;
      clearMarks();
      if (ok) return;

      const { feedback = '✗', te = false, miss, after } = info;
      misses++;
      if (miss) Progress.miss(Object.assign({ game: id }, miss));
      $('feedback').textContent = feedback;
      $('feedback').className   = 'feedback err' + (te ? ' te' : '');
      void $('char-card').offsetWidth;                           // so the shake plays again on a second mistake
      $('char-card').classList.add('wrong');
      if (limit !== null && misses >= limit) {                   // that was the mistake that ends it
        over = true;
        locked = true;
        updateProgress();
        setTimeout(showComplete, errMs);
        return;
      }
      updateProgress();
      if (!after) { fading = setTimeout(clearMarks, errMs); return; }
      locked  = true;                                            // hold what is on screen, then go on
      holding = setTimeout(() => {
        holding = null;
        clearMarks();
        locked = false;
        after();
      }, errMs);
    }

    function judge(ok, info = {}) {
      if (locked || !deck.length) return;
      locked = true;

      // counted: the card's answers went through step(), mistakes included, so nothing is counted here
      const { feedback = ok ? '✓  Correct!' : '✗', te = false, miss, after, counted = false } = info;
      if (!counted) attempts++;
      clearMarks();
      $('feedback').textContent = feedback;
      $('feedback').className   = 'feedback ' + (ok ? 'ok' : 'err') + (te ? ' te' : '');
      $('char-card').classList.add(ok ? 'correct' : 'wrong');

      if (ok) {
        deck.shift();
        completed++;
        updateProgress();
      } else {
        if (!counted) {
          misses++;
          if (limit !== null && misses >= limit) over = true;      // that was the mistake that ends it
          if (miss) Progress.miss(Object.assign({ game: id }, miss));
        }
        const card = deck.shift();
        // Back into the deck at a random position (never straight back to the front),
        // unless missed cards do not come back: then it is gone for this session
        if (again) deck.splice(Math.max(1, Math.floor(Math.random() * (deck.length + 1))), 0, card);
        else dropped++;
        updateProgress();
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
      id, start, judge, step, front, put,
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
      get again()     { return again; },
      get dropped()   { return dropped; },
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
