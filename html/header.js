// header.js
// Renders the site header into <header class="site-header"> on any page.
//
// Icons are served via the Iconify API: https://api.iconify.design/[set]:[name].svg
// Browse icons at https://icon-sets.iconify.design
//
// Usage: renderHeader("portfolio" | "contact" | "project")

const HEADER_CONFIG = {
  name:     "Spencer Arrasmith",
  logo:     "img/sra_simple.svg",
  nav: [
    { id: "portfolio", label: "Portfolio", href: "index.html"   },
    { id: "friends",   label: "Friends",   href: "friends.html" },
    { id: "contact",   label: "Contact",   href: "contact.html" },
  ],
  social: [
    {
      label: "LinkedIn",
      href:  "https://www.linkedin.com/in/spencer-arrasmith-542113191/",
      icon:  "https://api.iconify.design/uil:linkedin-alt.svg",
    },
    {
      label: "GitHub",
      href:  "https://github.com/spencerarrasmith/spencerarrasmith.com",
      icon:  "https://api.iconify.design/uil:github-alt.svg",
    },
  ],
};

// Fetch an SVG from a URL and inject it inline so it inherits currentColor.
// Returns a Promise that resolves to an <svg> element, or null on failure.
function fetchIcon(url, width, height) {
  if (!url) return Promise.resolve(null);

  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Icon fetch failed: ${url}`);
      return res.text();
    })
    .then((svgText) => {
      const parser = new DOMParser();
      const doc    = parser.parseFromString(svgText, "image/svg+xml");
      const svg    = doc.querySelector("svg");
      if (!svg) return null;
      svg.setAttribute("width",  width);
      svg.setAttribute("height", height);
      // Simple Icons use fill, not stroke — keep fill but make it currentColor
      svg.setAttribute("fill", "currentColor");
      svg.removeAttribute("xmlns");
      return svg;
    })
    .catch(() => null); // fail silently — icon just won't appear
}

// ── renderHeader ──────────────────────────────────────────────────────────────
function renderHeader(activePage) {
  const header = document.querySelector(".site-header");
  if (!header) return;

  // ── Logo (fetched inline so SVG fill inherits currentColor) ─────────────
  const logoLink = document.createElement("a");
  logoLink.href = "index.html";
  logoLink.className = "header-logo-link";
  logoLink.setAttribute("aria-label", "Home");

  // Placeholder keeps layout stable while the SVG loads
  const logoPlaceholder = document.createElement("span");
  logoPlaceholder.className = "header-logo";
  logoPlaceholder.style.display = "inline-block";
  logoPlaceholder.style.width = "32px";
  logoLink.appendChild(logoPlaceholder);

  fetch(HEADER_CONFIG.logo)
    .then((res) => { if (!res.ok) throw new Error(); return res.text(); })
    .then((svgText) => {
      const parser = new DOMParser();
      const svg = parser.parseFromString(svgText, "image/svg+xml").querySelector("svg");
      if (!svg) return;
      svg.classList.add("header-logo");
      // Let CSS height drive the size; remove any hardcoded width/height attrs
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("fill", "currentColor");
      logoLink.replaceChild(svg, logoPlaceholder);
    })
    .catch(() => {
      // Fall back to text initials if SVG fails to load
      logoPlaceholder.textContent = "SA";
      logoPlaceholder.style.fontSize = "18px";
      logoPlaceholder.style.fontWeight = "600";
      logoPlaceholder.style.color = "var(--text-primary)";
    });

  // ── Name ──────────────────────────────────────────────────────────────────
  const name = document.createElement("span");
  name.className = "site-name";
  name.textContent = HEADER_CONFIG.name;

  // ── Nav ───────────────────────────────────────────────────────────────────
  const nav = document.createElement("nav");
  nav.className = "header-nav";
  HEADER_CONFIG.nav.forEach(({ id, label, href }) => {
    const a = document.createElement("a");
    a.href = href;
    a.className = "nav-btn" + (id === activePage ? " active" : "");
    a.textContent = label;
    nav.appendChild(a);
  });

  // ── Social icons ──────────────────────────────────────────────────────────
  const social = document.createElement("div");
  social.className = "header-social";

  const iconPromises = HEADER_CONFIG.social.map(({ label, href, icon }) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "social-link";
    a.setAttribute("aria-label", label);
    social.appendChild(a);

    return fetchIcon(icon, 18, 18).then((svg) => {
      if (svg) a.appendChild(svg);
    });
  });

  // ── Assemble ──────────────────────────────────────────────────────────────
  const inner = document.createElement("div");
  inner.className = "header-inner";
  inner.appendChild(logoLink);
  inner.appendChild(name);
  inner.appendChild(nav);
  inner.appendChild(social);

  header.innerHTML = "";
  header.appendChild(inner);

  // Icons load async — they appear once fetched without shifting layout
  // because the <a> elements are already in the DOM at fixed size
  return Promise.all(iconPromises);
}