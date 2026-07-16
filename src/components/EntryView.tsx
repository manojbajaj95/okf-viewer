"use client";

import { FileTextIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { isLogEntry, useEntryLog } from "@/components/entry-log-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ConceptSummary } from "@/lib/bundle/graph";
import type { BundleEntry } from "@/lib/bundle/types";
import { bundlePathToHref } from "@/lib/bundle/url";
import { cn } from "@/lib/utils";
import { MarkdownBody } from "./MarkdownBody";

function directoryLabel(path: string): string {
  if (!path) {
    return "Bundle root";
  }
  const segment = path.split("/").pop() ?? path;
  return segment
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function childLabel(child: {
  name: string;
  kind: string;
  title?: string;
}): string {
  if (child.title) {
    return child.title;
  }
  if (child.kind === "dir") {
    return directoryLabel(child.name);
  }
  return child.name.replace(/\.md$/i, "");
}

function DirectoryChildren({
  items,
}: {
  items: Extract<BundleEntry, { kind: "directory" }>["children"];
}) {
  const visible = items
    .filter((child) => child.kind !== "index" && child.kind !== "log")
    .sort((a, b) => {
      if (a.kind === "dir" && b.kind !== "dir") {
        return -1;
      }
      if (a.kind !== "dir" && b.kind === "dir") {
        return 1;
      }
      return childLabel(a).localeCompare(childLabel(b));
    });

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">This folder is empty.</p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {visible.map((child) => {
        const Icon = child.kind === "dir" ? FolderIcon : FileTextIcon;
        const label = childLabel(child);

        return (
          <li key={child.path}>
            <Link
              href={bundlePathToHref(child.path)}
              className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none motion-reduce:transition-none"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">
                  {label}
                </span>
                {child.description ? (
                  <span className="mt-0.5 block text-sm text-muted-foreground text-pretty">
                    {child.description}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

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

function BacklinksSection({ backlinks }: { backlinks: ConceptSummary[] }) {
  if (backlinks.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 space-y-3" aria-label="Linked from">
      <h2 className="text-sm font-medium text-foreground">Linked from</h2>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {backlinks.map((item) => (
          <li key={item.id}>
            <Link
              href={bundlePathToHref(item.path)}
              className="flex flex-col gap-0.5 px-4 py-3 transition-colors duration-150 hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none motion-reduce:transition-none"
            >
              <span className="font-medium text-foreground">{item.title}</span>
              {item.description ? (
                <span className="text-sm text-muted-foreground text-pretty">
                  {item.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      <Separator />
    </section>
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

export function EntryView({
  entry,
  backlinks = [],
  logEntry,
}: {
  entry: BundleEntry;
  backlinks?: ConceptSummary[];
  logEntry?: BundleEntry;
}) {
  const { registerLog } = useEntryLog();
  const logToRegister = isLogEntry(entry)
    ? entry
    : isLogEntry(logEntry)
      ? logEntry
      : null;

  React.useEffect(() => {
    registerLog(logToRegister, entry.kind === "log");
    return () => registerLog(null);
  }, [logToRegister, entry.kind, registerLog]);

  if (entry.kind === "missing") {
    return (
      <article className="w-full max-w-3xl space-y-6">
        <Alert>
          <AlertTitle>Missing Concept</AlertTitle>
          <AlertDescription>
            No file found for{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
              {entry.path || "/"}
            </code>
            . Bundle Links to missing targets soft-fail by design — check the
            path or open another Concept from the Directory Tree.
          </AlertDescription>
        </Alert>
        <BacklinksSection backlinks={backlinks} />
      </article>
    );
  }

  if (entry.kind === "concept") {
    return (
      <article className="w-full max-w-3xl">
        <ConceptHeader frontmatter={entry.frontmatter} />
        <BacklinksSection backlinks={backlinks} />
        <MarkdownBody body={entry.body} fromRelPath={entry.path} />
      </article>
    );
  }

  if (entry.kind === "directory") {
    const fromPath = entry.path ? `${entry.path}/index.md` : "index.md";
    const title = directoryLabel(entry.path);

    return (
      <article className="w-full max-w-3xl">
        {entry.indexBody ? (
          <MarkdownBody
            body={entry.indexBody}
            fromRelPath={fromPath}
            className={cn(
              "[&_h1:first-of-type]:mt-0 [&_h1:first-of-type]:text-3xl",
              "[&_ul]:my-4 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:pl-0",
              "[&_li]:my-0 [&_li]:rounded-lg [&_li]:border [&_li]:border-border [&_li]:px-4 [&_li]:py-3 [&_li]:transition-colors [&_li]:duration-150 hover:[&_li]:bg-accent/40 motion-reduce:[&_li]:transition-none",
              "[&_li_p]:my-0",
            )}
          />
        ) : (
          <div className="space-y-6">
            <header className="space-y-3">
              <Badge variant="outline">directory</Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            </header>
            <section className="space-y-3" aria-label="Directory contents">
              <p className="text-sm text-muted-foreground">
                No index.md in this folder.
              </p>
              <DirectoryChildren items={entry.children} />
            </section>
          </div>
        )}
      </article>
    );
  }

  if (entry.kind === "log") {
    return (
      <article className="w-full max-w-3xl">
        <p className="text-sm text-muted-foreground">
          Use the log button in the header to open this change log.
        </p>
      </article>
    );
  }

  const title = entry.kind === "index" ? "Index" : (entry.title ?? entry.path);

  return (
    <article className="w-full max-w-3xl">
      <EntryChrome kind={entry.kind} title={title} />
      <MarkdownBody body={entry.body} fromRelPath={entry.path} />
    </article>
  );
}
