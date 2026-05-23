"use client";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

const BG = "#030308";

export function Hero() {
  const t = useTranslations("landing.hero");
  const words = t("title").split(" ");

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: BG }}>
      {/* 3D canvas */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 45%, transparent 0%, ${BG}cc 70%, ${BG} 100%)`,
        }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48"
        style={{ background: `linear-gradient(to top, ${BG}, transparent)` }}
      />

      {/* Content overlay */}
      <div className="container-page relative z-10 flex min-h-screen flex-col items-center justify-center pb-24 pt-36">
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.12)",
              color: "rgba(0,229,255,0.8)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            {t("badge")}
          </motion.div>

          {/* Title — word by word */}
          <h1 className="mx-auto max-w-[900px] text-[clamp(2.2rem,5.5vw,4.8rem)] font-extrabold leading-[1.05] tracking-tight">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.25 + i * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="mr-[0.28em] inline-block"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #c4e0ff 35%, #00e5ff 65%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mx-auto mt-7 max-w-lg text-[15px] leading-relaxed text-white/35 md:text-[17px]"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.04] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00c8ff 0%, #7c3aed 100%)",
                boxShadow: "0 0 40px rgba(0,200,255,0.25), 0 0 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white/50 transition-all hover:text-white/80 hover:bg-white/[0.03]"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-3"
          >
            {[
              { val: t("stats.users"), color: "#00e5ff" },
              { val: t("stats.bots"), color: "#8b5cf6" },
              { val: t("stats.uptime"), color: "#06b6d4" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px] text-white/25">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }}
                />
                {s.val}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
