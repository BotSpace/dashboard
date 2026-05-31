"use client";
import { Bot, Loader2, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { CurrentSubAgent } from "../use-agent-stream";

type Phase = "idle" | "queued" | "thinking" | "tool" | "waiting" | "done" | "error";

type Props = {
  phase: Phase;
  currentTool: string | null;
  currentSubAgent?: CurrentSubAgent | null;
};

const SUB_AGENT_LABELS: Record<string, string> = {
  "flow-builder": "Flow Builder",
  "crm-manager": "CRM Manager",
  "cms-manager": "CMS Manager",
  "deploy-manager": "Deploy Manager",
};

function subAgentLabel(name: string): string {
  return SUB_AGENT_LABELS[name] ?? name;
}

function label(phase: Phase, tool: string | null, sub: CurrentSubAgent | null | undefined): string {
  if (phase === "queued") return "Boshlanmoqda…";
  if (sub) {
    const name = subAgentLabel(sub.name);
    if (tool) return `${name} → ${tool}`;
    return `${name} ishlamoqda…`;
  }
  if (phase === "tool" && tool) return `${tool} bajarilmoqda…`;
  if (phase === "tool") return "Tool ishlamoqda…";
  if (phase === "thinking") return "O'ylamoqda…";
  if (phase === "waiting") return "Javob kutilmoqda";
  return "";
}

export function TypingIndicator({ phase, currentTool, currentSubAgent }: Props) {
  if (phase === "idle" || phase === "done" || phase === "error") return null;

  const activeSubAgent = Boolean(currentSubAgent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ring-transparent",
          activeSubAgent
            ? "animate-pulse bg-blue-500/15 text-blue-600 ring-blue-400/30 dark:text-blue-300"
            : phase === "tool"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
        )}
      >
        {activeSubAgent ? (
          <Bot className="h-4 w-4" />
        ) : phase === "tool" ? (
          <Wrench className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-2xl px-4 py-2.5",
          activeSubAgent ? "bg-blue-500/10" : "bg-muted/40"
        )}
      >
        <Dots />
        <span
          className={cn(
            "text-xs font-medium",
            activeSubAgent ? "text-blue-700 dark:text-blue-200" : "text-muted-foreground"
          )}
        >
          {label(phase, currentTool, currentSubAgent)}
        </span>
        {phase !== "waiting" && (
          <Loader2
            className={cn(
              "h-3 w-3 animate-spin",
              activeSubAgent ? "text-blue-500" : "text-muted-foreground/60"
            )}
          />
        )}
      </div>
    </motion.div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50" />
    </span>
  );
}

export function RunStatusChip({ phase, currentTool, currentSubAgent }: Props) {
  if (phase === "idle" || phase === "done") return null;
  const activeSubAgent = Boolean(currentSubAgent);
  const color =
    phase === "error"
      ? "bg-destructive/10 text-destructive"
      : phase === "waiting"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : activeSubAgent
          ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  const text =
    phase === "error"
      ? "Xato"
      : phase === "waiting"
        ? "Javob kutilmoqda"
        : phase === "queued"
          ? "Navbatda"
          : currentSubAgent
            ? subAgentLabel(currentSubAgent.name)
            : phase === "tool"
              ? `${currentTool ?? "Tool"}`
              : "Ishlamoqda";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium",
        color
      )}
    >
      {activeSubAgent && <Bot className="h-3 w-3" />}
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          phase !== "error" && "animate-pulse"
        )}
      />
      <span className={activeSubAgent ? "" : "hidden sm:inline"}>{text}</span>
    </span>
  );
}
