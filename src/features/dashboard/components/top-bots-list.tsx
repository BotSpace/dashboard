import { cn } from "@/shared/lib/utils";
import { TOP_BOTS } from "./mock-data";

const colorMap: Record<string, string> = {
  violet: "bg-violet-500/20 text-violet-300",
  blue: "bg-blue-500/20 text-blue-300",
  fuchsia: "bg-fuchsia-500/20 text-fuchsia-300",
  emerald: "bg-emerald-500/20 text-emerald-300",
  amber: "bg-amber-500/20 text-amber-300",
};

function formatVal(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function TopBotsList() {
  return (
    <ul className="space-y-3">
      {TOP_BOTS.map((bot, idx) => (
        <li key={bot.id} className="flex items-center gap-3">
          {/* Rank */}
          <span className="w-4 text-center text-xs text-muted-foreground">{idx + 1}</span>

          {/* Avatar */}
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              colorMap[bot.color] ?? "bg-muted text-muted-foreground",
            )}
          >
            {bot.initial}
          </div>

          {/* Name */}
          <div className="min-w-0 flex-1 truncate text-sm font-medium">{bot.name}</div>

          {/* Value + delta */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold tabular-nums">{formatVal(bot.value)}</span>
            <span className="text-[11px] font-medium text-emerald-400">{bot.delta}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
