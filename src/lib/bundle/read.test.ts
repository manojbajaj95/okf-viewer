import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listTree, readEntry } from "./read";
import { resolveMarkdownHref } from "./url";

const fixtureRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/sample-bundle",
);

describe("listTree", () => {
  it("lists dirs and markdown kinds", () => {
    const tree = listTree(fixtureRoot);
    const names = tree.map((n) => n.name);
    expect(names).toContain("operations");
    expect(names).toContain("data");
    expect(names).toContain("index.md");
    expect(names).toContain("log.md");
    expect(names).toContain("notes.md");

    const orders = tree
      .find((n) => n.name === "data")
      ?.children?.find((c) => c.name === "warehouse")
      ?.children?.find((c) => c.name === "tables")
      ?.children?.find((c) => c.name === "orders.md");
    expect(orders?.kind).toBe("concept");

    const notes = tree.find((n) => n.name === "notes.md");
    expect(notes?.kind).toBe("markdown");

    const log = tree.find((n) => n.name === "log.md");
    expect(log?.kind).toBe("log");
  });
});

describe("readEntry", () => {
  it("reads a concept by path without .md", () => {
    const entry = readEntry("data/warehouse/tables/orders", fixtureRoot);
    expect(entry.kind).toBe("concept");
    if (entry.kind === "concept") {
      expect(entry.frontmatter.type).toBe("BigQuery Table");
      expect(entry.frontmatter.title).toBe("Orders");
      expect(entry.body).toContain("# Schema");
    }
  });

  it("prefers index body for directories", () => {
    const entry = readEntry("data/warehouse/tables", fixtureRoot);
    expect(entry.kind).toBe("directory");
    if (entry.kind === "directory") {
      expect(entry.indexBody).toContain("Orders");
      expect(entry.children.some((c) => c.name === "orders.md")).toBe(true);
    }
  });

  it("returns missing for unknown paths", () => {
    const entry = readEntry("data/warehouse/tables/nope", fixtureRoot);
    expect(entry.kind).toBe("missing");
  });

  it("reads log as log", () => {
    const entry = readEntry("log.md", fixtureRoot);
    expect(entry.kind).toBe("log");
  });
});

describe("resolveMarkdownHref", () => {
  it("classifies external links", () => {
    expect(
      resolveMarkdownHref(
        "https://example.com",
        "data/warehouse/tables/orders.md",
      ).kind,
    ).toBe("external");
  });

  it("resolves bundle-absolute links", () => {
    const r = resolveMarkdownHref(
      "/data/warehouse/tables/customers.md",
      "data/warehouse/tables/orders.md",
    );
    expect(r.kind).toBe("bundle");
    expect(r.target).toBe("data/warehouse/tables/customers.md");
  });

  it("resolves relative links", () => {
    const r = resolveMarkdownHref(
      "./customers.md",
      "data/warehouse/tables/orders.md",
    );
    expect(r.kind).toBe("bundle");
    expect(r.target).toMatch(/customers\.md$/);
  });
});
