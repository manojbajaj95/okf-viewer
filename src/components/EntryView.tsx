"use client";

import {
  CalendarClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FolderIcon,
  TagsIcon,
} from "lucide-react";
import Link from "next/link";
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

function formatTimestamp(value: unknown): string {
  const raw = String(value);
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function resourceLabel(value: unknown): string {
  try {
    return new URL(String(value)).hostname.replace(/^www\./, "");
  } catch {
    return "Open resource";
  }
}

function ConceptHeader({
  frontmatter,
}: {
  frontmatter: Extract<BundleEntry, { kind: "concept" }>["frontmatter"];
}) {
  return (
    <header className="border-b border-border/70 pb-8">
      <Badge variant="secondary" className="mb-5">
        {frontmatter.type}
      </Badge>
      <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
        {frontmatter.title ?? "Untitled"}
      </h1>
      {frontmatter.description ? (
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
          {frontmatter.description}
        </p>
      ) : null}
    </header>
  );
}

function ConceptDetails({
  frontmatter,
}: {
  frontmatter: Extract<BundleEntry, { kind: "concept" }>["frontmatter"];
}) {
  const tags = frontmatter.tags ?? [];

  return (
    <aside
      aria-label="Concept details"
      className="space-y-6 lg:sticky lg:top-22"
    >
      <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Details
      </h2>
      {frontmatter.resource ? (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ExternalLinkIcon className="size-4 text-muted-foreground" />
            Resource
          </p>
          <a
            href={String(frontmatter.resource)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline motion-reduce:transition-none"
          >
            <span className="truncate">
              {resourceLabel(frontmatter.resource)}
            </span>
            <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden />
          </a>
        </div>
      ) : null}
      {frontmatter.timestamp ? (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <CalendarClockIcon className="size-4 text-muted-foreground" />
            Updated
          </p>
          <time
            dateTime={String(frontmatter.timestamp)}
            title={String(frontmatter.timestamp)}
            className="block text-sm text-muted-foreground"
          >
            {formatTimestamp(frontmatter.timestamp)}
          </time>
        </div>
      ) : null}
      {tags.length > 0 ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <TagsIcon className="size-4 text-muted-foreground" />
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function BacklinksSection({ backlinks }: { backlinks: ConceptSummary[] }) {
  if (backlinks.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-12 space-y-3 border-t border-border/70 pt-8"
      aria-label="Linked from"
    >
      <h2 className="text-lg font-semibold text-foreground">Linked from</h2>
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
}: {
  entry: BundleEntry;
  backlinks?: ConceptSummary[];
}) {
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
    const hasDetails = Boolean(
      entry.frontmatter.resource ||
        entry.frontmatter.timestamp ||
        entry.frontmatter.tags?.length,
    );

    return (
      <article className="w-full max-w-5xl">
        <ConceptHeader frontmatter={entry.frontmatter} />
        <div
          className={cn(
            "mt-8 grid items-start gap-10",
            hasDetails && "lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14",
          )}
        >
          <div className="min-w-0">
            <MarkdownBody body={entry.body} fromRelPath={entry.path} />
            <BacklinksSection backlinks={backlinks} />
          </div>
          {hasDetails ? (
            <ConceptDetails frontmatter={entry.frontmatter} />
          ) : null}
        </div>
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
