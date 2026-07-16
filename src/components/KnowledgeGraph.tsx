"use client";

import Dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  type Edge,
  MarkerType,
  type Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BundleGraph } from "@/lib/bundle/graph";
import { bundlePathToHref } from "@/lib/bundle/url";

type ConceptNodeData = {
  label: string;
  type: string;
  description?: string;
  path: string;
};

const nodeWidth = 220;
const nodeHeight = 72;

function layoutElements(
  nodes: Node<ConceptNodeData>[],
  edges: Edge[],
): { nodes: Node<ConceptNodeData>[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60 });

  for (const node of nodes) {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  const laidOut = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  return { nodes: laidOut, edges };
}

function ConceptNode({ data }: { data: ConceptNodeData }) {
  return (
    <div className="w-[220px] rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="truncate text-sm font-medium text-foreground">
        {data.label}
      </p>
      <Badge
        variant="secondary"
        className="mt-1 max-w-full truncate text-[10px]"
      >
        {data.type}
      </Badge>
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

export function KnowledgeGraph({ graph }: { graph: BundleGraph }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initial = useMemo(() => {
    const nodes: Node<ConceptNodeData>[] = graph.nodes.map((n) => ({
      id: n.id,
      type: "concept",
      position: { x: 0, y: 0 },
      data: {
        label: n.title,
        type: n.type,
        description: n.description,
        path: n.path,
      },
    }));
    const edges: Edge[] = graph.edges.map((e, i) => ({
      id: `e-${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed },
    }));
    return layoutElements(nodes, edges);
  }, [graph]);

  const [nodes, , onNodesChange] = useNodesState(initial.nodes);
  const [edges, , onEdgesChange] = useEdgesState(initial.edges);

  const selected = graph.nodes.find((n) => n.id === selectedId);

  const onNodeClick = useCallback((_: unknown, node: Node<ConceptNodeData>) => {
    setSelectedId(node.id);
  }, []);

  const openConcept = useCallback(() => {
    if (selected) {
      router.push(bundlePathToHref(selected.path));
    }
  }, [router, selected]);

  return (
    <div className="flex h-[min(70vh,720px)] w-full max-w-6xl flex-col gap-4 lg:flex-row">
      <div className="min-h-[400px] flex-1 rounded-lg border border-border bg-muted/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background gap={16} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {selected ? (
        <aside className="w-full shrink-0 space-y-4 rounded-lg border border-border bg-card p-4 lg:w-72">
          <div className="space-y-2">
            <Badge variant="secondary">{selected.type}</Badge>
            <h2 className="text-lg font-semibold tracking-tight">
              {selected.title}
            </h2>
            {selected.description ? (
              <p className="text-sm text-muted-foreground text-pretty">
                {selected.description}
              </p>
            ) : null}
          </div>
          <Button type="button" className="w-full" onClick={openConcept}>
            Open Concept
          </Button>
        </aside>
      ) : (
        <aside className="flex w-full items-center justify-center rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground lg:w-72">
          Select a node to preview
        </aside>
      )}
    </div>
  );
}
