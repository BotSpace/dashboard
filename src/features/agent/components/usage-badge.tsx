"use client";
import { useEffect, useState, useCallback } from "react";
import { getUsageAction } from "../actions";
import type { AgentUsage } from "@/shared/api/agent";

type Props = {
  refreshKey?: unknown;
};

export function UsageBadge({ refreshKey }: Props) {
  const [usage, setUsage] = useState<AgentUsage | null>(null);

  const load = useCallback(async () => {
    const data = await getUsageAction();
    setUsage(data);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (!usage) return null;

  const { used, limit, remaining } = usage;
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const plan = typeof usage.plan === "string" ? usage.plan : usage.plan?.display ?? usage.plan?.name;

  const formatTokens = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return `${value}`;
  };

  const color =
    remaining === 0
      ? "text-destructive"
      : pct >= 80
      ? "text-amber-500"
      : "text-muted-foreground";
  const title = [
    `Token ishlatildi: ${used.toLocaleString()} / ${limit.toLocaleString()}`,
    `Qoldi: ${remaining.toLocaleString()}`,
    `Input: ${usage.input_used.toLocaleString()}`,
    `Output: ${usage.output_used.toLocaleString()}`,
    plan ? `Tarif: ${plan}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <div className="flex items-center gap-1.5" title={title}>
      <div className="relative h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            remaining === 0 ? "bg-destructive" : pct >= 80 ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-[11px] tabular-nums ${color}`}>
        {formatTokens(remaining)} token
      </span>
    </div>
  );
}
