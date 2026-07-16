"use client";

import type * as React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { createBundleLinkComponent } from "./BundleLink";

const prose = [
  "max-w-[72ch] space-y-5 text-foreground",
  "[&_hr]:my-8",
  "[&_img]:my-6 [&_img]:rounded-xl [&_img]:border [&_img]:border-border/60",
  "[&_strong]:font-semibold",
  "[&_em]:text-muted-foreground",
  "[&>h1:first-child]:mt-0 [&>h2:first-child]:pt-0 [&>h3:first-child]:pt-0",
].join(" ");

function MarkdownTable({ children }: { children?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <Table>{children}</Table>
    </div>
  );
}

function MarkdownCodeBlock({
  children,
  className,
}: React.ComponentProps<"pre">) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 py-0">
      <CardContent className="overflow-x-auto px-4 py-4">
        <pre
          className={cn(
            "font-mono text-[0.8125rem] leading-6 text-foreground",
            className,
          )}
        >
          {children}
        </pre>
      </CardContent>
    </Card>
  );
}

export function MarkdownBody({
  body,
  fromRelPath,
  className,
}: {
  body: string;
  fromRelPath: string;
  className?: string;
}) {
  const BundleLink = createBundleLinkComponent(fromRelPath);

  return (
    <div className={cn(prose, className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: BundleLink,
          p: ({ children }) => (
            <p className="leading-7 text-foreground/95 text-pretty">
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-5 text-2xl font-semibold tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="pt-3 text-xl font-semibold tracking-tight text-foreground">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6 marker:font-medium marker:text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7 text-foreground/95">{children}</li>
          ),
          blockquote: ({ children }) => (
            <Alert className="border-border/70 bg-muted/40">
              <AlertDescription className="text-sm leading-7 text-foreground/80 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                {children}
              </AlertDescription>
            </Alert>
          ),
          code: ({ children, className }) => {
            const isBlock =
              typeof className === "string" &&
              /\blanguage-|\bhljs\b/.test(className);

            if (isBlock) {
              return <code className={className}>{children}</code>;
            }

            return (
              <code className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground">
                {children}
              </code>
            );
          },
          pre: ({ children, className }) => (
            <MarkdownCodeBlock className={className}>
              {children}
            </MarkdownCodeBlock>
          ),
          hr: () => <Separator className="my-8" />,
          table: ({ children }) => <MarkdownTable>{children}</MarkdownTable>,
          thead: ({ children }) => <TableHeader>{children}</TableHeader>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => (
            <TableHead className="h-auto bg-muted/30 px-3 py-2 align-top text-foreground">
              {children}
            </TableHead>
          ),
          td: ({ children }) => (
            <TableCell className="px-3 py-2 align-top whitespace-normal text-muted-foreground">
              {children}
            </TableCell>
          ),
        }}
      >
        {body}
      </Markdown>
    </div>
  );
}
