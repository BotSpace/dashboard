"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";

export function CtaBanner() {
  const t = useTranslations("landing.cta");
  return (
    <section id="contact" className="relative py-24 md:py-32" style={{ background: "#06060a" }}>
      {/* Animated grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "lp-grid-scroll 4s linear infinite",
        }}
      />

      <div className="container-page relative">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-20 text-center md:px-16"
          style={{
            background: "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(124,58,237,0.08) 50%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Glow orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(14,165,233,0.4), transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)" }} />

          <h2
            className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 20%, #0ea5e9 60%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/35">{t("subtitle")}</p>
          <div className="mt-10">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                boxShadow: "0 0 30px rgba(14,165,233,0.3), 0 0 80px rgba(124,58,237,0.15)",
              }}
            >
              {t("button")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
