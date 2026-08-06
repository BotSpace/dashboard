"use client";
import { Bell, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";
import { UserMenu, type UserMenuUser } from "./user-menu";
import { MobileSidebar } from "./mobile-sidebar";

export function TopBar({ user }: { user: UserMenuUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // The onboarding tour drives the drawer open/closed for its sidebar steps.
  useEffect(() => {
    const onDrawer = (e: Event) => setMobileOpen(Boolean((e as CustomEvent).detail));
    window.addEventListener("bs:tour-drawer", onDrawer);
    return () => window.removeEventListener("bs:tour-drawer", onDrawer);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/app/bots?q=${encodeURIComponent(q)}` : "/app/bots");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-3 backdrop-blur-xl lg:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu />
        </Button>
        <form onSubmit={onSearch} role="search" className="relative min-w-0 flex-1 sm:max-w-xs lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Botlarni qidirish…"
            aria-label="Botlarni qidirish"
            className="h-8 w-full border-transparent bg-muted/70 pl-9 shadow-none hover:border-border focus-visible:border-border focus-visible:bg-background"
          />
        </form>
        <div className="ml-auto flex items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Bildirishnomalar" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <LanguageSwitcher />
          <div className="ml-0.5">
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onOpenChangeAction={setMobileOpen} />
    </>
  );
}
