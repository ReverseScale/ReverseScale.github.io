export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

export const renderPipelineStage = (stage, index) => `
  <button
    class="workflow-stage${index === 0 ? " is-active" : ""}"
    type="button"
    data-pipeline-stage="${escapeHtml(stage.id)}"
    aria-pressed="${index === 0 ? "true" : "false"}"
  >
    <span class="workflow-stage__index">${escapeHtml(stage.index)}</span>
    <span class="workflow-stage__copy">
      <strong>${escapeHtml(stage.title)}</strong>
      <small>${escapeHtml(stage.label)}</small>
    </span>
    <span class="workflow-stage__signal" aria-hidden="true"></span>
  </button>
`;

export const renderFoundationLane = (lane) => `
  <article class="foundation-lane foundation-lane--${escapeHtml(lane.id)}">
    <span class="foundation-lane__mark" aria-hidden="true"><i></i><i></i><i></i></span>
    <div>
      <p>${escapeHtml(lane.title)}</p>
      <span>${escapeHtml(lane.detail)}</span>
    </div>
    <strong>${escapeHtml(lane.output)}</strong>
  </article>
`;

export const renderStateButton = (state, index) => `
  <button
    type="button"
    data-state-control="${escapeHtml(state.id)}"
    aria-pressed="${index === 0 ? "true" : "false"}"
  >${escapeHtml(state.label)}</button>
`;

export const renderModeButton = (mode, index, controlName) => `
  <button
    type="button"
    data-${escapeHtml(controlName)}-control="${escapeHtml(mode.id)}"
    aria-pressed="${index === 0 ? "true" : "false"}"
  >${escapeHtml(mode.label)}</button>
`;

export const renderSectionHeading = ({ eyebrow, title, description, id, split = false }) => `
  <div class="designer-section__heading${split ? " designer-section__heading--split" : ""}">
    ${split ? "<div>" : ""}
      <p class="designer-eyebrow">${escapeHtml(eyebrow)}</p>
      <h2 id="${escapeHtml(id)}">${title}</h2>
    ${split ? "</div>" : ""}
    <p>${escapeHtml(description)}</p>
  </div>
`;

export const renderCapabilityCard = (capability) => `
  <article class="capability-card capability-card--${escapeHtml(capability.id)}">
    <div class="capability-card__meta">
      <span>${escapeHtml(capability.index)}</span>
      <small>${escapeHtml(capability.eyebrow)}</small>
    </div>
    <h3>${escapeHtml(capability.title)}</h3>
    <p>${escapeHtml(capability.detail)}</p>
    <div class="capability-card__signal"><i></i>${escapeHtml(capability.signal)}</div>
    <ul>${capability.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
  </article>
`;

export const renderEvidenceArtifact = (artifact, index) => `
  <figure class="review-artifact review-artifact--${escapeHtml(artifact.crop)}${index === 0 ? " review-artifact--featured" : ""}">
    <div class="review-artifact__frame">
      <img src="${escapeHtml(artifact.src)}" alt="${escapeHtml(artifact.alt)}" decoding="async" />
    </div>
    <figcaption>
      <span>${escapeHtml(artifact.component)}</span>
      <small>${escapeHtml(artifact.useCase)}</small>
    </figcaption>
  </figure>
`;

export const createAIDesignerPage = ({ header, sections, footer }) => `
  ${header}
  <main>${sections.join("")}</main>
  ${footer}
`;
