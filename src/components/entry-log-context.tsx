"use client";

import { ScrollTextIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { BundleLogEntry, BundleLogRoute } from "@/lib/bundle/types";
import { MarkdownBody } from "./MarkdownBody";

type EntryLogContextValue = {
  logEntry: BundleLogEntry | null;
  openLog: () => void;
};

const EntryLogContext = createContext<EntryLogContextValue | null>(null);

function logScope(path: string): string {
  return path === "log.md" ? "Bundle log" : "Folder log";
}

function EntryLogSheet({
  logEntry,
  open,
  onOpenChange,
}: {
  logEntry: BundleLogEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="gap-3 border-b border-border bg-muted/30 pr-12">
          <SheetTitle>Change log</SheetTitle>
          <SheetDescription>
            Notes and updates for this{" "}
            {logEntry.path === "log.md" ? "bundle" : "section"}.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <MarkdownBody body={logEntry.body} fromRelPath={logEntry.path} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function EntryLogProvider({
  routes,
  children,
}: {
  routes: Record<string, BundleLogRoute>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const route = routes[pathname];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (route?.autoOpen) {
      setOpen(true);
    } else if (!route) {
      setOpen(false);
    }
  }, [route]);

  const value = useMemo(
    () => ({
      logEntry: route?.entry ?? null,
      openLog: () => setOpen(true),
    }),
    [route],
  );

  return (
    <EntryLogContext.Provider value={value}>
      {children}
      {route ? (
        <EntryLogSheet
          logEntry={route.entry}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </EntryLogContext.Provider>
  );
}

export function HeaderLogButton() {
  const context = useContext(EntryLogContext);
  if (!context) {
    throw new Error("HeaderLogButton must be used within EntryLogProvider");
  }
  if (!context.logEntry) {
    return null;
  }

  const scope = logScope(context.logEntry.path);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="shrink-0"
      onClick={context.openLog}
      aria-label={`Open ${scope}`}
    >
      <ScrollTextIcon />
      <span className="hidden sm:inline">{scope}</span>
      <span className="sm:hidden">Log</span>
    </Button>
  );
}
