const freezeCollection = (items) => Object.freeze(items.map((item) => Object.freeze({ ...item })));

export const showcaseScenario = Object.freeze({
  id: "camera-confidence-run",
  title: "Camera onboarding confidence run",
  goal: "Pair a camera, verify live view, and trace an alert back to evidence.",
  terminal: "completed",
  qualityDecision: "review-ready",
});

export const explorationStates = freezeCollection([
  { id: "state-home", index: "01", label: "Home", status: "Known", action: "Scan visible entry points", evidence: "Screenshot + UI hierarchy", nextId: "state-add" },
  { id: "state-add", index: "02", label: "Add device", status: "Covered", action: "Tap Add device", evidence: "Semantic control match", nextId: "state-choice" },
  { id: "state-choice", index: "03", label: "Device choice", status: "New", action: "Choose camera", evidence: "Visual state change", nextId: "state-pairing" },
  { id: "state-pairing", index: "04", label: "Pairing", status: "Candidate", action: "Submit local network", evidence: "UI + device log", nextId: "state-live" },
  { id: "state-live", index: "05", label: "Live view", status: "Covered", action: "Open live view", evidence: "First frame + stream state", nextId: "state-alert" },
  { id: "state-alert", index: "06", label: "Alert detail", status: "Candidate", action: "Open alert", evidence: "Notification + target screen", nextId: null },
]);

export const storyCapabilities = freezeCollection([
  { id: "mobile", label: "Mobile runtime" },
  { id: "camera", label: "Camera control" },
  { id: "local-network", label: "Local network" },
  { id: "recording", label: "Synchronized evidence" },
]);

export const planTasks = freezeCollection([
  { id: "task-explore", index: "01", label: "Explore", status: "Queued", owner: "AI planner", capabilityIds: Object.freeze(["mobile"]), completion: "Candidate path found" },
  { id: "task-pair", index: "02", label: "Pair", status: "Matched", owner: "Mobile + IoT hosts", capabilityIds: Object.freeze(["mobile", "camera", "local-network"]), completion: "Device reports online" },
  { id: "task-stream", index: "03", label: "Stream", status: "Leased", owner: "Session runner", capabilityIds: Object.freeze(["mobile", "camera", "recording"]), completion: "First frame verified" },
  { id: "task-alert", index: "04", label: "Alert", status: "Running", owner: "Event adapter", capabilityIds: Object.freeze(["mobile", "camera", "recording"]), completion: "Alert opens target state" },
  { id: "task-evidence", index: "05", label: "Evidence", status: "Evidence ready", owner: "Quality reporter", capabilityIds: Object.freeze(["recording"]), completion: "Decision context complete" },
]);

const interactionBeats = Object.freeze(["App command", "Host adapter", "Device state", "Evidence"]);

export const interactionMoments = freezeCollection([
  { id: "pair", index: "01", label: "Pair", support: "Supported", appAction: "Submit local network", deviceAction: "Pairing → Online", evidence: "UI state · device log · network result", outcome: "Camera available to the account", beats: interactionBeats },
  { id: "live", index: "02", label: "Live", support: "Supported", appAction: "Open live view", deviceAction: "Idle → Streaming", evidence: "First frame · stream state · player UI", outcome: "Live path is observable", beats: interactionBeats },
  { id: "alert", index: "03", label: "Alert", support: "Assisted", appAction: "Open received alert", deviceAction: "Event emitted → Alert available", evidence: "Event time · notification · target screen", outcome: "Alert path returns correlated evidence", beats: interactionBeats },
]);

export const replayMarkers = freezeCollection([
  { id: "marker-step", timeSeconds: 0, kind: "Step", label: "Scenario begins", source: "Regression contract", result: "Running" },
  { id: "marker-action", timeSeconds: 12, kind: "Action", label: "Pairing submitted", source: "Mobile automation", result: "Accepted" },
  { id: "marker-event", timeSeconds: 24, kind: "IoT Event", label: "Camera online", source: "Device adapter", result: "Observed" },
  { id: "marker-log", timeSeconds: 36, kind: "Log", label: "Live stream ready", source: "Host evidence", result: "Correlated" },
  { id: "marker-decision", timeSeconds: 49, kind: "Decision", label: "Review package ready", source: "Quality reporter", result: "Review-ready" },
]);

export function getStoryItem(items, itemId) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }
  return items.find((item) => item.id === itemId) ?? items[0];
}

export function createStoryCursor(items, initialId = items?.[0]?.id) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError("createStoryCursor requires at least one story item");
  }

  const initialItem = getStoryItem(items, initialId);
  let currentId = initialItem.id;

  return {
    get currentId() {
      return currentId;
    },
    get current() {
      return getStoryItem(items, currentId);
    },
    select(itemId) {
      currentId = getStoryItem(items, itemId).id;
      return this.current;
    },
    next() {
      const currentIndex = items.findIndex((item) => item.id === currentId);
      currentId = items[Math.min(currentIndex + 1, items.length - 1)].id;
      return this.current;
    },
    reset() {
      currentId = initialItem.id;
      return this.current;
    },
  };
}
