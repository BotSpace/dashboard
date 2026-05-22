"use client";
import { Check, Circle, CircleDashed, AlertCircle } from "lucide-react";
import type { PlanItem } from "../types";
import { cn } from "@/shared/lib/utils";

function StatusIcon({ status }: { status: PlanItem["status"] }) {
  switch (status) {
    case "completed":
      return <Check className="h-3.5 w-3.5 text-emerald-500" />;
    case "in_progress":
      return <CircleDashed className="h-3.5 w-3.5 animate-pulse text-primary" />;
    case "blocked":
      return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export function PlanPanel({ plan }: { plan: PlanItem[] }) {
  if (!plan.length)
    return (
      <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
        Agent hali plan tuzmagan.
      </div>
    );
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Plan
      </div>
      <ul className="divide-y">
        {plan.map((item) => (
          <li key={item.id} className="flex items-start gap-2 px-3 py-2 text-sm">
            <StatusIcon status={item.status} />
            <div className="flex-1">
              <div
                className={cn(
                  "leading-tight",
                  item.status === "completed" && "line-through text-muted-foreground"
                )}
              >
                {item.title}
              </div>
              {item.notes && (
                <div className="mt-0.5 text-xs text-muted-foreground">{item.notes}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
