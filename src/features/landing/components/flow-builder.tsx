"use client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

type NodeDef = {
  id: keyof Nodes;
  x: number;
  y: number;
  color: string;
};

type Nodes = {
  trigger: { type: string; label: string };
  msg: { type: string; label: string };
  menu: { type: string; label: string };
  cond: { type: string; label: string };
  ai: { type: string; label: string };
  save: { type: string; label: string };
};

const nodes: NodeDef[] = [
  { id: "trigger", x: 6, y: 18, color: "#22d3ee" },
  { id: "msg", x: 32, y: 12, color: "#a78bfa" },
  { id: "menu", x: 32, y: 56, color: "#60a5fa" },
  { id: "cond", x: 60, y: 18, color: "#fbbf24" },
  { id: "ai", x: 60, y: 60, color: "#34d399" },
  { id: "save", x: 84, y: 38, color: "#f0abfc" },
];

const edges: { from: NodeDef["id"]; to: NodeDef["id"] }[] = [
  { from: "trigger", to: "msg" },
  { from: "msg", to: "menu" },
  { from: "msg", to: "cond" },
  { from: "menu", to: "ai" },
  { from: "cond", to: "save" },
  { from: "ai", to: "save" },
];

function centerOf(id: NodeDef["id"]) {
  const n = nodes.find((n) => n.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + 7, y: n.y + 4 };
}

export function FlowBuilder() {
  const t = useTranslations("landing.flow");
  const bullets = t.raw("bullets") as string[];

  return (
    <SectionWrapper className="relative isolate bg-deep py-28 md:py-36">
      <div className="spot-orb spot-violet left-[-160px] top-[10%] h-[480px] w-[480px] opacity-[0.30]" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-[0.30]" />

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55"
          >
            <span className="h-1 w-1 rounded-full bg-violet-300" />
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
            className="mt-4 max-w-md text-[15px] leading-relaxed text-white/50 md:text-base"
          >
            {t("subtitle")}
          </motion.p>

          <ul className="mt-7 space-y-3.5">
            {bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                className="flex items-start gap-3 text-[14px] text-white/75"
              >
                <span
                  className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                    boxShadow: "0 0 12px rgba(139,92,246,0.5)",
                  }}
                >
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </span>
                {b}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right: flow canvas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.008) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 40px 80px -30px rgba(0,0,0,0.6), 0 0 60px -20px rgba(139,92,246,0.25)",
              aspectRatio: "4/3",
            }}
          >
            {/* Window chrome */}
            <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 border-b border-white/[0.06] bg-black/30 px-4 py-2.5 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.10]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.10]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/[0.10]" />
              <span className="ml-3 text-[11px] text-white/40">flow / @myshop_bot</span>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #10b981" }} />
                Live
              </span>
            </div>

            {/* Dot grid background */}
            <div
              className="absolute inset-0 top-9 bg-dots opacity-[0.28]"
              style={{ backgroundSize: "20px 20px" }}
            />

            {/* SVG edges */}
            <svg className="absolute inset-0 top-9 z-10 h-[calc(100%-2.25rem)] w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {edges.map((e, i) => {
                const from = centerOf(e.from);
                const to = centerOf(e.to);
                return (
                  <g key={i}>
                    <line
                      x1={`${from.x}%`}
                      y1={`${from.y}%`}
                      x2={`${to.x}%`}
                      y2={`${to.y}%`}
                      stroke="url(#edgeGrad)"
                      strokeWidth="1.4"
                      strokeDasharray="4 6"
                      opacity="0.7"
                      style={{
                        animation: `lp-shimmer ${3 + i * 0.4}s linear infinite`,
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
              const tn = t.raw(`nodes.${node.id}`) as { type: string; label: string };
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.85, y: 8 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                  whileHover={{ y: -2, scale: 1.04 }}
                  className="absolute z-20 select-none rounded-xl px-3.5 py-2"
                  style={{
                    left: `${node.x}%`,
                    top: `calc(${node.y}% + 2.25rem)`,
                    background:
                      "linear-gradient(180deg, rgba(20,21,32,0.95) 0%, rgba(10,11,18,0.95) 100%)",
                    border: `1px solid ${node.color}3a`,
                    boxShadow: `0 0 0 1px ${node.color}10, 0 16px 30px -12px ${node.color}30, 0 8px 18px -8px rgba(0,0,0,0.6)`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: node.color, boxShadow: `0 0 10px ${node.color}` }}
                    />
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/35">
                        {tn.type}
                      </div>
                      <div className="text-[12.5px] font-medium text-white/85">{tn.label}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Floating cursor pointer mockup */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: ["46%", "62%", "46%"],
                top: ["calc(38% + 2.25rem)", "calc(60% + 2.25rem)", "calc(38% + 2.25rem)"],
              }}
              transition={{
                opacity: { delay: 1.2, duration: 0.5 },
                left: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.4 },
                top: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.4 },
              }}
              className="absolute z-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                <path
                  d="M5.5 3.5l4 14 2.5-5.5 5.5-2.5-12-6z"
                  fill="white"
                  stroke="#0a0a12"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute left-5 top-4 whitespace-nowrap rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-900 shadow-md">
                You
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
