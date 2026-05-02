/**
 * Shared UI policy layer for the SilverCare Partner Console prototype.
 *
 * Developer note:
 * - Keep role, route, redaction, and API key reveal rules here so tests can
 *   verify them without rendering the DOM.
 *
 * AI agent note:
 * - Treat this file as the guardrail boundary. New screens should consume these
 *   helpers instead of reimplementing permission or privacy checks inline.
 */
export const roles = [
  { id: "B2B_DEV", label: "B2B Developer" },
  { id: "B2B_PM", label: "B2B PM" },
  { id: "OPERATOR", label: "Operator" },
  { id: "REVIEWER", label: "Reviewer" },
  { id: "PRIVACY_ADMIN", label: "Privacy Admin" },
  { id: "READ_ONLY", label: "Read Only" },
];

export const forbiddenRouteTerms = ["guardian", "institution", "elder-app", "elder-dashboard"];

export const landingRoute = {
  id: "landing",
  path: "/",
  label: "Landing",
  description: "Public customer hook page that routes qualified visitors into the Partner Console.",
};

export const publicRoutes = [
  landingRoute,
  {
    id: "login",
    path: "/login",
    label: "Partner Login",
    description: "Public authentication entry before opening the Partner Console.",
  },
  {
    id: "request-access",
    path: "/request-access",
    label: "Request Access",
    description: "Partner application and demo request entry for invite-based onboarding.",
  },
];

export const allowedRoutes = [
  {
    id: "home",
    path: "/console",
    label: "Home",
    description: "Tenant context, role, environment, and available Partner Console modules.",
    roles: ["B2B_DEV", "B2B_PM", "OPERATOR", "REVIEWER", "PRIVACY_ADMIN", "READ_ONLY"],
  },
  {
    id: "api-keys",
    path: "/console/api-keys",
    label: "API Keys",
    description: "Issue, copy once, revoke, and inspect API key metadata.",
    roles: ["B2B_DEV"],
  },
  {
    id: "api-docs",
    path: "/console/api-docs",
    label: "API Docs",
    description: "Partner API schema, enums, errors, and code samples.",
    roles: ["B2B_DEV", "READ_ONLY"],
  },
  {
    id: "playground",
    path: "/console/playground",
    label: "Playground",
    description: "Sandbox request builder, scenario picker, response viewer, and snippets.",
    roles: ["B2B_DEV"],
  },
  {
    id: "safety",
    path: "/console/safety",
    label: "Privacy & Safety",
    description: "Safety overview placeholder for privacy, consent, masking, review, and guardrail evidence.",
    roles: ["B2B_DEV", "B2B_PM", "OPERATOR", "REVIEWER", "PRIVACY_ADMIN", "READ_ONLY"],
  },
  {
    id: "report",
    path: "/console/report",
    label: "PoC Report",
    description: "Period metrics and aggregate-only CSV or JSON export.",
    roles: ["B2B_PM"],
  },
  {
    id: "ops",
    path: "/console/ops",
    label: "Ops Monitoring",
    description: "Masked logs, risk analysis, alert status, and review handoff.",
    roles: ["OPERATOR", "REVIEWER"],
  },
  {
    id: "review-queue",
    path: "/console/ops/review-queue",
    label: "Review Queue",
    description: "High-risk, safety-filtered, timeout, and reported cases by request id.",
    roles: ["REVIEWER", "OPERATOR"],
  },
  {
    id: "consent",
    path: "/console/consent",
    label: "Consent Admin",
    description: "Pseudonymous user consent state, memory flag, and deletion job status.",
    roles: ["PRIVACY_ADMIN"],
  },
  {
    id: "route-inventory",
    path: "/console/route-inventory",
    label: "Route Inventory",
    description: "Scope guard proving that only Partner Console routes exist.",
    roles: ["B2B_DEV", "B2B_PM", "OPERATOR", "REVIEWER", "PRIVACY_ADMIN", "READ_ONLY"],
  },
];

/**
 * Return the modules visible to a selected mock role.
 *
 * Developer note:
 * - This drives both navigation availability and the Console Home module grid.
 *
 * AI agent note:
 * - When role labels or routes change, update tests so permission drift is
 *   caught before reviewer handoff.
 */
export function getModulesForRole(role) {
  return allowedRoutes.filter((route) => route.roles.includes(role));
}

