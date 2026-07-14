"use client";
import { useEffect, useState } from "react";
import { Brain, Lock } from "lucide-react";
import { toast } from "sonner";
import { getThinkingEffortAction, setThinkingEffortAction, getUsageAction } from "../actions";
import type { ThinkingEffort } from "@/shared/api/agent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

/** Compact per-project reasoning-effort selector for the agent footer.
 * DeepSeek supports only high/max ("low"/"medium" map up to high), plus off to
 * disable reasoning. Max is a PAID-plan feature — locked for free users. */
const OPTIONS: { value: ThinkingEffort; label: string }[] = [
  { value: "off", label: "O'chiq" },
  { value: "high", label: "High" },
  { value: "max", label: "Max" },
];

export function ThinkingEffortControl({ projectId }: { projectId: string }) {
  const [effort, setEffort] = useState<ThinkingEffort>("high");
  const [maxAllowed, setMaxAllowed] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getThinkingEffortAction(projectId).then((e) => {
      if (alive && e) setEffort(e);
    });
    getUsageAction().then((u) => {
      if (alive && u) setMaxAllowed(u.max_thinking_allowed !== false);
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const onChange = async (next: ThinkingEffort) => {
    if (next === "max" && !maxAllowed) {
      toast.info("Max fikrlash faqat pullik tarifda", {
        description: "Tarifni yangilab, chuqurroq fikrlashni yoqing.",
      });
      return; // keep current selection
    }
    const prev = effort;
    setEffort(next);
    setSaving(true);
    const res = await setThinkingEffortAction(projectId, next);
    setSaving(false);
    if (!res.ok) setEffort(prev); // revert on failure
  };

  return (
    <Select value={effort} onValueChange={(v) => onChange(v as ThinkingEffort)} disabled={saving}>
      <SelectTrigger
        title="Fikrlash darajasi (DeepSeek)"
        className="h-5 w-auto gap-1 border-none bg-transparent px-1 py-0 text-[11px] font-normal text-muted-foreground shadow-none transition-colors hover:text-foreground focus:ring-0 focus:ring-offset-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60"
      >
        <Brain className="h-3 w-3 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[7rem]">
        {OPTIONS.map((o) => {
          const locked = o.value === "max" && !maxAllowed;
          return (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              <span className="flex items-center gap-1.5">
                {o.label}
                {locked && <Lock className="h-3 w-3 opacity-60" />}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
