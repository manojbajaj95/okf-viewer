"use client";

import { ScrollTextIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { BundleEntry } from "@/lib/bundle/types";
import { MarkdownBody } from "./MarkdownBody";

type LogEntry = {
  kind: "log";
  path: string;
  body: string;
  title?: string;
};

export function isLogEntry(entry: BundleEntry | undefined): entry is LogEntry {
  return entry?.kind === "log";
}

type EntryLogContextValue = {
  logEntry: LogEntry | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  openLog: () => void;
  registerLog: (entry: LogEntry | null, autoOpen?: boolean) => void;
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
  logEntry: LogEntry;
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

export function EntryLogProvider({ children }: { children: React.ReactNode }) {
  const [logEntry, setLogEntry] = useState<LogEntry | null>(null);
  const [open, setOpen] = useState(false);

  const registerLog = useCallback(
    (entry: LogEntry | null, autoOpen = false) => {
      setLogEntry(entry);
      if (autoOpen) {
        setOpen(true);
      } else if (!entry) {
        setOpen(false);
      }
    },
    [],
  );

  const openLog = useCallback(() => setOpen(true), []);

  const value = useMemo(
    () => ({ logEntry, open, setOpen, openLog, registerLog }),
    [logEntry, open, registerLog, openLog],
  );

  return (
    <EntryLogContext.Provider value={value}>
      {children}
      {logEntry ? (
        <EntryLogSheet logEntry={logEntry} open={open} onOpenChange={setOpen} />
      ) : null}
    </EntryLogContext.Provider>
  );
}

export function useEntryLog(): EntryLogContextValue {
  const ctx = useContext(EntryLogContext);
  if (!ctx) {
    throw new Error("useEntryLog must be used within EntryLogProvider");
  }
  return ctx;
}

export function HeaderLogButton() {
  const { logEntry, openLog } = useEntryLog();

  if (!logEntry) {
    return null;
  }

  const scope = logScope(logEntry.path);

  return (
    <Button
      variant="secondary"
      size="sm"
      className="shrink-0"
      onClick={openLog}
      aria-label={`Open ${scope}`}
    >
      <ScrollTextIcon />
      <span className="hidden sm:inline">{scope}</span>
      <span className="sm:hidden">Log</span>
    </Button>
  );
}
