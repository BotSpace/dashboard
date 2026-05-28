"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Loader2, Wrench, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ToolCallView } from "../types";
import { summarizeArgs, summarizeName, summarizeResult } from "../lib/summarize-tool";

type Props = {
  calls: ToolCallView[];
  pending: boolean;
};

export function ToolStrip({ calls, pending }: Props) {
  const [open, setOpen] = useState(false);
  if (!calls.length) return null;

  const last = calls[calls.length - 1];
  const hasError = calls.some((c) => c.isError);
  const count = calls.length;
  const lastLabel = summarizeName(last.name);
  const lastArgs = summarizeArgs(last.name, last.arguments);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-11 text-xs"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-1.5 transition-colors",
          "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {open ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        {pending ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
        ) : hasError ? (
          <Wrench className="h-3 w-3 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
        )}
        <span className={cn("font-medium", pending && "text-primary")}>
          {lastLabel}
        </span>
        {lastArgs && (
          <span className="truncate text-muted-foreground/80">· {lastArgs}</span>
        )}
        {count > 1 && (
          <span className="shrink-0 text-muted-foreground/70">
            {pending ? `(${count - 1} tugadi)` : `+${count - 1}`}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 space-y-2 overflow-hidden pl-3"
          >
            {calls.map((c, i) => {
              const label = summarizeName(c.name);
              const argLine = summarizeArgs(c.name, c.arguments);
              const resLine = summarizeResult(c.result);
              return (
                <li key={c.id} className="rounded-lg border bg-card/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        c.isError ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {label}
                    </span>
                    {argLine && (
                      <span className="truncate text-muted-foreground/80">· {argLine}</span>
                    )}
                    {c.result === undefined && (
                      <Loader2 className="ml-auto h-3 w-3 shrink-0 animate-spin text-primary" />
                    )}
                  </div>
                  {resLine && (
                    <div
                      className={cn(
                        "mt-1 line-clamp-2 text-[11px]",
                        c.isError ? "text-destructive/80" : "text-muted-foreground",
                      )}
                    >
                      {resLine}
                    </div>
                  )}
                  <DetailsAccordion call={c} />
                  {renderNestedActions(c)}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailsAccordion({ call }: { call: ToolCallView }) {
  const [open, setOpen] = useState(false);
  const hasArgs = Object.keys(call.arguments ?? {}).length > 0;
  const hasMoreResult =
    typeof call.result === "string" && call.result.length > 100;
  if (!hasArgs && !hasMoreResult) return null;

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="h-2.5 w-2.5" />
        ) : (
          <ChevronRight className="h-2.5 w-2.5" />
        )}
        Tafsilot
      </button>
      {open && (
        <div className="mt-1 space-y-1.5">
          {hasArgs && (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground">
              {JSON.stringify(call.arguments, null, 2)}
            </pre>
          )}
          {hasMoreResult && (
            <pre className="max-h-40 overflow-y-auto overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-[10px] text-muted-foreground/80">
              {call.result}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function renderNestedActions(call: ToolCallView) {
  const commands = Array.isArray(call.data?.commands)
    ? (call.data.commands as Array<Record<string, unknown>>)
    : [];
  if (!commands.length) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
        AI build actions
      </div>
      <ul className="space-y-0.5">
        {commands.map((command, index) => {
          const action = typeof command.action === "string" ? command.action : "action";
          const summary = summarizeCommand(command);
          return (
            <li key={`${call.id}:cmd:${index}`} className="rounded-md bg-muted/40 px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/60">#{index + 1}</span>
                <code className="font-mono text-[10px] text-foreground">{action}</code>
                {summary ? <span className="truncate text-[10px] text-muted-foreground">{summary}</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function summarizeCommand(command: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const key of ["key", "name", "text", "source", "target", "after", "on", "node_type"]) {
    const value = command[key];
    if (typeof value !== "string" || !value) continue;
    const compact = value.replace(/\s+/g, " ").trim();
    parts.push(`${key}=${compact.length > 48 ? `${compact.slice(0, 48)}...` : compact}`);
    if (parts.length >= 2) break;
  }
  return parts.join(" ");
}
