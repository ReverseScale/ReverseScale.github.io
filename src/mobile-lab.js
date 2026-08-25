import {
  aiWorkflowNodes,
  deviceLifecycle,
  flowStages,
  getFlowStage,
  isTerminalFlowStage,
  nextDeviceLifecycleState,
  nextFlowStage,
} from "./mobile-lab-flow.mjs";
import {
  mountMobileLabStoryViews,
  renderExplorationSection,
  renderInteractionSection,
  renderPlanSection,
  renderReplaySection,
} from "./mobile-lab-story-view.mjs";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const flowStageGlyphs = Object.freeze({
  branch: '<circle cx="6" cy="4" r="2"></circle><circle cx="6" cy="20" r="2"></circle><circle cx="18" cy="8" r="2"></circle><path d="M6 6v12M8 7.5h3a7 7 0 0 1 7 7V10"></path>',
  pipeline: '<rect x="3" y="5" width="6" height="14" rx="2"></rect><rect x="15" y="5" width="6" height="14" rx="2"></rect><path d="M9 9h6M12 7l3 2-3 2M15 15H9M12 13l-3 2 3 2"></path>',
  route: '<circle cx="5" cy="18" r="2"></circle><circle cx="19" cy="6" r="2"></circle><path d="M7 18c7 0 3-10 10-12M12 6l2-2M15 11l3 2M5 10V6h4"></path>',
  key: '<circle cx="8" cy="12" r="4"></circle><path d="M12 12h9M18 12v3M15 12v2"></path>',
  execute: '<path d="M4 5h7v14H4zM14 8l6 4-6 4zM7 9v6"></path>',
  evidence: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M5 17l4-4 3 3 3-3 4 4"></path>',
  "shield-check": '<path d="M12 3l8 3v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3zM8.5 12l2.2 2.2 4.8-5"></path>',
});

const renderFlowStage = (stage) => `
  <button class="flow-node" type="button" data-flow-stage="${stage.id}" aria-pressed="false">
    <span>${stage.index}</span>
    <svg class="flow-node__icon" viewBox="0 0 24 24" aria-hidden="true">${flowStageGlyphs[stage.icon]}</svg>
    <strong>${escapeHtml(stage.shortLabel)}</strong>
  </button>
`;

class MobileLabStory extends HTMLElement {
  connectedCallback() {
    this.activeFlowStageId = flowStages[0].id;
    this.activeAiStateId = aiWorkflowNodes[0].id;
    this.activeDeviceStateId = deviceLifecycle[0].id;
    this.flowTimer = null;
    this.deviceTimer = null;
    this.render();
    this.bindInteractions();
    this.storyViewsCleanup = mountMobileLabStoryViews(this);
    this.observeSections();
  }

  disconnectedCallback() {
    this.stopFlowPlayback();
    this.stopDeviceLifecycle();
    this.storyViewsCleanup?.();
    this.storyViewsCleanup = null;
    this.sectionObserver?.disconnect();
  }

