import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  extractMarkdownLinks,
  normalizeConceptId,
  resolveConceptLinks,
} from "./links";

const fixtureRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/sample-bundle",
);

describe("normalizeConceptId", () => {
  it("strips .md suffix", () => {
    expect(normalizeConceptId("tables/orders.md")).toBe("tables/orders");
  });

  it("leaves path without suffix unchanged", () => {
    expect(normalizeConceptId("tables/orders")).toBe("tables/orders");
  });
});

describe("extractMarkdownLinks", () => {
  it("extracts inline links", () => {
    const links = extractMarkdownLinks(
      "See [customers](/tables/customers.md) and [ext](https://example.com).",
    );
    expect(links.map((l) => l.href)).toEqual([
      "/tables/customers.md",
      "https://example.com",
    ]);
  });

  it("skips anchor-only links in extraction (filtered later)", () => {
    const links = extractMarkdownLinks("[section](#schema)");
    expect(links).toEqual([{ href: "#schema", label: "section" }]);
  });
});

describe("resolveConceptLinks", () => {
  it("resolves bundle links from orders concept", () => {
    const ordersPath = "data/warehouse/tables/orders.md";
    const body = readFileSync(join(fixtureRoot, ordersPath), "utf8")
      .split("---\n")
      .slice(2)
      .join("---\n");
    const targets = resolveConceptLinks(ordersPath, body);
    expect(targets).toContain("data/warehouse/tables/customers");
    expect(targets).toContain("data/warehouse/datasets/pos");
    expect(targets).toContain("data/warehouse/tables/does-not-exist");
  });

  it("excludes external URLs", () => {
    const targets = resolveConceptLinks("a.md", "[x](https://example.com/foo)");
    expect(targets).toEqual([]);
  });
});
