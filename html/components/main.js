// main.js

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────────────
  let activeTags = new Set(); // empty = show all (same as "All")
  let allTags    = [];

  // ── DOM helpers ────────────────────────────────────────────────────────────
  const grid   = document.getElementById("grid");
  const tagbar = document.getElementById("tagbar");

  // ── Build tiles (once) ─────────────────────────────────────────────────────
  function buildGrid(projects) {
    projects.forEach((p, i) => {
      const tile = document.createElement("a");
      tile.className = "tile";
      tile.href = `project.html?id=${p.id}`;
      tile.dataset.tags = p.tags.join(",");
      tile.dataset.id   = p.id;
      tile.style.animationDelay = `${i * 40}ms`;

      if (p.wip) {
        const sash = document.createElement("div");
        sash.className = "wip-sash";
        sash.textContent = "WIP";
        tile.appendChild(sash);
      }

      const thumb = document.createElement("div");
      thumb.className = "tile-thumb";
      const img = document.createElement("img");
      img.alt = p.title;
      img.loading = "lazy";
      if (p.thumb) {
        img.src = p.thumb;
      } else {
        img.src = "img/thumb/sra.jpg"
      }
      thumb.appendChild(img);

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

  let filterGeneration = 0;

  function applyFilter() {
    const tiles = Array.from(grid.children);
    const gen = ++filterGeneration;

    const matches = (tile) => {
      if (activeTags.size === 0) return true;
      return [...activeTags].every((t) => tile.dataset.tags.split(",").includes(t));
    };

    // Phase 1: snap all tiles invisible
    tiles.forEach((t) => {
      t.classList.remove("showing", "hiding");
      t.style.transition    = "none";
      t.style.opacity       = "0";
      t.style.transform     = "scale(0.96)";
      t.style.pointerEvents = "none";
    });

    void grid.offsetWidth;

    // Phase 2: update layout while everything is invisible
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

    void grid.offsetWidth;

    // Phase 3: fade in matching tiles
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
      }, 150);
    });
  }

  // ── Render tag bar ─────────────────────────────────────────────────────────
  function renderTagBar() {
    tagbar.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = "tag-btn" + (activeTags.size === 0 ? " active" : "");
    allBtn.textContent = "All";
    allBtn.dataset.tag = "All";
    allBtn.setAttribute("aria-pressed", activeTags.size === 0 ? "true" : "false");
    allBtn.style.setProperty("--tag-color", "var(--accent)");
    tagbar.appendChild(allBtn);

    allTags.forEach((tag) => {
      const btn = document.createElement("button");
      btn.className = "tag-btn" + (activeTags.has(tag) ? " active" : "");
      btn.textContent = tag;
      btn.dataset.tag = tag;
      btn.setAttribute("aria-pressed", activeTags.has(tag) ? "true" : "false");
      btn.style.setProperty("--tag-color", tagColor(tag));
      tagbar.appendChild(btn);
    });
  }

  // ── Calculate tag color from text ──────────────────────────────────────────
  function tagColor(tag) {
    const len = tag.length;

    const a = tag.slice(0,                   Math.floor(len / 3));
    const b = tag.slice(Math.floor(len / 3), Math.floor(2 * len / 3));
    const c = tag.slice(Math.floor(2 * len / 3));

    const sum = (str) => [...str].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

    const r  = 0xFF - (sum(a) % 0xFF);
    const g  = 0xFF - (sum(b) % 0xFF);
    const b_ = 0xFF - (sum(c) % 0xFF);

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b_;
    const MIN_LUMINANCE = 130;

    let fr = r, fg = g, fb = b_;
    if (luminance < MIN_LUMINANCE) {
      const scale = MIN_LUMINANCE / (luminance || 1);
      fr = Math.min(255, Math.round(r  * scale));
      fg = Math.min(255, Math.round(g  * scale));
      fb = Math.min(255, Math.round(b_ * scale));
    }

    const hex = (n) => n.toString(16).padStart(2, "0");
    return `#${hex(fr)}${hex(fg)}${hex(fb)}`;
  }

  // ── Delegated click listener ───────────────────────────────────────────────
  if (tagbar._filterController) tagbar._filterController.abort();
  tagbar._filterController = new AbortController();
  tagbar.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-btn");
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (tag === "All") {
      resetTags();
    } else {
      toggleTag(tag);
    }
  }, { signal: tagbar._filterController.signal });

  // ── Tag state mutators ─────────────────────────────────────────────────────
  function toggleTag(tag) {
    if (activeTags.has(tag)) {
      activeTags.delete(tag);
    } else {
      activeTags.add(tag);
    }
    applyFilter();
    renderTagBar();
  }

  function resetTags() {
    if (activeTags.size === 0) return;
    activeTags.clear();
    applyFilter();
    renderTagBar();
  }

  // ── Keyboard shortcut: Escape resets filters ───────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") resetTags();
  });

  // ── Click-and-drag-scrollable tag bar ──────────────────────────────────────
  const tagBar = document.getElementById("tagbar");

  let isDown = false;
  let startX;
  let scrollLeft;

  tagBar.addEventListener("mousedown", (e) => {
    isDown = true;
    tagBar.style.cursor = "grabbing";
    startX = e.pageX - tagBar.offsetLeft;
    scrollLeft = tagBar.scrollLeft;
  });

  tagBar.addEventListener("mouseleave", () => {
    isDown = false;
    tagBar.style.cursor = "grab";
  });

  tagBar.addEventListener("mouseup", () => {
    isDown = false;
    tagBar.style.cursor = "grab";
  });

  tagBar.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - tagBar.offsetLeft;
    const walk = x - startX;
    tagBar.scrollLeft = scrollLeft - walk;
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  fetch("projects.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load projects.json: ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      allTags = [...new Set(projects.flatMap((p) => p.tags))];
      buildGrid(projects);
      renderTagBar();

      // ── Version footer ─────────────────────────────────────────────────
      fetch("version.json")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          const el = document.getElementById("site-version");
          if (el && data?.version) {
            const badge = document.createElement("span");
            badge.className = "tile-tag";
            badge.textContent = data.version;
            el.appendChild(badge);
          }
        })
        .catch(() => {});
    })
    .catch((err) => {
      grid.innerHTML = `<p style="color:var(--text-secondary);font-size:13px;padding:1rem">${err.message}</p>`;
      console.error(err);
    });
})();
