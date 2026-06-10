"use client";
import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/shared/i18n/routing";
import { Logo } from "@/shared/components/common/logo";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";

type NavLink = { href: string; label: string; internal?: boolean; highlight?: boolean };

export function PublicHeader() {
  const t = useTranslations("landing");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: NavLink[] = [
    { href: "/#features", label: t("navFeatures") },
    { href: "/#pricing", label: t("navPricing") },
    { href: "/templates", label: t("navTemplates"), internal: true },
    { href: "/blog", label: t("navBlog"), internal: true },
    { href: "/docs/mcp", label: t("navMcp"), internal: true, highlight: true },
  ];

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container-page pt-3 md:pt-5">
        <div
          className={`relative flex h-14 items-center justify-between rounded-2xl px-3 pl-4 transition-all duration-300 md:h-16 md:px-4 md:pl-5`}
          style={{
            background: scrolled
              ? "linear-gradient(180deg, rgba(10,11,18,0.85) 0%, rgba(10,11,18,0.72) 100%)"
              : "linear-gradient(180deg, rgba(10,11,18,0.55) 0%, rgba(10,11,18,0.35) 100%)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.04)",
            boxShadow: scrolled
              ? "0 12px 40px -12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex items-center gap-7 md:gap-10">
            <Link href="/" className="flex items-center" aria-label="BotSpace">
              <Logo className="max-w-[120px] md:max-w-[136px]" />
            </Link>
            <nav className="hidden gap-7 md:flex">
              {links.map((l) =>
                l.internal ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={
                      l.highlight
                        ? "inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 text-[12px] font-semibold text-violet-300 transition-colors hover:bg-violet-500/20 hover:text-violet-200"
                        : "relative text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                    }
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                  >
                    {l.label}
                  </a>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="btn-primary group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold"
              >
                {t("navLogin")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
              </Link>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-2 overflow-hidden rounded-2xl md:hidden"
              style={{
                background: "rgba(10,11,18,0.92)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 60px -20px rgba(0,0,0,0.55)",
              }}
            >
              <div className="flex flex-col gap-1 p-4">
                {links.map((l) =>
                  l.internal ? (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={
                        l.highlight
                          ? "inline-flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3 py-2.5 text-sm font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
                          : "rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                      }
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      key={l.href}
                      href={l.href}
                      className="rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </a>
                  )
                )}
                <div className="my-2 h-px bg-white/[0.06]" />
                <div className="flex items-center justify-between gap-3 px-1">
                  <LanguageSwitcher />
                  <Link
                    href="/login"
                    className="btn-primary inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    {t("navLogin")}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
