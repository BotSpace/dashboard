"use client";

import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

export function AgentFloatingButton() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  if (pathname.includes("/app/agent")) {
    return null;
  }

  return (
    <Link
      href="/app/agent"
      data-tour="agent-fab"
      aria-label={t("agentFabAria")}
      className="group fixed bottom-5 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-foreground text-background shadow-lg transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:bg-card sm:px-2 sm:py-2 sm:pr-3 sm:text-foreground sm:hover:bg-accent"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-border bg-foreground text-background sm:bg-foreground">
        <Bot className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="relative hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="text-xs font-medium text-foreground">{t("agentFab")}</span>
        <span className="text-[11px] text-muted-foreground">{t("agentFabDesc")}</span>
      </span>
    </Link>
  );
}
