import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { openBundle } from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default function GraphPage() {
  const graph = openBundle().graph;

  return (
    <div className="w-full space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Knowledge Graph
        </h1>
        <p className="text-sm text-muted-foreground">
          Search and filter cross-links between Concepts. Select a node to
          preview it, then open the full Concept View.
        </p>
      </header>
      <KnowledgeGraph graph={graph} />
    </div>
  );
}
