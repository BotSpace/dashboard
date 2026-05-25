"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Loader2, Wrench, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ToolCallView } from "../types";

type Props = {
  calls: ToolCallView[];
  /** True if the very last call in this group is still running. */
  pending: boolean;
};

/**
 * Compact "Worked …" strip that groups consecutive tool turns into a single
 * foldable line — no border, no card, blends with the chat background.
 */
export function ToolStrip({ calls, pending }: Props) {
  const [open, setOpen] = useState(false);
  if (!calls.length) return null;

  const last = calls[calls.length - 1];
  const hasError = calls.some((c) => c.isError);
  const count = calls.length;

  return (
    <div className="ml-10 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 py-1 hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        ) : hasError ? (
          <Wrench className="h-3 w-3 text-destructive" />
        ) : (
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        )}
        <span>{pending ? "Ishlamoqda" : "Bajarildi"} ·</span>
        <code className={cn("font-mono text-foreground", pending && "text-primary")}>
          {last.name}
        </code>
        {count > 1 && (
          <span>
            {pending ? `(${count - 1} ta tugadi)` : `(+${count - 1} boshqa)`}
          </span>
        )}
      </button>

      {open && (
        <ul className="mt-1 space-y-3 pl-5">
          {calls.map((c, i) => (
            <li key={c.id} className="text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/70">#{i + 1}</span>
                <code
                  className={cn(
                    "font-mono font-medium",
                    c.isError ? "text-destructive" : "text-foreground"
                  )}
                >
                  {c.name}
                </code>
                {c.result === undefined && (
                  <Loader2 className="ml-1 h-3 w-3 animate-spin text-primary" />
                )}
              </div>
              {Object.keys(c.arguments ?? {}).length > 0 && (
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[10px] text-muted-foreground">
                  {JSON.stringify(c.arguments, null, 2)}
                </pre>
              )}
              {c.result !== undefined && (
                <pre className="mt-1 max-h-32 overflow-y-auto overflow-x-auto whitespace-pre-wrap text-[10px] text-muted-foreground/90">
                  {c.result}
                </pre>
              )}
              {renderNestedActions(c)}
            </li>
          ))}
        </ul>
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
    <div className="mt-2 space-y-1.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
        AI build actions
      </div>
      <ul className="space-y-1">
        {commands.map((command, index) => {
          const action = typeof command.action === "string" ? command.action : "action";
          const summary = summarizeCommand(command);
          return (
            <li key={`${call.id}:cmd:${index}`} className="rounded-sm border border-border/40 bg-muted/30 px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/70">#{index + 1}</span>
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
