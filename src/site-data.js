export const profile = Object.freeze({
  name: "Tim",
  mark: "T",
  role: "Independent software developer",
  focus: "Mobile engineering, delivery workflows, and developer tools.",
  description:
    "I’m Tim, an independent software developer focused on mobile engineering, delivery workflows, and developer tools.",
  story:
    "I build practical, self-hosted software around the work between code and release. These projects grow from real engineering problems: shipping mobile changes, keeping product strings reviewable, and making build artifacts easier to understand and deliver.",
  github: {
    label: "GitHub",
    href: "https://github.com/ReverseScale",
  },
  research: {
    label: "Research",
    href: "https://app.notion.com/p/timsappworkspace/Research-and-Insight-5fda3475a090427da9ac9b5c59964381?source=copy_link",
    summary: "Notes and research live in Notion.",
  },
});

export const projectLinks = [
  {
    name: "Roost",
    label: "Mobile release operations",
    href: "/roost-site/",
    status: "Flutter delivery",
    tone: "emerald",
    visual: "package",
    summary:
      "Self-hosted Flutter patch delivery with release-bound artifacts, worker queues, internal validation, and device rollout evidence.",
    points: ["Patch generation", "Release evidence", "Worker orchestration"],
  },
  {
    name: "Babel",
    label: "Localization workflow",
    href: "/babel-site/",
    status: "String operations",
    tone: "sky",
    visual: "strings",
    summary:
      "Localization as code for product teams that need traceable strings, review workflows, project structure, and AI-assisted operations.",
    points: ["Git-backed strings", "Review workflow", "AI-assisted changes"],
  },
  {
    name: "Bakery",
    label: "Mobile build and delivery",
    href: "/bakery-site/",
    status: "Build & distribution",
    tone: "amber",
    visual: "pipeline",
    summary:
      "Self-hosted mobile delivery that connects CI triggers, live pipeline visibility, versioned artifacts, and app distribution in one workspace.",
    points: ["CI integration", "Pipeline visibility", "Artifact distribution"],
  },
];

export const workingPrinciples = [
  {
    title: "Make state visible",
    body: "Delivery work should expose its inputs, progress, and outcomes instead of hiding them in scripts or chat history.",
  },
  {
    title: "Keep changes reviewable",
    body: "Strings, release context, and automation should remain close to source control and human review.",
  },
  {
    title: "Prefer practical control",
    body: "Self-hosting is useful when it keeps infrastructure understandable, operable, and close to the team using it.",
  },
];

export const researchLink = {
  label: "Research",
  href: "https://app.notion.com/p/timsappworkspace/Research-and-Insight-5fda3475a090427da9ac9b5c59964381?source=copy_link",
  summary: "Research notes and loose insights now live in Notion.",
};

export const proofPoints = [
  {
    value: "Mobile",
    label: "Release operations as the center",
    body: "Roost controls Flutter patch rollout, Babel manages localization as code, and Bakery connects mobile builds to installable artifacts.",
  },
  {
    value: "Self-hosted",
    label: "Control stays with the team",
    body: "The tools are shaped around infrastructure that can run close to the code, build systems, artifacts, reviewers, and operators.",
  },
  {
    value: "Traceable",
    label: "Decisions should leave evidence",
    body: "Release bases, build stages, artifacts, strings, reviews, and promotions should be inspectable instead of living in chat or terminal history.",
  },
];

export const operatingPrinciples = [
  {
    title: "Operator-focused workflows",
    body: "The products are designed for repeated delivery work: clear states, review gates, explicit inputs, visible pipelines, and inspectable outcomes.",
  },
  {
    title: "Source-controlled product work",
    body: "Code, strings, build context, release artifacts, and docs should stay connected to the source of truth instead of becoming disconnected admin chores.",
  },
  {
    title: "AI where it reduces toil",
    body: "Automation is useful when it narrows repetitive work and keeps humans in review, not when it hides the operational state.",
  },
];

export const currentFocus = [
  {
    title: "Mobile release operations",
    body: "Build orchestration, pipeline visibility, patch generation, artifact distribution, promotion, rollback, and release evidence.",
  },
  {
    title: "Localization workflow",
    body: "String lifecycle, branch-aware review, product copy structure, and AI-assisted localization operations.",
  },
  {
    title: "Practical self-hosting",
    body: "Public docs and project surfaces that explain how the systems run without requiring a managed SaaS backend first.",
  },
];
