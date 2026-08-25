import {
  componentStates,
  componentContractFields,
  createComponentPreview,
  foundationConsumers,
  foundationLanes,
  operatingCapabilities,
  pipelineStages,
  previewThemes,
  previewViewports,
  reviewArtifacts,
} from "./ai-designer-model.mjs";
import {
  createAIDesignerPage,
  escapeHtml,
  renderCapabilityCard,
  renderContractField,
  renderEvidenceArtifact,
  renderFoundationConsumer,
  renderFoundationLane,
  renderModeButton,
  renderPipelineStage,
  renderSectionHeading,
  renderStateButton,
} from "./ai-designer-components.mjs";

const pageTemplate = () => createAIDesignerPage({
  header: `
  <header class="designer-nav">
    <a class="designer-brand" href="/" aria-label="Back to Tim’s work">
      <span aria-hidden="true">T</span>
      <strong>Tim</strong>
    </a>
    <nav aria-label="AI Designer sections">
      <a href="#workflow">Workflow</a>
      <a href="#system">System</a>
      <a href="#capabilities">Capabilities</a>
      <a href="#lab">Component lab</a>
      <a href="#evidence">Evidence</a>
    </nav>
  </header>`,
  sections: [`
    <section class="designer-hero" aria-labelledby="designer-title">
      <div class="designer-hero__copy">
        <p class="designer-eyebrow"><span></span> AI Designer · Penpot → Flutter</p>
        <h1 id="designer-title">Design intent,<br />shipped as<br /><em>reviewable Flutter.</em></h1>
        <p class="designer-hero__lede">
          A design system workflow that freezes intent at a deliberate snapshot, turns foundations into typed APIs,
          and keeps component behavior and visual change reviewable all the way to release.
        </p>
        <div class="designer-actions">
          <a class="designer-button designer-button--primary" href="#workflow">Trace the workflow <span aria-hidden="true">↓</span></a>
          <a class="designer-button" href="#lab">Open component lab</a>
        </div>
      </div>

      <div class="designer-hero__system" role="img" aria-label="Penpot snapshot flows through independent Tokens, Icons, and Assets foundations into a component contract, Flutter UI, and visual review">
        <div class="system-caption"><span>Released input</span><span>Reviewable output</span></div>
        <div class="system-source">
          <span class="system-source__mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <div><small>Penpot</small><strong>User snapshot</strong></div>
          <span class="system-source__status">immutable</span>
        </div>
        <div class="system-rail" aria-hidden="true"><span></span><i></i></div>
        <div class="system-foundations">
          <span>Tokens</span><span>Icons</span><span>Assets</span>
        </div>
        <div class="system-merge" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="system-output">
          <span><small>Contract</small><strong>Behavior</strong></span>
          <b aria-hidden="true">→</b>
          <span><small>Flutter</small><strong>Component</strong></span>
          <b aria-hidden="true">→</b>
          <span class="system-output__approved"><small>Review</small><strong>Approved</strong></span>
        </div>
        <div class="system-proof">
          <span><i></i> provenance</span>
          <span><i></i> deterministic</span>
          <span><i></i> accessible</span>
        </div>
      </div>

      <dl class="designer-metrics">
        <div><dt>03</dt><dd>independent foundation lanes</dd></div>
        <div><dt>01</dt><dd>machine-readable component contract</dd></div>
        <div><dt>02</dt><dd>interactive and visual review surfaces</dd></div>
      </dl>
    </section>

    <section class="designer-section workflow-section" id="workflow" aria-labelledby="workflow-title">
      <div class="designer-section__heading">
        <p class="designer-eyebrow">Release flow</p>
        <h2 id="workflow-title">The handoff is a chain of evidence.</h2>
        <p>Choose a stage to see why each boundary exists. No production build reads a designer’s live workspace.</p>
      </div>
      <div class="workflow-board">
        <div class="workflow-list" aria-label="Design system pipeline stages">
          ${pipelineStages.map(renderPipelineStage).join("")}
        </div>
        <aside class="workflow-inspector" aria-live="polite">
          <span class="workflow-inspector__status">Stage ${escapeHtml(pipelineStages[0].index)} / ${pipelineStages.length.toString().padStart(2, "0")}</span>
          <p class="workflow-inspector__label">${escapeHtml(pipelineStages[0].label)}</p>
          <h3>${escapeHtml(pipelineStages[0].title)}</h3>
          <p class="workflow-inspector__detail">${escapeHtml(pipelineStages[0].detail)}</p>
          <dl class="workflow-inspector__facts">
            <div><dt>Input</dt><dd data-stage-input>${escapeHtml(pipelineStages[0].input)}</dd></div>
            <div><dt>Artifact</dt><dd data-stage-artifact>${escapeHtml(pipelineStages[0].artifact)}</dd></div>
            <div><dt>Release gate</dt><dd data-stage-gate>${escapeHtml(pipelineStages[0].gate)}</dd></div>
          </dl>
          <div class="workflow-inspector__rule">
            <span>Operating principle</span>
            <strong>Every handoff produces a reviewable artifact before the next stage begins.</strong>
          </div>
        </aside>
      </div>
    </section>

    <section class="designer-section foundation-section" id="system" aria-labelledby="system-title">
      <div class="designer-section__heading designer-section__heading--split">
        <div>
          <p class="designer-eyebrow">Architecture</p>
          <h2 id="system-title">Independent foundations.<br />One component language.</h2>
        </div>
        <p>
          Deterministic design data and product behavior have different ownership. Keeping them separate prevents a convenient generator from becoming an unreviewable runtime dependency.
        </p>
      </div>
      <div class="foundation-map">
        <div class="foundation-map__header">
          <div>
            <span>Release manifest</span>
            <strong>Foundations BOM</strong>
            <small><i>release 0.1.0</i><i>3 snapshots</i><i>4 packages</i></small>
          </div>
          <div class="foundation-map__checks"><span><i></i> snapshot pinned</span><span><i></i> inputs verified</span><span><i></i> drift clean</span></div>
        </div>
        <div class="foundation-lanes">
          ${foundationLanes.map(renderFoundationLane).join("")}
        </div>
        <div class="foundation-join" aria-hidden="true"><i></i><span>typed public APIs</span><i></i></div>
        <article class="component-contract">
          <div class="component-contract__header">
            <span><i>04</i> component-spec.json</span>
            <span><i></i> validated</span>
          </div>
          <div class="component-contract__content">
            <div class="component-contract__identity">
              <small>component</small>
              <strong>DesignButton</strong>
              <code>design_button / primary</code>
              <div><span>schema 1.2.0</span><span>stable</span></div>
            </div>
            <div class="component-contract__body">
              ${componentContractFields.map(renderContractField).join("")}
            </div>
          </div>
          <footer class="component-contract__footer">
            <span><i>DEP</i> tokens@0.1.0</span>
            <span><i>DEP</i> icons@0.1.0</span>
            <span><i>DEP</i> assets@0.1.0</span>
            <span><i>SHA</i> d682…44d</span>
          </footer>
        </article>
        <div class="foundation-flow" aria-hidden="true">
          <i></i><span>contract accepted</span><i></i>
        </div>
        <div class="foundation-consumers">
          ${foundationConsumers.map(renderFoundationConsumer).join("")}
        </div>
        <div class="foundation-map__legend">
          <span><i></i> immutable input</span>
          <span><i></i> generated + committed</span>
          <span><i></i> human approval required</span>
          </div>
      </div>
    </section>

    <section class="designer-section capability-section" id="capabilities" aria-labelledby="capabilities-title">
      ${renderSectionHeading({
        eyebrow: "Operating system",
        title: "From design release to running component.",
        description: "The value is not a pile of generated files. It is a controlled loop that moves a deliberate design release into typed development modules, a live cookbook, and review evidence.",
        id: "capabilities-title",
      })}
      <div class="release-loop" role="img" aria-label="Penpot release snapshot flows through verified sync and typed Flutter packages into a live Widgetbook cookbook and visual approval">
        <span><small>Design platform</small><strong>Release snapshot</strong></span>
        <i aria-hidden="true">→</i>
        <span><small>Protected automation</small><strong>Verify + sync</strong></span>
        <i aria-hidden="true">→</i>
        <span><small>Developer modules</small><strong>Typed packages</strong></span>
        <i aria-hidden="true">→</i>
        <span><small>Cookbook + CI</small><strong>Run + review</strong></span>
      </div>
      <div class="capability-grid">
        ${operatingCapabilities.map(renderCapabilityCard).join("")}
      </div>
      <p class="capability-boundary"><strong>Automation boundary</strong> A design release starts the import lane; production App builds consume committed, versioned packages and never read a live Penpot workspace.</p>
    </section>

    <section class="designer-section lab-section" id="lab" aria-labelledby="lab-title">
      <div class="designer-section__heading designer-section__heading--split">
        <div>
          <p class="designer-eyebrow">Component lab</p>
          <h2 id="lab-title">One contract.<br />Every meaningful state.</h2>
        </div>
        <p>Switch the component state. The preview, semantics, review label, and evidence note move together.</p>
      </div>
      <div class="component-lab" data-preview-state="default" data-preview-theme="light" data-preview-viewport="desktop">
        <div class="component-lab__toolbar">
          <div class="component-lab__identity">
            <span>DesignButton / Primary</span>
            <small data-preview-context>desktop · light · text scale 1.0</small>
          </div>
          <div class="component-lab__modes">
            <div class="mode-control" aria-label="Preview theme">
              <span>Theme</span>
              <div>${previewThemes.map((mode, index) => renderModeButton(mode, index, "theme")).join("")}</div>
            </div>
            <div class="mode-control" aria-label="Preview viewport">
              <span>Viewport</span>
              <div>${previewViewports.map((mode, index) => renderModeButton(mode, index, "viewport")).join("")}</div>
            </div>
          </div>
          <div class="state-controls" aria-label="Preview component states">
            ${componentStates.map(renderStateButton).join("")}
          </div>
        </div>
        <div class="component-lab__body">
          <div class="component-preview">
            <div class="component-preview__canvas">
              <span class="preview-badge"><i></i><b data-preview-badge>${escapeHtml(componentStates[0].badge)}</b></span>
              <label>
                <span>Review name</span>
                <span class="preview-field">Foundations release 0.1.0</span>
              </label>
              <button class="preview-button" type="button" data-preview-button>${escapeHtml(componentStates[0].button)}</button>
              <div class="preview-empty">
                <span aria-hidden="true"><i></i><i></i><i></i></span>
                <strong>Evidence stays attached</strong>
                <small>Contract, commit, Golden SHA, and Foundations BOM</small>
              </div>
            </div>
          </div>
          <aside class="component-inspector" aria-live="polite">
            <div><span>Component</span><strong>DesignButton</strong></div>
            <div><span>State</span><strong data-preview-label>${escapeHtml(componentStates[0].label)}</strong></div>
            <div><span>Surface</span><strong data-preview-surface>Light · Desktop</strong></div>
            <div><span>Semantics</span><strong data-preview-semantics>enabled · button</strong></div>
            <div class="component-inspector__note"><span>Why it matters</span><p data-preview-note>${escapeHtml(componentStates[0].note)}</p></div>
          </aside>
        </div>
      </div>
    </section>

    <section class="designer-section evidence-section" id="evidence" aria-labelledby="evidence-title">
      <div class="designer-section__heading">
        <p class="designer-eyebrow">Review evidence</p>
        <h2 id="evidence-title">A green build is not the whole answer.</h2>
        <p>Each review surface answers a different question, and none substitutes for the others.</p>
      </div>
      <div class="review-artifacts__header">
        <div><span>Production review artifacts</span><strong>Real Flutter output, fixed renderer</strong></div>
        <p>Generated from committed Flutter Golden baselines · Linux · Flutter 3.24.5</p>
      </div>
      <div class="review-artifacts">
        ${reviewArtifacts.map(renderEvidenceArtifact).join("")}
      </div>
      <div class="evidence-diff" aria-label="Golden Review comparison example">
        <article>
          <div class="evidence-diff__head"><span>Expected</span><small>approved baseline</small></div>
          <div class="evidence-diff__canvas"><span class="diff-badge"></span><i></i><b></b><em></em></div>
          <p>Linux · light · desktop</p>
        </article>
        <article>
          <div class="evidence-diff__head"><span>Actual</span><small>current candidate</small></div>
          <div class="evidence-diff__canvas evidence-diff__canvas--actual"><span class="diff-badge"></span><i></i><b></b><em></em></div>
          <p>2 visual regions changed</p>
        </article>
        <article class="evidence-diff__result">
          <div class="evidence-diff__head"><span>Diff</span><small>review required</small></div>
          <div class="evidence-diff__canvas evidence-diff__canvas--diff"><span class="diff-badge"></span><i></i><b></b><em></em><mark>2</mark></div>
          <p><span></span> spacing + button tone</p>
        </article>
      </div>
      <div class="evidence-grid">
        <article>
          <span class="evidence-grid__number">01</span>
          <p class="evidence-grid__label">Contract</p>
          <h3>Did we build the promised API and behavior?</h3>
          <ul><li>Variants and states</li><li>Slots and semantics</li><li>Stable dependency identities</li></ul>
        </article>
        <article>
          <span class="evidence-grid__number">02</span>
          <p class="evidence-grid__label">Automated</p>
          <h3>Does it behave across the supported matrix?</h3>
          <ul><li>Unit and widget tests</li><li>Static analysis and drift checks</li><li>Deterministic Golden comparison</li></ul>
        </article>
        <article>
          <span class="evidence-grid__number">03</span>
          <p class="evidence-grid__label">Human review</p>
          <h3>Is this change visually and product-wise correct?</h3>
          <ul><li>Widgetbook interaction</li><li>Expected / Actual / Diff</li><li>Explicit baseline approval</li></ul>
        </article>
      </div>
      <div class="evidence-manifest">
        <div>
          <span>visual-review.manifest</span>
          <strong>Traceable by construction</strong>
        </div>
        <code><span>component</span> design_button / primary<br /><span>source</span> snapshot + component contract<br /><span>runtime</span> Flutter + renderer identity<br /><span>result</span> expected · actual · diff · approval</code>
        <span class="evidence-manifest__seal">review<br />ready</span>
      </div>
    </section>

    <section class="designer-closing" aria-labelledby="closing-title">
      <p class="designer-eyebrow">The practical outcome</p>
      <h2 id="closing-title">Design moves faster when the handoff becomes a system—not a screenshot.</h2>
      <p>AI Designer keeps design intent deliberate, implementation typed, and every visual change explainable.</p>
      <a class="designer-button designer-button--primary" href="/">Explore the other projects <span aria-hidden="true">↗</span></a>
    </section>
  `],
  footer: `
  <footer class="designer-footer">
    <span>AI Designer · A ReverseScale project</span>
    <a href="/">Tim’s work</a>
  </footer>`,
});

