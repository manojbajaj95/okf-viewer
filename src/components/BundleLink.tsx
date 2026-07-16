"use client";

import Link from "next/link";
import type { Components } from "react-markdown";
import { useConceptExists } from "@/components/bundle-graph-context";
import { normalizeConceptId } from "@/lib/bundle/links";
import { bundlePathToHref, resolveMarkdownHref } from "@/lib/bundle/url";
import { cn } from "@/lib/utils";

const linkClass =
  "font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline motion-reduce:transition-none";

const missingLinkClass =
  "font-medium text-muted-foreground underline decoration-dashed underline-offset-4 transition-colors duration-150 hover:text-foreground motion-reduce:transition-none";

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
        <BundleInternalLink target={resolved.target}>
          {children}
        </BundleInternalLink>
      );
    }

    return <span className={cn("text-muted-foreground")}>{children}</span>;
  };
}

function BundleInternalLink({
  target,
  children,
}: {
  target: string;
  children: React.ReactNode;
}) {
  const exists = useConceptExists(normalizeConceptId(target));

  return (
    <Link
      href={bundlePathToHref(target)}
      className={exists ? linkClass : missingLinkClass}
      title={exists ? undefined : "Missing Concept"}
    >
      {children}
    </Link>
  );
}
