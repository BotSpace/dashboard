"use client";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Bot,
  CreditCard,
  Files,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  PackageOpen,
  Settings,
  Send,
  TrendingUp,
  Wand2,
  Plug,
  Zap,
} from "lucide-react";
import { Link } from "@/shared/i18n/routing";
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
      <div className="flex items-center px-[18px] pb-3.5 pt-[18px]">
        <Link
          href="/app"
          aria-label="BotSpace"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-blue-700 text-white shadow-[0_4px_16px_rgba(59,130,246,0.36)]">
            <Send className="h-4 w-4" />
          </span>
          <span
            className="text-[16.5px] font-bold leading-none tracking-[-0.4px] text-foreground"
            style={{ fontFamily: "Space Grotesk, var(--font-display)" }}
          >
            BotSpace<span className="text-primary">.uz</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
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
        <div className="my-3 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
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
              onClick={onNavigate}
            />
          ))}
        </div>

        {/* MCP section — separated, near the bottom */}
        <div className="mt-4 border-t border-border/60 pt-3">
          <Link
            href="/docs/mcp"
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname.includes("/docs/mcp")
                ? "bg-violet-500/10 text-violet-400 font-medium"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            )}
          >
            {pathname.includes("/docs/mcp") && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-violet-500"
                aria-hidden="true"
              />
            )}
            <Plug
              className={cn(
                "h-4 w-4 shrink-0",
                pathname.includes("/docs/mcp") ? "text-violet-400" : ""
              )}
            />
            {t("mcp")}
            <span
              className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
              style={{
                background: "rgba(139,92,246,0.15)",
                color: "rgba(167,139,250,0.9)",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
            >
              MCP
            </span>
          </Link>
        </div>
      </nav>
      <div className="p-3">
        <Link
          href="/app/billing"
          onClick={onNavigate}
          className="relative block overflow-hidden rounded-[13px] border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/[0.04] p-4 transition hover:border-primary/40"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-[90px] w-[90px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.32), transparent 70%)" }}
          />
          <div className="relative">
            <div className="mb-1.5 flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
              <Zap className="h-[15px] w-[15px] text-blue-300" />
              {t("upgradeTitle")}
            </div>
            <p className="mb-3 text-[11.5px] leading-relaxed text-muted-foreground">
              {t("upgradeDesc")}
            </p>
            <span className="block w-full rounded-lg bg-primary py-2 text-center text-[12.5px] font-semibold text-primary-foreground">
              {t("upgradeTitle")}
            </span>
          </div>
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
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-white/[0.045] hover:text-foreground"
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
      {label}
    </Link>
  );
}
