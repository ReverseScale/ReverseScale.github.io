export const projectLinks = [
  {
    name: "Roost",
    label: "Mobile release operations",
    href: "/roost-site/",
    status: "Flutter delivery",
    tone: "emerald",
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
    summary:
      "Localization as code for product teams that need traceable strings, review workflows, project structure, and AI-assisted operations.",
    points: ["Git-backed strings", "Review workflow", "AI-assisted changes"],
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
    body: "Roost focuses on app delivery and rollout control; Babel handles the string workflow that ships with product changes.",
  },
  {
    value: "Self-hosted",
    label: "Control stays with the team",
    body: "The tools are shaped around infrastructure that can run close to the code, artifacts, reviewers, and operators.",
  },
  {
    value: "Traceable",
    label: "Decisions should leave evidence",
    body: "Release bases, patch tasks, strings, reviews, and promotions should be inspectable instead of living in chat or terminal history.",
  },
];

export const operatingPrinciples = [
  {
    title: "Operator-focused workflows",
    body: "The products are designed for repeated release work: clear states, review gates, explicit inputs, and visible outcomes.",
  },
  {
    title: "Source-controlled product work",
    body: "Code, strings, release artifacts, and docs should stay connected to the source of truth instead of becoming disconnected admin chores.",
  },
  {
    title: "AI where it reduces toil",
    body: "Automation is useful when it narrows repetitive work and keeps humans in review, not when it hides the operational state.",
  },
];

export const currentFocus = [
  {
    title: "Mobile release operations",
    body: "Patch generation, internal validation, worker coordination, promotion, rollback, and evidence for Flutter releases.",
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
