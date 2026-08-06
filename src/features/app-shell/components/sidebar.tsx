"use client";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bot,
  CreditCard,
  Files,
  KeyRound,
	Kanban,
  LayoutDashboard,
  LifeBuoy,
  PackageOpen,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Wand2,
  Plug,
} from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Logo } from "@/shared/components/common/logo";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

type Item = { href: string; icon: typeof LayoutDashboard; key: string };

export function SidebarContent({ onNavigateAction }: { onNavigateAction?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();

  const main: Item[] = [
    { href: "/app", icon: LayoutDashboard, key: "dashboard" },
    { href: "/app/agent", icon: Wand2, key: "agent" },
    { href: "/app/bots", icon: Bot, key: "bots" },
	{ href: "/app/boards", icon: Kanban, key: "boards" },
    { href: "/app/templates", icon: PackageOpen, key: "templates" },
    { href: "/app/files", icon: Files, key: "files" },
    { href: "/app/credentials", icon: KeyRound, key: "credentials" },
  ];
  const secondary: Item[] = [
    { href: "/app/earnings", icon: TrendingUp, key: "earnings" },
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
      <div className="flex h-12 items-center px-3">
        <Link href="/app" aria-label="BotSpace" onClick={onNavigateAction} className="block max-w-33">
          <Logo className="w-full" />
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {main.map((i) => (
          <NavLink
            key={i.key}
            href={i.href}
            icon={i.icon}
            label={t(i.key)}
            active={isActive(i.href)}
            onClick={onNavigateAction}
            tourId={`nav-${i.key}`}
          />
        ))}
        <div className="mb-1 mt-4 px-2 text-[11px] font-medium text-muted-foreground">
          {t("settings")}
        </div>
        <div className="space-y-0.5">
          {secondary.map((i) => (
            <NavLink
              key={i.key}
              href={i.href}
              icon={i.icon}
              label={t(i.key)}
              active={isActive(i.href)}
              onClick={onNavigateAction}
            />
          ))}
        </div>

        {/* MCP section — separated, near the bottom */}
        <div className="mt-4 border-t border-border pt-3">
          <Link
            href="/docs/mcp"
            onClick={onNavigateAction}
            className={cn(
              "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
              pathname.includes("/docs/mcp")
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <Plug className="h-4 w-4 shrink-0" />
            {t("mcp")}
            <span
              className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
            >
              MCP
            </span>
          </Link>
        </div>
      </nav>
      <div className="border-t border-border p-2">
        <Link
          href="/app/billing"
          onClick={onNavigateAction}
          className="group block rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t("upgradeTitle")}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("upgradeDesc")}</p>
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-55 shrink-0 border-r border-sidebar-border lg:flex lg:flex-col">
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
  tourId,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  onClick?: () => void;
  tourId?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-tour={tourId}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
