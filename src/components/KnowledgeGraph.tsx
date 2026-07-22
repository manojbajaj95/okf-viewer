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
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RotateCcwIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BundleGraph } from "@/lib/bundle/graph";
import { bundlePathToHref } from "@/lib/bundle/url";

type ConceptNodeData = {
  label: string;
  type: string;
  description?: string;
  tags: string[];
  path: string;
  color: string;
};

type LayoutDirection = "TB" | "LR";

const nodeWidth = 220;
const nodeHeight = 72;
const typeColors = [
  "#2563eb",
  "#059669",
  "#7c3aed",
  "#d97706",
  "#db2777",
  "#0891b2",
  "#dc2626",
];

function layoutElements(
  nodes: Node<ConceptNodeData>[],
  edges: Edge[],
  direction: LayoutDirection,
): { nodes: Node<ConceptNodeData>[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 40, ranksep: 60 });

  for (const node of nodes) {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);
  const horizontal = direction === "LR";

  return {
    nodes: nodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: {
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2,
        },
        targetPosition: horizontal ? Position.Left : Position.Top,
        sourcePosition: horizontal ? Position.Right : Position.Bottom,
      };
    }),
    edges,
  };
}

function ConceptNode({
  data,
  selected,
}: {
  data: ConceptNodeData;
  selected?: boolean;
}) {
  return (
    <div
      className={`w-[220px] rounded-lg border border-l-4 border-border bg-card px-3 py-2 shadow-sm transition-shadow ${
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : ""
      }`}
      style={{ borderLeftColor: data.color }}
    >
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

function GraphWorkspace({ graph }: { graph: BundleGraph }) {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [direction, setDirection] = useState<LayoutDirection>("TB");

  const types = useMemo(
    () => [...new Set(graph.nodes.map((node) => node.type))].sort(),
    [graph.nodes],
  );

  const initial = useMemo(() => {
    const colors = new Map(
      types.map((type, index) => [type, typeColors[index % typeColors.length]]),
    );
    const nodes: Node<ConceptNodeData>[] = graph.nodes.map((node) => ({
      id: node.id,
      type: "concept",
      position: { x: 0, y: 0 },
      data: {
        label: node.title,
        type: node.type,
        description: node.description,
        tags: node.tags ?? [],
        path: node.path,
        color: colors.get(node.type) ?? typeColors[0],
      },
    }));
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges: Edge[] = graph.edges
      .filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to))
      .map((edge, index) => ({
        id: `e-${index}-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
    return layoutElements(nodes, edges, "TB");
  }, [graph.edges, graph.nodes, types]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const matchingIds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return new Set(
      graph.nodes
        .filter((node) => {
          if (typeFilter && node.type !== typeFilter) {
            return false;
          }
          if (!normalizedQuery) {
            return true;
          }
          return [node.title, node.id, ...(node.tags ?? [])]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalizedQuery);
        })
        .map((node) => node.id),
    );
  }, [graph.nodes, query, typeFilter]);

  const filtersActive = query.trim() !== "" || typeFilter !== "";
  const displayedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: !filtersActive || matchingIds.has(node.id) ? 1 : 0.15,
        },
      })),
    [filtersActive, matchingIds, nodes],
  );
  const displayedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          opacity:
            !filtersActive ||
            (matchingIds.has(edge.source) && matchingIds.has(edge.target))
              ? 1
              : 0.1,
        },
      })),
    [edges, filtersActive, matchingIds],
  );

  const selected = graph.nodes.find((node) => node.id === selectedId);

  const onNodeClick = useCallback((_: unknown, node: Node<ConceptNodeData>) => {
    setSelectedId(node.id);
  }, []);

  const openConcept = useCallback(() => {
    if (selected) {
      router.push(bundlePathToHref(selected.path));
    }
  }, [router, selected]);

  const changeLayout = useCallback(
    (nextDirection: LayoutDirection) => {
      const next = layoutElements(nodes, edges, nextDirection);
      setDirection(nextDirection);
      setNodes(next.nodes);
      setEdges(next.edges);
      fitView({ duration: 200, padding: 0.15 });
    },
    [edges, fitView, nodes, setEdges, setNodes],
  );

  const resetView = useCallback(() => {
    setQuery("");
    setTypeFilter("");
    setSelectedId(null);
    fitView({ duration: 200, padding: 0.15 });
  }, [fitView]);

  if (graph.nodes.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        No Concepts with a type were found in this Bundle.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-3">
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label htmlFor="graph-search" className="relative min-w-56 flex-1">
          <span className="sr-only">Search graph</span>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="graph-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, ID, or tag"
            className="pl-9"
          />
        </label>
        <select
          aria-label="Filter graph by type"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          aria-label="Graph layout"
          value={direction}
          onChange={(event) =>
            changeLayout(event.target.value as LayoutDirection)
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="TB">Vertical layout</option>
          <option value="LR">Horizontal layout</option>
        </select>
        <Button type="button" variant="outline" onClick={resetView}>
          <RotateCcwIcon aria-hidden />
          Reset
        </Button>
        <span className="text-xs text-muted-foreground sm:ml-auto">
          {filtersActive
            ? `${matchingIds.size} of ${graph.nodes.length} Concepts`
            : `${graph.nodes.length} Concepts · ${edges.length} links`}
        </span>
      </div>

      <div className="flex h-[min(70vh,720px)] flex-col gap-4 lg:flex-row">
        <div className="min-h-[400px] flex-1 rounded-lg border border-border bg-muted/20">
          <ReactFlow
            nodes={displayedNodes}
            edges={displayedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
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
              <p className="break-all font-mono text-xs text-muted-foreground">
                {selected.id}
              </p>
              {selected.description ? (
                <p className="text-sm text-muted-foreground text-pretty">
                  {selected.description}
                </p>
              ) : null}
              {selected.tags?.length ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
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
    </div>
  );
}

export function KnowledgeGraph({ graph }: { graph: BundleGraph }) {
  return (
    <ReactFlowProvider>
      <GraphWorkspace graph={graph} />
    </ReactFlowProvider>
  );
}
