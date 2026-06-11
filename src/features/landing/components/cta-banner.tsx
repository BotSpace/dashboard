"use client";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";

export function CtaBanner() {
  const t = useTranslations("landing.cta");

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-deep py-32 md:py-40 grain"
    >
      {/* Strong central glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(6,182,212,0.20) 35%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-[0.35]" />

      {/* Beams */}
      <div className="beam beam-thick left-[22%] opacity-50" />
      <div className="beam beam-thick right-[22%] opacity-50" />
      <div className="beam left-[40%] opacity-25" />
      <div className="beam right-[40%] opacity-25" />

      {/* Top/bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background: "linear-gradient(180deg, var(--bg-deep), transparent)",
        }}
      />

      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/65 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-cyan-300" />
            Start free today
          </div>

          <h2 className="display mt-6 text-[34px] font-semibold leading-[1.05] sm:text-[44px] md:text-[56px] lg:text-[64px]">
            <span
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #ffffff 45%, rgba(255,255,255,0.45) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t("title")}
            </span>
          </h2>

          <p className="mt-5 text-[15px] text-white/55 md:text-[17px]">
            {t("subtitle")}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex items-center justify-center"
          >
            <Link
              href="/login"
              className="btn-primary group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-bold"
            >
              {t("button")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Small trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/35"
          >
            <span className="inline-flex h-1 w-1 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #10b981" }} />
            {t("trust")}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
