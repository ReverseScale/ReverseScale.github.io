import { createRoomRouting, runnerCatalog } from "./ai-config-model.mjs";

const routingPresets = Object.freeze({
  default: Object.freeze({ planning: "gpt-sol", execution: "claude-code" }),
  swapped: Object.freeze({ planning: "claude-code", execution: "gpt-sol" }),
});

const runnerById = new Map(runnerCatalog.map((runner) => [runner.id, runner]));
const routingButtons = [...document.querySelectorAll("[data-route-preset]")];
const runnerSlots = [...document.querySelectorAll("[data-runner-role]")];

function renderRouting(presetName) {
  const assignments = routingPresets[presetName];

  if (!assignments) return;

  for (const route of createRoomRouting(assignments)) {
    const slot = runnerSlots.find((candidate) => candidate.dataset.runnerRole === route.role);
    const runner = runnerById.get(route.runnerId);

    if (!slot || !runner) continue;

    slot.dataset.runner = route.runnerId;
    slot.querySelector("[data-runner-mark]").textContent = runner.mark;
    slot.querySelector("[data-runner-name]").textContent = route.runnerLabel;
    slot.querySelector("[data-runner-scope]").textContent = route.scope;
  }

  for (const button of routingButtons) {
    const isActive = button.dataset.routePreset === presetName;
    button.setAttribute("aria-pressed", String(isActive));
  }
}

for (const button of routingButtons) {
  button.addEventListener("click", () => renderRouting(button.dataset.routePreset));
}

renderRouting("default");
