"use client";
import { Bot, Loader2, Wrench } from "lucide-react";
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
  if (phase === "thinking") return "Agent o'ylamoqda…";
  if (phase === "waiting") return "Foydalanuvchi javobi kutilmoqda";
  return "";
}

export function TypingIndicator({ phase, currentTool }: Props) {
  if (phase === "idle" || phase === "done" || phase === "error") return null;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full",
          phase === "tool" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary"
        )}
      >
        {phase === "tool" ? <Wrench className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
        <Dots />
        <span className="text-xs text-muted-foreground">{label(phase, currentTool)}</span>
        {phase !== "waiting" && (
          <Loader2 className="ml-1 h-3 w-3 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" />
    </span>
  );
}


// Header chip — used in the chat panel toolbar
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
            ? `Tool: ${currentTool ?? "…"}`
            : "Ishlamoqda";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium", color)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full bg-current",
          phase !== "error" && "animate-pulse"
        )}
      />
      {text}
    </span>
  );
}
