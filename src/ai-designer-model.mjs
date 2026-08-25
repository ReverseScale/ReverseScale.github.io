export const pipelineStages = Object.freeze([
  {
    id: "snapshot",
    index: "01",
    title: "Release design intent",
    label: "createdBy=user snapshot",
    detail: "A deliberate Penpot snapshot freezes the design input before code generation begins.",
    input: "Penpot working file",
    artifact: "Immutable user snapshot",
    gate: "User-created and valid",
  },
  {
    id: "foundations",
    index: "02",
    title: "Sync foundations",
    label: "Tokens · Icons · Assets",
    detail: "Independent pipelines validate provenance, hashes, references, and licenses before writing typed Flutter output.",
    input: "Released snapshot",
    artifact: "Typed packages + manifests",
    gate: "References and hashes verified",
  },
  {
    id: "contract",
    index: "03",
    title: "Define behavior",
    label: "Component contract",
    detail: "A machine-readable specification captures variants, states, slots, accessibility, and stable API intent.",
    input: "Foundations BOM + product intent",
    artifact: "Validated component-spec",
    gate: "Schema and identities resolve",
  },
  {
    id: "component",
    index: "04",
    title: "Build the component",
    label: "Flutter implementation",
    detail: "Production widgets compose public foundation APIs instead of copying raw values or generated layer geometry.",
    input: "Contract + fixed packages",
    artifact: "Flutter API + Widgetbook cases",
    gate: "Behavior and a11y tests pass",
  },
  {
    id: "review",
    index: "05",
    title: "Review the evidence",
    label: "Widgetbook · Golden Review",
    detail: "Interactive use cases, deterministic Golden images, and provenance make behavior and visual drift reviewable together.",
    input: "Implementation + baselines",
    artifact: "Expected / Actual / Diff report",
    gate: "Explicit approval + green CI",
  },
]);

export const foundationLanes = Object.freeze([
  {
    id: "tokens",
    title: "Tokens",
    detail: "Color, spacing, typography, radius, shadow, theme, and interaction states.",
    output: "Typed theme APIs",
  },
  {
    id: "icons",
    title: "Icons",
    detail: "Curated product symbols and stable icon identities from released libraries.",
    output: "Typed icon catalog",
  },
  {
    id: "assets",
    title: "Assets",
    detail: "Fonts, brand marks, illustrations, image variants, and auditable licenses.",
    output: "Typed asset catalog",
  },
]);

export const componentStates = Object.freeze([
  {
    id: "default",
    label: "Default",
    badge: "Ready",
    button: "Review changes",
    note: "The contract-approved default state combines typed color, typography, icon, and spacing APIs.",
  },
  {
    id: "loading",
    label: "Loading",
    badge: "Syncing",
    button: "Preparing review…",
    note: "Loading behavior is specified explicitly, so generated previews and product code share the same semantics.",
  },
  {
    id: "disabled",
    label: "Disabled",
    badge: "Unavailable",
    button: "Review unavailable",
    note: "Disabled styling and accessibility state come from the component contract rather than a one-off screen decision.",
  },
  {
    id: "approved",
    label: "Approved",
    badge: "Baseline approved",
    button: "Ready to publish",
    note: "The accepted visual baseline remains tied to the component case, commit, and Foundations BOM.",
  },
]);

export const previewThemes = Object.freeze([
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
]);

export const previewViewports = Object.freeze([
  { id: "desktop", label: "Desktop" },
  { id: "compact", label: "Compact" },
]);

export const operatingCapabilities = Object.freeze([
  {
    id: "cookbook",
    index: "01",
    eyebrow: "Cookbook / Widgetbook",
    title: "Run the real component, not a screenshot",
    detail: "Interactive use cases expose public knobs, state matrices, Light/Dark themes, text scaling, responsive viewports, accessibility checks, and the Widget Inspector.",
    signal: "Interactive + State Matrix",
    tags: ["knobs", "themes", "viewports", "a11y"],
  },
  {
    id: "release",
    index: "02",
    eyebrow: "Design release",
    title: "A deliberate snapshot becomes the import boundary",
    detail: "When design intent is ready, a createdBy=user snapshot is published. Protected sync jobs select that immutable version and fail closed on missing identity, hash, reference, or license evidence.",
    signal: "snapshot → verified manifest",
    tags: ["Penpot", "provenance", "SHA-256", "fail closed"],
  },
  {
    id: "packages",
    index: "03",
    eyebrow: "Developer import",
    title: "Released foundations arrive as typed Flutter modules",
    detail: "Tokens, icons, and assets generate independent Dart packages. The component library consumes only their public APIs, while the review app assembles a versioned four-package BOM.",
    signal: "release → sync → typed APIs",
    tags: ["ThemeExtension", "AppIcons", "DesignAssets", "BOM"],
  },
  {
    id: "review",
    index: "04",
    eyebrow: "Continuous review",
    title: "Every use case automatically enters visual coverage",
    detail: "The Widgetbook catalog is the scenario source of truth. CI discovers component use cases, captures the fixed rendering matrix, and publishes Expected, Actual, Diff, and approval evidence.",
    signal: "catalog → Golden → approval",
    tags: ["contract", "CI", "Golden", "Visual Review"],
  },
]);

export const reviewArtifacts = Object.freeze([
  {
    id: "button",
    component: "DesignButton",
    useCase: "State Matrix · Light",
    src: "../assets/ai-designer/design-button-state-matrix-light.png",
    alt: "DesignButton primary, secondary, and destructive variants across default, hover, focus, pressed, disabled, and loading states",
    crop: "button",
  },
  {
    id: "textfield",
    component: "DesignTextField",
    useCase: "State Matrix · Dark",
    src: "../assets/ai-designer/design-text-field-state-matrix-dark.png",
    alt: "DesignTextField dark theme states including default, focused, read only, disabled, success, and error",
    crop: "textfield",
  },
  {
    id: "badge",
    component: "DesignStatusBadge",
    useCase: "State Matrix · Light",
    src: "../assets/ai-designer/design-status-badge-state-matrix-light.png",
    alt: "DesignStatusBadge neutral, info, success, warning, and error semantic tones",
    crop: "badge",
  },
  {
    id: "empty",
    component: "DesignEmptyState",
    useCase: "Interactive · Light",
    src: "../assets/ai-designer/design-empty-state-interactive-light.png",
    alt: "DesignEmptyState composed with an icon, description, primary action, and secondary action",
    crop: "empty",
  },
]);

export function createComponentPreview(states = componentStates) {
  if (!Array.isArray(states) || states.length === 0) {
    throw new Error("Component preview requires at least one state.");
  }

  let currentIndex = 0;

  return Object.freeze({
    current() {
      return states[currentIndex];
    },
    next() {
      currentIndex = (currentIndex + 1) % states.length;
      return states[currentIndex];
    },
    select(stateId) {
      const selectedIndex = states.findIndex((state) => state.id === stateId);
      if (selectedIndex === -1) {
        return states[currentIndex];
      }
      currentIndex = selectedIndex;
      return states[currentIndex];
    },
  });
}
