"use client";
import { Blocks, BrainCircuit, Bot, Globe, Database, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const BG = "#030308";
const icons = [Blocks, BrainCircuit, Bot, Globe, Database, BarChart3];
const colors = ["#00e5ff", "#8b5cf6", "#06b6d4", "#a78bfa", "#22d3ee", "#7c3aed"];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export function Features() {
  const t = useTranslations("landing.features");
  const items = Array.from({ length: 6 }, (_, i) => ({
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
    Icon: icons[i],
    color: colors[i],
  }));

  return (
    <SectionWrapper id="features" className="relative py-24 md:py-36" style={{ background: BG }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #00e5ff, transparent 70%)" }}
      />

      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 25%, #00e5ff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-base text-white/30 md:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, desc, Icon, color }, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative cursor-default overflow-hidden rounded-2xl p-6"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "box-shadow 0.4s, border-color 0.4s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}25`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${color}08, 0 0 40px ${color}05`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${color}12 0%, transparent 70%)` }}
              />
              <div
                className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${color}0a`, border: `1px solid ${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-[15px] font-semibold text-white/85">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/30">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
