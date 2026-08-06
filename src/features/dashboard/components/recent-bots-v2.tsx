import { ArrowRight, Bot } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { initials } from "@/shared/lib/utils";
import type { Project } from "@/shared/types/api";

type BotItem = {
  id: string | number;
  uuid?: string;
  name: string;
  username?: string;
  updatedAt?: string;
  initial?: string;
};

function toBotItems(bots: Project[]): BotItem[] {
  return bots.map((b) => ({
    id: b.id,
    uuid: b.uuid,
    name: b.name,
    username: b.username,
    updatedAt: b.updated_at
      ? new Date(b.updated_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })
      : undefined,
  }));
}

export function RecentBotsV2({ bots }: { bots: Project[] }) {
  const items: BotItem[] = toBotItems(bots).slice(0, 5);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Hali bot yo&apos;q</p>
        <Link
          href="/app/bots/new?src=recent-empty"
          className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
        >
          Birinchi botni yarating
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((bot) => (
        <li key={bot.id}>
          <Link
            href={`/app/bots/${bot.id}`}
            className="group flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-accent"
          >
            {/* Avatar */}
            <Avatar className="h-8 w-8 shrink-0 rounded-md">
              <AvatarFallback className="rounded-md border border-border bg-muted text-xs font-medium text-foreground">
                {bot.initial ?? initials(bot.name)}
              </AvatarFallback>
            </Avatar>

            {/* Name + handle */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{bot.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {bot.username ? `@${bot.username.replace(/^@/, "")}` : (bot.updatedAt ?? "—")}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
