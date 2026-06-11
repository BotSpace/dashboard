"use client";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";

const SplineScene = dynamic(
  () => import("@/shared/components/ui/splite").then((m) => m.SplineScene),
  { ssr: false },
);

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative isolate overflow-hidden bg-deep grain">
      {/* Background: grid + dual spotlights + dark vignette */}
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-[0.55]" />
      <div className="spot-orb spot-violet -left-32 top-[-180px] h-[640px] w-[640px] opacity-70" />
      <div className="spot-orb spot-cyan right-[-180px] top-[120px] h-[600px] w-[600px] opacity-60" />
      <div className="spot-orb spot-blue left-1/2 top-[40%] h-[420px] w-[420px] -translate-x-1/2 opacity-40" />

      {/* Two vertical beams */}
      <div className="beam beam-thick left-[18%] opacity-50" />
      <div className="beam left-[82%] opacity-30" />

      {/* Bottom vignette into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background: "linear-gradient(180deg, transparent, var(--bg-deep))",
        }}
      />

      <div className="container-page relative z-10 grid items-center gap-8 pb-16 pt-28 md:pt-32 lg:min-h-[78svh] lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pt-36">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-white/70 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-cyan-400/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            <span className="uppercase">{t("badge")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="display mt-6 text-[40px] font-semibold text-white sm:text-[52px] md:text-[64px] lg:text-[72px] xl:text-[80px]"
          >
            <span
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #ffffff 55%, rgba(255,255,255,0.55) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t("title")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/55 md:text-[17px] lg:mx-0"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:items-start lg:justify-start"
          >
            <Link
              href="/login"
              className="btn-primary group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold"
            >
              <Sparkles className="h-4 w-4 text-violet-600" />
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium"
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
          >
            {[
              { val: t("stats.users"), color: "#22d3ee" },
              { val: t("stats.bots"), color: "#a78bfa" },
              { val: t("stats.uptime"), color: "#34d399" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] text-white/45"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: s.color,
                    boxShadow: `0 0 10px ${s.color}aa`,
                  }}
                />
                {s.val}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Spline robot with halo + accent dots */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto h-[300px] w-full max-w-[440px] md:h-[380px] lg:h-[460px]"
        >
          {/* Soft glow halo behind robot */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 mx-auto h-[80%] w-[80%] translate-y-[6%] rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(6,182,212,0.18) 35%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Decorative floating accent dots */}
          <motion.div
            className="absolute right-[8%] top-[14%] h-1.5 w-1.5 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 16px rgba(6,182,212,0.8)" }}
            animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[10%] h-1 w-1 rounded-full bg-violet-300"
            style={{ boxShadow: "0 0 12px rgba(139,92,246,0.8)" }}
            animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute right-[18%] bottom-[10%] h-1 w-1 rounded-full bg-white/60"
            animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
          />

          {/* Cover Spline watermark in bottom-right corner */}
          <div
            className="pointer-events-none absolute bottom-2 right-2 h-10 w-32 rounded-md"
            style={{ background: "var(--bg-deep)" }}
          />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 md:flex"
      >
        <span>scroll</span>
        <motion.div
          className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent"
          animate={{ scaleY: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
