"use client";
import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { getThinkingEffortAction, setThinkingEffortAction } from "../actions";
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
 * disable reasoning. null (unset) → provider default, shown as High. */
const OPTIONS: { value: ThinkingEffort; label: string }[] = [
  { value: "off", label: "O'chiq" },
  { value: "high", label: "High" },
  { value: "max", label: "Max" },
];

export function ThinkingEffortControl({ projectId }: { projectId: string }) {
  const [effort, setEffort] = useState<ThinkingEffort>("high");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getThinkingEffortAction(projectId).then((e) => {
      if (alive && e) setEffort(e);
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const onChange = async (next: ThinkingEffort) => {
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
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
