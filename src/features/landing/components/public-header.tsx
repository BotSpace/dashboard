"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/common/logo";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";

type NavLink = { href: string; label: string; internal?: boolean };

export function PublicHeader() {
  const t = useTranslations("landing");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: NavLink[] = [
    { href: "/#features", label: t("navFeatures") },
    { href: "/#pricing", label: t("navPricing") },
    { href: "/templates", label: t("navTemplates"), internal: true },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(8,8,12,0.7)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center" aria-label="BotSpace">
            <Logo className="max-w-[140px]" />
          </Link>
          <nav className="hidden gap-7 md:flex">
            {links.map((l) =>
              l.internal ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-medium text-white/50 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-medium text-white/50 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                boxShadow: "0 0 20px rgba(14,165,233,0.3), 0 0 60px rgba(124,58,237,0.15)",
              }}
            >
              {t("navLogin")}
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div
          className="md:hidden"
          style={{ background: "rgba(8,8,12,0.95)", backdropFilter: "blur(20px)" }}
        >
          <div className="container-page flex flex-col gap-4 py-6">
            {links.map((l) =>
              l.internal ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/60 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/60 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              )
            )}
            <div className="flex items-center gap-2 pt-2">
              <LanguageSwitcher />
            </div>
            <Link
              href="/login"
              className="mt-1 inline-flex w-full items-center justify-center rounded-full py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #7c3aed)" }}
              onClick={() => setOpen(false)}
            >
              {t("navLogin")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
