import { cn } from "@/shared/lib/utils";
import { TOP_BOTS } from "./mock-data";
import type { DashboardOverview } from "@/shared/types/api";

type TopBot = DashboardOverview["top_bots"][number];

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-300",
  "bg-blue-500/20 text-blue-300",
  "bg-fuchsia-500/20 text-fuchsia-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
];

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
    // Fallback: render mock data (keeps original shape)
    return (
      <ul className="space-y-3">
        {TOP_BOTS.map((bot, idx) => (
          <li key={bot.id} className="flex items-center gap-3">
            <span className="w-4 text-center text-xs text-muted-foreground">{idx + 1}</span>
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                AVATAR_COLORS[idx % AVATAR_COLORS.length],
              )}
            >
              {bot.initial}
            </div>
            <div className="min-w-0 flex-1 truncate text-sm font-medium">{bot.name}</div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold tabular-nums">{formatVal(bot.value)}</span>
              <span className="text-[11px] font-medium text-emerald-400">{bot.delta}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {bots.map((bot, idx) => (
        <li key={bot.id} className="flex items-center gap-3">
          <span className="w-4 text-center text-xs text-muted-foreground">{idx + 1}</span>
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              AVATAR_COLORS[idx % AVATAR_COLORS.length],
            )}
          >
            {initials(bot.name)}
          </div>
          <div className="min-w-0 flex-1 truncate text-sm font-medium">{bot.name}</div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold tabular-nums">{formatVal(bot.messages)}</span>
            {bot.delta !== null && (
              <span className="text-[11px] font-medium text-emerald-400">+{bot.delta}%</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
