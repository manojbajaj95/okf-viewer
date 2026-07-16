"use client";

import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
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
import { cn } from "@/lib/utils";

function isExactActive(pathname: string, href: string): boolean {
  return pathname === href;
}

function pathContainsActive(node: TreeNode, pathname: string): boolean {
  const href = bundlePathToHref(node.path);
  if (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))) {
    return true;
  }
  return node.children?.some((c) => pathContainsActive(c, pathname)) ?? false;
}

function FileIcon({
  kind,
  className,
}: {
  kind: TreeNode["kind"];
  className?: string;
}) {
  if (kind === "log") {
    return <ScrollTextIcon className={className} />;
  }
  return <FileTextIcon className={className} />;
}

const chevronClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/55 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground motion-reduce:transition-none";

const iconMuted = "text-sidebar-foreground/55";
const iconActive = "text-sidebar-accent-foreground";

function TreeNodes({
  nodes,
  pathname,
  nested = false,
}: {
  nodes: TreeNode[];
  pathname: string;
  nested?: boolean;
}) {
  return (
    <>
      {nodes.map((node) => {
        const href = bundlePathToHref(node.path);
        const active = isExactActive(pathname, href);

        if (node.kind === "dir") {
          const open = pathContainsActive(node, pathname);
          const label = node.name;
          const hasChildren = (node.children?.length ?? 0) > 0;
          const FolderGlyph = open ? FolderOpenIcon : FolderIcon;
          const folderIconClass = cn(active || open ? iconActive : iconMuted);

          if (!hasChildren) {
            if (nested) {
              return (
                <SidebarMenuSubItem key={node.path || node.name}>
                  <SidebarMenuSubButton
                    isActive={active}
                    className={cn(!active && "[&>svg]:text-sidebar-foreground/55")}
                    render={<Link href={href} />}
                  >
                    <FolderGlyph />
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
                  <FolderGlyph className={folderIconClass} />
                  <span className="truncate">{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={node.path || node.name}
              defaultOpen={open}
              className="group/collapsible"
            >
              {nested ? (
                <SidebarMenuSubItem>
                  <div className="flex w-full items-center gap-0.5">
                    <SidebarMenuSubButton
                      isActive={active}
                      className={cn(
                        "flex-1",
                        !active && "[&>svg]:text-sidebar-foreground/55",
                      )}
                      render={<Link href={href} />}
                    >
                      <FolderGlyph />
                      <span className="truncate">{label}</span>
                    </SidebarMenuSubButton>
                    <CollapsibleTrigger className={chevronClass}>
                      <ChevronRightIcon
                        className={cn(
                          "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
                          "group-data-[open]/collapsible:rotate-90",
                        )}
                      />
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
                </SidebarMenuSubItem>
              ) : (
                <SidebarMenuItem>
                  <div className="flex w-full items-center gap-0.5">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={label}
                      className="flex-1"
                      render={<Link href={href} />}
                    >
                      <FolderGlyph className={folderIconClass} />
                      <span className="truncate">{label}</span>
                    </SidebarMenuButton>
                    <CollapsibleTrigger className={chevronClass}>
                      <ChevronRightIcon
                        className={cn(
                          "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
                          "group-data-[open]/collapsible:rotate-90",
                        )}
                      />
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
              )}
            </Collapsible>
          );
        }

        const label = node.name.replace(/\.md$/i, "");
        const fileIconClass = cn(
          active ? iconActive : iconMuted,
          node.kind === "log" && !active && "text-sidebar-foreground/45",
        );

        if (nested) {
          return (
            <SidebarMenuSubItem key={node.path || node.name}>
              <SidebarMenuSubButton
                isActive={active}
                className={cn(
                  !active &&
                    (node.kind === "log"
                      ? "[&>svg]:text-sidebar-foreground/45"
                      : "[&>svg]:text-sidebar-foreground/55"),
                )}
                render={<Link href={href} />}
              >
                <FileIcon kind={node.kind} />
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
              <FileIcon kind={node.kind} className={fileIconClass} />
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

  if (nodes.length === 0) {
    return (
      <SidebarGroup className="py-2">
        <SidebarGroupLabel>Contents</SidebarGroupLabel>
        <SidebarGroupContent>
          <p className="px-2 py-6 text-center text-xs text-sidebar-foreground/55">
            No entries in this Bundle.
          </p>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel>Contents</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <TreeNodes nodes={nodes} pathname={pathname} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
