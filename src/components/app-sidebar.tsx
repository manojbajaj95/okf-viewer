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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/bundle/types";

function shortBundleLabel(path: string): string {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts.at(-1) ?? path;
}

const browseLinks = [
  { href: "/graph", label: "Graph", icon: NetworkIcon },
  { href: "/tags", label: "Tags", icon: TagIcon },
  { href: "/types", label: "Types", icon: TypeIcon },
] as const;

export function AppSidebar({
  nodes,
  bundleLabel,
  error,
}: {
  nodes: TreeNode[];
  bundleLabel: string;
  error: string | null;
}) {
  const pathname = usePathname();
  const displayLabel = error
    ? "Bundle unavailable"
    : shortBundleLabel(bundleLabel);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center gap-0 px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="OKF Viewer"
              render={<Link href="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpenIcon className="size-4" aria-hidden />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight">
                  OKF Viewer
                </span>
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={error ? undefined : bundleLabel}
                >
                  {displayLabel}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {error ? (
          <div className="p-2">
            <Alert variant="destructive">
              <AlertTitle>Cannot open Bundle</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel>Browse</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {browseLinks.map(({ href, label, icon: Icon }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={pathname === href}
                        tooltip={label}
                        render={<Link href={href} />}
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <DirectoryTree nodes={nodes} />
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
