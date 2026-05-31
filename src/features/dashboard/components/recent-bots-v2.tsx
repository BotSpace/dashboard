import { ArrowRight } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { initials } from "@/shared/lib/utils";
import { MOCK_BOTS } from "./mock-data";
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

export function RecentBotsV2({ bots }: { bots: Project[] }) {
  const items: BotItem[] = bots.length > 0 ? toBotItems(bots).slice(0, 5) : MOCK_BOTS;

  return (
    <ul className="space-y-2.5">
      {items.map((bot) => (
        <li key={bot.id}>
          <Link
            href={`/app/bots/${bot.uuid ?? bot.id}`}
            className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-3 transition-all duration-150 hover:border-border hover:bg-card"
          >
            {/* Avatar */}
            <Avatar className="h-9 w-9 shrink-0">
              {bot.avatar && <AvatarImage src={bot.avatar} alt={bot.name} />}
              <AvatarFallback className="bg-blue-500/15 text-xs font-bold text-blue-300">
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

            {/* Status + arrow */}
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant={bot.status === "active" ? "success" : "secondary"}
                className="text-[10px]"
              >
                {bot.status === "active" ? "Faol" : bot.status === "inactive" ? "Nofaol" : "Draft"}
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
