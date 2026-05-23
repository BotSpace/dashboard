"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

const faqs = [
  {
    q: "BotSpace bepulmi?",
    a: "Ha, Free tarif bilan 1 ta bot va oyiga 200K AI token bepul. Karta talab qilinmaydi.",
  },
  {
    q: "Kod yozish kerakmi?",
    a: "Yo'q. Vizual konstruktor yoki AI agent bilan tabiiy tilda bot yaratishingiz mumkin.",
  },
  {
    q: "Qanday to'lov usullari bor?",
    a: "Payme, Click va xalqaro kartalar (Visa/Mastercard) orqali to'lash mumkin.",
  },
  {
    q: "AI agent nima qila oladi?",
    a: "Flow tuzadi, node qo'shadi, deploy qiladi, CRM boshqaradi, broadcast yuboradi — barchasi tabiiy tilda.",
  },
  {
    q: "Botni boshqa platformalarga ulasa bo'ladimi?",
    a: "Hozircha Telegram to'liq qo'llab-quvvatlanadi. Boshqa kanallar tez orada qo'shiladi.",
  },
  {
    q: "MCP server nima?",
    a: "Claude Desktop yoki Cursor kabi AI agentlar orqali BotSpace platformasini boshqarish imkonini beradi.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <SectionWrapper
      className="relative py-24 md:py-32"
      style={{ background: "#06060a" }}
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{
              background: "linear-gradient(135deg, #fff 40%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Ko&apos;p beriladigan savollar
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  background: isOpen
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.015)",
                  borderColor: isOpen
                    ? "rgba(14,165,233,0.15)"
                    : "rgba(255,255,255,0.05)",
                }}
                className="overflow-hidden rounded-xl"
                style={{ border: "1px solid" }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-white/80">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="ml-4 shrink-0"
                  >
                    <ChevronDown className="h-4 w-4 text-white/30" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { type: "spring", stiffness: 300, damping: 32 },
                        opacity: { duration: 0.2 },
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-white/35">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
