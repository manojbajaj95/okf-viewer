"use client";

import Link from "next/link";
import type { Components } from "react-markdown";
import { buttonVariants } from "@/components/ui/button";
import { bundlePathToHref, resolveMarkdownHref } from "@/lib/bundle/url";
import { cn } from "@/lib/utils";

export function createBundleLinkComponent(
  fromRelPath: string,
): Components["a"] {
  return function BundleLink({ href, children }) {
    if (!href) {
      return <span>{children}</span>;
    }

    const resolved = resolveMarkdownHref(href, fromRelPath);
    const className = cn(buttonVariants({ variant: "link" }), "h-auto p-0");

    if (resolved.kind === "external" && resolved.target) {
      return (
        <a
          href={resolved.target}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      );
    }

    if (resolved.kind === "bundle" && resolved.target) {
      return (
        <Link href={bundlePathToHref(resolved.target)} className={className}>
          {children}
        </Link>
      );
    }

    return <span className="text-muted-foreground">{children}</span>;
  };
}
