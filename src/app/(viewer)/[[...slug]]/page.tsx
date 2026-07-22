import { EntryView } from "@/components/EntryView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { normalizeConceptId, openBundle, slugToRelPath } from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const rel = slugToRelPath(slug);

  try {
    const bundle = openBundle();
    const entry = bundle.readEntry(rel);
    const conceptId =
      entry.kind === "concept"
        ? normalizeConceptId(entry.path)
        : entry.kind === "missing"
          ? normalizeConceptId(entry.path)
          : null;
    const backlinks = conceptId ? bundle.backlinksFor(conceptId) : [];

    return <EntryView entry={entry} backlinks={backlinks} />;
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
