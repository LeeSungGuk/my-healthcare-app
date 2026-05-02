/**
 * Policy regression tests for the SilverCare Partner Console prototype.
 *
 * Developer note:
 * - Tests focus on behavior that would be expensive or risky to catch by visual
 *   inspection alone: route scope, role access, privacy redaction, and API key
 *   one-time reveal semantics.
 *
 * AI agent note:
 * - When changing routes, roles, or sensitive display behavior, update these
 *   tests first and verify the failure before changing implementation.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allowedRoutes,
  forbiddenRouteTerms,
  getModulesForRole,
  issueApiKey,
  listApiKeys,
  publicRoutes,
  redactSensitiveText,
  routeIdFromHash,
} from "../src/policies.mjs";

describe("Partner Console route scope", () => {
  it("contains only Partner Console routes", () => {
    const routes = allowedRoutes.map((route) => route.path.toLowerCase());

    for (const route of routes) {
      assert.match(route, /^\/console/);
      for (const forbiddenTerm of forbiddenRouteTerms) {
        assert.equal(route.includes(forbiddenTerm), false);
      }
    }
  });

  it("keeps the landing page outside protected console route inventory", () => {
    assert.equal(routeIdFromHash(""), "landing");
    assert.equal(routeIdFromHash("#/"), "landing");
    assert.equal(routeIdFromHash("#/console"), "home");
    assert.equal(allowedRoutes.some((route) => route.id === "landing"), false);
  });

  it("keeps public auth and access routes outside protected console route inventory", () => {
    assert.equal(routeIdFromHash("#/login"), "login");
    assert.equal(routeIdFromHash("#/request-access"), "request-access");
    assert.equal(allowedRoutes.some((route) => publicRoutes.some((publicRoute) => publicRoute.id === route.id)), false);
  });
});

describe("role module visibility", () => {
  it("gives B2B developers access to key, docs, and playground modules", () => {
    const modules = getModulesForRole("B2B_DEV").map((module) => module.id);

    assert.deepEqual(modules, ["home", "api-keys", "api-docs", "playground", "safety", "route-inventory"]);
  });

  it("does not expose privacy admin modules to read only users", () => {
    const modules = getModulesForRole("READ_ONLY").map((module) => module.id);

    assert.equal(modules.includes("consent"), false);
    assert.equal(modules.includes("ops"), false);
  });
});

describe("privacy redaction", () => {
  it("redacts direct identifiers, raw transcript markers, and API keys", () => {
    const unsafe = [
      "name: Kim Hana",
      "ssn: 900101-1234567",
      "address: 123 Seoul Road",
      "raw transcript: I feel unsafe",
      "sk_live_silvercare_secret",
    ].join(" | ");

    const safe = redactSensitiveText(unsafe);

    assert.equal(safe.includes("Kim Hana"), false);
    assert.equal(safe.includes("900101-1234567"), false);
    assert.equal(safe.includes("123 Seoul Road"), false);
    assert.equal(safe.toLowerCase().includes("raw transcript"), false);
    assert.equal(safe.includes("sk_live_silvercare_secret"), false);
  });
});

describe("API key one-time reveal", () => {
  it("reveals the raw key only in the issue result and never in the list", () => {
    const issued = issueApiKey("tenant_sandbox", "B2B_DEV");
    const listed = listApiKeys([issued.record]);

    assert.match(issued.rawKey, /^sk_sandbox_/);
    assert.equal("rawKey" in listed[0], false);
    assert.equal("keyHash" in listed[0], false);
  });
});
