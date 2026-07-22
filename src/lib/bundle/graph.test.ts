import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { openBundle } from "./opened-bundle";

const fixtureRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../fixtures/sample-bundle",
);

describe("opened Bundle graph", () => {
  const bundle = openBundle(fixtureRoot);
  const graph = bundle.graph;

  it("builds nodes for concepts", () => {
    expect(graph.nodes.length).toBeGreaterThanOrEqual(3);
    const orders = graph.nodes.find(
      (n) => n.id === "data/warehouse/tables/orders",
    );
    expect(orders?.title).toBe("Orders");
    expect(orders?.type).toBe("BigQuery Table");
  });

  it("builds edges from cross-links", () => {
    expect(
      graph.edges.some(
        (e) =>
          e.from === "data/warehouse/tables/orders" &&
          e.to === "data/warehouse/tables/customers",
      ),
    ).toBe(true);
  });

  it("indexes backlinks", () => {
    const backlinks = bundle.backlinksFor("data/warehouse/tables/customers");
    expect(backlinks.some((b) => b.id === "data/warehouse/tables/orders")).toBe(
      true,
    );
  });
});
