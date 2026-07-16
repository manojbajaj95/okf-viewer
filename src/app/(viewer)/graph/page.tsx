import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { buildBundleGraph, getBundleRoot } from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default function GraphPage() {
  const root = getBundleRoot();
  const graph = buildBundleGraph(root);

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Knowledge Graph
        </h1>
        <p className="text-sm text-muted-foreground">
          Cross-links between Concepts. Click a node to preview, then open the
          Concept View.
        </p>
      </header>
      <KnowledgeGraph graph={graph} />
    </div>
  );
}
