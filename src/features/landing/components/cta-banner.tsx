"use client";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/shared/i18n/routing";

const CtaScene = dynamic(() => import("./cta-scene"), { ssr: false });
const BG = "#030308";

export function CtaBanner() {
  const t = useTranslations("landing.cta");
  return (
    <section id="contact" className="relative py-28 md:py-36" style={{ background: BG }}>
      {/* 3D particle wave */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
        <CtaScene />
      </div>

      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 15%, #00e5ff 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </h2>
          <p className="mt-5 text-[15px] text-white/30">{t("subtitle")}</p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-full px-9 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.04] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00c8ff, #8b5cf6)",
                boxShadow: "0 0 50px rgba(0,200,255,0.3), 0 0 100px rgba(139,92,246,0.15)",
              }}
            >
              {t("button")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
