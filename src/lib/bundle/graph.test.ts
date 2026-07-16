import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildBundleGraph, getBacklinksFor } from "./graph";

const fixtureRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/sample-bundle",
);

describe("buildBundleGraph", () => {
  it("builds nodes for concepts", () => {
    const graph = buildBundleGraph(fixtureRoot);
    expect(graph.nodes.length).toBeGreaterThanOrEqual(3);
    const orders = graph.nodes.find((n) => n.id === "tables/orders");
    expect(orders?.title).toBe("Orders");
    expect(orders?.type).toBe("BigQuery Table");
  });

  it("builds edges from cross-links", () => {
    const graph = buildBundleGraph(fixtureRoot);
    expect(
      graph.edges.some(
        (e) => e.from === "tables/orders" && e.to === "tables/customers",
      ),
    ).toBe(true);
  });

  it("indexes backlinks", () => {
    const graph = buildBundleGraph(fixtureRoot);
    const backlinks = getBacklinksFor("tables/customers", graph);
    expect(backlinks.some((b) => b.id === "tables/orders")).toBe(true);
  });
});
