import { existsSync, lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import {
  resolveBundlePath as resolveFilesystemPath,
  shouldSkipName,
  toPosixRelative,
} from "./filesystem.mjs";

export function getBundleRoot(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.OKF_BUNDLE_PATH;
  if (!raw || raw.trim() === "") {
    throw new Error("OKF_BUNDLE_PATH is not set");
  }
  const root = resolve(raw);
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new Error(`OKF_BUNDLE_PATH is not a directory: ${root}`);
  }
  return realpathSync(root);
}

/**
 * Resolve a bundle-relative path (POSIX-style) to an absolute path under root.
 * Rejects escapes outside the bundle.
 */
export function resolveBundlePath(root: string, relPath: string): string {
  return resolveFilesystemPath(root, relPath);
}

export { shouldSkipName, toPosixRelative };
export { bundlePathToHref, slugToRelPath } from "./url";
