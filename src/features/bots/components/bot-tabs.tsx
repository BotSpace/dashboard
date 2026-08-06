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
	{ href: `/app/boards?bot=${id}`, label: t("boards"), external: true },
  ];

  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const full = `/${locale}${tab.href}`;
		const active = tab.external ? false : tab.end ? pathname === full : pathname.startsWith(full);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap border-b px-3 py-2 text-sm transition-colors",
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
