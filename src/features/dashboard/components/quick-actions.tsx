import { Bot, LayoutTemplate, Sparkles, Upload } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/shared/lib/utils";

type Action = {
  icon: typeof Bot;
  title: string;
  desc: string;
  href: string;
  gradient: string;
  iconColor: string;
};

const ACTIONS: Action[] = [
  {
    icon: Bot,
    title: "Yangi bot yaratish",
    desc: "Noldan bot quring",
    href: "/app/bots/new?src=quick-actions",
    gradient: "from-blue-500/15 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    icon: LayoutTemplate,
    title: "Shablon tanlash",
    desc: "Tayyor shablon bilan boshlang",
    href: "/app/templates",
    gradient: "from-indigo-500/15 to-indigo-600/5",
    iconColor: "text-indigo-400",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    desc: "Sun'iy intellekt yordami",
    href: "/app/agent",
    gradient: "from-fuchsia-500/15 to-fuchsia-600/5",
    iconColor: "text-fuchsia-400",
  },
  {
    icon: Upload,
    title: "Botni import qilish",
    desc: "Mavjud botni ulang",
    href: "/app/bots/new?src=quick-actions-import",
    gradient: "from-emerald-500/15 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4",
            "transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/10",
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-200 group-hover:opacity-100",
              action.gradient,
            )}
          />
          <div className="relative">
            <div
              className={cn(
                "mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5",
                action.iconColor,
              )}
            >
              <action.icon className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium leading-snug">{action.title}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{action.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
