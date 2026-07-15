"use client";

import Link from "next/link";
import type { Components } from "react-markdown";
import { bundlePathToHref, resolveMarkdownHref } from "@/lib/bundle/url";
import { cn } from "@/lib/utils";

const linkClass =
  "font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline motion-reduce:transition-none";

export function createBundleLinkComponent(
  fromRelPath: string,
): Components["a"] {
  return function BundleLink({ href, children }) {
    if (!href) {
      return <span>{children}</span>;
    }

    const resolved = resolveMarkdownHref(href, fromRelPath);

    if (resolved.kind === "external" && resolved.target) {
      return (
        <a
          href={resolved.target}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {children}
        </a>
      );
    }

    if (resolved.kind === "bundle" && resolved.target) {
      return (
        <Link href={bundlePathToHref(resolved.target)} className={linkClass}>
          {children}
        </Link>
      );
    }

    return (
      <span className={cn("text-muted-foreground")} title="Missing Concept">
        {children}
      </span>
    );
  };
}
