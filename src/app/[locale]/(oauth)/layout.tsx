import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/shared/i18n/routing";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";

// OAuth consent — not for search indexes.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function OAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh bg-deep text-white">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-page flex h-16 items-center justify-between md:h-20">
          <Link href="/" aria-label="BotSpace" className="flex items-center">
            <Image
              src="/logo-light.png"
              alt="BotSpace"
              width={480}
              height={120}
              priority
              className="h-auto w-[120px] md:w-[136px]"
            />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
