"use client";
import { useTranslations } from "next-intl";
import { Send, Github } from "lucide-react";
import { Logo } from "@/shared/components/common/logo";
import { Link } from "@/shared/i18n/routing";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

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
          <p className="max-w-xs text-[13px] leading-relaxed text-white/60">
            {t("tagline")}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #10b981" }} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/55">
              {t("systemsNormal")}
            </span>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title} className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              {g.title}
            </div>
            <ul className="space-y-2.5">
              {g.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-[13.5px] text-white/65 transition-colors hover:text-white"
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
          <span className="text-[11.5px] text-white/50">
            © {year} BotSpace. {t("rights")}.
          </span>
          <div className="flex items-center gap-3">
            {[
              { name: "Telegram", href: "https://t.me/botspace_uz", Icon: Send },
              { name: "GitHub", href: "https://github.com/botspace", Icon: Github },
              { name: "X", href: "https://x.com/botspace_uz", Icon: XIcon },
            ].map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
