"use client";

import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  ScrollTextIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/bundle/types";
import { bundlePathToHref } from "@/lib/bundle/url";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pathContainsActive(node: TreeNode, pathname: string): boolean {
  if (isActive(pathname, bundlePathToHref(node.path))) {
    return true;
  }
  return node.children?.some((c) => pathContainsActive(c, pathname)) ?? false;
}

function FileIcon({ kind }: { kind: TreeNode["kind"] }) {
  if (kind === "log") {
    return <ScrollTextIcon />;
  }
  return <FileTextIcon />;
}

function TreeNodes({
  nodes,
  pathname,
  nested,
}: {
  nodes: TreeNode[];
  pathname: string;
  nested?: boolean;
}) {
  return (
    <>
      {nodes.map((node) => {
        const href = bundlePathToHref(node.path);
        const active = isActive(pathname, href);

        if (node.kind === "dir") {
          const open = pathContainsActive(node, pathname);
          const label = node.name;

          if (nested) {
            return (
              <SidebarMenuSubItem key={node.path || node.name}>
                <SidebarMenuSubButton
                  isActive={active}
                  render={<Link href={href} />}
                >
                  <FolderIcon />
                  <span className="truncate">{label}</span>
                </SidebarMenuSubButton>
                {node.children && node.children.length > 0 ? (
                  <SidebarMenuSub>
                    <TreeNodes
                      nodes={node.children}
                      pathname={pathname}
                      nested
                    />
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuSubItem>
            );
          }

          return (
            <Collapsible
              key={node.path || node.name}
              defaultOpen={open}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <div className="flex w-full items-center">
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={label}
                    className="flex-1"
                    render={<Link href={href} />}
                  >
                    <FolderIcon />
                    <span className="truncate">{label}</span>
                  </SidebarMenuButton>
                  <CollapsibleTrigger className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <ChevronRightIcon className="size-4 transition-transform group-data-[open]/collapsible:rotate-90" />
                    <span className="sr-only">Toggle {label}</span>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <TreeNodes
                      nodes={node.children ?? []}
                      pathname={pathname}
                      nested
                    />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        const label = node.name.replace(/\.md$/i, "");
        if (nested) {
          return (
            <SidebarMenuSubItem key={node.path || node.name}>
              <SidebarMenuSubButton
                isActive={active}
                render={<Link href={href} />}
              >
                <span className="truncate">{label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        }

        return (
          <SidebarMenuItem key={node.path || node.name}>
            <SidebarMenuButton
              isActive={active}
              tooltip={label}
              render={<Link href={href} />}
            >
              <FileIcon kind={node.kind} />
              <span className="truncate">{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function DirectoryTree({ nodes }: { nodes: TreeNode[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Bundle</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <TreeNodes nodes={nodes} pathname={pathname} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
