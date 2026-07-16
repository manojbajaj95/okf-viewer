import { dirname } from "node:path";
import { EntryView } from "@/components/EntryView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  buildBundleGraph,
  getBacklinksFor,
  getBundleRoot,
  normalizeConceptId,
  readEntry,
  slugToRelPath,
} from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const rel = slugToRelPath(slug);

  try {
    const root = getBundleRoot();
    const entry = readEntry(rel, root);
    const logDir =
      entry.kind === "directory"
        ? entry.path
        : entry.kind === "missing" || entry.kind === "log"
          ? null
          : dirname(entry.path).replace(/^\.$/, "");
    const logEntry =
      logDir === null
        ? undefined
        : readEntry(logDir ? `${logDir}/log.md` : "log.md", root);
    const graph = buildBundleGraph(root);
    const conceptId =
      entry.kind === "concept"
        ? normalizeConceptId(entry.path)
        : entry.kind === "missing"
          ? normalizeConceptId(entry.path)
          : null;
    const backlinks = conceptId ? getBacklinksFor(conceptId, graph) : [];

    return (
      <EntryView
        entry={entry}
        backlinks={backlinks}
        logEntry={logEntry?.kind === "log" ? logEntry : undefined}
      />
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <Alert variant="destructive">
        <AlertTitle>Cannot open Bundle</AlertTitle>
        <AlertDescription>
          {message}. Run via{" "}
          <code className="rounded bg-muted px-1">okf-viewer open [path]</code>.
        </AlertDescription>
      </Alert>
    );
  }
}
