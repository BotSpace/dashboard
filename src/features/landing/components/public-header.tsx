"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";
import { Logo } from "@/shared/components/common/logo";
import { Link } from "@/shared/i18n/routing";

type NavLink = { href: string; label: string; internal?: boolean };

export function PublicHeader({ authenticated = false }: { authenticated?: boolean }) {
  const t = useTranslations("landing");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: NavLink[] = [
    { href: "/#features", label: t("navFeatures") },
    { href: "/#pricing", label: t("navPricing") },
    { href: "/templates", label: t("navTemplates"), internal: true },
    { href: "/blog", label: t("navBlog"), internal: true },
    { href: "/docs/mcp", label: t("navMcp"), internal: true },
  ];

  const renderLink = (link: NavLink, mobile = false) => {
    const className = mobile
      ? "rounded-md px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
      : "text-sm text-white/55 transition-colors hover:text-white";
    return link.internal ? (
      <Link key={link.href} href={link.href} className={className} onClick={() => setOpen(false)}>{link.label}</Link>
    ) : (
      <a key={link.href} href={link.href} className={className} onClick={() => setOpen(false)}>{link.label}</a>
    );
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${scrolled || open ? "border-white/10 bg-black/85 backdrop-blur-xl" : "border-transparent bg-black/20"}`}>
      <div className="container-page flex h-16 items-center">
        <Link href="/" className="flex items-center" aria-label="BotSpace"><Logo className="w-30" /></Link>
        <nav className="ml-10 hidden items-center gap-7 md:flex">{links.map((link) => renderLink(link))}</nav>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link href={authenticated ? "/app" : "/login"} className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-white/85">
            {authenticated ? <User className="h-3.5 w-3.5" /> : null}
            {authenticated ? t("navDashboard") : t("navLogin")}
            {!authenticated ? <ArrowRight className="h-3.5 w-3.5" /> : null}
          </Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white md:hidden" aria-label="Menu">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/10 bg-black md:hidden">
            <div className="container-page flex flex-col gap-1 py-4">
              {links.map((link) => renderLink(link, true))}
              <div className="my-2 h-px bg-white/10" />
              <div className="flex items-center gap-3"><LanguageSwitcher /><Link href={authenticated ? "/app" : "/login"} className="flex h-10 flex-1 items-center justify-center rounded-md bg-white text-sm font-medium text-black">{authenticated ? t("navDashboard") : t("navLogin")}</Link></div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