  render() {
    this.innerHTML = `
      <main class="lab-shell">
        <header class="lab-nav">
          <a class="lab-brand" href="/" aria-label="T MobileLab — Back to Tim’s work">
            <span aria-hidden="true">T</span>
            <strong>MobileLab</strong>
          </a>
          <nav aria-label="Project navigation">
            <a href="#explore">Explore</a>
            <a href="#plan">Plan</a>
            <a href="#run">Run</a>
            <a href="#replay">Replay</a>
            <a class="lab-nav__back" href="/">All work <span aria-hidden="true">↗</span></a>
          </nav>
        </header>

        <section class="lab-hero" aria-labelledby="lab-title">
          <div class="lab-hero__copy">
            <p class="lab-kicker"><span>AI-assisted quality infrastructure</span><i></i><span>App + IoT</span></p>
            <h1 id="lab-title">Quality, at<br />device-farm <em>efficiency.</em></h1>
            <p class="lab-hero__lede">
              MobileLab connects CI/CD, a LangGraph-based automation engine, and a shared farm of App and IoT devices. Every change gets the right test depth, the right hardware, and evidence a release decision can explain.
            </p>
            <div class="lab-hero__actions">
              <a class="lab-button lab-button--primary" href="#system">Explore the system <span aria-hidden="true">↓</span></a>
              <a class="lab-button" href="#principles">Read the decisions</a>
            </div>
          </div>

          <div class="hero-showcase" aria-label="App and IoT devices connected to the quality system">
            <span class="hero-showcase__orbit hero-showcase__orbit--outer" aria-hidden="true"></span>
            <span class="hero-showcase__orbit hero-showcase__orbit--inner" aria-hidden="true"></span>
            <img
              class="hero-showcase__asset"
              src="../assets/mobile-lab/device-cluster.webp"
              alt="A contemporary device-farm cluster with phones, tablet, camera, sensor, and edge gateway"
              fetchpriority="high"
            />
            <div class="hero-showcase__label hero-showcase__label--app"><span>App devices</span><strong>Screen · touch · platform</strong></div>
            <div class="hero-showcase__label hero-showcase__label--iot"><span>IoT devices</span><strong>Video · sensor · edge</strong></div>
            <div class="hero-showcase__flow" aria-hidden="true">
              <span><i>01</i><b>CI/CD</b></span><em></em>
              <span><i>02</i><b>AI plan</b></span><em></em>
              <span><i>03</i><b>Lease</b></span><em></em>
              <span><i>04</i><b>Evidence</b></span>
            </div>
            <div class="hero-showcase__status"><i></i><span>Quality loop</span><strong>Connected to hardware</strong></div>
          </div>
        </section>

        <section class="lab-section value-section reveal" aria-labelledby="value-title">
          <div class="lab-section__heading">
            <p class="lab-eyebrow">The operating idea</p>
            <h2 id="value-title">Quality and efficiency are one system.</h2>
            <p>More automation is not automatically better. The platform spends real-device time where it adds confidence, then returns enough context to make failures actionable.</p>
          </div>
          <div class="value-grid">
            <article class="value-card value-card--quality">
              <span class="value-card__index">Q</span>
              <p class="lab-eyebrow">Quality feedback loop</p>
              <h3>Test depth follows change risk.</h3>
              <p>Reviewable scenarios, real-device outcomes, and correlated evidence keep every release signal attached to what actually ran.</p>
              <ul><li>Risk-shaped coverage</li><li>Deterministic regression</li><li>Explainable failure evidence</li></ul>
            </article>
            <article class="value-card value-card--efficiency">
              <span class="value-card__index">E</span>
              <p class="lab-eyebrow">Efficiency loop</p>
              <h3>Hardware time follows test intent.</h3>
              <p>Capability matching and explicit leases reduce idle reservation, prevent collisions, and release devices when a job reaches its terminal state.</p>
              <ul><li>Capability-aware matching</li><li>Exclusive resource leases</li><li>Failure-safe cleanup</li></ul>
            </article>
          </div>
        </section>

        <section class="lab-section flow-section reveal" id="system" aria-labelledby="flow-title">
          <div class="lab-section__heading lab-section__heading--row">
            <div>
              <p class="lab-eyebrow">End-to-end system</p>
              <h2 id="flow-title">One flow, from change to confidence.</h2>
            </div>
            <button class="flow-play" type="button" aria-label="Play the delivery and test flow">
              <i aria-hidden="true"></i><span>Play flow</span>
            </button>
          </div>
          <div class="flow-workbench">
            <div class="flow-track" role="group" aria-label="Delivery and test stages">
              ${flowStages.map(renderFlowStage).join("")}
            </div>
            <article class="flow-detail" aria-live="polite">
              <div>
                <p class="flow-detail__signal"></p>
                <h3 class="flow-detail__title"></h3>
                <p class="flow-detail__body"></p>
              </div>
              <span class="flow-detail__number" aria-hidden="true"></span>
            </article>
          </div>
        </section>

        ${renderExplorationSection()}

        <section class="lab-section ai-section reveal" id="ai" aria-labelledby="ai-title">
          <div class="lab-section__heading">
            <p class="lab-eyebrow">LangGraph-based AI automation</p>
            <h2 id="ai-title">A state machine, not a magic prompt.</h2>
            <p>The AI loop is visible and bounded. It plans through registered capabilities, observes real device state, and makes each transition inspectable.</p>
          </div>
          <div class="ai-workbench">
            <div class="state-graph" role="group" aria-label="LangGraph scenario state graph">
              <div class="state-graph__legend"><span><i></i> State node</span><span><i></i> Conditional edge</span><span>Shared state moves through every transition</span></div>
              <div class="state-graph__canvas">
                <svg class="state-graph__edges" viewBox="0 0 1000 570" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <marker id="graph-arrow-violet" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0l8 4-8 4z"></path></marker>
                    <marker id="graph-arrow-cyan" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0l8 4-8 4z"></path></marker>
                    <marker id="graph-arrow-danger" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0l8 4-8 4z"></path></marker>
                  </defs>
                  <path class="state-graph__edge state-graph__edge--understand-plan" d="M180 273 H210" marker-end="url(#graph-arrow-violet)"></path>
                  <path class="state-graph__edge state-graph__edge--plan-execute" d="M370 273 H400" marker-end="url(#graph-arrow-violet)"></path>
                  <path class="state-graph__edge state-graph__edge--execute-observe" d="M560 273 H590" marker-end="url(#graph-arrow-violet)"></path>
                  <path class="state-graph__edge state-graph__edge--observe-decide" d="M750 273 H780" marker-end="url(#graph-arrow-violet)"></path>
                  <path class="state-graph__edge state-graph__edge--decide-complete" d="M860 222 V148" marker-end="url(#graph-arrow-cyan)"></path>
                  <path class="state-graph__edge state-graph__edge--decide-stopped" d="M860 324 V410" marker-end="url(#graph-arrow-danger)"></path>
                  <path class="state-graph__edge state-graph__edge--decide-replan" d="M800 324 V365 H590 V461 H560" marker-end="url(#graph-arrow-cyan)"></path>
                  <path class="state-graph__edge state-graph__edge--replan-execute" d="M480 410 V324" marker-end="url(#graph-arrow-cyan)"></path>
                  <g class="state-graph__edge-label" transform="translate(873 177)"><rect width="68" height="24" rx="3"></rect><text x="34" y="15">GOAL MET</text></g>
                  <g class="state-graph__edge-label" transform="translate(873 355)"><rect width="58" height="24" rx="3"></rect><text x="29" y="15">UNSAFE</text></g>
                  <g class="state-graph__edge-label" transform="translate(620 343)"><rect width="54" height="24" rx="3"></rect><text x="27" y="15">REVISE</text></g>
                </svg>
                ${aiWorkflowNodes.map((state, index) => `
                  <button class="ai-node ai-node--${state.id}" type="button" data-ai-state="${state.id}" aria-pressed="false">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <strong>${escapeHtml(state.label)}</strong>
                    <small>${escapeHtml(state.output)}</small>
                  </button>
                `).join("")}
              </div>
            </div>
            <article class="ai-detail" aria-live="polite">
              <p class="lab-eyebrow">Selected state</p>
              <h3></h3>
              <p></p>
              <div><span>Human boundary</span><strong>Reviewed scenarios remain the regression contract.</strong></div>
            </article>
          </div>
        </section>

        ${renderPlanSection()}

        <section class="lab-section fleet-section reveal" id="fleet" aria-labelledby="fleet-title">
          <div class="lab-section__heading lab-section__heading--row">
            <div>
              <p class="lab-eyebrow">App + IoT device farm</p>
              <h2 id="fleet-title">Shared hardware with explicit ownership.</h2>
            </div>
            <p>Devices are matched by capability, leased to one job, observed through the run, and returned through a deliberate cleanup path.</p>
          </div>
          <div class="farm-topology" data-farm-state="ready">
            <aside class="farm-request">
              <p class="lab-eyebrow">Capability request</p>
              <h3>Test intent becomes resource constraints.</h3>
              <dl>
                <div><dt>Target</dt><dd>App + camera</dd></div>
                <div><dt>Platform</dt><dd>Mobile</dd></div>
                <div><dt>Network</dt><dd>Local pairing</dd></div>
                <div><dt>Evidence</dt><dd>UI + video</dd></div>
              </dl>
            </aside>

            <div class="farm-route farm-route--match" aria-hidden="true"><span>Match</span><i></i></div>

            <section class="farm-pool" aria-labelledby="farm-pool-title">
              <header><span><i></i> Fleet pool</span><small>Representative hardware</small></header>
              <h3 id="farm-pool-title">One pool. Different physical capabilities.</h3>
              <div class="farm-media-grid">
                <figure class="farm-device farm-device--app">
                  <img
                    src="../assets/mobile-lab/mobile-rack.webp"
                    alt="A modern shared rack holding phones and a tablet for app testing"
                    loading="lazy"
                  />
                  <figcaption><span><i></i> Mobile rack</span><strong>Phones · tablet · app runtime</strong></figcaption>
                </figure>
                <figure class="farm-device farm-device--iot">
                  <img
                    src="../assets/mobile-lab/iot-bench.webp"
                    alt="A cohesive IoT test bench with camera, sensor, hub, and edge gateway"
                    loading="lazy"
                  />
                  <figcaption><span><i></i> IoT bench</span><strong>Camera · hub · sensor · edge</strong></figcaption>
                </figure>
              </div>
              <div class="farm-pool__lease"><span>Selected topology</span><strong>Mobile device + camera + local network</strong><em>Exclusive lease</em></div>
            </section>

            <div class="farm-route farm-route--dispatch" aria-hidden="true"><span>Dispatch</span><i></i></div>

            <aside class="farm-hosts">
              <p class="lab-eyebrow">Host agents</p>
              <h3>Execution stays close to hardware.</h3>
              <div class="host-agent"><span><i></i> Host / mobile</span><small>Automation · logs · cleanup</small></div>
              <div class="host-agent"><span><i></i> Host / IoT</span><small>Adapters · pairing · evidence</small></div>
              <div class="farm-lease-ticket"><small>Lease owner</small><strong>Sample quality job</strong><span>Fenced · observable</span></div>
            </aside>

            <div class="farm-controlbar">
              <button class="farm-play" type="button" aria-label="Run a sample device lease"><i aria-hidden="true"></i><span>Run sample lease</span></button>
              <div class="farm-lifecycle" role="group" aria-label="Device resource lifecycle">
                ${deviceLifecycle.map((state, index) => `
                  <button type="button" data-device-stage="${state.id}" aria-pressed="false"><i>${String(index + 1).padStart(2, "0")}</i><b>${escapeHtml(state.label)}</b></button>
                `).join("<em aria-hidden=\"true\"></em>")}
              </div>
              <article class="farm-state-story" aria-live="polite">
                <span></span>
                <strong></strong>
                <p></p>
              </article>
            </div>
          </div>
        </section>

        ${renderInteractionSection()}

        ${renderReplaySection()}

        <section class="lab-section principles-section" id="principles" aria-labelledby="principles-title">
          <div class="lab-section__heading">
            <p class="lab-eyebrow">Engineering decisions</p>
            <h2 id="principles-title">Automation with visible boundaries.</h2>
          </div>
          <div class="decision-grid">
            <article><span>01</span><h3>AI explores.<br />Regression decides.</h3><p>AI can assist planning and discovery without silently rewriting the release contract.</p></article>
            <article><span>02</span><h3>Lease before<br />touching hardware.</h3><p>Resource ownership is explicit, conditional, and paired with cleanup semantics.</p></article>
            <article><span>03</span><h3>Evidence before<br />diagnosis.</h3><p>Structured facts remain useful even when advanced analysis is unavailable.</p></article>
            <article><span>04</span><h3>Terminal does not<br />mean passed.</h3><p>Job completion and quality outcome stay separate so release signals remain honest.</p></article>
          </div>
        </section>

        <section class="lab-cta">
          <p class="lab-eyebrow">The project in one line</p>
          <h2>Use AI to focus the work.<br />Use real devices to prove it.</h2>
          <a class="lab-button lab-button--primary" href="/">Back to all projects <span aria-hidden="true">↗</span></a>
        </section>

        <footer class="lab-footer">
          <span>MobileLab · A ReverseScale project</span>
          <span>Concept, system design, and implementation by Tim</span>
        </footer>
      </main>
    `;
  }

