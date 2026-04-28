/**
 * SilverCare Partner Console prototype renderer.
 *
 * Developer note:
 * - This file intentionally keeps the prototype dependency-free: no build step,
 *   no framework runtime, and no real API calls.
 * - Screen rendering is centralized here so reviewers can inspect the complete
 *   UI flow in one place during the prototype phase.
 *
 * AI agent note:
 * - Preserve the boundary between this renderer, `policies.mjs`, and
 *   `mock-data.mjs`. Policy behavior should be changed in `policies.mjs`,
 *   fixture shape in `mock-data.mjs`, and visual composition here.
 * - Do not add guardian, institution, or elder-facing app routes without an
 *   explicit scope change.
 */
import {
  allowedRoutes,
  canAccessRoute,
  formatLatency,
  getModulesForRole,
  getRouteById,
  isRouteInventoryClean,
  issueApiKey,
  listApiKeys,
  roles,
  routeIdFromHash,
} from "./policies.mjs";
import {
  apiEndpoints,
  apiKeyRecords,
  consentRecords,
  enumDefinitions,
  opsLogs,
  playgroundResponses,
  playgroundScenarios,
  pocMetrics,
  session,
  standardErrors,
  tenants,
} from "./mock-data.mjs";

const root = document.querySelector("#app");

/**
 * In-memory UI state for the static SPA.
 *
 * Developer note:
 * - This is deliberately volatile state. Refreshing the page should clear
 *   transient values such as one-time API key reveal and playground responses.
 *
 * AI agent note:
 * - Do not persist `oneTimeKey` to localStorage/sessionStorage. The one-time
 *   reveal behavior is a security requirement, not just a UI flourish.
 */
const state = {
  role: session.defaultRole,
  routeId: routeIdFromHash(window.location.hash || "#/console"),
  apiKeys: [...apiKeyRecords],
  oneTimeKey: null,
  copied: false,
  selectedEndpointId: "chat-reply",
  selectedScenarioId: "normal",
  requestText: JSON.stringify(playgroundScenarios[0].payload, null, 2),
  response: null,
  validationErrors: [],
  reportPeriod: "last_7_days",
  exportNotice: "",
  opsFilter: "all",
  deletionRequestId: null,
};

const escapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => escapeMap[char]);
}

