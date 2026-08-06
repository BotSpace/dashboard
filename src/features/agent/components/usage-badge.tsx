"use client";
import { useEffect, useState, useCallback } from "react";
import { getUsageAction } from "../actions";
import type { AgentUsage } from "@/shared/api/agent";

type Props = {
  refreshKey?: unknown;
  /** Live tokens consumed by the CURRENT run — subtracted from remaining in
   * real time so the badge ticks down as the agent works. */
  liveDelta?: number;
};

export function UsageBadge({ refreshKey, liveDelta = 0 }: Props) {
  const [usage, setUsage] = useState<AgentUsage | null>(null);

  const load = useCallback(async () => {
    const data = await getUsageAction();
    setUsage(data);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (!usage) return null;

  const { limit } = usage;
  const used = usage.used + liveDelta;
  const remaining = Math.max(0, usage.remaining - liveDelta);
  const pct = limit > 0 ? (used / limit) * 100 : 0;

  const formatTokens = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return `${value}`;
  };

  const color =
    remaining === 0
      ? "text-destructive"
      : "text-muted-foreground";

  const barColor = remaining === 0 ? "bg-destructive" : "bg-foreground";

  const title = [
    `Token: ${used.toLocaleString()} / ${limit.toLocaleString()}`,
    `Qoldi: ${remaining.toLocaleString()}`,
  ].join(" · ");

  return (
    <div className="flex shrink-0 items-center gap-1.5" title={title}>
      <div className="relative h-1.5 w-10 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-[10px] tabular-nums ${color}`}>
        {formatTokens(remaining)}
      </span>
    </div>
  );
}
