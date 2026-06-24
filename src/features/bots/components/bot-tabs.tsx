"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/shared/lib/utils";

export function BotTabs({ id }: { id: string | number }) {
  const t = useTranslations("bots.tabs");
  const pathname = usePathname();
  const locale = useLocale();

  const tabs = [
    { href: `/app/bots/${id}`, label: t("overview"), end: true },
    { href: `/app/bots/${id}/messages`, label: t("messages") },
    { href: `/app/bots/${id}/cms`, label: t("cms") },
    { href: `/app/bots/${id}/files`, label: t("files") },
    { href: `/app/bots/${id}/env`, label: t("env") },
    { href: `/app/bots/${id}/releases`, label: t("releases") },
    { href: `/app/bots/${id}/monitoring`, label: t("monitoring") },
  ];

  return (
    <nav className="flex gap-[22px] overflow-x-auto border-b border-border/[0.07]">
      {tabs.map((tab) => {
        const full = `/${locale}${tab.href}`;
        const active = tab.end ? pathname === full : pathname.startsWith(full);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative whitespace-nowrap pb-2.5 pt-0.5 text-[13.5px] font-medium transition-colors",
              active
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-blue-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
