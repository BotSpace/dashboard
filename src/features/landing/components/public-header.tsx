"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/common/logo";
import { ThemeToggle } from "@/shared/components/common/theme-toggle";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";

type NavLink = { href: string; label: string; internal?: boolean };

export function PublicHeader() {
  const t = useTranslations("landing");
  const [open, setOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/#features", label: t("navFeatures") },
    { href: "/#pricing", label: t("navPricing") },
    { href: "/templates", label: t("navTemplates"), internal: true },
    { href: "/#contact", label: t("navContact") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="Botmother">
            <Logo />
          </Link>
          <nav className="hidden gap-6 md:flex">
            {links.map((l) =>
              l.internal ? (
                <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {l.label}
                </a>
              )
            )}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild>
              <Link href="/login">{t("navLogin")}</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container-page flex flex-col gap-4 py-4">
            {links.map((l) =>
              l.internal ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              )
            )}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/login">{t("navLogin")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