/**
 * Check whether a role may render a route's protected content.
 *
 * Developer note:
 * - Route visibility and route access intentionally share the same route
 *   metadata in this prototype.
 *
 * AI agent note:
 * - Keep this as a hard gate. Do not partially render protected route content
 *   and hide pieces afterward.
 */
export function canAccessRoute(role, routeId) {
  const route = allowedRoutes.find((item) => item.id === routeId);
  return Boolean(route?.roles.includes(role));
}

/**
 * Resolve a route ID to route metadata with Home as the safe fallback.
 */
export function getRouteById(routeId) {
  const publicRoute = publicRoutes.find((route) => route.id === routeId);
  if (publicRoute) {
    return publicRoute;
  }

  return allowedRoutes.find((route) => route.id === routeId) ?? allowedRoutes[0];
}

/**
 * Convert a URL hash path into the internal route ID used by the renderer.
 */
export function routeIdFromHash(hash) {
  const cleanHash = hash.replace(/^#/, "");
  if (cleanHash === "" || cleanHash === "/") {
    return landingRoute.id;
  }

  const publicRoute = publicRoutes.find((route) => route.path === cleanHash);
  if (publicRoute) {
    return publicRoute.id;
  }

  const found = allowedRoutes.find((route) => route.path === cleanHash);
  return found?.id ?? "home";
}

/**
 * Confirm that all known routes stay inside the Partner Console scope.
 *
 * Developer note:
 * - This is the route inventory test hook.
 *
 * AI agent note:
 * - Add any new out-of-scope term to `forbiddenRouteTerms` before adding route
 *   inventory tests for it.
 */
export function isRouteInventoryClean(routes = allowedRoutes) {
  return routes.every((route) => {
    const path = route.path.toLowerCase();
    return path.startsWith("/console") && forbiddenRouteTerms.every((term) => !path.includes(term));
  });
}

/**
 * Redact common direct identifiers and API key patterns from display strings.
 *
 * Developer note:
 * - This helper is prototype-grade and pattern-based. Product code should use a
 *   stricter privacy pipeline.
 *
 * AI agent note:
 * - When adding new sample data fields, call this helper before display unless
 *   the field is already known to be safe synthetic data.
 */
export function redactSensitiveText(value) {
  return String(value)
    .replace(/name:\s*[^|]+/gi, "name: [redacted]")
    .replace(/ssn:\s*[^|]+/gi, "ssn: [redacted]")
    .replace(/address:\s*[^|]+/gi, "address: [redacted]")
    .replace(/raw\s+transcript:\s*[^|]+/gi, "dialogue: [blocked]")
    .replace(/sk_(live|test|sandbox)_[A-Za-z0-9_=-]+/g, "[api-key-redacted]")
    .replace(/\b\d{6}-\d{7}\b/g, "[id-redacted]");
}

/**
 * Redact sensitive record fields while preserving safe metadata.
 */
export function sanitizeRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (["rawText", "fullText", "apiKey", "keyHash", "ssn", "address", "name"].includes(key)) {
        return [key, "[redacted]"];
      }

      if (typeof value === "string") {
        return [key, redactSensitiveText(value)];
      }

      return [key, value];
    }),
  );
}

/**
 * Issue a mock sandbox API key with a one-time raw key plus safe list metadata.
 *
 * Developer note:
 * - The raw key is returned only in the action result, while `record` contains a
 *   hash that must be removed before list rendering.
 *
 * AI agent note:
 * - Do not store `rawKey` in mock records or UI state beyond the one-time reveal
 *   branch.
 */
export function issueApiKey(tenantId, actorRole) {
  if (actorRole !== "B2B_DEV") {
    throw new Error("API key issuing requires B2B_DEV role");
  }

  const suffix = Math.random().toString(36).slice(2, 10);
  const rawKey = `sk_sandbox_${suffix}_copy_once`;

  return {
    rawKey,
    record: {
      apiKeyId: `key_${suffix}`,
      tenantId,
      status: "active",
      createdAt: new Date("2026-04-28T09:00:00.000Z").toISOString(),
      revokedAt: null,
      lastUsedAt: null,
      keyHash: `hash_${suffix}`,
    },
  };
}

/**
 * Strip raw and hashed key material from API key rows before rendering.
 */
export function listApiKeys(records) {
  return records.map(({ keyHash, rawKey, ...safeRecord }) => safeRecord);
}

/**
 * Format latency consistently across Playground, Report, and Ops surfaces.
 */
export function formatLatency(ms) {
  return `${Number(ms).toLocaleString()} ms`;
}
