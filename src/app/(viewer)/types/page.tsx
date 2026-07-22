import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { openBundle } from "@/lib/bundle";
import { bundlePathToHref } from "@/lib/bundle/url";

export const dynamic = "force-dynamic";

export default function TypesPage() {
  const graph = openBundle().graph;

  const byType = new Map<string, typeof graph.nodes>();
  for (const node of graph.nodes) {
    if (!byType.has(node.type)) {
      byType.set(node.type, []);
    }
    byType.get(node.type)?.push(node);
  }

  const sortedTypes = [...byType.keys()].sort((a, b) => a.localeCompare(b));

  return (
    <article className="w-full max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Types</h1>
        <p className="text-sm text-muted-foreground">
          Concepts grouped by frontmatter type.
        </p>
      </header>
      {sortedTypes.map((type) => (
        <section key={type} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">{type}</h2>
            <Badge variant="outline">{byType.get(type)?.length ?? 0}</Badge>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {(byType.get(type) ?? []).map((node) => (
              <li key={node.id}>
                <Link
                  href={bundlePathToHref(node.path)}
                  className="flex flex-col gap-0.5 px-4 py-3 transition-colors duration-150 hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none motion-reduce:transition-none"
                >
                  <span className="font-medium text-foreground">
                    {node.title}
                  </span>
                  {node.description ? (
                    <span className="text-sm text-muted-foreground text-pretty">
                      {node.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
