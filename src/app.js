import { currentFocus, operatingPrinciples, projectLinks, proofPoints, researchLink } from "./site-data.js";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const projectCard = (project) => `
  <a class="project-card project-card--${project.tone}" href="${project.href}">
    <span class="project-card__meta">${escapeHtml(project.status)}</span>
    <span class="project-card__name">${escapeHtml(project.name)}</span>
    <span class="project-card__label">${escapeHtml(project.label)}</span>
    <span class="project-card__summary">${escapeHtml(project.summary)}</span>
    <span class="project-card__points">
      ${project.points.map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
    </span>
  </a>
`;

const proofCard = (item) => `
  <article class="proof-card">
    <strong>${escapeHtml(item.value)}</strong>
    <span>${escapeHtml(item.label)}</span>
    <p>${escapeHtml(item.body)}</p>
  </article>
`;

const principleCard = (item) => `
  <article class="principle-card">
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.body)}</p>
  </article>
`;

const focusCard = (item) => `
  <article class="focus-card">
    <span></span>
    <div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
    </div>
  </article>
`;

function siteHeader() {
  return `
    <header class="site-nav" aria-label="Primary">
      <a class="brand" href="/" aria-label="ReverseScale home">
        <span class="brand-mark" aria-hidden="true">RS</span>
        <span>
          <strong>ReverseScale</strong>
          <small>self-hosted product infrastructure</small>
        </span>
      </a>
      <nav>
        <a href="/roost-site/">Roost</a>
        <a href="/babel-site/">Babel</a>
        <a class="nav-external" href="${researchLink.href}" target="_blank" rel="noreferrer">${escapeHtml(researchLink.label)}</a>
      </nav>
    </header>
  `;
}

function renderHome({ notFound = false } = {}) {
  return `
    ${siteHeader()}
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__copy">
        <p class="eyebrow">${notFound ? "Page not found" : "ReverseScale"}</p>
        <h1 id="hero-title">${notFound ? "This route is not part of the current public surface." : "Self-hosted tools for shipping mobile products with more control."}</h1>
        <p class="hero__lede">
          ReverseScale builds practical systems for app delivery, localization, release operations, and engineering workflows.
          Roost handles Flutter patch delivery; Babel handles localization as code.
        </p>
        <div class="hero__actions">
          <a class="button button--primary" href="/roost-site/">Explore Roost</a>
          <a class="button button--secondary" href="/babel-site/">Explore Babel</a>
        </div>
      </div>
      <div class="hero-visual" aria-label="ReverseScale project map">
        <div class="visual-panel visual-panel--main">
          <div class="panel-row panel-row--header">
            <span>ReverseScale</span>
            <strong>mobile product systems</strong>
          </div>
          <div class="flow">
            <span class="node node--root">Team</span>
            <span class="line"></span>
            <span class="node node--green">Release</span>
            <span class="line"></span>
            <span class="node node--blue">Strings</span>
          </div>
          <div class="metric-grid">
            <span><strong>Control</strong><small>self-hosted systems</small></span>
            <span><strong>Review</strong><small>traceable changes</small></span>
            <span><strong>Operate</strong><small>visible release state</small></span>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="projects-title">
      <div class="section__intro">
        <p class="eyebrow">Products</p>
        <h2 id="projects-title">Core modules on the main site.</h2>
        <p>
          The public homepage stays focused on current systems.
          <a class="text-link" href="${researchLink.href}" target="_blank" rel="noreferrer">${escapeHtml(researchLink.summary)}</a>
        </p>
      </div>
      <div class="project-grid">
        ${projectLinks.map(projectCard).join("")}
      </div>
    </section>

    <section class="proof-strip" aria-label="Site facts">
      ${proofPoints.map(proofCard).join("")}
    </section>

    <section class="section section--split" aria-labelledby="principles-title">
      <div class="section__intro">
        <p class="eyebrow">What connects them</p>
        <h2 id="principles-title">Infrastructure that keeps product operations inspectable.</h2>
        <p>Roost and Babel solve different problems, but they follow the same operating model.</p>
      </div>
      <div class="principle-grid">
        ${operatingPrinciples.map(principleCard).join("")}
      </div>
    </section>

    <section class="section" aria-labelledby="focus-title">
      <div class="section__intro">
        <p class="eyebrow">Current focus</p>
        <h2 id="focus-title">Where ReverseScale is spending design energy.</h2>
        <p>These are the active themes behind the public project sites.</p>
      </div>
      <div class="focus-grid">
        ${currentFocus.map(focusCard).join("")}
      </div>
    </section>
  `;
}

class ReverseScaleHome extends HTMLElement {
  connectedCallback() {
    const page = this.getAttribute("page") || "home";
    const notFound = page === "404";

    this.innerHTML = `
      <main class="site-shell">
        ${renderHome({ notFound })}
        <footer class="site-footer">
          <span>ReverseScale</span>
          <span>Self-hosted product infrastructure for mobile teams.</span>
        </footer>
      </main>
    `;
  }
}

customElements.define("rs-home", ReverseScaleHome);
