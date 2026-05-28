"use client";
import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  Bot,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { SubAgentTurn } from "../types";

type Props = {
  turn: SubAgentTurn;
};

const NAME_LABELS: Record<string, string> = {
  "flow-builder": "Flow Builder",
  "crm-manager": "CRM Manager",
  "cms-manager": "CMS Manager",
  "deploy-manager": "Deploy Manager",
};

export function SubAgentAccordion({ turn }: Props) {
  const [open, setOpen] = useState(false);
  const label = NAME_LABELS[turn.name] ?? turn.name;
  const running = !turn.finished;
  const failed = turn.finished && turn.ok === false;
  const stepsCount = turn.toolCalls || turn.steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-11 mr-2 my-1"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-start gap-2 rounded-xl border bg-card/60 px-3 py-2 text-left text-xs transition-colors",
          "hover:bg-card",
          failed && "border-destructive/40",
        )}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {running ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : failed ? (
            <XCircle className="h-3 w-3 text-destructive" />
          ) : (
            <Bot className="h-3 w-3" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{label}</span>
            <span className="text-muted-foreground">
              {running ? "ishlamoqda" : failed ? "xatolik" : "bajarildi"}
            </span>
            {stepsCount > 0 && (
              <span className="text-muted-foreground/70">
                · {stepsCount} ta tool
              </span>
            )}
            <span className="ml-auto text-muted-foreground/60">
              {open ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
          </div>
          {turn.summary && !running && (
            <div className="mt-1 line-clamp-2 text-muted-foreground">
              {turn.summary}
            </div>
          )}
          {!turn.summary && running && (
            <div className="mt-1 line-clamp-1 text-muted-foreground/70">
              {turn.prompt}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 overflow-hidden rounded-xl border bg-muted/30 px-3 py-2"
          >
            <div className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground/70">
              Vazifa
            </div>
            <div className="mb-3 whitespace-pre-wrap rounded-md bg-background/60 px-2 py-1.5 font-mono text-[11px] text-foreground/90">
              {turn.prompt}
            </div>

            {turn.steps.length === 0 && running && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Boshlanmoqda…</span>
              </div>
            )}

            {turn.steps.length > 0 && (
              <>
                <div className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                  Qadamlar
                </div>
                <ul className="space-y-1.5">
                  {turn.steps.map((step, i) => (
                    <li
                      key={step.id}
                      className="rounded-md bg-background/60 px-2 py-1.5 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-muted text-[9px] font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                        <code
                          className={cn(
                            "font-mono font-medium",
                            step.isError ? "text-destructive" : "text-foreground",
                          )}
                        >
                          {step.name}
                        </code>
                        {step.result === undefined ? (
                          <Loader2 className="ml-auto h-3 w-3 animate-spin text-primary" />
                        ) : step.isError ? (
                          <XCircle className="ml-auto h-3 w-3 text-destructive" />
                        ) : (
                          <CheckCircle2 className="ml-auto h-3 w-3 text-emerald-500" />
                        )}
                      </div>
                      {Object.keys(step.arguments ?? {}).length > 0 && (
                        <pre className="mt-1 max-h-32 overflow-x-auto whitespace-pre-wrap rounded bg-muted/60 p-1.5 text-[10px] text-muted-foreground">
                          {JSON.stringify(step.arguments, null, 2)}
                        </pre>
                      )}
                      {step.result !== undefined && (
                        <pre className="mt-1 max-h-32 overflow-y-auto overflow-x-auto whitespace-pre-wrap rounded bg-muted/60 p-1.5 text-[10px] text-muted-foreground/80">
                          {step.result}
                        </pre>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {turn.summary && (
              <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5 text-[11px] text-foreground/90">
                <div className="mb-0.5 text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Xulosa
                </div>
                <div className="whitespace-pre-wrap">{turn.summary}</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
