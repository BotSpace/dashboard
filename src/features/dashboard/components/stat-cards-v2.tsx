import { Bot, Users, MessageSquare, DollarSign, LayoutTemplate } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type StatItem = {
  label: string;
  value: string;
  delta: string;
  icon: typeof Bot;
  gradient: string;
  iconColor: string;
  glowColor: string;
};

const STATS: StatItem[] = [
  {
    label: "Jami Botlar",
    value: "128",
    delta: "+12 shu oy",
    icon: Bot,
    gradient: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-400",
    glowColor: "shadow-violet-500/20",
  },
  {
    label: "Foydalanuvchilar",
    value: "45,678",
    delta: "+18.2%",
    icon: Users,
    gradient: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    glowColor: "shadow-blue-500/20",
  },
  {
    label: "Xabarlar",
    value: "2.4M",
    delta: "+23.7%",
    icon: MessageSquare,
    gradient: "from-fuchsia-500/20 to-fuchsia-600/5",
    iconColor: "text-fuchsia-400",
    glowColor: "shadow-fuchsia-500/20",
  },
  {
    label: "Daromad",
    value: "$12,540",
    delta: "+31.4%",
    icon: DollarSign,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    glowColor: "shadow-emerald-500/20",
  },
  {
    label: "Shablonlar",
    value: "86",
    delta: "+6 yangi",
    icon: LayoutTemplate,
    gradient: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
    glowColor: "shadow-amber-500/20",
  },
];

export function StatCardsV2() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200",
            "hover:border-border hover:shadow-md",
          )}
        >
          {/* Subtle gradient background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-60",
              stat.gradient,
            )}
          />

          <div className="relative">
            {/* Icon badge */}
            <div
              className={cn(
                "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg",
                "border border-white/10 bg-white/5",
                stat.iconColor,
              )}
            >
              <stat.icon className="h-4 w-4" />
            </div>

            {/* Label */}
            <div className="text-xs text-muted-foreground">{stat.label}</div>

            {/* Value */}
            <div className="mt-0.5 text-2xl font-bold tracking-tight">
              {stat.value}
            </div>

            {/* Delta */}
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-[11px] font-medium text-emerald-400">
                {stat.delta}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
