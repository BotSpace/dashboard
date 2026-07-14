"use client";
import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { getThinkingEffortAction, setThinkingEffortAction } from "../actions";
import type { ThinkingEffort } from "@/shared/api/agent";

/** Compact per-project reasoning-effort selector for the agent footer.
 * DeepSeek supports only high/max ("low"/"medium" map up to high), plus we allow
 * turning thinking off. null (unset) → provider default, shown as High. */
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
    <label
      className="flex items-center gap-1 text-muted-foreground"
      title="Fikrlash darajasi (DeepSeek): O'chiq / High / Max"
    >
      <Brain className="h-3 w-3 shrink-0" />
      <select
        value={effort}
        disabled={saving}
        onChange={(e) => onChange(e.target.value as ThinkingEffort)}
        className="cursor-pointer bg-transparent text-[11px] outline-none disabled:opacity-50"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-background text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
