"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Wrench, AlertTriangle, Loader2 } from "lucide-react";
import type { ToolCallView } from "../types";
import { cn } from "@/shared/lib/utils";

export function ToolCallBubble({ call }: { call: ToolCallView }) {
  const [open, setOpen] = useState(false);
  const hasResult = call.result !== undefined;
  return (
    <div
      className={cn(
        "rounded-md border bg-card text-sm transition-colors",
        call.isError && "border-destructive/40",
        !hasResult && "border-primary/30 bg-primary/5"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {call.isError ? (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        ) : !hasResult ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : (
          <Wrench className="h-3.5 w-3.5 text-primary" />
        )}
        <code className="text-xs font-medium">{call.name}</code>
        {!hasResult && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium uppercase text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            running
          </span>
        )}
      </button>
      {open && (
        <div className="space-y-2 border-t bg-muted/30 px-3 py-2 text-xs">
          <div>
            <div className="mb-0.5 text-muted-foreground">arguments</div>
            <pre className="overflow-x-auto rounded bg-background p-2">
              {JSON.stringify(call.arguments, null, 2)}
            </pre>
          </div>
          {hasResult && (
            <div>
              <div className="mb-0.5 text-muted-foreground">result</div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-background p-2">
                {call.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
