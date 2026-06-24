"use client";
import { useLocale, useTranslations } from "next-intl";
import { LogOut, Settings, CreditCard, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Link } from "@/shared/i18n/routing";
import { initials } from "@/shared/lib/utils";

export type UserMenuUser = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
};

function fullName(u: UserMenuUser): string {
  return [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const display = fullName(user) || user.email || user.phone || "—";

  const handleLogout = () => {
    // ROUTE HANDLER orqali: cookie'ni ishonchli o'chiradi (server action
    // cookies().delete() ni brauzerga qo'llamasdi → logout ishlamasdi).
    window.location.href = `/api/auth/logout?locale=${locale}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {user.avatar && <AvatarImage src={user.avatar} alt={display} />}
            <AvatarFallback>{initials(display)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{display}</span>
            <span className="text-xs text-muted-foreground">{user.email ?? user.phone}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <UserCircle className="h-4 w-4" /> Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Settings className="h-4 w-4" /> {t("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/billing">
            <CreditCard className="h-4 w-4" /> Tarif
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
