import { agentStages, createAgentStageCursor } from "./forge-model.mjs";

class ForgeLearningLoop extends HTMLElement {
  connectedCallback() {
    this.cursor = createAgentStageCursor(agentStages);
    this.stageButtons = [...this.querySelectorAll("[data-agent-stage]")];
    this.playButton = this.querySelector("[data-loop-play]");
    this.inspector = this.querySelector("[data-agent-inspector]");
    this.cleanupCallbacks = [];
    this.playTimer = null;

    const activate = (stageId, focusButton = false) => {
      const stage = this.cursor.select(stageId);
      this.render(stage);
      if (focusButton) {
        this.stageButtons.find((button) => button.dataset.agentStage === stage.id)?.focus();
      }
    };

    this.stageButtons.forEach((button) => {
      const clickListener = () => {
        this.stopPlayback();
        activate(button.dataset.agentStage);
      };
      const keydownListener = (event) => {
        let nextStage;
        if (event.key === "ArrowRight") nextStage = this.cursor.next();
        if (event.key === "ArrowLeft") nextStage = this.cursor.previous();
        if (event.key === "Home") nextStage = this.cursor.select(agentStages[0].id);
        if (event.key === "End") nextStage = this.cursor.select(agentStages.at(-1).id);
        if (!nextStage) return;
        event.preventDefault();
        this.stopPlayback();
        this.render(nextStage);
        this.stageButtons.find((item) => item.dataset.agentStage === nextStage.id)?.focus();
      };

      button.addEventListener("click", clickListener);
      button.addEventListener("keydown", keydownListener);
      this.cleanupCallbacks.push(() => button.removeEventListener("click", clickListener));
      this.cleanupCallbacks.push(() => button.removeEventListener("keydown", keydownListener));
    });

    const playListener = () => this.togglePlayback();
    this.playButton?.addEventListener("click", playListener);
    this.cleanupCallbacks.push(() => this.playButton?.removeEventListener("click", playListener));

    this.render(this.cursor.current());
  }

  render(stage) {
    this.dataset.activeStage = stage.id;
    this.stageButtons.forEach((button) => {
      const active = button.dataset.agentStage === stage.id;
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
    this.inspector.querySelector("[data-stage-decision]").textContent = stage.decision;
    this.inspector.querySelector("[data-stage-tool]").textContent = stage.tool;
    this.inspector.querySelector("[data-stage-output]").textContent = stage.output;
    this.inspector.querySelector("[data-stage-signal]").textContent = stage.signal;
  }

  togglePlayback() {
    if (this.playTimer) {
      this.stopPlayback();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.render(this.cursor.next());
      return;
    }

    this.playButton.textContent = "Pause loop";
    this.playButton.setAttribute("aria-pressed", "true");
    this.playTimer = window.setInterval(() => this.render(this.cursor.next()), 1400);
  }

  stopPlayback() {
    if (this.playTimer) window.clearInterval(this.playTimer);
    this.playTimer = null;
    if (this.playButton) {
      this.playButton.textContent = "Play loop";
      this.playButton.setAttribute("aria-pressed", "false");
    }
  }

  disconnectedCallback() {
    this.stopPlayback();
    this.cleanupCallbacks?.forEach((cleanup) => cleanup());
    this.cleanupCallbacks = [];
  }
}

if (!customElements.get("forge-learning-loop")) {
  customElements.define("forge-learning-loop", ForgeLearningLoop);
}
