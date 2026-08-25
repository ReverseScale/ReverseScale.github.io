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

const renderFoundationSample = (laneId, sample) => `
  <span class="foundation-sample foundation-sample--${escapeHtml(laneId)}-${escapeHtml(sample.id)}">
    <i aria-hidden="true">${escapeHtml(sample.symbol)}</i>
    <small>${escapeHtml(sample.label)}</small>
  </span>
`;

const renderFoundationFact = (fact) => `
  <span class="foundation-fact">
    <small>${escapeHtml(fact.label)}</small>
    <strong>${escapeHtml(fact.value)}</strong>
  </span>
`;

export const renderFoundationLane = (lane) => `
  <article class="foundation-lane foundation-lane--${escapeHtml(lane.id)}">
    <header class="foundation-lane__header">
      <span>${escapeHtml(lane.index)} · foundation</span>
      <i>v${escapeHtml(lane.version)}</i>
    </header>
    <div class="foundation-lane__title">
      <p>${escapeHtml(lane.title)}</p>
      <code>${escapeHtml(lane.packageName)}</code>
    </div>
    <div class="foundation-lane__preview" aria-label="${escapeHtml(lane.title)} package samples">
      ${lane.samples.map((sample) => renderFoundationSample(lane.id, sample)).join("")}
    </div>
    <p class="foundation-lane__detail">${escapeHtml(lane.detail)}</p>
    <div class="foundation-lane__facts">
      ${lane.facts.map(renderFoundationFact).join("")}
    </div>
    <footer>
      <span>public export</span>
      <strong>${escapeHtml(lane.output)}</strong>
      <i aria-hidden="true">↗</i>
    </footer>
  </article>
`;

export const renderContractField = (field) => `
  <p>
    <span>${escapeHtml(field.label)}</span>
    <b>${escapeHtml(field.value)}</b>
  </p>
`;

const consumerPreviews = Object.freeze({
  production: `
    <div class="consumer-preview consumer-preview--production" aria-hidden="true">
      <span class="consumer-preview__caption">DesignButton / primary</span>
      <strong><i>✓</i> Review changes</strong>
      <small>enabled · 48dp · label</small>
    </div>
  `,
  widgetbook: `
    <div class="consumer-preview consumer-preview--widgetbook" aria-hidden="true">
      <span class="consumer-preview__chrome"><i></i><i></i><i></i><b>Widgetbook</b></span>
      <span class="consumer-preview__sidebar"><i></i><i></i><i></i><i></i></span>
      <span class="consumer-preview__canvas"><b>Button</b><i>Primary</i><small>theme · viewport · state</small></span>
    </div>
  `,
  golden: `
    <div class="consumer-preview consumer-preview--golden" aria-hidden="true">
      <span><small>Expected</small><i></i></span>
      <span><small>Actual</small><i></i></span>
      <span><small>Diff</small><i></i><b>2</b></span>
    </div>
  `,
});

export const renderFoundationConsumer = (consumer) => `
  <article class="foundation-consumer foundation-consumer--${escapeHtml(consumer.id)}">
    <header><span>${escapeHtml(consumer.index)}</span><small>${escapeHtml(consumer.eyebrow)}</small></header>
    ${consumerPreviews[consumer.id] ?? ""}
    <div class="foundation-consumer__copy">
      <strong>${escapeHtml(consumer.title)}</strong>
      <small>${escapeHtml(consumer.detail)}</small>
    </div>
    <footer>${escapeHtml(consumer.meta)}</footer>
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
