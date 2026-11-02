/** Invented, neutral data for tests and for /lab. Nothing here describes a real project. */
import type { Decision, DiagramData, Project, Rules, Showcase, Structure, Tools } from "./types.ts";

export const sequenceFixture: DiagramData = {
  type: "sequence",
  caption: "A sample request passing through three services.",
  nodes: [
    { id: "client", label: "Client" },
    { id: "gateway", label: "Gateway" },
    { id: "service", label: "Sample service" },
    { id: "store", label: "Data store" },
  ],
  steps: [
    {
      from: "client",
      to: "gateway",
      label: "send request",
      note: "The client sends a request with a credential.",
    },
    {
      from: "gateway",
      to: "service",
      label: "forward after check",
      note: "The gateway checks the credential and forwards the call.",
    },
    { from: "service", to: "store", label: "read record", note: "The service reads one record." },
    { from: "store", to: "service", label: "record", note: "The store returns the record." },
    {
      from: "service",
      to: "service",
      label: "validate",
      note: "The service validates the record before answering.",
    },
    { from: "service", to: "client", label: "response", note: "The answer travels back to the client." },
  ],
};

export const pipelineFixture: DiagramData = {
  type: "pipeline",
  caption: "A sample pipeline with a retry loop and a skipped stage.",
  nodes: [
    { id: "intake", label: "Intake" },
    { id: "draft", label: "Draft" },
    { id: "check", label: "Check" },
    { id: "publish", label: "Publish" },
  ],
  steps: [
    { from: "intake", to: "draft", label: "request", note: "A request enters the pipeline." },
    { from: "draft", to: "check", label: "draft ready", note: "The draft goes to the check." },
    { from: "check", to: "draft", label: "retry", note: "A failed check sends the draft back." },
    { from: "check", to: "publish", label: "approved", note: "An approved draft is published." },
    {
      from: "intake",
      to: "publish",
      label: "fast path",
      note: "Trusted requests skip the draft and the check.",
    },
    { from: "publish", to: "publish", label: "notify", note: "Publishing notifies the requester." },
  ],
};

export const decisionsFixture: Decision[] = [
  { kind: "decision", title: "Sample decision", why: "The reason it was taken, in one or two sentences." },
  { kind: "trade-off", title: "Sample trade-off", why: "What was given up, and why that was acceptable." },
  { kind: "next", title: "Sample next step", why: "What would come next and what it depends on." },
];

export const rulesFixture: Rules = {
  items: [
    {
      rule: "Sample rule that a tool enforces",
      why: "Why the rule exists, written for someone who has not seen the project.",
      heldBy: ["lint rule", "CI check"],
    },
    {
      rule: "Sample rule that only a convention holds",
      why: "A rule with no tool behind it says so in its chip.",
      heldBy: ["convention only"],
    },
  ],
  agents: "A sample paragraph on how agents are set up to work with these rules.",
};

export const structureFixture: Structure = {
  tree: [
    "sample-service/",
    "  src/",
    "    domain/        pure rules, no I/O",
    "    adapters/      database and HTTP clients",
    "    routes/        request handlers",
    "  migrations/",
    "  test/",
  ].join("\n"),
  notes: [
    { path: "src/domain/", why: "Rules live here so they can be tested without a database or a network." },
    {
      path: "src/adapters/",
      why: "Every outside system sits behind one adapter, so swapping it touches one folder.",
    },
    { path: "migrations/", why: "Schema changes are files in order, never edits to a live database." },
  ],
};

export const toolsFixture: Tools = {
  title: "Tools",
  intro: "A sample intro paragraph on what a caller can do and how the calls are grouped.",
  groups: [
    {
      title: "Read",
      note: "These calls change nothing.",
      items: [
        { name: "list_samples", does: "Returns the samples the caller may see, newest first." },
        { name: "get_sample_with_a_long_name", does: "Returns one sample with its parts and their order." },
      ],
    },
    {
      title: "Write",
      items: [
        {
          name: "save_sample",
          does: "Validates a sample and stores it; an invalid one is refused with a report.",
        },
      ],
    },
  ],
};

/** Text of a sample showcase. The screens carry no image here, because lib cannot import assets; /lab adds them. */
export const showcaseFixture: Omit<Showcase, "screens"> & { screens: { alt: string; caption: string }[] } = {
  title: "A sample result",
  intro: "A sample paragraph on what was built with the system and why it is worth a look.",
  link: { label: "Open the sample", url: "https://example.com/" },
  screens: [
    { alt: "Placeholder screen with a title and three options", caption: "A question with three options" },
    { alt: "Placeholder screen with a ring in the middle", caption: "A loading step" },
    { alt: "Placeholder screen with a picture and a button", caption: "An offer with one button" },
  ],
  points: [
    "A sample point about something to notice in the screens.",
    "A second sample point, written as one plain sentence.",
  ],
  excerpt: {
    caption: "A piece of the data behind the sample.",
    code: ["steps:", "  - type: question", "    options: 3", "  - type: loader"].join("\n"),
  },
};

function makeProject(overrides: Partial<Project> & Pick<Project, "slug" | "title">): Project {
  return {
    company: "side",
    period: "2024",
    order: 1,
    role: "Sample role",
    disciplines: ["backend"],
    aiAgents: false,
    summary: "A sample project used to try the layout.",
    glance: [{ value: "3", label: "sample facts" }],
    stack: ["TypeScript", "Postgres"],
    overview: ["First sample paragraph.", "Second sample paragraph."],
    diagram: sequenceFixture,
    decisions: [{ kind: "decision", title: "Sample decision", why: "The reason, in one or two sentences." }],
    connections: [],
    links: [],
    ...overrides,
  };
}

export const fixtureProjects: Project[] = [
  makeProject({
    slug: "auth-service",
    title: "Sample identity service",
    company: "playme",
    order: 1,
    disciplines: ["backend"],
    aiAgents: true,
    connections: [
      { to: "quiz-builder", label: "issues tokens for" },
      { to: "s3", label: "stores files in" },
    ],
  }),
  makeProject({
    slug: "quiz-builder",
    title: "Sample builder",
    company: "playme",
    order: 2,
    disciplines: ["backend", "fullstack"],
    diagram: pipelineFixture,
    connections: [
      { to: "auth-service", label: "asks for tokens from" },
      { to: "media-storage", label: "uploads through" },
    ],
  }),
  makeProject({
    slug: "dualio-app",
    title: "Sample mobile app",
    company: "sysgears",
    order: 1,
    disciplines: ["mobile"],
  }),
  makeProject({
    slug: "family-budget",
    title: "Sample side project",
    company: "side",
    order: 1,
    disciplines: ["frontend"],
  }),
];
