import { Bot, LayoutTemplate, Sparkles, Upload } from "lucide-react";
import { Link } from "@/shared/i18n/routing";


type Action = {
  icon: typeof Bot;
  title: string;
  desc: string;
  href: string;
};

const ACTIONS: Action[] = [
  {
    icon: Bot,
    title: "Yangi bot yaratish",
    desc: "Noldan bot quring",
    href: "/app/bots/new?src=quick-actions",
  },
  {
    icon: LayoutTemplate,
    title: "Shablon tanlash",
    desc: "Tayyor shablon bilan boshlang",
    href: "/app/templates",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    desc: "Sun'iy intellekt yordami",
    href: "/app/agent",
  },
  {
    icon: Upload,
    title: "Botni import qilish",
    desc: "Mavjud botni ulang",
    href: "/app/bots/new?src=quick-actions-import",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {ACTIONS.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group flex items-center gap-3 rounded-md p-3 transition-colors hover:bg-accent"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
            <action.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium leading-snug">{action.title}</div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">{action.desc}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
