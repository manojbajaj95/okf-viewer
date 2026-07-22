"use client";

import Dagre from "@dagrejs/dagre";
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeMouseHandler,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowRightIcon,
  NetworkIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BundleGraph } from "@/lib/bundle/graph";
import { bundlePathToHref } from "@/lib/bundle/url";

type LayoutDirection = "TB" | "LR";

type ConceptNodeData = {
  label: string;
  type: string;
  path: string;
  color: string;
  direction: LayoutDirection;
};

const nodeWidth = 220;
const nodeHeight = 72;
const typeColors = [
  "#0d9488",
  "#2563eb",
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
  const layout = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  layout.setGraph({ rankdir: direction, nodesep: 48, ranksep: 72 });

  for (const node of nodes) {
    layout.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }
  for (const edge of edges) {
    layout.setEdge(edge.source, edge.target);
  }

  Dagre.layout(layout);
  const horizontal = direction === "LR";

  return {
    nodes: nodes.map((node) => {
      const position = layout.node(node.id);
      return {
        ...node,
        data: { ...node.data, direction },
        position: {
          x: position.x - nodeWidth / 2,
          y: position.y - nodeHeight / 2,
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
  const horizontal = data.direction === "LR";

  return (
    <div
      className={`w-[220px] rounded-xl border bg-card px-3.5 py-2.5 shadow-sm transition-[box-shadow,border-color,opacity] ${
        selected
          ? "border-primary shadow-md ring-2 ring-primary/20"
          : "border-border hover:border-foreground/25 hover:shadow-md"
      }`}
    >
      <Handle
        type="target"
        position={horizontal ? Position.Left : Position.Top}
        className="!size-2 !border-2 !border-card"
        style={{ backgroundColor: data.color }}
      />
      <div className="flex items-center gap-2.5">
        <span
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: data.color }}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {data.label}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {data.type}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={horizontal ? Position.Right : Position.Bottom}
        className="!size-2 !border-2 !border-card"
        style={{ backgroundColor: data.color }}
      />
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
  const typeColorMap = useMemo(
    () =>
      new Map(
        types.map((type, index) => [
          type,
          typeColors[index % typeColors.length],
        ]),
      ),
    [types],
  );

  const initial = useMemo(() => {
    const nodes: Node<ConceptNodeData>[] = graph.nodes.map((node) => ({
      id: node.id,
      type: "concept",
      position: { x: 0, y: 0 },
      ariaLabel: `${node.title}, ${node.type} Concept`,
      data: {
        label: node.title,
        type: node.type,
        path: node.path,
        color: typeColorMap.get(node.type) ?? typeColors[0],
        direction: "TB",
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
  }, [graph.edges, graph.nodes, typeColorMap]);

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

  const connectedIds = useMemo(() => {
    if (!selectedId) {
      return null;
    }
    const ids = new Set([selectedId]);
    for (const edge of edges) {
      if (edge.source === selectedId) ids.add(edge.target);
      if (edge.target === selectedId) ids.add(edge.source);
    }
    return ids;
  }, [edges, selectedId]);

  const filtersActive = query.trim() !== "" || typeFilter !== "";
  const displayedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const matches = !filtersActive || matchingIds.has(node.id);
        const isConnected = !connectedIds || connectedIds.has(node.id);
        return {
          ...node,
          style: {
            ...node.style,
            opacity: matches && isConnected ? 1 : matches ? 0.35 : 0.12,
          },
        };
      }),
    [connectedIds, filtersActive, matchingIds, nodes],
  );
  const displayedEdges = useMemo(
    () =>
      edges.map((edge) => {
        const matches =
          !filtersActive ||
          (matchingIds.has(edge.source) && matchingIds.has(edge.target));
        const isConnected =
          !selectedId ||
          edge.source === selectedId ||
          edge.target === selectedId;
        return {
          ...edge,
          animated: Boolean(selectedId && isConnected),
          style: {
            ...edge.style,
            stroke: isConnected ? "var(--primary)" : "var(--muted-foreground)",
            strokeWidth: isConnected && selectedId ? 2 : 1.25,
            opacity: matches && isConnected ? 0.75 : 0.08,
          },
        };
      }),
    [edges, filtersActive, matchingIds, selectedId],
  );

  const selected = graph.nodes.find((node) => node.id === selectedId);
  const selectedLinks = useMemo(() => {
    if (!selectedId) return { incoming: 0, outgoing: 0 };
    return graph.edges.reduce(
      (counts, edge) => ({
        incoming: counts.incoming + Number(edge.to === selectedId),
        outgoing: counts.outgoing + Number(edge.from === selectedId),
      }),
      { incoming: 0, outgoing: 0 },
    );
  }, [graph.edges, selectedId]);

  const openConcept = useCallback(
    (path?: string) => {
      if (path) router.push(bundlePathToHref(path));
    },
    [router],
  );

  const onNodeClick = useCallback<NodeMouseHandler<Node<ConceptNodeData>>>(
    (_, node) => setSelectedId(node.id),
    [],
  );
  const onNodeDoubleClick = useCallback<
    NodeMouseHandler<Node<ConceptNodeData>>
  >((_, node) => openConcept(node.data.path), [openConcept]);

  const changeLayout = useCallback(
    (nextDirection: LayoutDirection) => {
      const next = layoutElements(nodes, edges, nextDirection);
      setDirection(nextDirection);
      setNodes(next.nodes);
      setEdges(next.edges);
      fitView({ duration: 250, padding: 0.18 });
    },
    [edges, fitView, nodes, setEdges, setNodes],
  );

  const resetGraph = useCallback(() => {
    setQuery("");
    setTypeFilter("");
    setSelectedId(null);
    fitView({ duration: 250, padding: 0.18 });
  }, [fitView]);

  if (graph.nodes.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 text-center">
        <span className="rounded-full bg-muted p-3 text-muted-foreground">
          <NetworkIcon className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-medium">Nothing to map yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No Concepts with a type were found in this Bundle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="w-full overflow-hidden rounded-xl border bg-card shadow-sm"
      aria-label="Knowledge graph workspace"
    >
      <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center">
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
            placeholder="Find a Concept by title, ID, or tag…"
            className="h-9 bg-background pr-9 pl-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </label>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select
            aria-label="Filter graph by type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 min-w-36 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="h-9 min-w-40 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="TB">Top to bottom</option>
            <option value="LR">Left to right</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={resetGraph}
            className="col-span-2"
          >
            <RotateCcwIcon aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex min-h-[520px] h-[min(68vh,760px)] flex-col lg:flex-row">
        <div className="relative min-h-[420px] flex-1 bg-muted/20">
          <ReactFlow
            nodes={displayedNodes}
            edges={displayedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.2}
            maxZoom={1.75}
            className="[--xy-controls-button-background-color-default:var(--card)] [--xy-controls-button-color-default:var(--foreground)] [--xy-controls-button-border-color-default:var(--border)] [--xy-edge-stroke-default:var(--muted-foreground)]"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.25}
              color="var(--border)"
            />
            <Controls showInteractive={false} position="bottom-left" />
            <Panel position="top-right" className="!m-3 hidden sm:block">
              <div className="rounded-md border bg-background/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-xs backdrop-blur-sm">
                Click to preview · Double-click to open
              </div>
            </Panel>
          </ReactFlow>

          {filtersActive && matchingIds.size === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg border bg-background/95 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-sm font-medium">No matching Concepts</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Try another search or type.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="w-full shrink-0 border-t bg-card lg:w-80 lg:border-t-0 lg:border-l">
          {selected ? (
            <div className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <Badge
                  variant="secondary"
                  className="gap-1.5"
                  style={{
                    boxShadow: `inset 3px 0 0 ${typeColorMap.get(selected.type) ?? typeColors[0]}`,
                  }}
                >
                  {selected.type}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close Concept preview"
                >
                  <XIcon aria-hidden />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-pretty">
                  {selected.title}
                </h2>
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {selected.id}
                </p>
                {selected.description ? (
                  <p className="pt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {selected.description}
                  </p>
                ) : null}
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">Links to</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                    {selectedLinks.outgoing}
                  </dd>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">Linked from</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                    {selectedLinks.incoming}
                  </dd>
                </div>
              </dl>

              {selected.tags?.length ? (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button
                type="button"
                className="mt-6 w-full lg:mt-auto"
                onClick={() => openConcept(selected.path)}
              >
                Open Concept
                <ArrowRightIcon aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center px-8 text-center">
              <span className="rounded-full bg-muted p-3 text-muted-foreground">
                <NetworkIcon className="size-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium">Select a Concept</p>
              <p className="mt-1 max-w-48 text-xs leading-relaxed text-muted-foreground">
                Choose a node to see its details and connected Concepts.
              </p>
            </div>
          )}
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <span aria-live="polite">
          {filtersActive
            ? `${matchingIds.size} of ${graph.nodes.length} Concepts match`
            : `${graph.nodes.length} Concepts · ${edges.length} links`}
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {types.map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: typeColorMap.get(type) }}
                aria-hidden
              />
              {type}
            </span>
          ))}
        </div>
      </footer>
    </section>
  );
}

export function KnowledgeGraph({ graph }: { graph: BundleGraph }) {
  return (
    <ReactFlowProvider>
      <GraphWorkspace graph={graph} />
    </ReactFlowProvider>
  );
}
