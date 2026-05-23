"use client";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.7, ease: "easeOut" as const },
  }),
};

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: "easeOut" as const } },
});

export function Hero() {
  const t = useTranslations("landing.hero");
  const titleWords = t("title").split(" ");

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#06060a" }}
    >
      {/* 3D Canvas — absolute behind text */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Gradient vignette to keep text legible */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(6,6,10,0.55) 80%)",
        }}
      />

      {/* Content */}
      <div className="container-page relative z-10 flex min-h-screen flex-col items-center justify-center pb-20 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            className="lp-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300/80"
            variants={fadeUp(0.2)}
            initial="hidden"
            animate="visible"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            {t("badge")}
          </motion.div>

          {/* Title — word-by-word stagger */}
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mr-[0.25em]"
                style={{
                  background:
                    "linear-gradient(135deg, #fff 0%, #e0e7ff 30%, #0ea5e9 60%, #7c3aed 100%)",
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
            className="mx-auto mt-6 max-w-xl text-pretty text-base text-white/40 md:text-lg"
            variants={fadeUp(0.6)}
            initial="hidden"
            animate="visible"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={fadeUp(0.8)}
            initial="hidden"
            animate="visible"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                boxShadow:
                  "0 0 30px rgba(14,165,233,0.3), 0 0 80px rgba(124,58,237,0.15)",
              }}
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm"
            variants={fadeUp(1.0)}
            initial="hidden"
            animate="visible"
          >
            {[t("stats.users"), t("stats.bots"), t("stats.uptime")].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-white/30">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      i === 0 ? "#0ea5e9" : i === 1 ? "#7c3aed" : "#06b6d4",
                    boxShadow: `0 0 6px ${i === 0 ? "#0ea5e9" : i === 1 ? "#7c3aed" : "#06b6d4"}`,
                  }}
                />
                {stat}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 z-10"
        style={{ background: "linear-gradient(to top, #06060a, transparent)" }}
      />
    </section>
  );
}
