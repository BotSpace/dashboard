import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["uz", "en", "ru"],
  defaultLocale: "en",
  localePrefix: "always",
  // Keep every public URL explicit and stable for users and search engines:
  // / redirects to /en, while selected Uzbek and Russian use /uz and /ru.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
