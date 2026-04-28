/**
 * Synthetic fixture data for the SilverCare Partner Console prototype.
 *
 * Developer note:
 * - These records model the API, report, operations, and consent states needed
 *   for UI review without requiring a backend.
 *
 * AI agent note:
 * - Keep this file synthetic. Do not paste real elder profiles, raw transcripts,
 *   direct identifiers, production tenant IDs, or real API keys into fixtures.
 */
import { listApiKeys } from "./policies.mjs";

/**
 * Mock tenant catalog used by the topbar and route guard context.
 */
export const tenants = [
  {
    id: "tenant_sandbox",
    name: "SilverCare Sandbox",
    environment: "sandbox",
    region: "ap-northeast-2",
  },
];

/**
 * Mock authenticated session. Role can be changed in the UI role switcher.
 */
export const session = {
  userId: "user_partner_001",
  displayName: "Partner Operator",
  tenantId: "tenant_sandbox",
  defaultRole: "B2B_DEV",
};

/**
 * Safe API key list rows. `listApiKeys()` strips key hash material before export.
 */
export const apiKeyRecords = listApiKeys([
  {
    apiKeyId: "key_alpha_01",
    tenantId: "tenant_sandbox",
    status: "active",
    createdAt: "2026-04-28T08:10:00.000Z",
    revokedAt: null,
    lastUsedAt: "2026-04-28T08:42:00.000Z",
    keyHash: "hidden_hash_alpha",
  },
  {
    apiKeyId: "key_beta_02",
    tenantId: "tenant_sandbox",
    status: "revoked",
    createdAt: "2026-04-26T11:20:00.000Z",
    revokedAt: "2026-04-27T09:05:00.000Z",
    lastUsedAt: "2026-04-27T08:57:00.000Z",
    keyHash: "hidden_hash_beta",
  },
]);

/**
 * OpenAPI-like endpoint metadata used by API Docs and Playground defaults.
 */
export const apiEndpoints = [
  {
    id: "chat-reply",
    method: "POST",
    path: "/api/v1/chat/reply",
    summary: "Generate a safe companion reply from a sandbox utterance.",
    requestFields: [
      { name: "tenant_id", type: "string", required: true, sample: "tenant_sandbox" },
      { name: "device_id", type: "string", required: true, sample: "device_demo_01" },
      { name: "elder_id", type: "string", required: true, sample: "elder_demo_01" },
      { name: "utterance", type: "string", required: true, sample: "I feel lonely this evening." },
    ],
    responseFields: ["request_id", "reply_text", "risk_level", "safety_policy_applied"],
  },
  {
    id: "emotion",
    method: "POST",
    path: "/api/v1/analyze/emotion",
    summary: "Classify synthetic utterance sentiment and risk level.",
    requestFields: [
      { name: "tenant_id", type: "string", required: true, sample: "tenant_sandbox" },
      { name: "elder_id", type: "string", required: true, sample: "elder_demo_01" },
      { name: "utterance", type: "string", required: true, sample: "I skipped lunch and feel tired." },
    ],
    responseFields: ["request_id", "emotion_tags", "risk_level", "recommended_action"],
  },
  {
    id: "proactive",
    method: "POST",
    path: "/api/v1/schedule/proactive",
    summary: "Schedule a sandbox proactive check-in.",
    requestFields: [
      { name: "tenant_id", type: "string", required: true, sample: "tenant_sandbox" },
      { name: "device_id", type: "string", required: true, sample: "device_demo_02" },
      { name: "scenario", type: "enum", required: true, sample: "daily_check_in" },
    ],
    responseFields: ["request_id", "scheduled_at", "status"],
  },
  {
    id: "poc-report",
    method: "GET",
    path: "/api/v1/report/poc",
    summary: "Return aggregate PoC metrics for a selected period.",
    requestFields: [
      { name: "tenant_id", type: "string", required: true, sample: "tenant_sandbox" },
      { name: "period", type: "enum", required: true, sample: "last_7_days" },
    ],
    responseFields: ["active_devices", "active_elders", "conversation_count", "p95_latency_ms"],
  },
];

/**
 * Shared enum and standard error fixtures for API Docs.
 */
export const enumDefinitions = [
  { name: "risk_level", values: ["low", "medium", "high", "critical"] },
  { name: "recommended_action", values: ["none", "check_in", "review", "urgent_review"] },
  { name: "error_code", values: ["INVALID_REQUEST", "SAFETY_FILTERED", "LLM_TIMEOUT", "QUOTA_EXCEEDED"] },
];

export const standardErrors = [
  { code: "INVALID_REQUEST", http: 400, retryable: false, meaning: "Field validation failed before execution." },
  { code: "SAFETY_FILTERED", http: 200, retryable: false, meaning: "The safety policy changed the response path." },
  { code: "LLM_TIMEOUT", http: 504, retryable: true, meaning: "The upstream model did not respond in time." },
  { code: "QUOTA_EXCEEDED", http: 429, retryable: true, meaning: "The sandbox quota was exceeded." },
];

/**
 * Sandbox-only scenarios for fast reviewer walkthrough of normal, safety, and
 * error states.
 */
