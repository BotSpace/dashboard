"use client";
import { useTranslations } from "next-intl";
import { Logo } from "@/shared/components/common/logo";
import { Link } from "@/shared/i18n/routing";

export function PublicFooter() {
  const t = useTranslations("landing.footer");
  const tn = useTranslations("landing");
  const year = new Date().getFullYear();

  const groups = [
    {
      title: t("product"),
      items: [
        { label: t("docs"), href: "/docs" },
        { label: tn("navMcp"), href: "/docs/mcp" },
        { label: tn("navTemplates"), href: "/templates" },
      ],
    },
    {
      title: t("company"),
      items: [
        { label: t("about"), href: "/about" },
        { label: t("contact"), href: "/contact" },
        { label: t("blog"), href: "/blog" },
      ],
    },
    {
      title: t("legal"),
      items: [
        { label: t("terms"), href: "/terms" },
        { label: t("privacy"), href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-deep">
      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

      {/* Subtle bottom spot */}
      <div className="spot-orb spot-violet left-1/2 -bottom-40 h-[320px] w-[700px] -translate-x-1/2 opacity-[0.18]" />

      <div className="container-page relative grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className="max-w-[130px]" />
          <p className="max-w-xs text-[13px] leading-relaxed text-white/40">
            {t("tagline")}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #10b981" }} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">
              All systems normal
            </span>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title} className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              {g.title}
            </div>
            <ul className="space-y-2.5">
              {g.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-[13.5px] text-white/55 transition-colors hover:text-white"
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/[0.06]">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 md:flex-row md:items-center">
          <span className="text-[11.5px] text-white/30">
            © {year} BotSpace. {t("rights")}.
          </span>
          <div className="flex items-center gap-4">
            {["Telegram", "GitHub", "X"].map((name) => (
              <span
                key={name}
                className="cursor-pointer text-[11.5px] text-white/30 transition-colors hover:text-white/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
