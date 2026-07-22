import { ViewerShell } from "@/components/viewer-shell";
import { openBundle } from "@/lib/bundle";
import type { BundleGraph } from "@/lib/bundle/graph";
import type { BundleLogRoute, TreeNode } from "@/lib/bundle/types";

export const dynamic = "force-dynamic";

const emptyGraph: BundleGraph = { nodes: [], edges: [], backlinks: {} };

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tree: TreeNode[] = [];
  let bundleLabel = "(OKF_BUNDLE_PATH not set)";
  let error: string | null = null;
  let graph: BundleGraph = emptyGraph;
  let logRoutes: Record<string, BundleLogRoute> = {};

  try {
    const bundle = openBundle();
    bundleLabel = bundle.root;
    tree = bundle.tree;
    graph = bundle.graph;
    logRoutes = bundle.logRoutes;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <ViewerShell
      nodes={tree}
      bundleLabel={bundleLabel}
      error={error}
      graph={graph}
      logRoutes={logRoutes}
    >
      {children}
    </ViewerShell>
  );
}
