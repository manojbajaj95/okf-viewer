import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bundlePathToHref, resolveBundlePath, slugToRelPath } from "./paths";

const fixtureRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../fixtures/sample-bundle",
);

describe("resolveBundlePath", () => {
  it("resolves a normal relative path", () => {
    const abs = resolveBundlePath(fixtureRoot, "tables/orders.md");
    expect(abs.endsWith(`${join("tables", "orders.md")}`)).toBe(true);
  });

  it("rejects path escape", () => {
    expect(() => resolveBundlePath(fixtureRoot, "../outside.md")).toThrow(
      /escapes/,
    );
  });

  it("rejects absolute-looking escape via normalization", () => {
    expect(() =>
      resolveBundlePath(fixtureRoot, "tables/../../outside.md"),
    ).toThrow(/escapes/);
  });
});

describe("slugToRelPath / bundlePathToHref", () => {
  it("joins slug segments", () => {
    expect(slugToRelPath(["tables", "orders"])).toBe("tables/orders");
  });

  it("maps empty slug to root href", () => {
    expect(bundlePathToHref("")).toBe("/");
    expect(bundlePathToHref("tables/orders.md")).toBe("/tables/orders");
  });
});
