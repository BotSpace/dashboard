import { Bot } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn, initials } from "@/shared/lib/utils";
import type { Project } from "@/shared/types/api";

type BotItem = {
  id: string | number;
  uuid?: string;
  name: string;
  username?: string;
  avatar?: string;
  status?: "active" | "inactive" | "draft";
  updatedAt?: string;
  initial?: string;
};

function toBotItems(bots: Project[]): BotItem[] {
  return bots.map((b) => ({
    id: b.id,
    uuid: b.uuid,
    name: b.name,
    username: b.username,
    avatar: b.avatar,
    status: b.status,
    updatedAt: b.updated_at
      ? new Date(b.updated_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })
      : undefined,
  }));
}

const STATUS_CONFIG = {
  active: {
    bg: "bg-emerald-500/10",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "Faol",
  },
  inactive: {
    bg: "bg-zinc-500/10",
    color: "text-zinc-400",
    dot: "bg-zinc-400",
    label: "Nofaol",
  },
  draft: {
    bg: "bg-amber-500/10",
    color: "text-amber-400",
    dot: "bg-amber-400",
    label: "Draft",
  },
};

export function RecentBotsV2({ bots }: { bots: Project[] }) {
  const items: BotItem[] = toBotItems(bots).slice(0, 5);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-muted/40">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Hali bot yo&apos;q</p>
        <Link
          href="/app/bots/new"
          className="text-xs font-medium text-blue-400 hover:text-blue-300"
        >
          Birinchi botni yarating
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((bot, idx) => {
        const statusKey = bot.status ?? "draft";
        const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.draft;
        const isLast = idx === items.length - 1;

        return (
          <Link
            key={bot.id}
            href={`/app/bots/${bot.uuid ?? bot.id}`}
            className={cn(
              "flex items-center gap-3 rounded-[9px] px-2 py-[11px]",
              "transition-colors hover:bg-white/3",
              !isLast && "border-b border-white/4",
            )}
          >
            {/* Avatar */}
            <Avatar className="h-9 w-9 shrink-0 rounded-[9px]">
              {bot.avatar && <AvatarImage src={bot.avatar} alt={bot.name} />}
              <AvatarFallback className="rounded-[9px] bg-blue-500/15 text-xs font-bold text-blue-300">
                {bot.initial ?? initials(bot.name)}
              </AvatarFallback>
            </Avatar>

            {/* Name + time */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-medium text-foreground">
                {bot.name}
              </div>
              <div className="truncate text-[11.5px] text-muted-foreground">
                {bot.username
                  ? `@${bot.username.replace(/^@/, "")}`
                  : (bot.updatedAt ?? "—")}
              </div>
            </div>

            {/* Status badge with dot */}
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-[5px] rounded-[6px] px-[9px] py-[3px]",
                "text-[11px] font-semibold",
                cfg.bg,
                cfg.color,
              )}
            >
              <span className={cn("h-[5px] w-[5px] rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
