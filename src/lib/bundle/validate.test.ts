import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateBundle } from "./validate-bundle.mjs";

const sampleRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/sample-bundle",
);
const conformantRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/conformant-bundle",
);
const invalidRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/invalid-bundle",
);

describe("validateBundle", () => {
  it("accepts conformant-bundle", () => {
    const result = validateBundle(conformantRoot);
    expect(result.conformant).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.conceptCount).toBeGreaterThan(0);
  });

  it("rejects sample-bundle with best-effort markdown file", () => {
    const result = validateBundle(sampleRoot);
    expect(result.conformant).toBe(false);
    expect(result.errors.some((e) => e.path === "notes.md")).toBe(true);
  });

  it("rejects bundle with missing frontmatter", () => {
    const result = validateBundle(invalidRoot);
    expect(result.conformant).toBe(false);
    expect(result.errors.some((e) => e.rule === "§9.1")).toBe(true);
  });

  it("rejects empty type", () => {
    const result = validateBundle(invalidRoot);
    expect(result.errors.some((e) => e.rule === "§9.2")).toBe(true);
  });
});
