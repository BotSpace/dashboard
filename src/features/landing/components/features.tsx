"use client";
import { Blocks, BrainCircuit, ShoppingBag, Globe, Database, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const icons = [Blocks, BrainCircuit, ShoppingBag, Globe, Database, BarChart3];
const accents = [
  { color: "#22d3ee", glow: "rgba(6,182,212,0.30)" },
  { color: "#a78bfa", glow: "rgba(139,92,246,0.30)" },
  { color: "#f0abfc", glow: "rgba(232,121,249,0.28)" },
  { color: "#60a5fa", glow: "rgba(59,130,246,0.28)" },
  { color: "#34d399", glow: "rgba(16,185,129,0.28)" },
  { color: "#fbbf24", glow: "rgba(251,191,36,0.26)" },
];

export function Features() {
  const t = useTranslations("landing.features");
  const items = Array.from({ length: 6 }, (_, i) => ({
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
    Icon: icons[i],
    ...accents[i],
  }));

  return (
    <SectionWrapper id="features" className="relative isolate bg-deep py-28 md:py-36">
      {/* Soft top spotlight that fades in */}
      <div className="spot-orb spot-cyan left-1/2 top-[-100px] h-[420px] w-[820px] -translate-x-1/2 opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-[0.35]" />

      <div className="container-page relative">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55"
          >
            <span className="h-1 w-1 rounded-full bg-cyan-300" />
            {t("eyebrow")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="display mt-5 text-3xl font-semibold text-white md:text-4xl lg:text-[44px]"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 text-[15px] text-white/50 md:text-base"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Grid */}
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {items.map(({ title, desc, Icon, color, glow }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4 }}
              className="group surface-card relative overflow-hidden p-6 transition-colors duration-300"
              style={{ ["--accent" as string]: color, ["--accent-glow" as string]: glow }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}33`;
                (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${color}1a, 0 30px 70px -30px ${glow}, 0 14px 38px -14px ${glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Corner glow on hover */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${color}26, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className="relative mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(180deg, ${color}1c 0%, ${color}06 100%)`,
                  border: `1px solid ${color}26`,
                  boxShadow: `inset 0 1px 0 ${color}33, 0 6px 20px -6px ${color}22`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
                <span
                  className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)`, filter: "blur(12px)" }}
                />
              </div>

              <h3 className="text-[16px] font-semibold tracking-tight text-white/92">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-white/45">{desc}</p>

              {/* Bottom accent line on hover */}
              <div
                className="absolute inset-x-6 bottom-0 h-px scale-x-0 origin-left bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
