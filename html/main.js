// main.js

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────────────
  let activeTag = "All";
  let allTags   = ["All"];

  // ── DOM helpers ────────────────────────────────────────────────────────────
  const grid   = document.getElementById("grid");
  const tagbar = document.getElementById("tagbar");

  // ── Build tiles (once) ─────────────────────────────────────────────────────
  function buildGrid(projects) {
    projects.forEach((p, i) => {
      const tile = document.createElement("a");
      tile.className = "tile";
      tile.href = p.link || "#";
      if (p.link && p.link !== "#") {
        tile.target = "_blank";
        tile.rel = "noopener noreferrer";
      }
      tile.dataset.tags = p.tags.join(",");
      tile.dataset.id   = p.id;
      tile.style.animationDelay = `${i * 40}ms`;

      const thumb = document.createElement("div");
      thumb.className = "tile-thumb";
      if (p.image) {
        const img = document.createElement("img");
        img.src = p.image;
        img.alt = p.title;
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        thumb.style.background = p.thumb || "#111";
      }

      const body = document.createElement("div");
      body.className = "tile-body";

      const title = document.createElement("p");
      title.className = "tile-title";
      title.textContent = p.title;

      const desc = document.createElement("p");
      desc.className = "tile-desc";
      desc.textContent = p.description;

      const tags = document.createElement("div");
      tags.className = "tile-tags";
      p.tags.forEach((t) => {
        const span = document.createElement("span");
        span.className = "tile-tag";
        span.textContent = t;
        tags.appendChild(span);
      });

      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(tags);
      tile.appendChild(thumb);
      tile.appendChild(body);
      grid.appendChild(tile);
    });
  }

  // ── Filter: fade all out → reflow layout → fade matching back in ────────────
  //
  // Uses transitionend rather than a fixed timeout so phase 2 starts exactly
  // when the last tile finishes fading out, not after an approximated delay.

  let filterGeneration = 0; // incremented on each call to abort stale callbacks

  function applyFilter() {
    const tiles = Array.from(grid.children);
    const gen = ++filterGeneration;

    const matches = (tile) => {
      const tags = tile.dataset.tags.split(",");
      return activeTag === "All" || tags.includes(activeTag);
    };

    // ── Phase 1: snap all tiles to invisible immediately ──────────────────────
    // Remove any in-progress animation state, then disable the transition and
    // set opacity/transform directly so every tile is invisible right now.
    tiles.forEach((t) => {
      t.classList.remove("showing", "hiding");
      t.style.transition = "none";
      t.style.opacity    = "0";
      t.style.transform  = "scale(0.96)";
      t.style.pointerEvents = "none";
    });

    // Force reflow so the browser commits the hidden state before we
    // re-enable transitions for the fade-out.
    void grid.offsetWidth;

    // ── Phase 2: reflow — update which tiles are in the grid ─────────────────
    // All tiles are invisible, so we can safely add/remove display:none here
    // without any visible jump.
    tiles.forEach((t) => {
      t.style.transition    = "";
      t.style.pointerEvents = "";
      if (matches(t)) {
        t.classList.remove("hidden");
      } else {
        t.classList.add("hidden");
        t.style.opacity   = "";
        t.style.transform = "";
      }
    });

    // Force reflow so the grid recalculates positions with the correct tiles
    // in flow before we start the fade-in.
    void grid.offsetWidth;

    // ── Phase 3: fade in matching tiles ──────────────────────────────────────
    // A generation check guards against a second applyFilter call arriving
    // while requestAnimationFrame is pending.
    requestAnimationFrame(() => {
      if (gen !== filterGeneration) return;
      tiles.forEach((t) => {
        if (matches(t)) {
          t.classList.add("showing");
          t.style.opacity   = "";
          t.style.transform = "";
        }
      });

      setTimeout(() => {
        if (gen !== filterGeneration) return;
        tiles.forEach((t) => t.classList.remove("showing"));
      }, 320);
    });
  }

  // ── Render tag bar (active state only — no listener churn) ────────────────
  function renderTagBar() {
    tagbar.innerHTML = "";
    allTags.forEach((tag) => {
      const btn = document.createElement("button");
      btn.className = "tag-btn" + (tag === activeTag ? " active" : "");
      btn.textContent = tag;
      btn.dataset.tag = tag;
      btn.setAttribute("aria-pressed", tag === activeTag ? "true" : "false");
      tagbar.appendChild(btn);
    });
  }

  // ── Delegated click listener on the tag bar (survives re-renders) ──────────
  // Guard against main.js being executed more than once (e.g. double script load),
  // which would attach a second listener and cause every click to fire twice.
  if (!tagbar.dataset.listenerAttached) {
    tagbar.dataset.listenerAttached = "1";
    tagbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".tag-btn");
      if (!btn) return;
      setTag(btn.dataset.tag);
    });
  }

  // ── Set active tag ─────────────────────────────────────────────────────────
  function setTag(tag) {
    if (tag === activeTag) return;
    activeTag = tag;
    applyFilter();
    renderTagBar();
  }

  // ── Keyboard shortcut: Escape resets filter ────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeTag !== "All") setTag("All");
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  fetch("projects.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load projects.json: ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      allTags = ["All", ...new Set(projects.flatMap((p) => p.tags))];
      buildGrid(projects);
      renderTagBar();
    })
    .catch((err) => {
      grid.innerHTML = `<p style="color:var(--text-secondary);font-size:13px;padding:1rem">${err.message}</p>`;
      console.error(err);
    });
})();