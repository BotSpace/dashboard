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

  const { used_today, limit, remaining } = usage;
  const pct = limit > 0 ? (used_today / limit) * 100 : 0;

  const color =
    remaining === 0
      ? "text-destructive"
      : pct >= 80
      ? "text-amber-500"
      : "text-muted-foreground";

  return (
    <div className="flex items-center gap-1.5" title={`Bugun ${used_today} ta so'rov ishlatildi. Limit: ${limit}`}>
      <div className="relative h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            remaining === 0 ? "bg-destructive" : pct >= 80 ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-[11px] tabular-nums ${color}`}>
        {used_today}/{limit}
      </span>
    </div>
  );
}
