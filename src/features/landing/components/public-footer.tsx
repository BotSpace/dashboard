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
    <footer className="relative overflow-hidden" style={{ background: "#030308" }}>
      {/* Dot grid pattern background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
        }}
      />

      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-[600px] -translate-x-1/2 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.4), transparent 70%)",
        }}
      />

      <div
        className="relative"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="container-page grid gap-10 py-14 md:grid-cols-4">
          <div className="space-y-4">
            <Logo className="max-w-[130px]" />
            <p className="max-w-xs text-sm leading-relaxed text-white/25">
              {t("tagline")}
            </p>
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
                      className="group relative inline-block text-sm text-white/25 transition-colors hover:text-white/50"
                    >
                      {item.label}
                      <span
                        className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="container-page flex items-center justify-between py-6">
          <span className="text-xs text-white/20">
            &copy; {year} BotSpace. {t("rights")}.
          </span>
          <div className="flex items-center gap-3">
            {["Telegram", "GitHub"].map((name) => (
              <span
                key={name}
                className="cursor-pointer text-xs text-white/15 transition-colors hover:text-white/30"
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
