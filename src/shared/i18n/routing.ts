import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["uz", "en", "ru"],
  defaultLocale: "uz",
  localePrefix: "as-needed",
  // First visit should land on Uzbek (no Accept-Language sniffing that sent
  // users to /en). The user's explicit choice is still honoured via the
  // NEXT_LOCALE cookie that next-intl sets when switching languages.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
