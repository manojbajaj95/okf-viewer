import { remark } from "remark";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { resolveMarkdownHref } from "./url";

export type MarkdownLink = {
  href: string;
  label?: string;
};

/** Concept ID form: bundle-relative path without `.md` suffix. */
export function normalizeConceptId(relPath: string): string {
  const cleaned = relPath.replace(/^\/+/, "").replace(/\\/g, "/");
  return cleaned.endsWith(".md") ? cleaned.slice(0, -3) : cleaned;
}

/** Bundle-relative path with `.md` suffix for filesystem lookup. */
export function conceptIdToPath(conceptId: string): string {
  const cleaned = conceptId.replace(/^\/+/, "");
  return cleaned.endsWith(".md") ? cleaned : `${cleaned}.md`;
}

/**
 * Extract markdown link targets from a body (inline + reference definitions).
 */
export function extractMarkdownLinks(body: string): MarkdownLink[] {
  const tree = remark().use(remarkGfm).parse(body);
  const links: MarkdownLink[] = [];

  visit(tree, (node) => {
    if (node.type === "link" && "url" in node && typeof node.url === "string") {
      const label =
        "children" in node &&
        Array.isArray(node.children) &&
        node.children[0]?.type === "text"
          ? String(node.children[0].value)
          : undefined;
      links.push({ href: node.url, label });
    }
    if (
      node.type === "definition" &&
      "url" in node &&
      typeof node.url === "string"
    ) {
      links.push({ href: node.url });
    }
  });

  return links;
}

/**
 * Resolve cross-links in a concept body to bundle-relative concept IDs.
 * Skips anchors, external URLs, and unresolvable hrefs.
 */
export function resolveConceptLinks(
  fromRelPath: string,
  body: string,
): string[] {
  const seen = new Set<string>();
  const targets: string[] = [];

  for (const { href } of extractMarkdownLinks(body)) {
    if (!href || href.startsWith("#")) {
      continue;
    }
    const resolved = resolveMarkdownHref(href, fromRelPath);
    if (resolved.kind !== "bundle" || !resolved.target) {
      continue;
    }
    const id = normalizeConceptId(resolved.target);
    if (!seen.has(id)) {
      seen.add(id);
      targets.push(id);
    }
  }

  return targets;
}
