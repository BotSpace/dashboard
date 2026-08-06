import { Bot } from "lucide-react";

import type { DashboardOverview } from "@/shared/types/api";

type TopBot = DashboardOverview["top_bots"][number];


function formatVal(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface TopBotsListProps {
  bots?: TopBot[] | null;
}

export function TopBotsList({ bots }: TopBotsListProps) {
  if (!bots || bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Hali bot yo&apos;q</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {bots.map((bot, idx) => (
        <li key={bot.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="w-4 text-center font-mono text-[11px] text-muted-foreground">{idx + 1}</span>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-medium">
            {initials(bot.name)}
          </div>
          <div className="min-w-0 flex-1 truncate text-sm font-medium">{bot.name}</div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold tabular-nums">{formatVal(bot.messages)}</span>
            {bot.delta !== null && (
              <span className="text-[11px] font-medium text-emerald-500">+{bot.delta}%</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
