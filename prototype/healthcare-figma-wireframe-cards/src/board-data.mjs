export const sourceSnapshot = "assets/silvercare-console-home.png";

export const boardColumns = [
  {
    id: "foundation",
    title: "Foundation",
    subtitle: "Authenticated shell and scope boundary",
  },
  {
    id: "developer",
    title: "Developer Portal",
    subtitle: "Keys, docs, and partner onboarding",
  },
  {
    id: "playground",
    title: "Playground",
    subtitle: "Sandbox request, response, and snippets",
  },
  {
    id: "operations",
    title: "Operations",
    subtitle: "Reporting, masked logs, and human review",
  },
  {
    id: "governance",
    title: "Governance",
    subtitle: "Consent, privacy, and route inventory",
  },
];

export const screenCards = [
  {
    id: "home",
    title: "Console Home",
    column: "foundation",
    route: "/console",
    imageType: "dashboard",
    purpose: "Shows tenant, role, environment, and accessible modules.",
    primaryUser: "All authenticated partner roles",
    components: ["Sidebar", "Topbar", "Context cards", "Module grid"],
    guardrails: ["Role-aware navigation", "Tenant isolation", "No app routes outside Partner Console"],
  },
  {
    id: "api-keys",
    title: "API Key Manager",
    column: "developer",
    route: "/console/api-keys",
    imageType: "table",
    purpose: "Issues, copies once, revokes, and lists API key metadata.",
    primaryUser: "B2B Developer",
    components: ["Key table", "Issue action", "One-time reveal", "Revoke button"],
    guardrails: ["No key_hash", "Raw key only in success state", "Audit target"],
  },
  {
    id: "api-docs",
    title: "API Docs",
    column: "developer",
    route: "/console/api-docs",
    imageType: "docs",
    purpose: "Presents endpoint schema, enums, errors, and sample calls.",
    primaryUser: "B2B Developer",
    components: ["Endpoint cards", "Enum list", "Error table", "Sample snippets"],
    guardrails: ["Synthetic samples", "OpenAPI-compatible contract", "No production tenant data"],
  },
  {
    id: "playground",
    title: "Web API Playground",
    column: "playground",
    route: "/console/playground",
    imageType: "split",
    purpose: "Builds sandbox requests and previews JSON responses and code snippets.",
    primaryUser: "B2B Developer",
    components: ["Endpoint selector", "Scenario picker", "JSON editor", "Response viewer"],
    guardrails: ["Sandbox default", "Field validation", "Production disabled"],
  },
  {
    id: "poc-report",
    title: "PoC Report",
    column: "operations",
    route: "/console/report",
    imageType: "metrics",
    purpose: "Summarizes aggregate tenant metrics and export states.",
    primaryUser: "B2B PM",
    components: ["Period filter", "Metric tiles", "CSV export", "JSON export"],
    guardrails: ["Aggregate-only export", "No PII", "p95 visibility target"],
  },
  {
    id: "ops-monitoring",
    title: "Ops Monitoring",
    column: "operations",
    route: "/console/ops",
    imageType: "ops",
    purpose: "Filters masked request logs and risk/safety summaries.",
    primaryUser: "Operator",
    components: ["Status filter", "Masked log table", "Risk cards", "Review link"],
    guardrails: ["Masked evidence only", "No diagnosis wording", "Operator or reviewer only"],
  },
  {
    id: "review-queue",
    title: "Review Queue",
    column: "operations",
    route: "/console/ops/review-queue",
    imageType: "queue",
    purpose: "Collects high-risk, safety-filtered, timeout, and reported cases.",
    primaryUser: "Reviewer",
    components: ["Queue cards", "Risk badges", "Request id", "Review state"],
    guardrails: ["Request-id handoff", "Masked evidence", "No raw transcript"],
  },
  {
    id: "consent-admin",
    title: "Consent Admin",
    column: "governance",
    route: "/console/consent",
    imageType: "consent",
    purpose: "Displays consent dimensions, memory state, and deletion job status.",
    primaryUser: "Privacy Admin",
    components: ["Consent matrix", "Memory badge", "Deletion action", "Job status"],
    guardrails: ["Pseudonymous IDs", "Least privilege", "Audit target"],
  },
  {
    id: "route-inventory",
    title: "Route Inventory",
    column: "governance",
    route: "/console/route-inventory",
    imageType: "inventory",
    purpose: "Documents allowed routes and confirms out-of-scope app routes are absent.",
    primaryUser: "All partner roles",
    components: ["Route table", "Allowed roles", "Scope status", "Guard summary"],
    guardrails: ["Partner Console only", "Scope change required for new app surfaces", "CI-friendly inventory"],
  },
];

export function getCardsForColumn(columnId) {
  return screenCards.filter((card) => card.column === columnId);
}

export function getCoverageSummary() {
  return {
    columns: boardColumns.length,
    cards: screenCards.length,
    guardrails: new Set(screenCards.flatMap((card) => card.guardrails)).size,
  };
}
