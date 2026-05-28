"use client";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionWrapper } from "./section-wrapper";

export function AIAgent() {
  const t = useTranslations("landing.agent");
  const tags = t.raw("tags") as string[];

  return (
    <SectionWrapper className="relative isolate bg-deep py-28 md:py-36">
      <div className="spot-orb spot-violet right-[-160px] top-[5%] h-[520px] w-[520px] opacity-40" />
      <div className="spot-orb spot-cyan left-[-100px] bottom-[10%] h-[400px] w-[400px] opacity-25" />

      <div className="container-page relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-200">
              <Sparkles className="h-3 w-3" />
              {t("eyebrow")}
            </div>
            <h2 className="display mt-5 text-3xl font-semibold text-white md:text-4xl lg:text-[44px]">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/50 md:text-base">
              {t("subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] font-medium text-white/55 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: chat preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            {/* Halo behind chat */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] opacity-50"
              style={{
                background:
                  "radial-gradient(circle at 70% 50%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(circle at 20% 80%, rgba(6,182,212,0.20), transparent 60%)",
                filter: "blur(40px)",
              }}
            />

            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,21,32,0.95) 0%, rgba(10,11,18,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -30px rgba(0,0,0,0.7), 0 0 60px -20px rgba(139,92,246,0.25)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
                <div className="relative">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: "linear-gradient(135deg, #22d3ee, #8b5cf6)" }}
                  >
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400"
                    style={{ boxShadow: "0 0 0 2px #0a0b12, 0 0 8px #10b981" }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-white/90">
                    {t("chat.headerTitle")}
                  </div>
                  <div className="text-[10.5px] text-white/40">
                    {t("chat.headerStatus")}
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-3 px-5 py-5">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-[82%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed text-neutral-900"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                    }}
                  >
                    {t("chat.u1")}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] leading-relaxed text-white/85 backdrop-blur-sm">
                    {t("chat.a1")}{" "}
                    <span
                      className="block pt-1 font-medium"
                      style={{
                        background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {t("chat.a1Flow")}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.85 }}
                  className="flex justify-end"
                >
                  <div
                    className="rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed text-neutral-900"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                    }}
                  >
                    {t("chat.u2")}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.15 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] leading-relaxed text-white/85 backdrop-blur-sm">
                    🚀 {t("chat.a2")}{" "}
                    <span className="font-semibold text-cyan-300">
                      {t("chat.a2Mention")}
                    </span>{" "}
                    {t("chat.a2Tail")}
                  </div>
                </motion.div>

                {/* Typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span
                      className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Input mock */}
              <div className="border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2.5">
                  <span className="flex-1 text-[12.5px] text-white/35">
                    {t("chat.placeholder")}
                  </span>
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                      boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
                    }}
                  >
                    <Send className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
