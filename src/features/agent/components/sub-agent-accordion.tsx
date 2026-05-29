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
import { summarizeArgs, summarizeName, summarizeResult } from "../lib/summarize-tool";

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
  const running = !turn.finished;
  // Sub-agent accordion default yopiq — foydalanuvchi xohlasagina ochadi.
  // Header chip qaysi sub-agent ishlayotganini doim ko'rsatadi.
  const [open, setOpen] = useState(false);
  const label = NAME_LABELS[turn.name] ?? turn.name;
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
          "group flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs transition-all",
          running
            ? "border-violet-400/50 bg-violet-500/10 shadow-[0_0_0_3px_rgba(139,92,246,0.08)] dark:border-violet-400/40"
            : "border-border bg-card/60 hover:bg-card",
          failed && "border-destructive/40",
        )}
      >
        <div
          className={cn(
            "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            running
              ? "bg-violet-500/20 text-violet-600 dark:text-violet-300"
              : failed
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary",
          )}
        >
          {running ? (
            <>
              <Bot className="h-3.5 w-3.5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
            </>
          ) : failed ? (
            <XCircle className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "font-semibold",
                running ? "text-violet-700 dark:text-violet-200" : "text-foreground",
              )}
            >
              {label}
            </span>
            {running ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ishlamoqda
              </span>
            ) : failed ? (
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                xatolik
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-2.5 w-2.5" />
                bajarildi
              </span>
            )}
            {stepsCount > 0 && (
              <span className="text-muted-foreground/80">
                {stepsCount} ta tool
              </span>
            )}
            <span className="ml-auto text-muted-foreground/60">
              {open ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
          {turn.summary && !running && (
            <div className="mt-1 line-clamp-2 text-muted-foreground">
              {turn.summary}
            </div>
          )}
          {!turn.summary && running && (
            <div className="mt-1 line-clamp-1 text-muted-foreground/80">
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
                    <SubAgentStep key={step.id} step={step} index={i} />
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


type StepProps = {
  step: SubAgentTurn["steps"][number];
  index: number;
};

function SubAgentStep({ step, index }: StepProps) {
  const [open, setOpen] = useState(false);
  const label = summarizeName(step.name);
  const argLine = summarizeArgs(step.name, step.arguments);
  const resLine = summarizeResult(step.result);
  const hasArgs = Object.keys(step.arguments ?? {}).length > 0;
  const hasFullResult =
    typeof step.result === "string" && step.result.length > 100;

  return (
    <li className="rounded-md bg-background/60 text-[11px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors",
          "hover:bg-background/80",
          open && "rounded-b-none",
        )}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-medium text-muted-foreground">
          {index + 1}
        </span>
        <span
          className={cn(
            "font-medium",
            step.isError ? "text-destructive" : "text-foreground",
          )}
        >
          {label}
        </span>
        {argLine && (
          <span className="truncate text-muted-foreground/80">· {argLine}</span>
        )}
        {step.result === undefined ? (
          <Loader2 className="ml-auto h-3 w-3 shrink-0 animate-spin text-primary" />
        ) : step.isError ? (
          <XCircle className="ml-auto h-3 w-3 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 className="ml-auto h-3 w-3 shrink-0 text-emerald-500" />
        )}
        {(hasArgs || hasFullResult || resLine) && (
          <span className="text-muted-foreground/60">
            {open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden border-t border-border/40 px-2 py-1.5 space-y-1.5"
          >
            {hasArgs && (
              <div>
                <div className="mb-0.5 text-[9px] uppercase tracking-wide text-muted-foreground/70">
                  Argumentlar
                </div>
                <pre className="max-h-40 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded bg-muted/60 p-1.5 text-[10px] text-muted-foreground">
                  {JSON.stringify(step.arguments, null, 2)}
                </pre>
              </div>
            )}
            {step.result !== undefined && (
              <div>
                <div className="mb-0.5 text-[9px] uppercase tracking-wide text-muted-foreground/70">
                  Natija
                </div>
                <pre
                  className={cn(
                    "max-h-40 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded bg-muted/60 p-1.5 text-[10px]",
                    step.isError ? "text-destructive/80" : "text-muted-foreground/90",
                  )}
                >
                  {step.result}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
