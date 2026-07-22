import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { openBundle } from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default function GraphPage() {
  const graph = openBundle().graph;

  return (
    <div className="w-full space-y-5">
      <header className="max-w-2xl space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Graph</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          See how Concepts connect across this Bundle. Find a Concept, inspect
          its nearest connections, or open it for the full context.
        </p>
      </header>
      <KnowledgeGraph graph={graph} />
    </div>
  );
}
