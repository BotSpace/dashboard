import { Bot, LayoutTemplate, Sparkles, Upload } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/shared/lib/utils";

type Action = {
  icon: typeof Bot;
  label: string;
  href: string;
  iconColor: string;
};

const ACTIONS: Action[] = [
  {
    icon: Bot,
    label: "Yangi bot yaratish",
    href: "/app/bots/new",
    iconColor: "text-blue-400",
  },
  {
    icon: LayoutTemplate,
    label: "Shablon tanlash",
    href: "/app/templates",
    iconColor: "text-indigo-400",
  },
  {
    icon: Sparkles,
    label: "AI Assistant",
    href: "/app/agent",
    iconColor: "text-fuchsia-400",
  },
  {
    icon: Upload,
    label: "Botni import qilish",
    href: "/app/bots/new",
    iconColor: "text-emerald-400",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={cn(
            "group flex flex-col gap-[10px] rounded-[11px] border border-border/70 bg-card/70",
            "px-[13px] py-[15px] text-left",
            "transition-all duration-[180ms]",
            "hover:border-blue-500/35 hover:bg-blue-500/6",
          )}
        >
          {/* Icon badge */}
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[9px] bg-blue-500/10",
              action.iconColor,
            )}
          >
            <action.icon className="h-[19px] w-[19px]" />
          </span>

          {/* Label */}
          <span className="text-[13px] font-medium leading-[1.3] text-foreground">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