export const playgroundScenarios = [
  {
    id: "normal",
    label: "Normal check-in",
    type: "normal",
    endpointId: "chat-reply",
    profile: "elder_demo_01",
    utterance: "I finished my walk and took my medicine.",
    payload: {
      tenant_id: "tenant_sandbox",
      device_id: "device_demo_01",
      elder_id: "elder_demo_01",
      utterance: "I finished my walk and took my medicine.",
    },
  },
  {
    id: "safety",
    label: "Safety policy path",
    type: "safety",
    endpointId: "emotion",
    profile: "elder_demo_02",
    utterance: "I feel dizzy and need help soon.",
    payload: {
      tenant_id: "tenant_sandbox",
      elder_id: "elder_demo_02",
      utterance: "I feel dizzy and need help soon.",
    },
  },
  {
    id: "error",
    label: "Standard error",
    type: "error",
    endpointId: "chat-reply",
    profile: "elder_demo_03",
    utterance: "",
    payload: {
      tenant_id: "tenant_sandbox",
      device_id: "device_demo_03",
      elder_id: "elder_demo_03",
      utterance: "",
    },
  },
];

/**
 * Mock execution results keyed by scenario ID for the Response Viewer.
 */
export const playgroundResponses = {
  normal: {
    status: 200,
    latencyMs: 842,
    requestId: "req_sandbox_1001",
    body: {
      request_id: "req_sandbox_1001",
      reply_text: "Great. Keep the routine steady and check in again tonight.",
      risk_level: "low",
      safety_policy_applied: false,
    },
  },
  safety: {
    status: 200,
    latencyMs: 1150,
    requestId: "req_sandbox_1002",
    body: {
      request_id: "req_sandbox_1002",
      emotion_tags: ["fatigue", "concern"],
      risk_level: "high",
      recommended_action: "urgent_review",
      safety_policy_applied: true,
    },
  },
  error: {
    status: 400,
    latencyMs: 126,
    requestId: "req_sandbox_1003",
    error: {
      error_code: "INVALID_REQUEST",
      message: "utterance is required",
      request_id: "req_sandbox_1003",
      retryable: false,
    },
  },
};

/**
 * Aggregate-only report fixtures. No row-level user or conversation data lives
 * in this dataset.
 */
export const pocMetrics = [
  {
    period: "last_7_days",
    activeDevices: 128,
    activeElders: 118,
    conversationCount: 2479,
    p95LatencyMs: 1410,
    errorRate: 0.018,
    riskEventCount: 34,
  },
  {
    period: "last_30_days",
    activeDevices: 192,
    activeElders: 181,
    conversationCount: 10444,
    p95LatencyMs: 1584,
    errorRate: 0.021,
    riskEventCount: 126,
  },
];

/**
 * Masked operational log fixtures. Evidence is intentionally excerpted and
 * redacted for privacy review.
 */
export const opsLogs = [
  {
    requestId: "req_sandbox_1002",
    endpoint: "/api/v1/analyze/emotion",
    tenant: "tenant_sandbox",
    latencyMs: 1150,
    statusCode: 200,
    errorCode: "-",
    safetyPolicyApplied: true,
    alertStatus: "open",
    maskedEvidence: "I feel dizzy and need [masked]",
    riskLevel: "high",
    reviewStatus: "queued",
    modelVersion: "gemini-adapter-demo",
  },
  {
    requestId: "req_sandbox_1003",
    endpoint: "/api/v1/chat/reply",
    tenant: "tenant_sandbox",
    latencyMs: 126,
    statusCode: 400,
    errorCode: "INVALID_REQUEST",
    safetyPolicyApplied: false,
    alertStatus: "triaged",
    maskedEvidence: "Empty utterance validation",
    riskLevel: "low",
    reviewStatus: "not_required",
    modelVersion: "contract-validator",
  },
  {
    requestId: "req_sandbox_1004",
    endpoint: "/api/v1/chat/reply",
    tenant: "tenant_sandbox",
    latencyMs: 2210,
    statusCode: 504,
    errorCode: "LLM_TIMEOUT",
    safetyPolicyApplied: false,
    alertStatus: "open",
    maskedEvidence: "Timeout after upstream delay",
    riskLevel: "medium",
    reviewStatus: "queued",
    modelVersion: "gemini-adapter-demo",
  },
];

/**
 * Pseudonymous consent and deletion job fixtures for Privacy Admin review.
 */
export const consentRecords = [
  {
    elderId: "elder_demo_01",
    deviceId: "device_demo_01",
    dimensions: {
      companionReply: "granted",
      emotionAnalysis: "granted",
      proactiveCheckIn: "granted",
      reportAggregation: "granted",
      retention: "limited",
      humanReview: "granted",
    },
    memoryEnabled: true,
    deletionJobStatus: "none",
    requestId: "-",
  },
  {
    elderId: "elder_demo_02",
    deviceId: "device_demo_02",
    dimensions: {
      companionReply: "granted",
      emotionAnalysis: "granted",
      proactiveCheckIn: "withdrawn",
      reportAggregation: "granted",
      retention: "withdrawn",
      humanReview: "granted",
    },
    memoryEnabled: false,
    deletionJobStatus: "queued",
    requestId: "del_sandbox_2201",
  },
];
