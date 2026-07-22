"use client";

import { BookOpenIcon, NetworkIcon, TagIcon, TypeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DirectoryTree } from "@/components/DirectoryTree";
import { ModeToggle } from "@/components/mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { BundleGraph } from "@/lib/bundle/graph";
import type { TreeNode } from "@/lib/bundle/types";

function shortBundleLabel(path: string): string {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts.at(-1) ?? path;
}

function browseStats(graph: BundleGraph) {
  const tagSet = new Set<string>();
  const typeSet = new Set<string>();
  for (const node of graph.nodes) {
    if (node.type) {
      typeSet.add(node.type);
    }
    for (const tag of node.tags ?? []) {
      tagSet.add(tag);
    }
  }
  return {
    concepts: graph.nodes.length,
    tags: tagSet.size,
    types: typeSet.size,
  };
}

const browseLinks = [
  { href: "/graph", label: "Graph", icon: NetworkIcon, stat: "concepts" },
  { href: "/tags", label: "Tags", icon: TagIcon, stat: "tags" },
  { href: "/types", label: "Types", icon: TypeIcon, stat: "types" },
] as const;

export function AppSidebar({
  nodes,
  bundleLabel,
  error,
  graph,
}: {
  nodes: TreeNode[];
  bundleLabel: string;
  error: string | null;
  graph: BundleGraph;
}) {
  const pathname = usePathname();
  const displayLabel = error
    ? "Bundle unavailable"
    : shortBundleLabel(bundleLabel);
  const stats = browseStats(graph);
  const isHome = pathname === "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center gap-0 border-b border-sidebar-border px-2 py-0 group-data-[collapsible=icon]:items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              isActive={isHome}
              tooltip="OKF Viewer"
              render={<Link href="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpenIcon className="size-4" aria-hidden />
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight">
                  OKF Viewer
                </span>
                <span
                  className="truncate font-mono text-xs text-sidebar-foreground/65"
                  title={error ? undefined : bundleLabel}
                >
                  {displayLabel}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 overflow-hidden">
        {error ? (
          <div className="p-2">
            <Alert variant="destructive">
              <AlertTitle>Cannot open Bundle</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <SidebarGroup className="shrink-0 py-2">
              <SidebarGroupLabel>Browse</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {browseLinks.map(({ href, label, icon: Icon, stat }) => {
                    const count = stats[stat];
                    return (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                          isActive={pathname === href}
                          tooltip={label}
                          className="pr-8"
                          render={<Link href={href} />}
                        >
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                        {count > 0 ? (
                          <SidebarMenuBadge className="bg-transparent text-sidebar-foreground/55">
                            {count}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="shrink-0" />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <DirectoryTree nodes={nodes} />
            </div>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="gap-0 border-t border-sidebar-border p-2">
        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
