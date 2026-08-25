import { createPipelineCursor, diagnosisSignals, pipelineStages } from "./core-log-model.mjs";

class CoreLogPipeline extends HTMLElement {
  connectedCallback() {
    this.cursor = createPipelineCursor(pipelineStages);
    this.buttons = [...this.querySelectorAll("[data-pipeline-stage]")];
    this.inspector = this.querySelector("[data-pipeline-inspector]");
    this.cleanups = [];

    const select = (stageId, focus = false) => {
      const stage = this.cursor.select(stageId);
      this.render(stage);
      if (focus) this.buttons.find((button) => button.dataset.pipelineStage === stage.id)?.focus();
    };

    this.buttons.forEach((button) => {
      const click = () => select(button.dataset.pipelineStage);
      const keydown = (event) => {
        let stage;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") stage = this.cursor.next();
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") stage = this.cursor.previous();
        if (event.key === "Home") stage = this.cursor.select(pipelineStages[0].id);
        if (event.key === "End") stage = this.cursor.select(pipelineStages.at(-1).id);
        if (!stage) return;
        event.preventDefault();
        this.render(stage);
        this.buttons.find((item) => item.dataset.pipelineStage === stage.id)?.focus();
      };
      button.addEventListener("click", click);
      button.addEventListener("keydown", keydown);
      this.cleanups.push(() => button.removeEventListener("click", click));
      this.cleanups.push(() => button.removeEventListener("keydown", keydown));
    });

    this.render(this.cursor.current());
  }

  render(stage) {
    this.dataset.activeStage = stage.id;
    this.buttons.forEach((button) => {
      const active = button.dataset.pipelineStage === stage.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (!this.inspector) return;
    this.inspector.querySelector("[data-stage-index]").textContent = stage.index;
    this.inspector.querySelector("[data-stage-verb]").textContent = stage.verb;
    this.inspector.querySelector("[data-stage-name]").textContent = stage.name;
    this.inspector.querySelector("[data-stage-summary]").textContent = stage.summary;
    this.inspector.querySelector("[data-stage-input]").textContent = stage.input;
    this.inspector.querySelector("[data-stage-guarantee]").textContent = stage.guarantee;
    this.inspector.querySelector("[data-stage-failure]").textContent = stage.failure;
    this.inspector.querySelector("[data-stage-signal]").textContent = stage.signal;
    this.dispatchEvent(new CustomEvent("corelog:pipeline-stage", {
      bubbles: true,
      detail: { stageId: stage.id },
    }));
  }

  disconnectedCallback() {
    this.cleanups?.forEach((cleanup) => cleanup());
    this.cleanups = [];
  }
}

class DiagnosisTimeline extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll("[data-diagnosis-signal]")];
    this.inspector = this.querySelector("[data-diagnosis-inspector]");
    this.cleanups = [];
    this.buttons.forEach((button) => {
      const click = () => this.render(button.dataset.diagnosisSignal);
      button.addEventListener("click", click);
      this.cleanups.push(() => button.removeEventListener("click", click));
    });
    this.render(diagnosisSignals[0].id);
  }

  render(signalId) {
    const signal = diagnosisSignals.find((item) => item.id === signalId) ?? diagnosisSignals[0];
    this.buttons.forEach((button) => {
      const active = button.dataset.diagnosisSignal === signal.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (!this.inspector) return;
    this.inspector.querySelector("[data-diagnosis-time]").textContent = signal.index;
    this.inspector.querySelector("[data-diagnosis-source]").textContent = signal.source;
    this.inspector.querySelector("[data-diagnosis-event]").textContent = signal.event;
    this.inspector.querySelector("[data-diagnosis-detail]").textContent = signal.detail;
    this.inspector.querySelector("[data-diagnosis-evidence]").textContent = signal.evidence;
    this.dispatchEvent(new CustomEvent("corelog:diagnosis-signal", {
      bubbles: true,
      detail: { signalId: signal.id },
    }));
  }

  disconnectedCallback() {
    this.cleanups?.forEach((cleanup) => cleanup());
    this.cleanups = [];
  }
}

if (!customElements.get("core-log-pipeline")) customElements.define("core-log-pipeline", CoreLogPipeline);
if (!customElements.get("diagnosis-timeline")) customElements.define("diagnosis-timeline", DiagnosisTimeline);
