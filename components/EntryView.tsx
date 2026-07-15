import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BundleEntry } from "@/lib/bundle/types";
import { bundlePathToHref } from "@/lib/bundle/url";
import { cn } from "@/lib/utils";
import { MarkdownBody } from "./MarkdownBody";

function ConceptHeader({
  frontmatter,
}: {
  frontmatter: Extract<BundleEntry, { kind: "concept" }>["frontmatter"];
}) {
  const tags = frontmatter.tags ?? [];
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{frontmatter.type}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-3xl">
          {frontmatter.title ?? "Untitled"}
        </CardTitle>
        {frontmatter.description ? (
          <CardDescription className="text-base">
            {frontmatter.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      {(frontmatter.resource || frontmatter.timestamp) && (
        <>
          <Separator />
          <CardContent className="grid gap-2 pt-4 text-sm sm:grid-cols-[auto_1fr]">
            {frontmatter.resource ? (
              <>
                <span className="font-medium text-muted-foreground">
                  Resource
                </span>
                <a
                  href={String(frontmatter.resource)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "h-auto justify-start break-all p-0",
                  )}
                >
                  {String(frontmatter.resource)}
                </a>
              </>
            ) : null}
            {frontmatter.timestamp ? (
              <>
                <span className="font-medium text-muted-foreground">
                  Updated
                </span>
                <code className="font-mono text-xs">
                  {String(frontmatter.timestamp)}
                </code>
              </>
            ) : null}
          </CardContent>
        </>
      )}
    </Card>
  );
}

export function EntryView({ entry }: { entry: BundleEntry }) {
  if (entry.kind === "missing") {
    return (
      <Alert>
        <AlertTitle>Missing Concept</AlertTitle>
        <AlertDescription>
          No file found for{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            {entry.path || "/"}
          </code>
          . Bundle Links to missing targets are soft-fail by design.
        </AlertDescription>
      </Alert>
    );
  }

  if (entry.kind === "concept") {
    return (
      <article>
        <ConceptHeader frontmatter={entry.frontmatter} />
        <MarkdownBody body={entry.body} fromRelPath={entry.path} />
      </article>
    );
  }

  if (entry.kind === "directory") {
    const fromPath = entry.path ? `${entry.path}/index.md` : "index.md";
    return (
      <article className="space-y-6">
        <div>
          <Badge variant="outline" className="mb-2">
            directory
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            {entry.path || "Bundle root"}
          </h1>
        </div>
        {entry.indexBody ? (
          <MarkdownBody body={entry.indexBody} fromRelPath={fromPath} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Contents</CardTitle>
              <CardDescription>
                No index.md — synthesized listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {entry.children.map((child) => (
                  <li key={child.path}>
                    <Link
                      href={bundlePathToHref(child.path)}
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "h-auto p-0",
                      )}
                    >
                      {child.title ?? child.name}
                    </Link>
                    {child.description ? (
                      <span className="text-muted-foreground">
                        {" "}
                        — {child.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
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
    <article>
      <div className="mb-6 space-y-2">
        <Badge variant="secondary">{entry.kind}</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Separator />
      </div>
      <MarkdownBody body={entry.body} fromRelPath={entry.path} />
    </article>
  );
}
