"use client";

import { BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { DirectoryTree } from "@/components/DirectoryTree";
import { ModeToggle } from "@/components/mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/bundle/types";

export function AppSidebar({
  nodes,
  bundleLabel,
  error,
}: {
  nodes: TreeNode[];
  bundleLabel: string;
  error: string | null;
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="okf viewer"
              render={<Link href="/" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpenIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">okf viewer</span>
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={bundleLabel}
                >
                  {error ? "bundle unavailable" : bundleLabel}
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
          <DirectoryTree nodes={nodes} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