function mountPipeline(root) {
  const stageButtons = [...root.querySelectorAll("[data-pipeline-stage]")];
  const status = root.querySelector(".workflow-inspector__status");
  const label = root.querySelector(".workflow-inspector__label");
  const title = root.querySelector(".workflow-inspector h3");
  const detail = root.querySelector(".workflow-inspector__detail");
  const input = root.querySelector("[data-stage-input]");
  const artifact = root.querySelector("[data-stage-artifact]");
  const gate = root.querySelector("[data-stage-gate]");

  const selectStage = (stageId) => {
    const selectedIndex = pipelineStages.findIndex((stage) => stage.id === stageId);
    const selectedStage = pipelineStages[selectedIndex];
    if (!selectedStage) return;

    stageButtons.forEach((button) => {
      const active = button.dataset.pipelineStage === stageId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    status.textContent = `Stage ${selectedStage.index} / ${pipelineStages.length.toString().padStart(2, "0")}`;
    label.textContent = selectedStage.label;
    title.textContent = selectedStage.title;
    detail.textContent = selectedStage.detail;
    input.textContent = selectedStage.input;
    artifact.textContent = selectedStage.artifact;
    gate.textContent = selectedStage.gate;
  };

  const cleanups = stageButtons.map((button) => {
    const listener = () => selectStage(button.dataset.pipelineStage);
    button.addEventListener("click", listener);
    return () => button.removeEventListener("click", listener);
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

function mountComponentLab(root) {
  const preview = createComponentPreview(componentStates);
  const lab = root.querySelector(".component-lab");
  const stateButtons = [...root.querySelectorAll("[data-state-control]")];
  const themeButtons = [...root.querySelectorAll("[data-theme-control]")];
  const viewportButtons = [...root.querySelectorAll("[data-viewport-control]")];
  const badge = root.querySelector("[data-preview-badge]");
  const previewButton = root.querySelector("[data-preview-button]");
  const stateLabel = root.querySelector("[data-preview-label]");
  const semantics = root.querySelector("[data-preview-semantics]");
  const note = root.querySelector("[data-preview-note]");
  const context = root.querySelector("[data-preview-context]");
  const surface = root.querySelector("[data-preview-surface]");

  const renderState = (state) => {
    lab.dataset.previewState = state.id;
    badge.textContent = state.badge;
    previewButton.textContent = state.button;
    previewButton.disabled = state.id === "disabled" || state.id === "loading";
    previewButton.setAttribute("aria-busy", String(state.id === "loading"));
    stateLabel.textContent = state.label;
    semantics.textContent = state.id === "disabled" ? "disabled · button" : "enabled · button";
    note.textContent = state.note;
    stateButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.stateControl === state.id));
    });
  };

  const renderMode = (controlName, modeId, buttons) => {
    if (controlName === "theme") {
      lab.dataset.previewTheme = modeId;
    } else {
      lab.dataset.previewViewport = modeId;
    }
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset[`${controlName}Control`] === modeId));
    });
    const themeLabel = lab.dataset.previewTheme === "dark" ? "Dark" : "Light";
    const viewportLabel = lab.dataset.previewViewport === "compact" ? "Compact" : "Desktop";
    context.textContent = `${viewportLabel.toLowerCase()} · ${themeLabel.toLowerCase()} · text scale 1.0`;
    surface.textContent = `${themeLabel} · ${viewportLabel}`;
  };

  const cleanups = stateButtons.map((button) => {
    const listener = () => renderState(preview.select(button.dataset.stateControl));
    button.addEventListener("click", listener);
    return () => button.removeEventListener("click", listener);
  });

  themeButtons.forEach((button) => {
    const listener = () => renderMode("theme", button.dataset.themeControl, themeButtons);
    button.addEventListener("click", listener);
    cleanups.push(() => button.removeEventListener("click", listener));
  });

  viewportButtons.forEach((button) => {
    const listener = () => renderMode("viewport", button.dataset.viewportControl, viewportButtons);
    button.addEventListener("click", listener);
    cleanups.push(() => button.removeEventListener("click", listener));
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

class AIDesignerStory extends HTMLElement {
  connectedCallback() {
    this.innerHTML = pageTemplate();
    this.cleanups = [mountPipeline(this), mountComponentLab(this)];
  }

  disconnectedCallback() {
    this.cleanups?.forEach((cleanup) => cleanup());
    this.cleanups = [];
  }
}

if (!customElements.get("ai-designer-story")) {
  customElements.define("ai-designer-story", AIDesignerStory);
}
