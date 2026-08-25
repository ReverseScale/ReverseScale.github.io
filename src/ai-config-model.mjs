/**
 * AI Config binds durable workflow roles to replaceable runner adapters.
 * Keeping the two catalogs separate prevents a provider name from becoming
 * an accidental orchestration contract.
 */
export const runnerCatalog = Object.freeze([
  Object.freeze({ id: "gpt-sol", label: "GPT-5.6 Sol", mark: "GS" }),
  Object.freeze({ id: "claude-code", label: "Claude Code", mark: "CC" }),
]);

const roomRoles = Object.freeze([
  Object.freeze({ role: "planning", label: "Plan & accept", scope: "reason · review" }),
  Object.freeze({ role: "execution", label: "Implement & test", scope: "edit · tools · test" }),
]);

const defaultRunnerIds = Object.freeze({
  planning: "gpt-sol",
  execution: "claude-code",
});

export function createRoomRouting(assignments = defaultRunnerIds) {
  return roomRoles.map((roomRole) => {
    const runnerId = assignments[roomRole.role] ?? defaultRunnerIds[roomRole.role];
    const runner = runnerCatalog.find((candidate) => candidate.id === runnerId);

    if (!runner) {
      throw new Error(`Unknown AI runner: ${runnerId}`);
    }

    return {
      ...roomRole,
      runnerId: runner.id,
      runnerLabel: runner.label,
    };
  });
}
