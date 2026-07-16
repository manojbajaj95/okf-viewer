import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  conceptIdToPath,
  normalizeConceptId,
  resolveConceptLinks,
} from "./links";
import { getBundleRoot, resolveBundlePath } from "./paths";
import { listTree } from "./read";
import type { TreeNode } from "./types";

export type GraphNode = {
  id: string;
  path: string;
  title: string;
  type: string;
  description?: string;
  tags?: string[];
};

export type GraphEdge = {
  from: string;
  to: string;
};

export type BundleGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** target concept ID → linking concept IDs */
  backlinks: Record<string, string[]>;
};

export type ConceptSummary = {
  id: string;
  path: string;
  title: string;
  type: string;
  description?: string;
  tags?: string[];
};

function walkConceptFiles(
  nodes: TreeNode[],
  root: string,
  out: { relPath: string; absPath: string }[],
): void {
  for (const node of nodes) {
    if (node.kind === "concept") {
      out.push({
        relPath: node.path,
        absPath: join(root, node.path),
      });
    }
    if (node.children) {
      walkConceptFiles(node.children, root, out);
    }
  }
}

function readConceptMeta(absPath: string, relPath: string): ConceptSummary {
  const raw = readFileSync(absPath, "utf8");
  const { data } = matter(raw);
  const type = typeof data.type === "string" ? data.type.trim() : "";
  const title =
    typeof data.title === "string"
      ? data.title
      : (relPath.replace(/\.md$/i, "").split("/").pop() ?? relPath);
  const description =
    typeof data.description === "string" ? data.description : undefined;
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : undefined;
  const id = normalizeConceptId(relPath);

  return { id, path: relPath, title, type, description, tags };
}

export function buildBundleGraph(root = getBundleRoot()): BundleGraph {
  const tree = listTree(root);
  const conceptFiles: { relPath: string; absPath: string }[] = [];
  walkConceptFiles(tree, root, conceptFiles);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const backlinks: Record<string, string[]> = {};
  const bodies = new Map<string, string>();

  for (const { relPath, absPath } of conceptFiles) {
    const raw = readFileSync(absPath, "utf8");
    const { data, content } = matter(raw);
    const type = typeof data.type === "string" ? data.type.trim() : "";
    if (!type) {
      continue;
    }
    const meta = readConceptMeta(absPath, relPath);
    nodes.push({
      id: meta.id,
      path: meta.path,
      title: meta.title,
      type: meta.type,
      description: meta.description,
      tags: meta.tags,
    });
    bodies.set(relPath, content.trimStart());
  }

  for (const node of nodes) {
    const body = bodies.get(node.path) ?? "";
    const targets = resolveConceptLinks(node.path, body);
    for (const targetId of targets) {
      edges.push({ from: node.id, to: targetId });
      if (!backlinks[targetId]) {
        backlinks[targetId] = [];
      }
      if (!backlinks[targetId].includes(node.id)) {
        backlinks[targetId].push(node.id);
      }
    }
  }

  return { nodes, edges, backlinks };
}

export function listConcepts(root = getBundleRoot()): ConceptSummary[] {
  return buildBundleGraph(root).nodes;
}

export function getBacklinksFor(
  conceptId: string,
  graph: BundleGraph,
): ConceptSummary[] {
  const linkerIds = graph.backlinks[normalizeConceptId(conceptId)] ?? [];
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  return linkerIds
    .map((id) => byId.get(id))
    .filter((n): n is GraphNode => n !== undefined)
    .map((n) => ({
      id: n.id,
      path: n.path,
      title: n.title,
      type: n.type,
      description: n.description,
      tags: n.tags,
    }));
}

export function conceptPathExists(root: string, conceptId: string): boolean {
  try {
    const abs = resolveBundlePath(root, conceptIdToPath(conceptId));
    return existsSync(abs) && statSync(abs).isFile();
  } catch {
    return false;
  }
}
