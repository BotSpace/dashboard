"use client";

import { Github, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/shared/components/common/logo";
import { Link } from "@/shared/i18n/routing";

function XIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>;
}

export function PublicFooter() {
  const t = useTranslations("landing.footer");
  const tn = useTranslations("landing");
  const groups = [
    { title: t("product"), items: [{ label: t("docs"), href: "/docs" }, { label: tn("navMcp"), href: "/docs/mcp" }, { label: tn("navTemplates"), href: "/templates" }] },
    { title: t("company"), items: [{ label: t("about"), href: "/about" }, { label: t("contact"), href: "/contact" }, { label: t("blog"), href: "/blog" }] },
    { title: t("legal"), items: [{ label: t("terms"), href: "/terms" }, { label: t("privacy"), href: "/privacy" }] },
  ];

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo className="w-32" />
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/45">{t("tagline")}</p>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/35"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("systemsNormal")}</div>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <div className="text-xs font-medium text-white">{group.title}</div>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => <li key={item.label}><Link href={item.href} className="text-sm text-white/45 transition-colors hover:text-white">{item.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} BotSpace. {t("rights")}.</span>
          <div className="flex gap-4">
            <a href="https://telegram.me/botspace_uz" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="hover:text-white"><Send className="h-4 w-4" /></a>
            <a href="https://github.com/botspace" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white"><Github className="h-4 w-4" /></a>
            <a href="https://x.com/botspace_uz" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-white"><XIcon className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
