import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BundleEntry } from "@/lib/bundle/types";
import { bundlePathToHref } from "@/lib/bundle/url";
import { MarkdownBody } from "./MarkdownBody";

function ConceptHeader({
  frontmatter,
}: {
  frontmatter: Extract<BundleEntry, { kind: "concept" }>["frontmatter"];
}) {
  const tags = frontmatter.tags ?? [];
  const hasMeta = Boolean(frontmatter.resource || frontmatter.timestamp);

  return (
    <header className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{frontmatter.type}</Badge>
        {tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {frontmatter.title ?? "Untitled"}
        </h1>
        {frontmatter.description ? (
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground text-pretty">
            {frontmatter.description}
          </p>
        ) : null}
      </div>
      {hasMeta ? (
        <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[6.5rem_1fr]">
          {frontmatter.resource ? (
            <>
              <dt className="font-medium text-muted-foreground">Resource</dt>
              <dd>
                <a
                  href={String(frontmatter.resource)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary underline-offset-4 transition-colors duration-150 hover:underline motion-reduce:transition-none"
                >
                  {String(frontmatter.resource)}
                </a>
              </dd>
            </>
          ) : null}
          {frontmatter.timestamp ? (
            <>
              <dt className="font-medium text-muted-foreground">Updated</dt>
              <dd>
                <time className="font-mono text-xs text-foreground">
                  {String(frontmatter.timestamp)}
                </time>
              </dd>
            </>
          ) : null}
        </dl>
      ) : null}
      <Separator />
    </header>
  );
}

function EntryChrome({ kind, title }: { kind: string; title: string }) {
  return (
    <header className="mb-8 space-y-3">
      <Badge variant="secondary">{kind}</Badge>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <Separator />
    </header>
  );
}

export function EntryView({ entry }: { entry: BundleEntry }) {
  if (entry.kind === "missing") {
    return (
      <Alert>
        <AlertTitle>Missing Concept</AlertTitle>
        <AlertDescription>
          No file found for{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            {entry.path || "/"}
          </code>
          . Bundle Links to missing targets soft-fail by design — check the path
          or open another Concept from the Directory Tree.
        </AlertDescription>
      </Alert>
    );
  }

  if (entry.kind === "concept") {
    return (
      <article className="w-full max-w-3xl">
        <ConceptHeader frontmatter={entry.frontmatter} />
        <MarkdownBody body={entry.body} fromRelPath={entry.path} />
      </article>
    );
  }

  if (entry.kind === "directory") {
    const fromPath = entry.path ? `${entry.path}/index.md` : "index.md";
    return (
      <article className="w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <Badge variant="outline">directory</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            {entry.path || "Bundle root"}
          </h1>
        </header>
        {entry.indexBody ? (
          <MarkdownBody body={entry.indexBody} fromRelPath={fromPath} />
        ) : (
          <section className="space-y-3" aria-label="Directory contents">
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-foreground">Contents</h2>
              <p className="text-sm text-muted-foreground">
                No index.md — listing Concepts in this directory
              </p>
            </div>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {entry.children.map((child) => (
                <li key={child.path}>
                  <Link
                    href={bundlePathToHref(child.path)}
                    className="flex flex-col gap-0.5 px-4 py-3 transition-colors duration-150 hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none motion-reduce:transition-none"
                  >
                    <span className="font-medium text-foreground">
                      {child.title ?? child.name}
                    </span>
                    {child.description ? (
                      <span className="text-sm text-muted-foreground text-pretty">
                        {child.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    );
  }

  const title =
    entry.kind === "log"
      ? "Log"
      : entry.kind === "index"
        ? "Index"
        : (entry.title ?? entry.path);

  return (
    <article className="w-full max-w-3xl">
      <EntryChrome kind={entry.kind} title={title} />
      <MarkdownBody body={entry.body} fromRelPath={entry.path} />
    </article>
  );
}
