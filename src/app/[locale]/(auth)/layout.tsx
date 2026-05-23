import { Logo } from "@/shared/components/common/logo";
import { Link } from "@/shared/i18n/routing";
import { LanguageSwitcher } from "@/shared/components/common/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="container-page flex h-16 items-center justify-between">
        <Link href="/" aria-label="BotSpace">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
