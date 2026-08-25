export const flowStages = Object.freeze([
  {
    id: "change",
    icon: "branch",
    index: "01",
    shortLabel: "Change",
    title: "A change creates a quality question",
    detail: "Source, configuration, or firmware changes enter with release context instead of becoming an anonymous test request.",
    signal: "Change scope",
  },
  {
    id: "pipeline",
    icon: "pipeline",
    index: "02",
    shortLabel: "CI/CD",
    title: "CI/CD establishes the execution context",
    detail: "The pipeline provides the build, target environment, and review boundary that every later result must remain connected to.",
    signal: "Build context",
  },
  {
    id: "plan",
    icon: "route",
    index: "03",
    shortLabel: "AI plan",
    title: "AI turns intent into a reviewable plan",
    detail: "A LangGraph-based workflow plans from current application state, uses registered capabilities, and can revise the route after observation.",
    signal: "Risk-shaped coverage",
  },
  {
    id: "lease",
    icon: "key",
    index: "04",
    shortLabel: "Lease",
    title: "The scheduler leases only the hardware required",
    detail: "Capability-aware matching selects App or IoT devices, establishes explicit ownership, and prevents concurrent jobs from sharing the same resource.",
    signal: "Right-sized fleet use",
  },
  {
    id: "execute",
    icon: "execute",
    index: "05",
    shortLabel: "Execute",
    title: "Actions run on real devices",
    detail: "Host agents translate the plan into automation commands while keeping device sessions, adapters, and cleanup close to the hardware.",
    signal: "Real-device behavior",
  },
  {
    id: "evidence",
    icon: "evidence",
    index: "06",
    shortLabel: "Evidence",
    title: "Every step returns structured evidence",
    detail: "Actions, logs, screenshots, UI state, and recordings are correlated so failure review starts with an explainable timeline.",
    signal: "Traceable quality",
  },
  {
    id: "gate",
    icon: "shield-check",
    index: "07",
    shortLabel: "Gate",
    title: "Evidence informs the release decision",
    detail: "Deterministic regression and human-owned policy decide the outcome; the result feeds the next delivery cycle without giving AI silent authority.",
    signal: "Release feedback",
  },
]);

export function nextFlowStage(currentStageId) {
  const currentIndex = flowStages.findIndex((stage) => stage.id === currentStageId);
  const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % flowStages.length;
  return flowStages[nextIndex];
}

export function getFlowStage(stageId) {
  return flowStages.find((stage) => stage.id === stageId) ?? flowStages[0];
}

export function isTerminalFlowStage(stageId) {
  return stageId === flowStages[flowStages.length - 1].id;
}

export const aiWorkflowNodes = Object.freeze([
  {
    id: "understand",
    label: "Understand",
    title: "Read intent and current state",
    body: "The graph starts with the test goal, available capabilities, and the application state that is actually visible on the device.",
    output: "Context",
    transitions: ["plan"],
  },
  {
    id: "plan",
    label: "Plan",
    title: "Build a constrained route",
    body: "The planner selects registered actions and produces reviewable steps rather than inventing device commands or hidden locators.",
    output: "Scenario",
    transitions: ["execute"],
  },
  {
    id: "execute",
    label: "Execute",
    title: "Act through the device layer",
    body: "Commands cross the same controlled execution boundary used by deterministic tests, keeping AI away from direct hardware ownership.",
    output: "Actions",
    transitions: ["observe"],
  },
  {
    id: "observe",
    label: "Observe",
    title: "Ground the next decision",
    body: "UI state, screenshots, logs, and action outcomes return to the graph as evidence instead of being reduced to a single pass or fail flag.",
    output: "Evidence",
    transitions: ["decide"],
  },
  {
    id: "decide",
    label: "Decide",
    title: "Branch from observed evidence",
    body: "The workflow explicitly chooses to complete, revise the plan, or stop safely. The branch is visible and reviewable.",
    output: "Conditional edge",
    transitions: ["complete", "replan", "stopped"],
  },
  {
    id: "complete",
    label: "Complete",
    title: "Return a reviewable scenario",
    body: "A completed exploration returns steps and evidence for human review. It does not silently become a release gate.",
    output: "Candidate scenario",
    transitions: [],
  },
  {
    id: "replan",
    label: "Replan",
    title: "Revise from real device evidence",
    body: "When observation invalidates the current route, the graph updates its plan and returns to controlled execution.",
    output: "Revised route",
    transitions: ["execute"],
  },
  {
    id: "stopped",
    label: "Stop safely",
    title: "Preserve the failure boundary",
    body: "Unsupported or unsafe states stop with evidence instead of being hidden behind an invented action or a false pass.",
    output: "Bounded failure",
    transitions: [],
  },
]);

export function getAiTransitions(nodeId) {
  return aiWorkflowNodes.find((node) => node.id === nodeId)?.transitions ?? [];
}

export const deviceLifecycle = Object.freeze([
  { id: "ready", label: "Ready", actor: "Scheduler", action: "Discover capacity", detail: "The pool publishes available device capabilities.", leaseOwner: "No active owner", leaseStatus: "Capacity open", leaseLabel: "Available", capacityReturned: true },
  { id: "matched", label: "Matched", actor: "Capability matcher", action: "Resolve a physical topology", detail: "The request selects one mobile rack and one IoT bench.", leaseOwner: "Candidate topology", leaseStatus: "Awaiting lease", leaseLabel: "Matched", capacityReturned: false },
  { id: "leased", label: "Leased", actor: "Lease authority", action: "Fence selected hardware", detail: "One quality job receives exclusive ownership.", leaseOwner: "Sample quality job", leaseStatus: "Fenced · observable", leaseLabel: "Exclusive lease", capacityReturned: false },
  { id: "running", label: "Running", actor: "Host agents", action: "Execute near the devices", detail: "Mobile and IoT hosts run actions and stream evidence.", leaseOwner: "Sample quality job", leaseStatus: "Live session", leaseLabel: "Exclusive lease", capacityReturned: false },
  { id: "released", label: "Released", actor: "Cleanup", action: "Return capacity to the pool", detail: "Sessions close, ownership clears, and devices become ready.", leaseOwner: "No active owner", leaseStatus: "Ownership cleared", leaseLabel: "Returned", capacityReturned: true },
]);

export function nextDeviceLifecycleState(currentStateId) {
  const currentIndex = deviceLifecycle.findIndex((state) => state.id === currentStateId);
  const nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, deviceLifecycle.length - 1);
  return deviceLifecycle[nextIndex];
}
