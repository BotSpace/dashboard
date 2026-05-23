"use client";
import { motion } from "framer-motion";
import { SectionWrapper } from "./section-wrapper";

const BG = "#030308";

const nodes = [
  { id: "trigger", x: 8, y: 18, label: "/start", type: "Trigger", color: "#00e5ff" },
  { id: "msg", x: 38, y: 12, label: "Salomlashish", type: "Message", color: "#8b5cf6" },
  { id: "menu", x: 38, y: 50, label: "Menyu", type: "Keyboard", color: "#06b6d4" },
  { id: "cond", x: 68, y: 18, label: "Tekshirish", type: "Condition", color: "#f59e0b" },
  { id: "ai", x: 68, y: 55, label: "AI Agent", type: "AI", color: "#22d3ee" },
  { id: "save", x: 88, y: 38, label: "Saqlash", type: "State", color: "#a78bfa" },
];

const edges = [
  { from: "trigger", to: "msg" },
  { from: "msg", to: "menu" },
  { from: "msg", to: "cond" },
  { from: "menu", to: "ai" },
  { from: "cond", to: "save" },
  { from: "ai", to: "save" },
];

function getNodeCenter(id: string) {
  const n = nodes.find((n) => n.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + 5, y: n.y + 4 };
}

export function FlowBuilder() {
  return (
    <SectionWrapper className="relative py-24 md:py-32" style={{ background: BG }}>
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
            Vizual konstruktor
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 text-base text-white/30 md:text-lg"
          >
            Drag-and-drop bilan murakkab bot flow&apos;larni yarating
          </motion.p>
        </div>

        {/* Flow canvas mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(0,229,255,0.03)",
              aspectRatio: "16/9",
            }}
          >
            {/* Dot grid background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* SVG edges */}
            <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {edges.map((e, i) => {
                const from = getNodeCenter(e.from);
                const to = getNodeCenter(e.to);
                return (
                  <line
                    key={i}
                    x1={`${from.x}%`}
                    y1={`${from.y}%`}
                    x2={`${to.x}%`}
                    y2={`${to.y}%`}
                    stroke="url(#edgeGrad)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    style={{
                      animation: `lp-shimmer ${3 + i * 0.5}s linear infinite`,
                    }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="absolute z-10 rounded-lg px-3 py-2"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  background: "rgba(3,3,8,0.85)",
                  border: `1px solid ${node.color}30`,
                  boxShadow: `0 0 20px ${node.color}10, 0 4px 12px rgba(0,0,0,0.4)`,
                  backdropFilter: "blur(10px)",
                  animation: `lp-float ${6 + i * 1.5}s ease-in-out infinite ${i * 0.5}s`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: node.color, boxShadow: `0 0 8px ${node.color}` }}
                  />
                  <div>
                    <div className="text-[10px] text-white/25">{node.type}</div>
                    <div className="text-xs font-medium text-white/70">{node.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
