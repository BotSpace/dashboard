"use client";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bot,
  CreditCard,
  Files,
  LayoutDashboard,
  LifeBuoy,
  PackageOpen,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Logo } from "@/shared/components/common/logo";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

type Item = { href: string; icon: typeof LayoutDashboard; key: string };

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();

  const main: Item[] = [
    { href: "/app", icon: LayoutDashboard, key: "dashboard" },
    { href: "/app/agent", icon: Wand2, key: "agent" },
    { href: "/app/bots", icon: Bot, key: "bots" },
    { href: "/app/templates", icon: PackageOpen, key: "templates" },
    { href: "/app/files", icon: Files, key: "files" },
  ];
  const secondary: Item[] = [
    { href: "/app/billing", icon: CreditCard, key: "billing" },
    { href: "/app/tickets", icon: LifeBuoy, key: "tickets" },
    { href: "/app/settings", icon: Settings, key: "settings" },
  ];

  const isActive = (href: string) => {
    const localized = `/${locale}${href}`;
    if (href === "/app") return pathname === localized;
    return pathname.startsWith(localized);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center px-3 py-3">
        <Link href="/app" aria-label="BotSpace" onClick={onNavigate} className="block w-full">
          <Logo className="w-full" />
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {main.map((i) => (
          <NavLink
            key={i.key}
            href={i.href}
            icon={i.icon}
            label={t(i.key)}
            active={isActive(i.href)}
            onClick={onNavigate}
          />
        ))}
        <div className="my-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("settings")}
        </div>
        {secondary.map((i) => (
          <NavLink
            key={i.key}
            href={i.href}
            icon={i.icon}
            label={t(i.key)}
            active={isActive(i.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>
      <div className="px-3 pb-4">
        <Link
          href="/app/billing"
          onClick={onNavigate}
          className="block rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-fuchsia-500/10 p-4 transition hover:from-primary/15"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Pro tarifga o'ting</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">AI agent, ko'proq xabar, prioritet support</p>
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
