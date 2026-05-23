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
    <footer className="relative" style={{ background: "#06060a" }}>
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="container-page grid gap-10 py-14 md:grid-cols-4">
          <div className="space-y-4">
            <Logo className="max-w-[130px]" />
            <p className="max-w-xs text-sm leading-relaxed text-white/25">{t("tagline")}</p>
          </div>
          {groups.map((g) => (
            <div key={g.title} className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                {g.title}
              </div>
              <ul className="space-y-2">
                {g.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/25 transition-colors hover:text-white/50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="container-page flex items-center justify-between py-6">
          <span className="text-xs text-white/20">
            © {year} BotSpace. {t("rights")}.
          </span>
          <div className="flex items-center gap-3">
            {["Telegram", "GitHub"].map((name) => (
              <span key={name} className="text-xs text-white/15 transition-colors hover:text-white/30">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
