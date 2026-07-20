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
