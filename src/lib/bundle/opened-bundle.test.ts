import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { openBundle } from "./opened-bundle";
import { resolveMarkdownHref } from "./url";

const fixtureRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/sample-bundle",
);

describe("openBundle", () => {
  it("lists dirs and markdown kinds", () => {
    const tree = openBundle(fixtureRoot).tree;
    const names = tree.map((n) => n.name);
    expect(names).toContain("operations");
    expect(names).toContain("data");
    expect(names).not.toContain("index.md");
    expect(names).not.toContain("log.md");
    expect(names).toContain("notes.md");

    const orders = tree
      .find((n) => n.name === "data")
      ?.children?.find((c) => c.name === "warehouse")
      ?.children?.find((c) => c.name === "tables")
      ?.children?.find((c) => c.name === "orders.md");
    expect(orders?.kind).toBe("concept");

    const notes = tree.find((n) => n.name === "notes.md");
    expect(notes?.kind).toBe("markdown");
  });
});

describe("opened Bundle entries", () => {
  const bundle = openBundle(fixtureRoot);

  it("reuses the opened Bundle", () => {
    expect(openBundle(fixtureRoot)).toBe(bundle);
  });

  it("reads a concept by path without .md", () => {
    const entry = bundle.readEntry("data/warehouse/tables/orders");
    expect(entry.kind).toBe("concept");
    if (entry.kind === "concept") {
      expect(entry.frontmatter.type).toBe("BigQuery Table");
      expect(entry.frontmatter.title).toBe("Orders");
      expect(entry.body).toContain("# Schema");
    }
  });

  it("prefers index body for directories", () => {
    const entry = bundle.readEntry("data/warehouse/tables");
    expect(entry.kind).toBe("directory");
    if (entry.kind === "directory") {
      expect(entry.indexBody).toContain("Orders");
      expect(entry.children.some((c) => c.name === "orders.md")).toBe(true);
    }
  });

  it("returns missing for unknown paths", () => {
    const entry = bundle.readEntry("data/warehouse/tables/nope");
    expect(entry.kind).toBe("missing");
  });

  it("reads log as log", () => {
    const entry = bundle.readEntry("log.md");
    expect(entry.kind).toBe("log");
  });

  it("indexes Logs by Viewer route", () => {
    expect(bundle.logRoutes["/notes"]?.entry.path).toBe("log.md");
    expect(bundle.logRoutes["/data"]?.entry.path).toBe("data/log.md");
    expect(bundle.logRoutes["/log"]?.autoOpen).toBe(true);
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
