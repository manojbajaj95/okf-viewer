import { ViewerShell } from "@/components/viewer-shell";
import { buildBundleGraph, getBundleRoot, listTree } from "@/lib/bundle";
import type { BundleGraph } from "@/lib/bundle/graph";

export const dynamic = "force-dynamic";

const emptyGraph: BundleGraph = { nodes: [], edges: [], backlinks: {} };

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tree: ReturnType<typeof listTree> = [];
  let bundleLabel = "(OKF_BUNDLE_PATH not set)";
  let error: string | null = null;
  let graph: BundleGraph = emptyGraph;

  try {
    const root = getBundleRoot();
    bundleLabel = root;
    tree = listTree(root);
    graph = buildBundleGraph(root);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <ViewerShell
      nodes={tree}
      bundleLabel={bundleLabel}
      error={error}
      graph={graph}
    >
      {children}
    </ViewerShell>
  );
}
