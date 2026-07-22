"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { BundleGraphProvider } from "@/components/bundle-graph-context";
import {
  EntryLogProvider,
  HeaderLogButton,
} from "@/components/entry-log-context";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { BundleGraph } from "@/lib/bundle/graph";
import type { BundleLogRoute, TreeNode } from "@/lib/bundle/types";
import { cn } from "@/lib/utils";

function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments =
    pathname === "/"
      ? []
      : pathname
          .slice(1)
          .split("/")
          .filter(Boolean)
          .map((s) => decodeURIComponent(s));

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm">
        <li className="shrink-0">
          <Link
            href="/"
            className={cn(
              "rounded-sm transition-colors duration-150 motion-reduce:transition-none",
              segments.length === 0
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Bundle root
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments
            .slice(0, index + 1)
            .map((s) => encodeURIComponent(s))
            .join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <li key={href} className="flex min-w-0 items-center gap-1.5">
              <ChevronRightIcon
                className="size-3.5 shrink-0 text-muted-foreground/50"
                aria-hidden
              />
              {isLast ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current="page"
                  title={segment}
                >
                  {segment}
                </span>
              ) : (
                <Link
                  href={href}
                  className="truncate text-muted-foreground transition-colors duration-150 hover:text-foreground motion-reduce:transition-none"
                  title={segment}
                >
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function ViewerShell({
  nodes,
  bundleLabel,
  error,
  graph,
  logRoutes,
  children,
}: {
  nodes: TreeNode[];
  bundleLabel: string;
  error: string | null;
  graph: BundleGraph;
  logRoutes: Record<string, BundleLogRoute>;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <BundleGraphProvider graph={graph}>
        <EntryLogProvider routes={logRoutes}>
          <SidebarProvider>
            <AppSidebar
              nodes={nodes}
              bundleLabel={bundleLabel}
              error={error}
              graph={graph}
            />
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-8">
                <div className="flex shrink-0 items-center">
                  <SidebarTrigger />
                </div>
                <HeaderBreadcrumb />
                <HeaderLogButton />
              </header>
              <div className="flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </EntryLogProvider>
      </BundleGraphProvider>
    </TooltipProvider>
  );
}
