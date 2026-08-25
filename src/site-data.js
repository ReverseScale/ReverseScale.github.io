export const profile = Object.freeze({
  name: "Tim",
  mark: "T",
  role: "Independent software developer",
  focus: "Mobile engineering, delivery workflows, and developer tools, with design systems.",
  description:
    "I’m Tim, an independent software developer focused on mobile engineering, delivery workflows, and developer tools, with design systems as another practical focus.",
  story:
    "I build practical, self-hosted software around the work between design, code, and release. These projects grow from real engineering problems: translating design intent, shipping mobile changes, keeping product strings reviewable, and making build artifacts easier to understand and deliver.",
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

export const runtimeBaseURL = "https://tims.tail5d10b9.ts.net";

export const projectLinks = [
  {
    name: "Roost",
    label: "Mobile release operations",
    href: `${runtimeBaseURL}/roost/`,
    siteHref: "/roost-site/",
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
    href: `${runtimeBaseURL}/babel/`,
    siteHref: "/babel-site/",
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
    href: `${runtimeBaseURL}/bakery/`,
    siteHref: "/bakery-site/",
    status: "Build & distribution",
    tone: "amber",
    visual: "pipeline",
    summary:
      "Self-hosted mobile delivery that connects CI triggers, live pipeline visibility, versioned artifacts, and app distribution in one workspace.",
    points: ["CI integration", "Pipeline visibility", "Artifact distribution"],
  },
  {
    name: "Mobile Lab",
    label: "App & IoT quality infrastructure",
    href: "/mobile-lab/",
    siteHref: "/mobile-lab/",
    status: "Quality & efficiency",
    tone: "violet",
    visual: "device-flow",
    summary:
      "AI-assisted quality infrastructure that connects CI/CD with an App and IoT device farm, balancing stronger release evidence with efficient hardware use.",
    points: ["AI test orchestration", "App & IoT device farm", "CI/CD feedback loop"],
  },
  {
    name: "AI Config",
    label: "Personal AI environment & collaboration",
    href: "https://github.com/ReverseScale/ai-config",
    siteHref: "/ai-config/",
    status: "AI workspace",
    tone: "coral",
    visual: "agent-room",
    summary:
      "A versioned personal AI environment that layers instructions, routes replaceable coding runners, isolates execution, and requires evidence before handoff.",
    points: ["Layered configuration", "Pluggable runner routing", "Isolated evidence loops"],
  },
  {
    name: "AI Designer",
    label: "Penpot to Flutter design systems",
    href: "/ai-designer/",
    siteHref: "/ai-designer/",
    status: "Design infrastructure",
    tone: "rose",
    visual: "design-system",
    summary:
      "A snapshot-first design system workflow that turns Penpot intent into typed Flutter foundations, contract-driven components, and reviewable visual evidence.",
    points: ["Snapshot-first foundations", "Contract-driven components", "Visual review evidence"],
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
