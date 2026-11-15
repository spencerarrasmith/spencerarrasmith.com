/* ═════════════════════════════════════════════════════════
   game-menu.js — behaviour of the ⋮ options menu that the
   practice games share (phonemes, diacritics, conjuncts, …).
   Exposes window.GameMenu. Pairs with game.css.

   The page supplies the markup (ids matter):
     #menu-wrap  #menu-btn  #opts-menu     the ⋮ button + popover
     #show-cat   #shuffle-kb  #cat-note    keyboard options (optional)
     #cat-badge                            the card's category label

   Usage:
     GameMenu.init({
       rebuild: buildKB,                        // redraw the keyboard(s)
       reorder: on => { kbOrder = on ? … : null } // shuffle just toggled
     });
     GameMenu.shuffled()   // is "Shuffle keyboard" ticked?
     GameMenu.grouped()    // is "Show categories" ticked?

   Rules it enforces
     · Shuffle ticked   → "Show categories" is forced off and held
       there (a shuffled keyboard has no groups).
     · Shuffle unticked → the box is freed but stays unticked.
═════════════════════════════════════════════════════════ */
(function () {
  const $ = id => document.getElementById(id);

  function syncCategories() {
    const cat = $('show-cat'), shuf = $('shuffle-kb');
    if (!cat) return;
    const shuffled = !!shuf && shuf.checked;
    if (shuffled) cat.checked = false;
    cat.disabled = shuffled;
    const row = cat.closest('.menu-opt');
    if (row) row.classList.toggle('disabled', shuffled);
    if ($('cat-note')) $('cat-note').hidden = !shuffled;
    if ($('cat-badge')) $('cat-badge').style.visibility = cat.checked ? '' : 'hidden';
  }

  function init(opts = {}) {
    const { rebuild = () => {}, reorder = () => {} } = opts;
    const wrap = $('menu-wrap'), btn = $('menu-btn'), menu = $('opts-menu');

    if (wrap && btn && menu) {
      const setOpen = open => { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
      btn.addEventListener('click', () => setOpen(menu.hidden));
      // Stays open while ticking boxes; closes on a tap anywhere else, or Escape.
      document.addEventListener('pointerdown', e => { if (!menu.hidden && !wrap.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
      });
    }

    if ($('show-cat')) $('show-cat').addEventListener('change', () => {
      syncCategories();               // card label follows the box
      rebuild();                      // regroup / flatten the keyboard(s)
    });
    if ($('shuffle-kb')) $('shuffle-kb').addEventListener('change', e => {
      syncCategories();
      reorder(e.target.checked);      // page picks a fresh order (or clears it)
      rebuild();
    });

    syncCategories();                 // browsers can restore ticked boxes on reload
  }

  window.GameMenu = {
    init,
    sync:     syncCategories,
    shuffled: () => !!$('shuffle-kb') && $('shuffle-kb').checked,
    grouped:  () => !$('show-cat') || $('show-cat').checked,
  };
})();