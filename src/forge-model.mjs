export const agentStages = Object.freeze([
  Object.freeze({
    id: "curriculum",
    index: "01",
    name: "Curriculum",
    verb: "Choose",
    summary: "Decides what is worth practicing now.",
    input: "Ability history · SRS due topics · active project context",
    decision: "Select the highest-value weakness and set the right difficulty.",
    tool: "ability_query · history_query · narrative_search",
    output: "A focused learning directive for one concrete technical edge.",
    signal: "Priority resolved",
  }),
  Object.freeze({
    id: "generator",
    index: "02",
    name: "Generator",
    verb: "Frame",
    summary: "Turns the learning edge into a useful challenge.",
    input: "Learning directive · project snippets · existing question bank",
    decision: "Create a grounded question with an observable depth rubric.",
    tool: "bank_search · project_rag · self_critique",
    output: "A distinct question whose quality can be evaluated.",
    signal: "Challenge ready",
  }),
  Object.freeze({
    id: "interrogator",
    index: "03",
    name: "Interrogator",
    verb: "Probe",
    summary: "Pushes beyond the first plausible answer.",
    input: "Question · rubric · every answer in the current session",
    decision: "Ask for boundaries, failure semantics, and real tradeoffs.",
    tool: "rubric_evaluator · clarification prompts",
    output: "Evidence of what the developer understands—and where it breaks.",
    signal: "Reasoning exposed",
  }),
  Object.freeze({
    id: "curator",
    index: "04",
    name: "Curator",
    verb: "Remember",
    summary: "Converts one conversation into durable learning memory.",
    input: "Dialogue · evaluation · user feedback · previous ability state",
    decision: "Keep the useful question and update only the learning that changed.",
    tool: "bank_insert · narrative_writer · srs_schedule",
    output: "A refreshed ability snapshot, weakness narrative, and next review window.",
    signal: "Memory updated",
  }),
]);

export function createAgentStageCursor(stages = agentStages) {
  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error("Agent stages must be a non-empty array.");
  }

  let currentIndex = 0;

  return Object.freeze({
    current: () => stages[currentIndex],
    select: (stageId) => {
      const selectedIndex = stages.findIndex((stage) => stage.id === stageId);
      if (selectedIndex < 0) {
        throw new Error(`Unknown agent stage: ${stageId}`);
      }
      currentIndex = selectedIndex;
      return stages[currentIndex];
    },
    next: () => {
      currentIndex = (currentIndex + 1) % stages.length;
      return stages[currentIndex];
    },
    previous: () => {
      currentIndex = (currentIndex - 1 + stages.length) % stages.length;
      return stages[currentIndex];
    },
  });
}