  bindInteractions() {
    this.querySelectorAll("[data-flow-stage]").forEach((button) => {
      button.addEventListener("click", () => {
        this.stopFlowPlayback();
        this.setActiveFlowStage(button.dataset.flowStage);
      });
    });

    this.querySelector(".flow-play").addEventListener("click", () => {
      if (this.flowTimer) {
        this.stopFlowPlayback();
        return;
      }
      this.startFlowPlayback();
    });

    this.querySelectorAll("[data-ai-state]").forEach((button) => {
      button.addEventListener("click", () => this.setActiveAiState(button.dataset.aiState));
    });

    this.querySelectorAll("[data-device-stage]").forEach((button) => {
      button.addEventListener("click", () => {
        this.stopDeviceLifecycle();
        this.setActiveDeviceState(button.dataset.deviceStage);
      });
    });

    this.querySelector(".farm-play").addEventListener("click", () => {
      if (this.deviceTimer) {
        this.stopDeviceLifecycle();
        return;
      }
      this.startDeviceLifecycle();
    });

    this.setActiveFlowStage(this.activeFlowStageId);
    this.setActiveAiState(this.activeAiStateId);
    this.setActiveDeviceState(this.activeDeviceStateId);
  }

  setActiveFlowStage(stageId) {
    const stage = getFlowStage(stageId);
    this.activeFlowStageId = stage.id;
    this.querySelectorAll("[data-flow-stage]").forEach((button) => {
      const isActive = button.dataset.flowStage === stage.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    this.querySelector(".flow-detail__signal").textContent = stage.signal;
    this.querySelector(".flow-detail__title").textContent = stage.title;
    this.querySelector(".flow-detail__body").textContent = stage.detail;
    this.querySelector(".flow-detail__number").textContent = stage.index;
  }

  startFlowPlayback() {
    const playButton = this.querySelector(".flow-play");
    playButton.classList.add("is-playing");
    playButton.querySelector("span").textContent = "Pause flow";
    this.flowTimer = window.setInterval(() => {
      const nextStage = nextFlowStage(this.activeFlowStageId);
      this.setActiveFlowStage(nextStage.id);
      if (isTerminalFlowStage(nextStage.id)) {
        this.stopFlowPlayback();
      }
    }, 780);
  }

  stopFlowPlayback() {
    if (this.flowTimer) {
      window.clearInterval(this.flowTimer);
      this.flowTimer = null;
    }
    const playButton = this.querySelector(".flow-play");
    if (playButton) {
      playButton.classList.remove("is-playing");
      playButton.querySelector("span").textContent = "Play flow";
    }
  }

  setActiveAiState(stateId) {
    const state = aiWorkflowNodes.find((candidate) => candidate.id === stateId) ?? aiWorkflowNodes[0];
    this.activeAiStateId = state.id;
    this.querySelectorAll("[data-ai-state]").forEach((button) => {
      const isActive = button.dataset.aiState === state.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    this.querySelector(".ai-detail h3").textContent = state.title;
    this.querySelector(".ai-detail > p:not(.lab-eyebrow)").textContent = state.body;
    this.querySelector(".state-graph").dataset.activeState = state.id;
  }

  setActiveDeviceState(stateId) {
    const state = deviceLifecycle.find((candidate) => candidate.id === stateId) ?? deviceLifecycle[0];
    this.activeDeviceStateId = state.id;
    this.querySelector(".farm-topology").dataset.farmState = state.id;
    this.querySelectorAll("[data-device-stage]").forEach((button) => {
      const isActive = button.dataset.deviceStage === state.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    this.querySelector(".farm-state-story span").textContent = state.actor;
    this.querySelector(".farm-state-story strong").textContent = state.action;
    this.querySelector(".farm-state-story p").textContent = state.detail;
    this.querySelector(".farm-lease-ticket strong").textContent = state.leaseOwner;
    this.querySelector(".farm-lease-ticket span").textContent = state.leaseStatus;
    this.querySelector(".farm-pool__lease em").textContent = state.leaseLabel;
  }

  startDeviceLifecycle() {
    if (this.activeDeviceStateId === deviceLifecycle.at(-1).id) {
      this.setActiveDeviceState(deviceLifecycle[0].id);
    }
    const playButton = this.querySelector(".farm-play");
    playButton.classList.add("is-playing");
    playButton.querySelector("span").textContent = "Pause lease";
    const advanceLifecycle = () => {
      const nextState = nextDeviceLifecycleState(this.activeDeviceStateId);
      this.setActiveDeviceState(nextState.id);
      if (nextState.id === deviceLifecycle.at(-1).id) {
        this.stopDeviceLifecycle();
      }
    };
    advanceLifecycle();
    if (this.activeDeviceStateId !== deviceLifecycle.at(-1).id) {
      this.deviceTimer = window.setInterval(advanceLifecycle, 1400);
    }
  }

  stopDeviceLifecycle() {
    if (this.deviceTimer) {
      window.clearInterval(this.deviceTimer);
      this.deviceTimer = null;
    }
    const playButton = this.querySelector(".farm-play");
    if (playButton) {
      playButton.classList.remove("is-playing");
      playButton.querySelector("span").textContent = "Run sample lease";
    }
  }

  observeSections() {
    if (!("IntersectionObserver" in window)) {
      this.querySelectorAll(".reveal").forEach((section) => section.classList.add("is-visible"));
      return;
    }
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    this.querySelectorAll(".reveal").forEach((section) => this.sectionObserver.observe(section));
  }
}

customElements.define("mobile-lab-story", MobileLabStory);
