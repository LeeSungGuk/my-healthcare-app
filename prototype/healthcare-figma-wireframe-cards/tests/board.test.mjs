import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { boardColumns, screenCards, sourceSnapshot } from "../src/board-data.mjs";

describe("wireframe card board", () => {
  it("organizes the prototype into Figma-style workflow columns", () => {
    assert.deepEqual(
      boardColumns.map((column) => column.id),
      ["foundation", "developer", "playground", "operations", "governance"],
    );
  });

  it("contains one card per Partner Console surface", () => {
    const ids = screenCards.map((card) => card.id);

    assert.deepEqual(ids, [
      "home",
      "api-keys",
      "api-docs",
      "playground",
      "poc-report",
      "ops-monitoring",
      "review-queue",
      "consent-admin",
      "route-inventory",
    ]);
  });

  it("does not include out-of-scope consumer app cards", () => {
    const names = screenCards.map((card) => `${card.id} ${card.title}`.toLowerCase()).join(" ");

    assert.equal(names.includes("guardian"), false);
    assert.equal(names.includes("institution"), false);
    assert.equal(names.includes("elder app"), false);
  });

  it("keeps the captured homepage screenshot as the source image", () => {
    assert.equal(sourceSnapshot, "assets/silvercare-console-home.png");
  });
});
