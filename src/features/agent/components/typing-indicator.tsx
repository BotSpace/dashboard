"use client";
import { Bot, Loader2, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

type Phase = "idle" | "queued" | "thinking" | "tool" | "waiting" | "done" | "error";

type Props = {
  phase: Phase;
  currentTool: string | null;
};

function label(phase: Phase, tool: string | null): string {
  if (phase === "queued") return "Boshlanmoqda…";
  if (phase === "tool" && tool) return `${tool} bajarilmoqda…`;
  if (phase === "tool") return "Tool ishlamoqda…";
  if (phase === "thinking") return "O'ylamoqda…";
  if (phase === "waiting") return "Javob kutilmoqda";
  return "";
}

export function TypingIndicator({ phase, currentTool }: Props) {
  if (phase === "idle" || phase === "done" || phase === "error") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          phase === "tool"
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
        )}
      >
        {phase === "tool" ? <Wrench className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-4 py-2.5">
        <Dots />
        <span className="text-xs text-muted-foreground">{label(phase, currentTool)}</span>
        {phase !== "waiting" && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/60" />
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

export function RunStatusChip({ phase, currentTool }: Props) {
  if (phase === "idle" || phase === "done") return null;
  const color =
    phase === "error"
      ? "bg-destructive/10 text-destructive"
      : phase === "waiting"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  const text =
    phase === "error"
      ? "Xato"
      : phase === "waiting"
        ? "Javob kutilmoqda"
        : phase === "queued"
          ? "Navbatda"
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
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          phase !== "error" && "animate-pulse"
        )}
      />
      <span className="hidden sm:inline">{text}</span>
    </span>
  );
}
