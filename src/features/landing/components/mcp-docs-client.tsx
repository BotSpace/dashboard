"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Terminal,
  Key,
  Plug,
  Zap,
  ShieldCheck,
  Package,
  Workflow,
  Database,
  Rocket,
  MessageSquare,
  Radio,
  ChevronRight,
} from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

interface Capability {
  name: string;
  desc: string;
}

interface McpDocsStrings {
  pageTitle: string;
  pageSubtitle: string;
  whatTitle: string;
  whatBody: string;
  capabilitiesTitle: string;
  capabilities: Capability[];
  connectTitle: string;
  claudeCodeTitle: string;
  claudeCodeStep1: string;
  claudeCodeStep2: string;
  claudeCodeStep3: string;
  tokenTitle: string;
  tokenStep1: string;
  tokenStep2: string;
  otherClientsTitle: string;
  otherClientsBody: string;
  quickstartTitle: string;
  quickstartBody: string;
  quickstartPrompt: string;
  quickstartResult: string;
  securityTitle: string;
  securityBody: string;
  copyTooltip: string;
}

const capabilityIcons = [Package, Workflow, Database, Rocket, Zap, Radio];
const capabilityColors = [
  { color: "#22d3ee", glow: "rgba(6,182,212,0.30)" },
  { color: "#a78bfa", glow: "rgba(139,92,246,0.30)" },
  { color: "#34d399", glow: "rgba(16,185,129,0.28)" },
  { color: "#60a5fa", glow: "rgba(59,130,246,0.28)" },
  { color: "#f0abfc", glow: "rgba(232,121,249,0.28)" },
  { color: "#fbbf24", glow: "rgba(251,191,36,0.26)" },
];

function CodeBlock({ code, copyTooltip }: { code: string; copyTooltip: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl"
      style={{
        background: "rgba(5,6,10,0.85)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <button
          onClick={handleCopy}
          title={copyTooltip}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed text-white/80">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white/70"
      style={{
        background: "rgba(139,92,246,0.18)",
        border: "1px solid rgba(139,92,246,0.35)",
      }}
    >
      {n}
    </span>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof Terminal; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(180deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 100%)",
          border: "1px solid rgba(139,92,246,0.28)",
          boxShadow: "inset 0 1px 0 rgba(139,92,246,0.25)",
        }}
      >
        <Icon className="h-4 w-4" style={{ color: "#a78bfa" }} />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-white/92">{title}</h2>
    </div>
  );
}

