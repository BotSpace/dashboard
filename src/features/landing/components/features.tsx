"use client";
import { motion } from "framer-motion";
import { Bot, BrainCircuit, BarChart3, Blocks, Database, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionWrapper } from "./section-wrapper";

const icons = [Blocks, BrainCircuit, Bot, Globe, Database, BarChart3];
const colors = ["#0ea5e9", "#7c3aed", "#06b6d4", "#8b5cf6", "#0ea5e9", "#7c3aed"];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
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
    <SectionWrapper
      id="features"
      className="lp-section-glow relative py-24 md:py-32"
      style={{ background: "#06060a" }}
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 30%, #0ea5e9 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/35 md:text-lg">{t("subtitle")}</p>
        </div>

        <motion.div
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {items.map(({ title, desc, Icon, color }, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl p-6 transition-shadow duration-500"
              whileHover={{
                scale: 1.03,
                boxShadow: `0 0 40px ${color}18, 0 20px 60px rgba(0,0,0,0.4)`,
              }}
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                }}
              />
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300"
                style={{
                  background: `${color}10`,
                  border: `1px solid ${color}20`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-base font-semibold text-white/90">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/35">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
