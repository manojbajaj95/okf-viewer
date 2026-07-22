export type TreeKind = "dir" | "concept" | "index" | "log" | "markdown";

export type TreeNode = {
  name: string;
  /** Bundle-relative path using `/` separators. Dirs have no trailing slash. */
  path: string;
  kind: TreeKind;
  children?: TreeNode[];
};

export type ConceptFrontmatter = {
  type: string;
  title?: string;
  description?: string;
  resource?: string;
  tags?: string[];
  timestamp?: string;
  [key: string]: unknown;
};

export type BundleEntry =
  | {
      kind: "concept";
      path: string;
      frontmatter: ConceptFrontmatter;
      body: string;
    }
  | {
      kind: "index";
      path: string;
      body: string;
      title?: string;
    }
  | {
      kind: "log";
      path: string;
      body: string;
      title?: string;
    }
  | {
      kind: "markdown";
      path: string;
      body: string;
      title?: string;
    }
  | {
      kind: "directory";
      path: string;
      /** Present when directory has index.md — body of that index. */
      indexBody?: string;
      children: Array<{
        name: string;
        path: string;
        kind: TreeKind;
        title?: string;
        description?: string;
      }>;
    }
  | {
      kind: "missing";
      path: string;
    };

export type BundleLogEntry = Extract<BundleEntry, { kind: "log" }>;

export type BundleLogRoute = {
  entry: BundleLogEntry;
  autoOpen: boolean;
};
