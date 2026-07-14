"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
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
      className="group fixed bottom-5 right-4 z-40 flex items-center gap-2 overflow-hidden rounded-full border border-cyan-300/50 bg-background/90 px-2.5 py-2 pr-4 shadow-[0_16px_45px_rgba(8,47,73,0.22)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_22px_60px_rgba(8,47,73,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:bottom-6 sm:right-6 dark:border-cyan-300/20 dark:bg-card/90 dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_120deg,rgba(34,211,238,0.0),rgba(34,211,238,0.18),rgba(132,204,22,0.14),rgba(34,211,238,0.0))] opacity-75 motion-safe:animate-[agent-halo_3.8s_linear_infinite]" />
      <span className="pointer-events-none absolute inset-px rounded-full bg-background/90 dark:bg-card/90" />
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/60 bg-gradient-to-br from-cyan-200 via-white to-lime-100 shadow-inner motion-safe:animate-[agent-float_2.7s_ease-in-out_infinite] dark:border-white/15 dark:from-cyan-300/30 dark:via-slate-900 dark:to-lime-300/20">
        <Image
          src="/logo-icon-light.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-contain drop-shadow-sm dark:hidden"
        />
        <Image
          src="/logo-icon-dark.png"
          alt=""
          width={32}
          height={32}
          className="hidden h-8 w-8 object-contain drop-shadow-sm dark:block"
        />
        <span className="absolute right-1 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-cyan-400 text-white shadow-sm">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      </span>
      <span className="relative hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="text-xs font-semibold text-foreground">{t("agentFab")}</span>
        <span className="text-[11px] text-muted-foreground">{t("agentFabDesc")}</span>
      </span>
    </Link>
  );
}
