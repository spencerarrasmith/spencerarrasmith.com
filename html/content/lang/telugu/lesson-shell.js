/* ═════════════════════════════════════════════════════════
   lesson-shell.js — the common frame for every lesson page.

   A lesson page is a few lines of data plus one practice
   function. The shell supplies the layout, the Learn →
   Remarks → Practice flow, completion + the ✓ on the home tile.

   Page needs:
     <link rel="stylesheet" href="../shell.css">   (from a page inside a section folder)
     script tags (src=…) for units.js, progress.js, and lesson-shell.js
     <div id="lesson"></div>
   then:
     LessonShell.mount({
       id:      'grammar-nouns',      // = the tile id in units.js
       section: 'Grammar',            // optional: taken from units.js by id
       title:   'Nouns: gender & number',   // optional: same
       telugu:  '…',                  // optional second-language title
       learn:   [ blocks… ],
       remarks: [ blocks… ],          // optional
       practice(el, ctx) { … },       // optional
     });

   BLOCKS (strings in blocks are HTML; keep text of your own)
     'text'                            paragraph
     { h: 'Heading' }
     { p: 'Paragraph' }
     { list: ['item', …] }
     { note: 'Highlighted aside' }
     { table: { head: [...], rows: [[...], …] } }
     { examples: [{ te: 'Telugu', en: 'English', ipa: 'optional', iso: 'optional' }] }
         The sound is shown in the reader's notation (IPA or ISO, chosen on
         the home page). Give `ipa` and `iso` for a word or phrase; for a
         single character (క, కా, క్ష) leave both out and it is worked out
         from telugu-data.js, when that file is loaded.
     { html: '<raw html>' }

   PRACTICE gets the panel element and ctx:
     ctx.miss(key, prompt, answer, note?)   send a wrong answer to Review
     ctx.miss({ key, ask, note })           the same for a Telugu character:
                                            key is the character, ask is 'telugu'
                                            (it was shown) or 'sound' (its sound
                                            was shown). Review then writes the
                                            sound in the reader's notation.
     ctx.complete({accuracy, attempts})     mark the unit done (✓)
     ctx.isComplete()
     ctx.id

   A unit that isn't written yet is one line:
     LessonShell.placeholder('grammar-nouns');
   which draws its "Coming soon" page from the tile in units.js
   (title, description, and the three `soon` lines).
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function block(b) {
    if (typeof b === 'string') return `<p>${b}</p>`;
    if (b.h)    return `<h2>${b.h}</h2>`;
    if (b.p)    return `<p>${b.p}</p>`;
    if (b.note) return `<div class="note">${b.note}</div>`;
    if (b.html) return b.html;
    if (b.list) return `<ul>${b.list.map(i => `<li>${i}</li>`).join('')}</ul>`;
    if (b.table) {
      const { head = [], rows = [] } = b.table;
      return `<div class="table-wrap"><table>` +
        (head.length ? `<thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>` : '') +
        `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (b.examples) {
      return `<div class="examples">${b.examples.map(e => `
        <div class="example">
          <span class="te-big">${e.te ?? ''}</span>
          <span class="en">${e.en ?? ''}</span>
          ${soundOf(e) ? `<span class="ipa">${soundOf(e)}</span>` : ''}
        </div>`).join('')}</div>`;
    }
    throw new Error('lesson-shell: unknown block ' + JSON.stringify(b).slice(0, 60));
  }
  const blocks = list => `<div class="blocks">${(list || []).map(block).join('')}</div>`;

  // An example's sound in the reader's notation: /kaː/ or kā.
  // What the lesson gives for that notation wins; a single character without it
  // is read from telugu-data.js; failing both, the IPA is better than nothing.
  function soundOf(e) {
    const TD = root.TeluguData;
    if (!TD) return e.ipa ? '/' + e.ipa + '/' : '';
    const N = TD.notation;
    const given = N.id === 'iso' ? e.iso : e.ipa;
    if (given) return N.wrap(given);
    const r = e.te ? TD.read(e.te) : null;
    return r ? N.wrap(N.of(r)) : e.ipa ? '/' + e.ipa + '/' : '';
  }

  // The unit's tile and section in units.js (null when units.js isn't loaded or the id isn't listed).
  const Units = () => root.TeluguUnits || null;
  const tileOf    = id => (Units() && Units().get(id)) || null;
  const sectionOf = id => (Units() && Units().sectionOf(id)) || null;

  function mount(cfg, host) {
    host = host || document.getElementById('lesson') || document.body;
    const tile = tileOf(cfg.id), sec = sectionOf(cfg.id);
    cfg = Object.assign({}, cfg, {
      section: cfg.section ?? (sec ? sec.title : ''),
      title:   cfg.title   ?? (tile ? tile.title : cfg.id),
    });
    const Progress = root.TeluguProgress || { miss() {}, complete() {}, isComplete() { return false; } };

    const stages = [
      cfg.learn && cfg.learn.length ? { id: 'learn',    label: 'Learn' }    : null,
      cfg.remarks && cfg.remarks.length ? { id: 'remarks',  label: 'Remarks' }  : null,
      typeof cfg.practice === 'function' ? { id: 'practice', label: 'Practice' } : null,
    ].filter(Boolean);
    if (!stages.length) throw new Error('lesson-shell: nothing to show (give learn, remarks, or practice)');

    document.title = cfg.title + ' · Telugu Suite';
    host.innerHTML = `
      <div class="shell">
        <header class="shell-head">
          <div class="eyebrow">${esc(cfg.section)}</div>
          <div class="title-row">
            <h1>${esc(cfg.title)}</h1>
            <span class="pill done" id="ls-done" hidden>Completed ✓</span>
          </div>
          ${cfg.telugu ? `<div class="te-title">${esc(cfg.telugu)}</div>` : ''}
          <nav class="stepper" role="tablist">
            ${stages.map(s => `<button class="step" role="tab" data-stage="${s.id}" id="tab-${s.id}"
              aria-controls="panel-${s.id}">${s.label}</button>`).join('')}
          </nav>
        </header>
        <main class="shell-body" id="ls-body">
          ${stages.map(s => `<section class="panel" role="tabpanel" id="panel-${s.id}"
            aria-labelledby="tab-${s.id}" hidden></section>`).join('')}
        </main>
        <footer class="shell-foot">
          <button class="btn" id="ls-back">← Back</button>
          <button class="btn primary" id="ls-next">Next →</button>
        </footer>
      </div>`;

    const $ = id => host.querySelector('#' + id);
    const panels = Object.fromEntries(stages.map(s => [s.id, $('panel-' + s.id)]));
    if (panels.learn)   panels.learn.innerHTML   = blocks(cfg.learn);
    if (panels.remarks) panels.remarks.innerHTML = blocks(cfg.remarks.map(r => typeof r === 'string' ? { note: r } : r));

    const ctx = {
      id: cfg.id,
      miss: (key, prompt, answer, note) =>
        Progress.miss(key && typeof key === 'object'
          ? Object.assign({}, key, { game: cfg.id })
          : { game: cfg.id, key, prompt, answer, note }),
      complete(info) {
        const was = Progress.isComplete(cfg.id);
        Progress.complete(cfg.id, info || {});
        $('ls-done').hidden = false;
        if (!was) toast('Unit completed ✓');
      },
      isComplete: () => Progress.isComplete(cfg.id),
    };

    function toast(msg) {
      const t = document.createElement('div');
      t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
      host.appendChild(t);
      setTimeout(() => t.remove(), 2200);
    }

    let current = null, practiceStarted = false;
    function go(id) {
      const i = stages.findIndex(s => s.id === id);
      if (i < 0) return;
      current = id;
      stages.forEach(s => {
        const sel = s.id === id;
        panels[s.id].hidden = !sel;
        const tab = $('tab-' + s.id);
        tab.setAttribute('aria-selected', String(sel));
        tab.tabIndex = sel ? 0 : -1;
      });
      if (id === 'practice' && !practiceStarted) {          // build once, keep state when switching tabs
        practiceStarted = true;
        cfg.practice(panels.practice, ctx);
      }
      $('ls-body').scrollTop = 0;
      $('ls-back').disabled = i === 0;
      const last = i === stages.length - 1;
      $('ls-next').hidden = last;
      $('ls-back').hidden = stages.length === 1;
    }

    host.querySelectorAll('.step').forEach(b => b.addEventListener('click', () => go(b.dataset.stage)));
    $('ls-back').addEventListener('click', () => { const i = stages.findIndex(s => s.id === current); if (i > 0) go(stages[i - 1].id); });
    $('ls-next').addEventListener('click', () => { const i = stages.findIndex(s => s.id === current); if (i < stages.length - 1) go(stages[i + 1].id); });

    $('ls-done').hidden = !ctx.isComplete();
    go(stages[0].id);
    return { go, ctx, stages: stages.map(s => s.id) };
  }

  /* The "Coming soon" page of a unit that isn't written yet. Everything on it
     comes from the unit's tile in units.js, so the home tile and this page
     can't disagree. */
  const SOON_ROWS = [['learn', "What you'll learn"], ['practice', "How you'll practice"], ['fits', 'Where it fits']];

  function placeholder(id, host) {
    host = host || document.getElementById('lesson') || document.body;
    if (!Units()) throw new Error('lesson-shell: load units.js before calling placeholder()');
    const tile = tileOf(id), sec = sectionOf(id);
    if (!tile) throw new Error('lesson-shell: no tile "' + id + '" in units.js');
    const soon = tile.soon && typeof tile.soon === 'object' ? tile.soon : {};
    const rows = SOON_ROWS.filter(([k]) => soon[k]);

    document.title = tile.title + ' · Telugu Suite';
    host.innerHTML = `
      <div class="shell soon-page">
        <header class="shell-head">
          <div class="eyebrow">${esc(sec ? sec.title : '')}</div>
          <div class="title-row soon-head">
            <div class="unit-icon" aria-hidden="true">${esc(tile.icon)}</div>
            <h1>${esc(tile.title)}</h1>
          </div>
          <span class="pill soon">Coming soon</span>
        </header>
        <main class="shell-body soon-body">
          <p class="lead">${esc(tile.desc)}</p>
          ${rows.length ? `<div class="facts">${rows.map(([k, label]) => `
            <div class="fact"><div class="fact-label">${label}</div><p>${esc(soon[k])}</p></div>`).join('')}
          </div>` : ''}
        </main>
      </div>`;
    return { id, tile };
  }

  root.LessonShell = { mount, placeholder, block, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.LessonShell;
})(typeof window !== 'undefined' ? window : globalThis);
