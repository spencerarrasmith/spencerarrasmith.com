/* ═════════════════════════════════════════════════════════
   game-menu.js — the keyboard option the practice games share
   ("Group keyboard phonetically"), and the ⋮ options menu of a
   game that has one (Lookalikes). Phonemes, Diacritics,
   Conjuncts, and Words keep their checkboxes in the session
   popup (game-setup.js) and have no ⋮ menu.
   Exposes window.GameMenu. Pairs with game.css.

   The page supplies the markup (ids matter):
     #menu-wrap  #menu-btn  #opts-menu     the ⋮ button + popover (optional)
     #group-kb                             "Group keyboard phonetically" (optional)
     #cat-badge                            the card's category label: shown
                                           while the keyboard is grouped
     #shuffle-kb                           Lookalikes' "Shuffle choices" (optional)

   Usage:
     GameMenu.init({
       rebuild: buildKB,                        // redraw the keyboard
       reorder: on => { … }                     // "Shuffle choices" just toggled
     });
     GameMenu.grouped()    // is "Group keyboard phonetically" checked?
     GameMenu.shuffled()   // is "Shuffle choices" checked?
     GameMenu.sync()       // the card's label follows the box (after a page sets it)

   Unchecked, the games lay their keys out as the Telugu keyboard
   does (TeluguKeyboard.board(), telugu-keyboard.js); checked, in
   groups by sound, with each card's group shown on the card.
════════════════════════════════════════════════════════ */
(function () {
  const $ = id => document.getElementById(id);

  function syncCategories() {
    if ($('cat-badge')) $('cat-badge').style.visibility = $('group-kb') && $('group-kb').checked ? '' : 'hidden';
  }

  function init(opts = {}) {
    const { rebuild = () => {}, reorder = () => {} } = opts;
    const wrap = $('menu-wrap'), btn = $('menu-btn'), menu = $('opts-menu');

    if (wrap && btn && menu) {
      const setOpen = open => { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
      btn.addEventListener('click', () => setOpen(menu.hidden));
      // Stays open while checking boxes; closes on a tap anywhere else, or Escape.
      document.addEventListener('pointerdown', e => { if (!menu.hidden && !wrap.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
      });
    }

    if ($('group-kb')) $('group-kb').addEventListener('change', () => {
      syncCategories();               // the card's label follows the box
      rebuild();                      // the layout, or the groups
    });
    if ($('shuffle-kb')) $('shuffle-kb').addEventListener('change', e => {
      reorder(e.target.checked);      // page picks a fresh order (or clears it)
      rebuild();
    });

    syncCategories();                 // browsers can restore checked boxes on reload
  }

  window.GameMenu = {
    init,
    sync:     syncCategories,
    shuffled: () => !!$('shuffle-kb') && $('shuffle-kb').checked,
    grouped:  () => !!$('group-kb') && $('group-kb').checked,
  };
})();
