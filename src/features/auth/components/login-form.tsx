"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, ExternalLink, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { CanvasRevealEffect } from "@/shared/components/ui/sign-in-flow-1";
import { GoogleButton } from "./google-button";
import { telegramLoginAction, type ActionState } from "@/features/auth/actions";
import { env } from "@/shared/lib/env";
import { OTP_LENGTH } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

type Step = "entry" | "code" | "success";

export function LoginForm({ from }: { from?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep] = useState<Step>("entry");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const botUsername = env.NEXT_PUBLIC_TELEGRAM_BOT;
  const botUrl = `https://t.me/${botUsername}`;

  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    telegramLoginAction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      setReverseCanvasVisible(true);
      setTimeout(() => setInitialCanvasVisible(false), 50);
      setTimeout(() => setStep("success"), 1400);
      const target = from && from.startsWith("/") ? from : `/${locale}/app`;
      setTimeout(() => {
        router.push(target);
        router.refresh();
      }, 2400);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, from, locale, router]);

  useEffect(() => {
    if (step === "code") {
      const id = setTimeout(() => codeInputRefs.current[0]?.focus(), 400);
      return () => clearTimeout(id);
    }
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < OTP_LENGTH - 1) codeInputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) codeInputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    codeInputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const codeString = code.join("");
  const codeComplete = code.every((d) => d.length === 1);

  const handleBackClick = () => {
    setStep("entry");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-deep">
      {/* Split: brand left / form right (stacks on mobile) */}
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* ─── Brand panel ───────────────────────────────────────── */}
        <div className="relative hidden overflow-hidden lg:block">
          {/* Shader background (kept, but muted) */}
          <div className="absolute inset-0 opacity-50">
            {initialCanvasVisible && (
              <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-transparent"
                colors={[[255, 255, 255], [255, 255, 255]]}
                dotSize={5}
                reverse={false}
              />
            )}
            {reverseCanvasVisible && (
              <CanvasRevealEffect
                animationSpeed={4}
                containerClassName="bg-transparent"
                colors={[[255, 255, 255], [255, 255, 255]]}
                dotSize={5}
                reverse
              />
            )}
          </div>

          {/* Gradient overlays */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.30), transparent 55%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.22), transparent 55%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,6,10,0.65) 0%, rgba(5,6,10,0.4) 50%, rgba(5,6,10,0.8) 100%)",
            }}
          />
          <div className="beam beam-thick left-[20%] opacity-50" />
          <div className="beam left-[70%] opacity-30" />

          {/* Right edge hairline */}
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.10] to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
            <div />
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/65 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-cyan-300" />
                BotSpace
              </div>
              <h2 className="display max-w-md text-4xl font-semibold leading-[1.05] xl:text-5xl">
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #ffffff 55%, rgba(255,255,255,0.55) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {t("brand.headline")}
                </span>
              </h2>
              <p className="max-w-md text-[15px] leading-relaxed text-white/55">
                {t("brand.tagline")}
              </p>
              <ul className="space-y-2.5 pt-2">
                {(t.raw("brand.perks") as string[]).map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[13.5px] text-white/65">
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
                        boxShadow: "0 0 10px rgba(139,92,246,0.5)",
                      }}
                    >
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-white/30">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #10b981" }} />
              {t("brand.status")}
            </div>
          </div>
        </div>

        {/* ─── Form panel ────────────────────────────────────────── */}
        <div className="relative flex items-center justify-center px-4 py-24 sm:px-6 md:px-8 lg:py-12">
          {/* Subtle background on mobile */}
          <div className="pointer-events-none absolute inset-0 lg:hidden">
            <div className="spot-orb spot-blue left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 opacity-50" />
          </div>

          <div className="relative w-full max-w-sm">
            <AnimatePresence mode="wait">
              {step === "entry" ? (
                <motion.div
                  key="entry-step"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="space-y-7"
                >
                  <div className="space-y-2 text-center lg:text-left">
                    <h1 className="display text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-[36px]">
                      {t("telegram.title")}
                    </h1>
                    <p className="text-[14px] text-white/55">{t("telegram.subtitle")}</p>
                  </div>

                  <div className="space-y-3">
                    <GoogleButton label={t("login.google")} />

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/[0.08]" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">
                        {t("login.or")}
                      </span>
                      <div className="h-px flex-1 bg-white/[0.08]" />
                    </div>

                    <a
                      href={botUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-medium"
                    >
                      <span>{t("telegram.openBot")}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setStep("code")}
                      className="btn-primary group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold"
                    >
                      {t("telegram.enterCode")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  <p className="text-center text-[11.5px] leading-relaxed text-white/35 lg:text-left">
                    {t("terms")}
                  </p>
                </motion.div>
              ) : step === "code" ? (
                <motion.div
                  key="code-step"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="space-y-7"
                >
                  <div className="space-y-2 text-center lg:text-left">
                    <h1 className="display text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-[36px]">
                      {t("telegram.title")}
                    </h1>
                    <p className="text-[14px] text-white/55">{t("telegram.enterCode")}</p>
                  </div>

                  <form action={action} className="space-y-6">
                    <input type="hidden" name="code" value={codeString} />

                    {/* OTP cells */}
                    <div className="flex items-center justify-between gap-2">
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            codeInputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onPaste={handlePaste}
                          aria-label={`digit-${i + 1}`}
                          className={cn(
                            "h-14 w-12 rounded-xl border bg-white/[0.025] text-center text-2xl font-semibold text-white outline-none transition-all",
                            "focus:border-white/40 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]",
                            digit
                              ? "border-white/25 bg-white/[0.05]"
                              : "border-white/10",
                          )}
                          style={{ caretColor: "rgba(255,255,255,0.5)" }}
                        />
                      ))}
                    </div>

                    <a
                      href={botUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] text-white/50 underline-offset-4 transition-colors hover:text-white/85 hover:underline"
                    >
                      {t("telegram.openBot")}
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex w-full gap-3">
                      <motion.button
                        type="button"
                        onClick={handleBackClick}
                        className="btn-ghost flex h-12 w-14 items-center justify-center rounded-xl"
                        whileTap={{ scale: 0.96 }}
                        aria-label="Back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </motion.button>
                      <button
                        type="submit"
                        disabled={!codeComplete || pending}
                        className={cn(
                          "h-12 flex-1 rounded-xl text-[14px] font-semibold transition-all",
                          codeComplete && !pending
                            ? "btn-primary"
                            : "cursor-not-allowed border border-white/[0.06] bg-white/[0.025] text-white/30",
                        )}
                      >
                        {pending ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
                            ...
                          </span>
                        ) : (
                          t("telegram.submit")
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 220 }}
                    className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(180deg, #ffffff 0%, #f4f4f6 100%)",
                      boxShadow: "0 0 60px rgba(139,92,246,0.4), 0 18px 40px -10px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Check className="h-7 w-7 text-neutral-900" strokeWidth={3} />
                  </motion.div>
                  <div className="space-y-1">
                    <h1 className="display text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-[36px]">
                      {t("welcome")}
                    </h1>
                    <p className="text-[14px] text-white/55">BotSpace</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
