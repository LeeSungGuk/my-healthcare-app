export const roles = [
  { id: "B2B_DEV", label: "B2B Developer" },
  { id: "B2B_PM", label: "B2B PM" },
  { id: "OPERATOR", label: "Operator" },
  { id: "REVIEWER", label: "Reviewer" },
  { id: "PRIVACY_ADMIN", label: "Privacy Admin" },
  { id: "READ_ONLY", label: "Read Only" },
];

export const forbiddenRouteTerms = ["guardian", "institution", "elder-app", "elder-dashboard"];

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

export function getModulesForRole(role) {
  return allowedRoutes.filter((route) => route.roles.includes(role));
}

export function canAccessRoute(role, routeId) {
  const route = allowedRoutes.find((item) => item.id === routeId);
  return Boolean(route?.roles.includes(role));
}

export function getRouteById(routeId) {
  return allowedRoutes.find((route) => route.id === routeId) ?? allowedRoutes[0];
}

export function routeIdFromHash(hash) {
  const cleanHash = hash.replace(/^#/, "");
  const found = allowedRoutes.find((route) => route.path === cleanHash);
  return found?.id ?? "home";
}

export function isRouteInventoryClean(routes = allowedRoutes) {
  return routes.every((route) => {
    const path = route.path.toLowerCase();
    return path.startsWith("/console") && forbiddenRouteTerms.every((term) => !path.includes(term));
  });
}

export function redactSensitiveText(value) {
  return String(value)
    .replace(/name:\s*[^|]+/gi, "name: [redacted]")
    .replace(/ssn:\s*[^|]+/gi, "ssn: [redacted]")
    .replace(/address:\s*[^|]+/gi, "address: [redacted]")
    .replace(/raw\s+transcript:\s*[^|]+/gi, "dialogue: [blocked]")
    .replace(/sk_(live|test|sandbox)_[A-Za-z0-9_=-]+/g, "[api-key-redacted]")
    .replace(/\b\d{6}-\d{7}\b/g, "[id-redacted]");
}

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

export function listApiKeys(records) {
  return records.map(({ keyHash, rawKey, ...safeRecord }) => safeRecord);
}

export function formatLatency(ms) {
  return `${Number(ms).toLocaleString()} ms`;
}
