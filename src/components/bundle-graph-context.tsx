"use client";

import { createContext, useContext } from "react";
import type { BundleGraph } from "@/lib/bundle/graph";

const BundleGraphContext = createContext<BundleGraph | null>(null);

export function BundleGraphProvider({
  graph,
  children,
}: {
  graph: BundleGraph;
  children: React.ReactNode;
}) {
  return (
    <BundleGraphContext.Provider value={graph}>
      {children}
    </BundleGraphContext.Provider>
  );
}

export function useBundleGraph(): BundleGraph | null {
  return useContext(BundleGraphContext);
}

export function useConceptExists(conceptId: string): boolean {
  const graph = useBundleGraph();
  if (!graph) {
    return true;
  }
  const normalized = conceptId.replace(/^\/+/, "").replace(/\.md$/i, "");
  return graph.nodes.some((n) => n.id === normalized);
}
