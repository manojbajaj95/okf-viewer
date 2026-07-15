import { dirname, join, normalize, relative, resolve, sep } from "node:path";

/**
 * Resolve a logical path under `root` without touching the filesystem.
 * Throws if the result would escape `root`.
 */
export function resolveUnderRoot(root: string, relPath: string): string {
  const cleaned = relPath.replace(/^\/+/, "").replaceAll("\\", "/");
  const absolute = normalize(
    resolve(root, ...cleaned.split("/").filter(Boolean)),
  );
  const rel = relative(root, absolute);
  if (rel.startsWith("..") || !absolute.startsWith(root)) {
    throw new Error(`Path escapes bundle root: ${relPath}`);
  }
  return absolute;
}

export function toPosixRelative(root: string, absolute: string): string {
  return relative(root, absolute).split(sep).join("/");
}

/** Map URL slug segments to a bundle-relative path candidate (no leading slash). */
export function slugToRelPath(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) {
    return "";
  }
  return slug.map((s) => decodeURIComponent(s)).join("/");
}

/**
 * Viewer URL path for a bundle-relative path (file or dir).
 * Strips trailing `.md` for nicer URLs.
 */
export function bundlePathToHref(relPath: string): string {
  const cleaned = relPath.replace(/^\/+/, "");
  if (cleaned === "" || cleaned === ".") {
    return "/";
  }
  const withoutMd = cleaned.endsWith(".md") ? cleaned.slice(0, -3) : cleaned;
  return `/${withoutMd.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Resolve a markdown href to an external URL or bundle-relative path.
 * Does not check that the target exists (soft-fail at page load).
 */
export function resolveMarkdownHref(
  href: string,
  fromRelPath: string,
): { kind: "external" | "bundle" | "invalid"; target?: string } {
  if (!href || href.startsWith("#")) {
    return { kind: "invalid" };
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return { kind: "external", target: href };
  }

  let targetRel: string;
  if (href.startsWith("/")) {
    targetRel = href.replace(/^\/+/, "");
  } else {
    const fromDir = fromRelPath.endsWith(".md")
      ? dirname(fromRelPath)
      : fromRelPath;
    const base = !fromDir || fromDir === "." ? "" : fromDir;
    targetRel = (base ? join(base, href) : href).split("\\").join("/");
  }

  // Normalize . and .. with a fake root so we can detect escapes
  const fakeRoot = "/__okf_bundle__";
  try {
    const abs = resolveUnderRoot(fakeRoot, targetRel);
    const posix = toPosixRelative(fakeRoot, abs);
    return { kind: "bundle", target: posix };
  } catch {
    return { kind: "invalid" };
  }
}
