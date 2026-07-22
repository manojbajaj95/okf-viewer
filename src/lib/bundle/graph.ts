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
  /** target Concept ID → linking Concept IDs */
  backlinks: Record<string, string[]>;
};

export type ConceptSummary = GraphNode;
