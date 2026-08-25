export const pipelineStages = Object.freeze([
  Object.freeze({
    id: "accept",
    index: "01",
    name: "Accept",
    verb: "Capture",
    summary: "Normalize one event at the stable native boundary.",
    input: "Message · level · tag · thread · namespace",
    guarantee: "Platform-specific values become one owned event shape.",
    failure: "Invalid handles and stopped runtimes return explicit errors.",
    signal: "Event owned",
  }),
  Object.freeze({
    id: "filter",
    index: "02",
    name: "Filter",
    verb: "Bound",
    summary: "Reject work that does not belong in the active evidence policy.",
    input: "Normalized event · runtime log level",
    guarantee: "Disabled and lower-priority events never enter persistence work.",
    failure: "A full prepare queue drops the event with an observable overflow result.",
    signal: "Policy passed",
  }),
  Object.freeze({
    id: "sanitize",
    index: "03",
    name: "Sanitize",
    verb: "Protect",
    summary: "Remove sensitive material before hooks or storage can observe it.",
    input: "Event message · JSON rules · dynamic blacklist",
    guarantee: "Governed content continues through the rest of the pipeline.",
    failure: "Timeout, overload, or rule failure produces a redacted message.",
    signal: "Content governed",
  }),
  Object.freeze({
    id: "correlate",
    index: "04",
    name: "Correlate",
    verb: "Connect",
    summary: "Attach the execution context needed to reconstruct one operation.",
    input: "Trace ID · span ID · parent span · operation metadata",
    guarantee: "Related App, service, and device signals can share an incident thread.",
    failure: "Missing context keeps a valid standalone event instead of inventing a trace.",
    signal: "Context attached",
  }),
  Object.freeze({
    id: "encode",
    index: "05",
    name: "Encode",
    verb: "Shape",
    summary: "Choose structured binary evidence or an operator-readable text record.",
    input: "Governed event · output format · optional encryption material",
    guarantee: "The record carries a stable schema and can be encrypted before storage.",
    failure: "Serialization and encryption errors stay visible to the caller and runtime.",
    signal: "Record ready",
  }),
  Object.freeze({
    id: "persist",
    index: "06",
    name: "Persist",
    verb: "Commit",
    summary: "Append into bounded local storage and preserve a recovery route.",
    input: "Encoded record · active file · size and age policy",
    guarantee: "Writes, rotation, retention, flush, and recovery share one lifecycle.",
    failure: "A failed rotation attempts recovery and reports failure without silent success.",
    signal: "Evidence durable",
  }),
]);

export function createPipelineCursor(stages = pipelineStages) {
  if (!Array.isArray(stages) || stages.length === 0) {
    throw new Error("Pipeline stages must be a non-empty array.");
  }

  let currentIndex = 0;

  return Object.freeze({
    current: () => stages[currentIndex],
    select: (stageId) => {
      const selectedIndex = stages.findIndex((stage) => stage.id === stageId);
      if (selectedIndex < 0) throw new Error(`Unknown pipeline stage: ${stageId}`);
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

export const diagnosisSignals = Object.freeze([
  Object.freeze({
    id: "app",
    index: "10:42:18.214",
    source: "App logs",
    event: "pairing.submit",
    detail: "The App accepted the pairing request and attached trace 7fb2…2e1c.",
    evidence: "UI action · network request · device alias",
  }),
  Object.freeze({
    id: "service",
    index: "10:42:18.396",
    source: "Service logs",
    event: "credential.exchange",
    detail: "The service issued a short-lived credential, then observed a device timeout.",
    evidence: "Request span · policy decision · timeout boundary",
  }),
  Object.freeze({
    id: "iot",
    index: "10:42:20.012",
    source: "IoT logs",
    event: "network.join.rejected",
    detail: "The device rejected the join after receiving an outdated network profile.",
    evidence: "Firmware event · local clock · sanitized network profile",
  }),
]);
