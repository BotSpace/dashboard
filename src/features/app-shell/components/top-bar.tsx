"use client";
import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";
import { UserMenu, type UserMenuUser } from "./user-menu";
import { MobileSidebar } from "./mobile-sidebar";

export function TopBar({ user }: { user: UserMenuUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu />
        </Button>
        <div className="relative w-full max-w-sm lg:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Qidirish… (⌘K)"
            className="h-9 w-full pl-9 bg-muted/40 focus-visible:bg-background"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Bildirishnomalar" className="relative">
            <Bell className="h-4 w-4" />
          </Button>
          <LanguageSwitcher />
          <div className="ml-0.5">
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
