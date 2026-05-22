import { Bot, MessagesSquare, Sparkles, Wallet } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn, formatNumber } from "@/shared/lib/utils";

type Stat = {
  label: string;
  value: string | number;
  delta?: string;
  icon: typeof Bot;
  tone?: "primary" | "success" | "warn" | "muted";
};

const tones: Record<NonNullable<Stat["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  muted: "bg-muted text-muted-foreground",
};

export function StatsCards({
  totalBots,
  activeBots,
  totalMessages,
  balance,
  currency = "UZS",
  labels,
}: {
  totalBots: number;
  activeBots: number;
  totalMessages: number;
  balance: number;
  currency?: string;
  labels: { totalBots: string; activeBots: string; totalMessages: string; balance: string };
}) {
  const items: Stat[] = [
    { label: labels.totalBots, value: formatNumber(totalBots), icon: Bot, tone: "primary" },
    { label: labels.activeBots, value: formatNumber(activeBots), icon: Sparkles, tone: "success" },
    { label: labels.totalMessages, value: formatNumber(totalMessages), icon: MessagesSquare, tone: "warn" },
    {
      label: labels.balance,
      value: `${formatNumber(balance)} ${currency}`,
      icon: Wallet,
      tone: "muted",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <Card key={s.label} className="overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={cn("grid h-11 w-11 place-items-center rounded-lg", tones[s.tone ?? "muted"])}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 truncate text-2xl font-semibold tracking-tight">{s.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
