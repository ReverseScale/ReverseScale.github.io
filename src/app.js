import { profile, projectLinks, workingPrinciples } from "./site-data.js";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const projectMicroVisual = (project) => {
  if (project.visual === "package") {
    return `
      <span class="micro-visual micro-visual--package" aria-hidden="true">
        <span class="package-file"><i></i><i></i><i></i></span>
        <span class="package-arrow">↓</span>
        <span class="package-device"><i></i></span>
      </span>
    `;
  }

  if (project.visual === "strings") {
    return `
      <span class="micro-visual micro-visual--strings" aria-hidden="true">
        <span><b>title</b><i>Welcome back</i></span>
        <span><b>cta</b><i>Continue</i></span>
        <span><b>status</b><i>Ready</i></span>
      </span>
    `;
  }

  if (project.visual === "pipeline") {
    return `
      <span class="micro-visual micro-visual--pipeline" aria-hidden="true">
        <span><i></i><b>Build</b></span>
        <em></em>
        <span><i></i><b>Sign</b></span>
        <em></em>
        <span><i></i><b>Ship</b></span>
      </span>
    `;
  }

  return "";
};

const heroProjectCard = (project, index) => `
  <a class="hero-project hero-project--${project.tone}" href="${project.href}" aria-label="Explore ${escapeHtml(project.name)}">
    <span class="hero-project__index">0${index + 1}</span>
    <span class="hero-project__copy">
      <strong>${escapeHtml(project.name)}</strong>
      <small>${escapeHtml(project.label)}</small>
    </span>
    ${projectMicroVisual(project)}
    <span class="hero-project__arrow" aria-hidden="true">↗</span>
  </a>
`;

const projectCard = (project) => `
  <a class="project-card project-card--${project.tone}" href="${project.href}">
    ${projectMicroVisual(project)}
    <span class="project-card__meta">${escapeHtml(project.status)}</span>
    <span class="project-card__name">${escapeHtml(project.name)}</span>
    <span class="project-card__label">${escapeHtml(project.label)}</span>
    <span class="project-card__summary">${escapeHtml(project.summary)}</span>
    <span class="project-card__points">
      ${project.points.map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
    </span>
    <span class="project-card__link">Open project <span aria-hidden="true">↗</span></span>
  </a>
`;

const principleCard = (principle, index) => `
  <article class="principle-card">
    <span>0${index + 1}</span>
    <h3>${escapeHtml(principle.title)}</h3>
    <p>${escapeHtml(principle.body)}</p>
  </article>
`;

function siteHeader() {
  return `
    <header class="site-nav" aria-label="Primary navigation">
      <a class="brand" href="/" aria-label="Tim home">
        <span class="brand-mark" aria-hidden="true">${escapeHtml(profile.mark)}</span>
        <span>
          <strong>${escapeHtml(profile.name)}</strong>
          <small>${escapeHtml(profile.role)}</small>
        </span>
      </a>
      <nav>
        <a href="/#work">Work</a>
        <a href="${profile.research.href}" target="_blank" rel="noreferrer">Research</a>
        <a href="/about/">About</a>
        <a class="nav-external" href="${profile.github.href}" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  `;
}

function renderHome() {
  return `
    ${siteHeader()}
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__copy">
        <p class="eyebrow">${escapeHtml(profile.role)}</p>
        <h1 id="hero-title">I build tools for mobile teams.</h1>
        <p class="hero__lede">${escapeHtml(profile.description)}</p>
        <div class="hero__actions">
          <a class="button button--primary" href="#work">See my work <span aria-hidden="true">↓</span></a>
          <a class="button button--secondary" href="/about/">About me</a>
        </div>
      </div>
      <div class="hero-work" aria-label="Selected projects">
        <p><span>Selected work</span><span>2026</span></p>
        ${projectLinks.map(heroProjectCard).join("")}
      </div>
    </section>

    <section class="section work-section" id="work" aria-labelledby="work-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Selected work</p>
          <h2 id="work-title">Three tools, one practical thread.</h2>
        </div>
        <p>Projects built around the difficult space between code, review, build, and release.</p>
      </div>
      <div class="project-grid">
        ${projectLinks.map(projectCard).join("")}
      </div>
    </section>

    <section class="section principles-section" aria-labelledby="principles-title">
      <div class="section-heading section-heading--compact">
        <div>
          <p class="eyebrow">How I work</p>
          <h2 id="principles-title">Software should make its state understandable.</h2>
        </div>
      </div>
      <div class="principle-grid">
        ${workingPrinciples.map(principleCard).join("")}
      </div>
    </section>

    <section class="section about-brief" id="about" aria-labelledby="about-title">
      <p class="eyebrow">About</p>
      <div>
        <h2 id="about-title">Independent by choice, product-minded by habit.</h2>
        <div>
          <p>${escapeHtml(profile.story)}</p>
          <a class="text-link" href="/about/">More about me <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>

    <section class="section research-brief" id="research" aria-labelledby="research-title">
      <div>
        <p class="eyebrow">Research & notes</p>
        <h2 id="research-title">Writing lives in Notion.</h2>
        <p>${escapeHtml(profile.research.summary)} Project-specific documentation stays with each project.</p>
      </div>
      <a class="button button--secondary" href="${profile.research.href}" target="_blank" rel="noreferrer">Open Research <span aria-hidden="true">↗</span></a>
    </section>
  `;
}

class ReverseScaleHome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <main class="site-shell">
        ${renderHome()}
        <footer class="site-footer">
          <span>© 2026 ${escapeHtml(profile.name)}</span>
          <span>ReverseScale is the home of my independent projects.</span>
        </footer>
      </main>
    `;
  }
}

customElements.define("rs-home", ReverseScaleHome);