function titleCase(value) {
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function currentTenant() {
  return tenants.find((tenant) => tenant.id === session.tenantId) ?? tenants[0];
}

function selectedEndpoint() {
  return apiEndpoints.find((endpoint) => endpoint.id === state.selectedEndpointId) ?? apiEndpoints[0];
}

function selectedScenario() {
  return playgroundScenarios.find((scenario) => scenario.id === state.selectedScenarioId) ?? playgroundScenarios[0];
}

function currentMetric() {
  return pocMetrics.find((metric) => metric.period === state.reportPeriod) ?? pocMetrics[0];
}

function badge(label, tone = "neutral") {
  return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
}

function statusTone(value) {
  const normalized = String(value).toLowerCase();
  if (["active", "granted", "success", "low", "none"].includes(normalized)) return "success";
  if (["open", "queued", "high", "critical", "limited"].includes(normalized)) return "warning";
  if (["revoked", "withdrawn", "error", "failed"].includes(normalized)) return "danger";
  return "neutral";
}

function moduleIcon(id) {
  const icons = {
    home: "HM",
    "api-keys": "KEY",
    "api-docs": "DOC",
    playground: "RUN",
    report: "RPT",
    ops: "OPS",
    "review-queue": "REV",
    consent: "PRI",
    "route-inventory": "INV",
  };
  return icons[id] ?? "UI";
}

/**
 * Render the full application shell for the active hash route and selected role.
 *
 * Developer note:
 * - All route content passes through `canAccessRoute()` before screen-specific
 *   markup is rendered.
 *
 * AI agent note:
 * - If you add a new screen, update `allowedRoutes`, `renderRoute()`, docs, and
 *   tests together so navigation, route inventory, and permissions stay aligned.
 */
function render() {
  if (state.routeId === "landing") {
    root.innerHTML = renderLanding();
    return;
  }

  const route = getRouteById(state.routeId);
  const tenant = currentTenant();
  const canAccess = canAccessRoute(state.role, route.id);

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">SC</div>
          <div>
            <div class="brand-title">SilverCare</div>
            <div class="brand-subtitle">Partner Console</div>
          </div>
        </div>
        <nav class="nav-list" aria-label="Partner Console navigation">
          ${allowedRoutes.map(renderNavItem).join("")}
        </nav>
        <div class="sidebar-footer">
          <div class="small-label">Scope</div>
          <div class="scope-line">${badge("Partner Console only", "success")}</div>
          <div class="muted small">No consumer, institution, or elder app routes are generated.</div>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <div class="eyebrow">${escapeHtml(route.path)}</div>
            <h1>${escapeHtml(route.label)}</h1>
          </div>
          <div class="topbar-actions">
            <div class="context-pill">
              <span class="small-label">Tenant</span>
              <strong>${escapeHtml(tenant.id)}</strong>
            </div>
            <div class="context-pill">
              <span class="small-label">Env</span>
              <strong>${escapeHtml(tenant.environment)}</strong>
            </div>
            <label class="role-picker">
              <span class="small-label">Role</span>
              <select data-control="role">
                ${roles
                  .map(
                    (role) =>
                      `<option value="${escapeHtml(role.id)}" ${role.id === state.role ? "selected" : ""}>${escapeHtml(role.label)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
          </div>
        </header>
        <section class="content">
          ${canAccess ? renderRoute(route.id) : renderPermissionDenied(route)}
        </section>
      </main>
    </div>
  `;
}

/**
 * Render the public landing page before the protected Partner Console.
 *
 * Developer note:
 * - This is the customer hook layer. It should communicate the outcome and then
 *   route qualified visitors into `#/console`.
 *
 * AI agent note:
 * - Keep the page persuasive but defensible. Do not imply clinical diagnosis,
 *   real production readiness, or third-party endorsements that do not exist.
 */
function renderLanding() {
  return `
    <main class="landing-page">
      <header class="landing-nav">
        <a class="landing-brand" href="#/" aria-label="SilverCare landing home">
          <span class="brand-mark">SC</span>
          <span>
            <strong>SilverCare</strong>
            <small>Partner Console</small>
          </span>
        </a>
        <nav class="landing-links" aria-label="Landing navigation">
          <a href="#landing-workflow">Workflow</a>
          <a href="#landing-proof">Proof</a>
          <a href="#landing-safety">Safety</a>
          <a class="button primary" href="#/console">Open the console</a>
        </nav>
      </header>

      <section class="landing-hero">
        <div class="hero-copy">
          <p class="eyebrow">Healthcare AI operations, review ready</p>
          <h1>Validate eldercare AI workflows without exposing sensitive data.</h1>
          <p class="hero-subtitle">
            A sandbox-first Partner Console for teams that need API docs, request testing, operations review, and consent visibility in one controlled surface.
          </p>
          <div class="hero-actions">
            <a class="button primary large" href="#/console">Open the console</a>
            <a class="button large" href="#/console/route-inventory">Review route scope</a>
          </div>
          <div class="hero-trust-row" aria-label="Trust indicators">
            ${landingStat("0", "default PII exposure target")}
            ${landingStat("9", "Partner Console routes")}
            ${landingStat("2s", "p95 initial view target")}
          </div>
          <p class="hero-media-caption">Background shows the actual Partner Console prototype surface: role-aware navigation, tenant context, and privacy-first module access.</p>
        </div>
      </section>

      <section class="logo-wall" id="landing-proof" aria-label="Capability proof">
        <span>Sandbox API</span>
        <span>Role Guard</span>
        <span>Masked Evidence</span>
        <span>Consent Admin</span>
        <span>Route Inventory</span>
      </section>

      <section class="landing-section" id="landing-workflow">
        <div class="section-heading landing-heading">
          <div>
            <p class="eyebrow">A to Z workflow</p>
            <h2>From partner API setup to privacy review in one path.</h2>
          </div>
          <a class="button" href="#/console/playground">Try the sandbox flow</a>
        </div>
        <div class="workflow-strip">
          ${landingWorkflow("01", "Issue API key", "Create a sandbox key and copy it once without storing raw key material.")}
          ${landingWorkflow("02", "Test safe scenarios", "Run normal, safety, and error flows through the Playground before production.")}
          ${landingWorkflow("03", "Review operations", "Inspect masked logs, risk status, and review queue handoff by request ID.")}
          ${landingWorkflow("04", "Check consent state", "Confirm pseudonymous consent dimensions and deletion job status.")}
        </div>
      </section>

      <section class="landing-section split-section" id="landing-safety">
        <div>
          <p class="eyebrow">Safety checks</p>
          <h2>Built for teams that cannot afford unclear privacy boundaries.</h2>
          <p class="section-copy">
            The prototype emphasizes verification and guardrails rather than generic AI claims. Every default path keeps production data out and makes scope visible.
          </p>
        </div>
        <div class="safety-grid">
          ${landingSafetyItem("Sandbox is the default", "Production execution is disabled unless a later scope explicitly adds controlled confirmation.")}
          ${landingSafetyItem("One-time key reveal", "Raw API keys appear only in the issue success state and never in list rows.")}
          ${landingSafetyItem("Masked operations view", "Ops and review surfaces use request IDs and masked evidence instead of full dialogue text.")}
          ${landingSafetyItem("Scope guard", "Route inventory keeps consumer-facing app surfaces outside this Partner Console prototype.")}
        </div>
      </section>

      <section class="landing-section">
        <div class="section-heading landing-heading">
          <div>
            <p class="eyebrow">Value proposition</p>
            <h2>What the team gets before real integration begins.</h2>
          </div>
        </div>
        <div class="value-grid">
          ${landingValueCard("Developers", "See schema, errors, snippets, and sandbox responses without waiting for backend setup.")}
          ${landingValueCard("Operators", "Review masked request logs and safety states without opening raw sensitive content.")}
          ${landingValueCard("Privacy owners", "Inspect consent and deletion state using pseudonymous identifiers only.")}
        </div>
      </section>

      <section class="landing-final-cta">
        <div>
          <p class="eyebrow">Prototype review ready</p>
          <h2>Open the console and inspect the guardrails directly.</h2>
          <p>Use the role switcher to see how each module appears or gets blocked for different partner users.</p>
        </div>
        <a class="button primary large" href="#/console">Open the console</a>
      </section>
    </main>
  `;
}

function landingStat(value, label) {
  return `
    <div class="landing-stat">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function landingWorkflow(step, title, description) {
  return `
    <article class="workflow-card">
      <span>${escapeHtml(step)}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </article>
  `;
}

function landingSafetyItem(title, description) {
  return `
    <article class="safety-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </article>
  `;
}

function landingValueCard(audience, benefit) {
  return `
    <article class="value-card">
      <span>${escapeHtml(audience)}</span>
      <p>${escapeHtml(benefit)}</p>
    </article>
  `;
}

function renderNavItem(route) {
  const visible = route.roles.includes(state.role);
  const active = route.id === state.routeId;
  return `
    <a class="nav-item ${active ? "active" : ""} ${visible ? "" : "disabled"}" href="#${escapeHtml(route.path)}">
      <span class="nav-icon">${escapeHtml(moduleIcon(route.id))}</span>
      <span>
        <span class="nav-label">${escapeHtml(route.label)}</span>
        <span class="nav-state">${visible ? "Available" : "Permission required"}</span>
      </span>
    </a>
  `;
}

/**
 * Render route-specific content for the current navigation target.
 *
 * Developer note:
 * - The renderer map is the component boundary for this prototype.
 *
 * AI agent note:
 * - Keep this list Partner Console-only. Consumer app surfaces belong outside
 *   this prototype unless PRD/SRS scope changes are made first.
 */
function renderRoute(routeId) {
  const views = {
    home: renderHome,
    "api-keys": renderApiKeys,
    "api-docs": renderApiDocs,
    playground: renderPlayground,
    report: renderReport,
    ops: renderOps,
    "review-queue": renderReviewQueue,
    consent: renderConsent,
    "route-inventory": renderRouteInventory,
  };

  return (views[routeId] ?? renderHome)();
}

/**
 * Render a denied state instead of partially rendering protected data.
 *
 * Developer note:
 * - This should remain a full-state replacement, not an inline warning beside
 *   hidden content.
 *
 * AI agent note:
 * - Never leak table rows, metrics, consent records, or logs when this branch is
 *   selected.
 */
function renderPermissionDenied(route) {
  return `
    <div class="empty-state">
      <div class="empty-icon">403</div>
      <h2>Permission required</h2>
      <p>The ${escapeHtml(state.role)} role cannot view ${escapeHtml(route.label)}. Tenant data stays hidden until the route and action guard both pass.</p>
      <div class="state-row">
        ${badge("authenticated mock session", "success")}
        ${badge("role guard blocked", "danger")}
        ${badge("tenant data hidden", "neutral")}
      </div>
    </div>
  `;
}

function renderHome() {
  const modules = getModulesForRole(state.role);
  return `
    <div class="grid two">
      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Authenticated shell</p>
            <h2>Console context</h2>
          </div>
          ${badge("REQ-NF-036", "neutral")}
        </div>
        <dl class="definition-list">
          <div><dt>Tenant</dt><dd>${escapeHtml(session.tenantId)}</dd></div>
          <div><dt>User</dt><dd>${escapeHtml(session.displayName)}</dd></div>
          <div><dt>Role</dt><dd>${escapeHtml(state.role)}</dd></div>
          <div><dt>Environment</dt><dd>${escapeHtml(currentTenant().environment)}</dd></div>
        </dl>
      </section>
      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Privacy posture</p>
            <h2>Default display policy</h2>
          </div>
          ${badge("PII exposure: 0", "success")}
        </div>
        <ul class="check-list">
          <li>Original dialogue text is blocked by default.</li>
          <li>Direct identifiers and original API keys are never shown in lists.</li>
          <li>Production tenant execution is disabled in this prototype.</li>
          <li>All sensitive actions are marked as audit targets.</li>
        </ul>
      </section>
    </div>
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Role-aware modules</p>
          <h2>Accessible surface for ${escapeHtml(state.role)}</h2>
        </div>
        ${badge(`${modules.length} modules`, "neutral")}
      </div>
      <div class="module-grid">
        ${allowedRoutes.map((route) => renderModuleCard(route, modules.some((module) => module.id === route.id))).join("")}
      </div>
    </section>
  `;
}

function renderModuleCard(route, available) {
  return `
    <article class="module-card ${available ? "" : "muted-card"}">
      <div class="module-icon">${escapeHtml(moduleIcon(route.id))}</div>
      <div>
        <h3>${escapeHtml(route.label)}</h3>
        <p>${escapeHtml(route.description)}</p>
        ${available ? badge("available", "success") : badge("hidden or denied", "neutral")}
      </div>
    </article>
  `;
}

function renderApiKeys() {
  return `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Developer portal</p>
          <h2>API Key Manager</h2>
        </div>
        <button class="button primary" data-action="issue-key">Issue sandbox key</button>
      </div>
      ${state.oneTimeKey ? renderOneTimeKey() : ""}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Key ID</th>
              <th>Status</th>
              <th>Created</th>
              <th>Revoked</th>
              <th>Last used</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.apiKeys.map(renderApiKeyRow).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderOneTimeKey() {
  return `
    <div class="notice warning">
      <div>
        <strong>One-time reveal</strong>
        <p>This sandbox key is available only in this success state. It is not stored in list, detail, route cache, or mock storage.</p>
        <code>${escapeHtml(state.oneTimeKey)}</code>
      </div>
      <button class="button" data-action="copy-key">${state.copied ? "Copied" : "Copy once"}</button>
    </div>
  `;
}

function renderApiKeyRow(key) {
  return `
    <tr>
      <td><code>${escapeHtml(key.apiKeyId)}</code></td>
      <td>${badge(key.status, statusTone(key.status))}</td>
      <td>${escapeHtml(key.createdAt.slice(0, 10))}</td>
      <td>${escapeHtml(key.revokedAt ? key.revokedAt.slice(0, 10) : "-")}</td>
      <td>${escapeHtml(key.lastUsedAt ? key.lastUsedAt.slice(0, 10) : "-")}</td>
      <td>
        <button class="button compact" data-action="revoke-key" data-key-id="${escapeHtml(key.apiKeyId)}" ${key.status === "revoked" ? "disabled" : ""}>
          Revoke
        </button>
      </td>
    </tr>
  `;
}

function renderApiDocs() {
  return `
    <div class="grid docs-grid">
      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">OpenAPI-compatible contract</p>
            <h2>Endpoints</h2>
          </div>
          ${badge("synthetic samples", "success")}
        </div>
        <div class="endpoint-list">
          ${apiEndpoints.map(renderEndpointDoc).join("")}
        </div>
      </section>
      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Shared contract</p>
            <h2>Enums and errors</h2>
          </div>
        </div>
        ${enumDefinitions.map(renderEnum).join("")}
        <div class="table-wrap compact-table">
          <table>
            <thead><tr><th>Error</th><th>HTTP</th><th>Retry</th></tr></thead>
            <tbody>
              ${standardErrors
                .map(
                  (error) =>
                    `<tr><td><code>${escapeHtml(error.code)}</code><div class="muted">${escapeHtml(error.meaning)}</div></td><td>${error.http}</td><td>${error.retryable ? "yes" : "no"}</td></tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderEndpointDoc(endpoint) {
  return `
    <article class="endpoint-card">
      <div class="endpoint-title">
        ${badge(endpoint.method, endpoint.method === "GET" ? "success" : "neutral")}
        <code>${escapeHtml(endpoint.path)}</code>
      </div>
      <p>${escapeHtml(endpoint.summary)}</p>
      <div class="field-grid">
        <div>
          <h3>Request fields</h3>
          <ul class="dense-list">
            ${endpoint.requestFields
              .map((field) => `<li><code>${escapeHtml(field.name)}</code> ${escapeHtml(field.type)} ${field.required ? badge("required", "warning") : ""}</li>`)
              .join("")}
          </ul>
        </div>
        <div>
          <h3>Response fields</h3>
          <ul class="dense-list">
            ${endpoint.responseFields.map((field) => `<li><code>${escapeHtml(field)}</code></li>`).join("")}
          </ul>
        </div>
      </div>
      <pre><code>${escapeHtml(makeCurl(endpoint, samplePayload(endpoint)))}</code></pre>
    </article>
  `;
}

function renderEnum(definition) {
  return `
    <div class="enum-row">
      <strong>${escapeHtml(definition.name)}</strong>
      <div>${definition.values.map((value) => badge(value, "neutral")).join("")}</div>
    </div>
  `;
}

function renderPlayground() {
  const endpoint = selectedEndpoint();
  const validation = validateRequest();
  const snippetsEnabled = validation.errors.length === 0;

  return `
    <div class="grid playground-grid">
      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Sandbox first</p>
            <h2>Request Builder</h2>
          </div>
          ${badge("sandbox locked", "success")}
        </div>
        <div class="form-grid">
          <label>
            <span class="small-label">Endpoint</span>
            <select data-control="endpoint">
              ${apiEndpoints
                .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === endpoint.id ? "selected" : ""}>${escapeHtml(item.method)} ${escapeHtml(item.path)}</option>`)
                .join("")}
            </select>
          </label>
          <label>
            <span class="small-label">Scenario</span>
            <select data-control="scenario">
              ${playgroundScenarios
                .map((scenario) => `<option value="${escapeHtml(scenario.id)}" ${scenario.id === state.selectedScenarioId ? "selected" : ""}>${escapeHtml(scenario.label)}</option>`)
                .join("")}
            </select>
          </label>
        </div>
        <textarea data-control="request" spellcheck="false">${escapeHtml(state.requestText)}</textarea>
        ${validation.errors.length ? `<div class="notice danger">${validation.errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</div>` : `<div class="notice success">Request is valid for ${escapeHtml(endpoint.path)}.</div>`}
        <div class="action-row">
          <button class="button primary" data-action="run-playground">Run sandbox request</button>
          <button class="button" data-action="reset-scenario">Apply scenario preset</button>
          <button class="button" disabled>Production disabled</button>
        </div>
      </section>
      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Execution result</p>
            <h2>Response Viewer</h2>
          </div>
          ${state.response ? badge(formatLatency(state.response.latencyMs), "neutral") : badge("idle", "neutral")}
        </div>
        ${renderResponseViewer()}
      </section>
    </div>
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Developer handoff</p>
          <h2>cURL and TypeScript snippets</h2>
        </div>
        ${snippetsEnabled ? badge("synced to request", "success") : badge("blocked until valid", "danger")}
      </div>
      ${snippetsEnabled ? renderSnippets(endpoint, validation.payload) : `<div class="empty-state slim">Fix validation errors to enable snippet copy.</div>`}
    </section>
  `;
}

/**
 * Render the current playground execution result.
 *
 * Developer note:
 * - The viewer displays structured JSON for debugging but uses synthetic
 *   response fixtures only.
 *
 * AI agent note:
 * - Do not render raw transcript, direct identifiers, or original API keys here.
 *   If new response fields are added, confirm they are safe display fields first.
 */
function renderResponseViewer() {
  if (!state.response) {
    return `<div class="empty-state slim">Run a sandbox scenario to inspect status, latency, request id, risk fields, and standard errors.</div>`;
  }

  const payload = state.response.error ?? state.response.body;
  return `
    <div class="response-meta">
      ${badge(`HTTP ${state.response.status}`, state.response.status >= 400 ? "danger" : "success")}
      ${badge(state.response.requestId, "neutral")}
      ${badge(formatLatency(state.response.latencyMs), "neutral")}
    </div>
    <pre><code>${escapeHtml(JSON.stringify(payload, null, 2))}</code></pre>
  `;
}

function renderSnippets(endpoint, payload) {
  return `
    <div class="snippet-grid">
      <pre><code>${escapeHtml(makeCurl(endpoint, payload))}</code></pre>
      <pre><code>${escapeHtml(makeTypeScript(endpoint, payload))}</code></pre>
    </div>
  `;
}

function renderReport() {
  const metric = currentMetric();
  return `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Aggregate-only reporting</p>
          <h2>PoC metrics</h2>
        </div>
        <label class="inline-select">
          <span class="small-label">Period</span>
          <select data-control="period">
            ${pocMetrics.map((item) => `<option value="${escapeHtml(item.period)}" ${item.period === state.reportPeriod ? "selected" : ""}>${escapeHtml(item.period)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="metric-grid">
        ${renderMetric("Active devices", metric.activeDevices)}
        ${renderMetric("Active elders", metric.activeElders)}
        ${renderMetric("Conversations", metric.conversationCount)}
        ${renderMetric("p95 latency", formatLatency(metric.p95LatencyMs))}
        ${renderMetric("Error rate", `${(metric.errorRate * 100).toFixed(1)}%`)}
        ${renderMetric("Risk events", metric.riskEventCount)}
      </div>
      <div class="action-row">
        <button class="button" data-action="export-json">Export JSON</button>
        <button class="button" data-action="export-csv">Export CSV</button>
        ${state.exportNotice ? `<span class="muted">${escapeHtml(state.exportNotice)}</span>` : ""}
      </div>
    </section>
  `;
}

function renderMetric(label, value) {
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `;
}

function renderOps() {
  const filtered = state.opsFilter === "all" ? opsLogs : opsLogs.filter((log) => log.alertStatus === state.opsFilter);
  return `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Operations</p>
          <h2>Masked request log</h2>
        </div>
        <label class="inline-select">
          <span class="small-label">Alert status</span>
          <select data-control="ops-filter">
            ${["all", "open", "triaged"].map((status) => `<option value="${status}" ${status === state.opsFilter ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Request</th><th>Endpoint</th><th>Status</th><th>Latency</th><th>Evidence</th><th>Review</th></tr></thead>
          <tbody>
            ${filtered.map(renderOpsRow).join("")}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Analysis view</p>
          <h2>Risk and safety summary</h2>
        </div>
      </div>
      <div class="module-grid">
        ${filtered.map(renderOpsAnalysis).join("")}
      </div>
    </section>
  `;
}

function renderOpsRow(log) {
  return `
    <tr>
      <td><code>${escapeHtml(log.requestId)}</code></td>
      <td>${escapeHtml(log.endpoint)}</td>
      <td>${badge(String(log.statusCode), log.statusCode >= 400 ? "danger" : "success")} ${log.errorCode !== "-" ? badge(log.errorCode, "warning") : ""}</td>
      <td>${escapeHtml(formatLatency(log.latencyMs))}</td>
      <td>${escapeHtml(log.maskedEvidence)}</td>
      <td><a class="text-link" href="#/console/ops/review-queue">${escapeHtml(log.reviewStatus)}</a></td>
    </tr>
  `;
}

function renderOpsAnalysis(log) {
  return `
    <article class="module-card">
      <div class="module-icon">${escapeHtml(log.riskLevel.slice(0, 3).toUpperCase())}</div>
      <div>
        <h3>${escapeHtml(log.requestId)}</h3>
        <p>Risk: ${escapeHtml(log.riskLevel)}. Safety policy: ${log.safetyPolicyApplied ? "applied" : "not applied"}.</p>
        <p class="muted">Model: ${escapeHtml(log.modelVersion)}</p>
      </div>
    </article>
  `;
}

function renderReviewQueue() {
  const queued = opsLogs.filter((log) => ["queued", "open"].includes(log.reviewStatus) || log.alertStatus === "open");
  return `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Human review</p>
          <h2>Queue by request id</h2>
        </div>
        ${badge(`${queued.length} items`, "warning")}
      </div>
      <div class="module-grid">
        ${queued
          .map(
            (item) => `
              <article class="module-card">
                <div class="module-icon">REV</div>
                <div>
                  <h3>${escapeHtml(item.requestId)}</h3>
                  <p>${escapeHtml(item.maskedEvidence)}</p>
                  <div class="state-row">
                    ${badge(item.riskLevel, statusTone(item.riskLevel))}
                    ${badge(item.errorCode, item.errorCode === "-" ? "neutral" : "warning")}
                    ${badge(item.alertStatus, statusTone(item.alertStatus))}
                  </div>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderConsent() {
  return `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Privacy operations</p>
          <h2>User and Consent Admin</h2>
        </div>
        ${badge("least privilege", "success")}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Elder</th><th>Device</th><th>Consent dimensions</th><th>Memory</th><th>Deletion job</th><th>Action</th></tr></thead>
          <tbody>
            ${consentRecords.map(renderConsentRow).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderConsentRow(record) {
  return `
    <tr>
      <td><code>${escapeHtml(record.elderId)}</code></td>
      <td><code>${escapeHtml(record.deviceId)}</code></td>
      <td>
        <div class="dimension-list">
          ${Object.entries(record.dimensions)
            .map(([key, value]) => `<span>${escapeHtml(titleCase(key))}: ${badge(value, statusTone(value))}</span>`)
            .join("")}
        </div>
      </td>
      <td>${badge(record.memoryEnabled ? "enabled" : "disabled", record.memoryEnabled ? "success" : "neutral")}</td>
      <td>${badge(state.deletionRequestId && record.elderId === "elder_demo_01" ? "queued" : record.deletionJobStatus, statusTone(record.deletionJobStatus))}</td>
      <td><button class="button compact" data-action="request-delete" data-elder-id="${escapeHtml(record.elderId)}">Request deletion</button></td>
    </tr>
  `;
}

function renderRouteInventory() {
  const clean = isRouteInventoryClean();
  return `
    <section class="panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Scope guard</p>
          <h2>Route inventory</h2>
        </div>
        ${badge(clean ? "clean" : "needs review", clean ? "success" : "danger")}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Route</th><th>Module</th><th>Allowed roles</th><th>Status</th></tr></thead>
          <tbody>
            ${allowedRoutes
              .map(
                (route) => `
                  <tr>
                    <td><code>${escapeHtml(route.path)}</code></td>
                    <td>${escapeHtml(route.label)}</td>
                    <td>${route.roles.map((role) => badge(role, "neutral")).join("")}</td>
                    <td>${badge("Partner Console", "success")}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Build a sample request payload from endpoint field metadata.
 *
 * Developer note:
 * - This mirrors the API Docs samples and keeps Playground defaults in sync with
 *   endpoint metadata.
 *
 * AI agent note:
 * - Keep samples sandbox-only. Production tenant IDs should not appear in this
 *   prototype.
 */
function samplePayload(endpoint) {
  return Object.fromEntries(endpoint.requestFields.map((field) => [field.name, field.sample]));
}

/**
 * Validate the playground JSON request before enabling execution/snippets.
 *
 * Developer note:
 * - This is intentionally minimal for the prototype. A product version should
 *   derive validation from the OpenAPI-compatible contract.
 *
 * AI agent note:
 * - The sandbox tenant check is a guardrail. Do not remove it when changing
 *   endpoint fields or sample payloads.
 */
function validateRequest() {
  const endpoint = selectedEndpoint();
  const errors = [];
  let payload = {};

  try {
    payload = JSON.parse(state.requestText);
  } catch {
    return { payload: null, errors: ["Request body must be valid JSON."] };
  }

  for (const field of endpoint.requestFields) {
    if (field.required && (payload[field.name] === undefined || payload[field.name] === "")) {
      errors.push(`${field.name} is required.`);
    }
  }

  if (payload.tenant_id && payload.tenant_id !== "tenant_sandbox") {
    errors.push("Only tenant_sandbox is allowed in this prototype.");
  }

  return { payload, errors };
}

/**
 * Generate a documentation-safe cURL snippet for the active request.
 *
 * Developer note:
 * - The snippet is for partner developer onboarding and mirrors API Docs output.
 *
 * AI agent note:
 * - Use `<SILVERCARE_API_KEY>` only. Never interpolate `state.oneTimeKey`.
 */
function makeCurl(endpoint, payload) {
  return [
    `curl -X ${endpoint.method} https://api.silvercare.example${endpoint.path} \\`,
    "  -H 'Authorization: Bearer <SILVERCARE_API_KEY>' \\",
    "  -H 'Content-Type: application/json' \\",
    `  -d '${JSON.stringify(payload)}'`,
  ].join("\n");
}

/**
 * Generate a documentation-safe TypeScript fetch snippet for the active request.
 *
 * Developer note:
 * - This is a copyable sample, not an SDK implementation.
 *
 * AI agent note:
 * - Keep credentials as environment placeholders. Do not embed generated keys or
 *   production tenant payloads.
 */
function makeTypeScript(endpoint, payload) {
  return [
    `const response = await fetch("https://api.silvercare.example${endpoint.path}", {`,
    `  method: "${endpoint.method}",`,
    "  headers: {",
    "    Authorization: `Bearer ${process.env.SILVERCARE_API_KEY}`,",
    "    \"Content-Type\": \"application/json\",",
    "  },",
    `  body: JSON.stringify(${JSON.stringify(payload, null, 2).replace(/\n/g, "\n  ")}),`,
    "});",
    "const data = await response.json();",
  ].join("\n");
}

/**
 * Apply a sandbox scenario to the selected endpoint and request editor.
 *
 * Developer note:
 * - Scenario selection is the primary path for reviewers to exercise normal,
 *   safety, and error states quickly.
 *
 * AI agent note:
 * - Scenarios must stay synthetic and must not reference real elder profiles or
 *   direct identifiers.
 */
function applyScenario(scenarioId) {
  const scenario = playgroundScenarios.find((item) => item.id === scenarioId) ?? playgroundScenarios[0];
  state.selectedScenarioId = scenario.id;
  state.selectedEndpointId = scenario.endpointId;
  state.requestText = JSON.stringify(scenario.payload, null, 2);
  state.response = null;
}

/**
 * Handle all prototype UI actions from delegated click events.
 *
 * Developer note:
 * - Actions mutate the in-memory state then re-render the shell.
 *
 * AI agent note:
 * - Security-sensitive actions here are mocks. Preserve audit-facing UI labels
 *   and one-time key behavior even when adding new actions.
 */
function handleAction(action, target) {
  if (action === "issue-key") {
    const issued = issueApiKey(session.tenantId, state.role);
    state.oneTimeKey = issued.rawKey;
    state.copied = false;
    state.apiKeys = [...listApiKeys([issued.record]), ...state.apiKeys];
  }

  if (action === "copy-key") {
    state.copied = true;
    if (navigator.clipboard && state.oneTimeKey) {
      navigator.clipboard.writeText(state.oneTimeKey).catch(() => {});
    }
  }

  if (action === "revoke-key") {
    const keyId = target.dataset.keyId;
    state.apiKeys = state.apiKeys.map((key) =>
      key.apiKeyId === keyId
        ? {
            ...key,
            status: "revoked",
            revokedAt: "2026-04-28T10:00:00.000Z",
          }
        : key,
    );
  }

  if (action === "run-playground") {
    const validation = validateRequest();
    state.validationErrors = validation.errors;
    state.response = validation.errors.length ? null : playgroundResponses[state.selectedScenarioId] ?? playgroundResponses.normal;
  }

  if (action === "reset-scenario") {
    applyScenario(state.selectedScenarioId);
  }

  if (action === "export-json") {
    state.exportNotice = "JSON export generated with aggregate fields only.";
  }

  if (action === "export-csv") {
    state.exportNotice = "CSV export generated with aggregate fields only.";
  }

  if (action === "request-delete") {
    state.deletionRequestId = `del_${target.dataset.elderId}_queued`;
  }

  render();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  event.preventDefault();
  handleAction(target.dataset.action, target);
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.control === "role") {
    state.role = target.value;
  }

  if (target.dataset.control === "endpoint") {
    state.selectedEndpointId = target.value;
    state.requestText = JSON.stringify(samplePayload(selectedEndpoint()), null, 2);
    state.response = null;
  }

  if (target.dataset.control === "scenario") {
    applyScenario(target.value);
  }

  if (target.dataset.control === "period") {
    state.reportPeriod = target.value;
    state.exportNotice = "";
  }

  if (target.dataset.control === "ops-filter") {
    state.opsFilter = target.value;
  }

  render();
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.control === "request") {
    state.requestText = target.value;
    state.response = null;
  }
});

window.addEventListener("hashchange", () => {
  state.routeId = routeIdFromHash(window.location.hash || "#/console");
  render();
});

if (!window.location.hash) {
  window.location.hash = "/";
} else {
  render();
}