export function McpDocsClient({ strings: s }: { strings: McpDocsStrings }) {
  return (
    <div className="relative min-h-screen bg-deep text-white">
      {/* Background ambiance */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-120px] h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.22]"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.5), transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-[0.25]" />
      </div>

      {/* Hero */}
      <div className="relative pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mx-auto max-w-3xl"
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" style={{ boxShadow: "0 0 6px #a78bfa" }} />
              MCP · Streamable HTTP
            </div>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[56px] lg:leading-[1.08]">
              {s.pageTitle}
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-white/50 md:text-[17px] md:max-w-2xl">
              {s.pageSubtitle}
            </p>

            {/* Server URL pill */}
            <div
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{
                background: "rgba(5,6,10,0.7)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <span className="text-[12px] uppercase tracking-[0.14em] text-white/35">URL</span>
              <code className="text-[13px] font-mono text-cyan-300">https://botspace.uz/mcp</code>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-page relative space-y-16 pb-28">
        {/* What is MCP */}
        <SectionWrapper className="relative">
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <SectionHeading icon={Zap} title={s.whatTitle} />
            <p className="mt-4 text-[15px] leading-relaxed text-white/55">{s.whatBody}</p>
          </div>
        </SectionWrapper>

        {/* Capabilities grid */}
        <SectionWrapper className="relative">
          <SectionHeading icon={Package} title={s.capabilitiesTitle} />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {s.capabilities.map(({ name, desc }, i) => {
              const Icon = capabilityIcons[i];
              const { color, glow } = capabilityColors[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-xl p-5 transition-colors duration-300"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}33`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${color}1a, 0 20px 50px -20px ${glow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  <div
                    className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(180deg, ${color}1c 0%, ${color}06 100%)`,
                      border: `1px solid ${color}26`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="text-[14px] font-semibold text-white/90">{name}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-white/45">{desc}</div>
                </motion.div>
              );
            })}
          </div>
        </SectionWrapper>

        {/* Connect section */}
        <SectionWrapper className="relative space-y-6">
          <SectionHeading icon={Plug} title={s.connectTitle} />

          {/* Claude Code OAuth */}
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.02) 100%)",
              border: "1px solid rgba(139,92,246,0.20)",
            }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-violet-400" />
              <h3 className="text-[15px] font-semibold text-white/90">{s.claudeCodeTitle}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <StepBadge n={1} />
                <div className="flex-1 space-y-2">
                  <p className="text-[13px] text-white/55">{s.claudeCodeStep1}</p>
                  <CodeBlock
                    code="claude mcp add --transport http botspace https://botspace.uz/mcp"
                    copyTooltip={s.copyTooltip}
                  />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <StepBadge n={2} />
                <div className="flex-1 space-y-2">
                  <p className="text-[13px] text-white/55">{s.claudeCodeStep2}</p>
                  <CodeBlock code="/mcp" copyTooltip={s.copyTooltip} />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <StepBadge n={3} />
                <p className="text-[13px] text-white/55">{s.claudeCodeStep3}</p>
              </div>
            </div>
          </div>

          {/* Token / CI */}
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: "linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(6,182,212,0.02) 100%)",
              border: "1px solid rgba(6,182,212,0.20)",
            }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              <h3 className="text-[15px] font-semibold text-white/90">{s.tokenTitle}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <StepBadge n={1} />
                <p className="text-[13px] text-white/55">{s.tokenStep1}</p>
              </div>
              <div className="flex items-start gap-3">
                <StepBadge n={2} />
                <div className="flex-1 space-y-2">
                  <p className="text-[13px] text-white/55">{s.tokenStep2}</p>
                  <CodeBlock
                    code={`claude mcp add --transport http botspace https://botspace.uz/mcp \\\n  --header "Authorization: Bearer bsp_..."`}
                    copyTooltip={s.copyTooltip}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Other clients */}
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Plug className="h-4 w-4 text-white/40" />
              <h3 className="text-[15px] font-semibold text-white/90">{s.otherClientsTitle}</h3>
            </div>
            <p className="mb-4 text-[13px] text-white/55">{s.otherClientsBody}</p>
            <CodeBlock code="https://botspace.uz/mcp" copyTooltip={s.copyTooltip} />
          </div>
        </SectionWrapper>

        {/* Quickstart */}
        <SectionWrapper className="relative">
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(6,182,212,0.04) 100%)",
              border: "1px solid rgba(16,185,129,0.22)",
            }}
          >
            <div className="p-6 md:p-8">
              <SectionHeading icon={Rocket} title={s.quickstartTitle} />
              <p className="mt-4 text-[14px] text-white/55">{s.quickstartBody}</p>
              <div
                className="mt-5 flex items-start gap-3 rounded-xl p-4"
                style={{ background: "rgba(5,6,10,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-[14px] italic text-white/70">&ldquo;{s.quickstartPrompt}&rdquo;</p>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-[14px] text-white/55">{s.quickstartResult}</p>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Security note */}
        <SectionWrapper className="relative">
          <div
            className="flex items-start gap-4 rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 100%)",
              border: "1px solid rgba(251,191,36,0.18)",
            }}
          >
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div>
              <div className="text-[14px] font-semibold text-white/90">{s.securityTitle}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">{s.securityBody}</p>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
}
