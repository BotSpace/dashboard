"use client";
import { useState } from "react";
import { Check, Circle, CircleDashed, AlertCircle, ChevronDown, ChevronRight, ListChecks } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
      return <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />;
  }
}

export function PlanPanel({ plan }: { plan: PlanItem[] }) {
  const [open, setOpen] = useState(true);
  if (!plan.length) return null;

  const done = plan.filter((i) => i.status === "completed").length;

  return (
    <div className="rounded-xl border bg-card/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs"
      >
        <ListChecks className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">Plan</span>
        <span className="text-muted-foreground">
          {done}/{plan.length}
        </span>
        <div className="ml-auto">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <ul className="border-t px-2 py-1.5">
              {plan.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm">
                  <div className="mt-0.5">
                    <StatusIcon status={item.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-xs font-medium leading-snug",
                        item.status === "completed" && "text-muted-foreground line-through"
                      )}
                    >
                      {item.title}
                    </div>
                    {item.detail && (
                      <div
                        className={cn(
                          "mt-0.5 whitespace-pre-wrap text-[11px] leading-snug text-muted-foreground",
                          item.status === "completed" && "opacity-60"
                        )}
                      >
                        {item.detail}
                      </div>
                    )}
                    {item.notes && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground/70">{item.notes}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
