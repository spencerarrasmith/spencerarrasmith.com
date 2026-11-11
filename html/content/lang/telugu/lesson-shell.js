/* ═════════════════════════════════════════════════════════
   lesson-shell.js — the common frame for every lesson page.

   A lesson page is a few lines of data plus one practice
   function. The shell supplies the layout, the Learn →
   Remarks → Practice flow, completion + the ✓ on the home tile.

   Page needs:
     <link rel="stylesheet" href="shell.css">
     script tags (src=…) for progress.js and lesson-shell.js
     <div id="lesson"></div>
   then:
     LessonShell.mount({
       id:      'grammar-nouns',      // = the tile id in index.html
       section: 'Grammar',
       title:   'Nouns: gender & number',
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
     { examples: [{ te: 'Telugu', en: 'English', ipa: 'optional' }] }
     { html: '<raw html>' }

   PRACTICE gets the panel element and ctx:
     ctx.miss(key, prompt, answer, note?)   send a wrong answer to Review
     ctx.complete({accuracy, attempts})     mark the unit done (✓)
     ctx.isComplete()
     ctx.id
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
          ${e.ipa ? `<span class="ipa">/${e.ipa}/</span>` : ''}
        </div>`).join('')}</div>`;
    }
    throw new Error('lesson-shell: unknown block ' + JSON.stringify(b).slice(0, 60));
  }
  const blocks = list => `<div class="blocks">${(list || []).map(block).join('')}</div>`;

  function mount(cfg, host) {
    host = host || document.getElementById('lesson') || document.body;
    const Progress = root.TeluguProgress || { miss() {}, complete() {}, isComplete() { return false; } };

    const stages = [
      cfg.learn && cfg.learn.length ? { id: 'learn',    label: 'Learn' }    : null,
      cfg.remarks && cfg.remarks.length ? { id: 'remarks',  label: 'Remarks' }  : null,
      typeof cfg.practice === 'function' ? { id: 'practice', label: 'Practice' } : null,
    ].filter(Boolean);
    if (!stages.length) throw new Error('lesson-shell: nothing to show (give learn, remarks or practice)');

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
        Progress.miss({ game: cfg.id, key, prompt, answer, note }),
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

  root.LessonShell = { mount, block, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.LessonShell;
})(typeof window !== 'undefined' ? window : globalThis);
