// project.js

(function () {
  "use strict";

  const root = document.getElementById("project-root");

  // ── Read project ID from query string: /project.html?id=ray-tracer ──────────
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    renderError("No project ID specified.");
    return;
  }

  // ── Fetch project data, then matching markdown file ───────────────────────
  fetch("projects.json")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load projects.json: ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      const project = projects.find((p) => p.id === id);
      if (!project) {
        renderError(`No project found with id "${id}".`);
        return;
      }

      // Fetch the markdown — a missing file is non-fatal
      return fetch(`content/${id}.md`)
        .then((res) => (res.ok ? res.text() : ""))
        .then((markdown) => renderProject(project, markdown));
    })
    .catch((err) => {
      renderError(err.message);
      console.error(err);
    });

  // ── Render ────────────────────────────────────────────────────────────────
  function renderProject(p, markdown) {
    document.title = `${p.title} — Portfolio`;

    // ── Hero ─────────────────────────────────────────────────────────────────
    const hero = document.createElement("div");
    hero.className = "project-hero";
    if (p.hero) {
      const img = document.createElement("img");
      img.src = p.hero;
      img.alt = p.title;
      hero.appendChild(img);
    } else {
      hero.style.background = "#111";
    }

    // ── Back link ─────────────────────────────────────────────────────────────
    const back = document.createElement("a");
    back.className = "project-back";
    back.href = "index.html";
    back.textContent = "← All Projects";

    // ── Header block ──────────────────────────────────────────────────────────
    const header = document.createElement("div");
    header.className = "project-header";

    const title = document.createElement("h1");
    title.className = "project-title";
    title.textContent = p.title;

    const tags = document.createElement("div");
    tags.className = "tile-tags";
    (p.tags || []).forEach((t) => {
      const span = document.createElement("span");
      span.className = "tile-tag";
      span.textContent = t;
      tags.appendChild(span);
    });

    header.appendChild(title);
    header.appendChild(tags);

    // ── Body ──────────────────────────────────────────────────────────────────
    const body = document.createElement("div");
    body.className = "project-body";

    // Markdown prose
    if (markdown) {
      const prose = document.createElement("div");
      prose.className = "project-prose";
      prose.innerHTML = marked.parse(markdown);
      body.appendChild(prose);
    }

    // External link
    if (p.link && p.link !== "#") {
      const linkWrap = document.createElement("div");
      linkWrap.className = "project-link-wrap";
      const link = document.createElement("a");
      link.className = "project-link";
      link.href = p.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View on GitHub →";
      linkWrap.appendChild(link);
      body.appendChild(linkWrap);
    }

    // ── Assemble ──────────────────────────────────────────────────────────────
    root.appendChild(back);
    root.appendChild(hero);
    root.appendChild(header);
    root.appendChild(body);
  }

  // ── Error state ───────────────────────────────────────────────────────────
  function renderError(msg) {
    root.innerHTML = `
      <div class="project-error">
        <p>${msg}</p>
        <a href="index.html">← back to projects</a>
      </div>`;
  }
})();
