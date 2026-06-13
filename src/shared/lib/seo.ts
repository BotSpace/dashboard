import type { Metadata } from "next";
import { env } from "./env";
import { routing, type Locale } from "@/shared/i18n/routing";

/** Canonical production origin (no trailing slash). */
export const SITE_URL = (env.NEXT_PUBLIC_SITE_URL ?? "https://botspace.uz").replace(/\/+$/, "");
export const SITE_NAME = "BotSpace";
export const TWITTER_HANDLE = "@botspace_uz";

const OG_LOCALE: Record<Locale, string> = {
  uz: "uz_UZ",
  en: "en_US",
  ru: "ru_RU",
};

/**
 * Absolute URL for a route in a given locale, honouring next-intl's
 * `as-needed` prefix (default locale `uz` has no prefix; `en`/`ru` do).
 */
export function localizedUrl(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+/, "")}`;
  if (locale === routing.defaultLocale) return `${SITE_URL}${clean}`;
  return `${SITE_URL}/${locale}${clean}`;
}

/** hreflang map (uz/en/ru + x-default → default locale) for a path. */
export function languageAlternates(path = "/"): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const l of routing.locales) langs[l] = localizedUrl(l, path);
  langs["x-default"] = localizedUrl(routing.defaultLocale, path);
  return langs;
}

type BuildArgs = {
  locale: Locale;
  /** Route path WITHOUT the locale prefix, e.g. "/pricing" (default "/"). */
  path?: string;
  title: string;
  description: string;
  keywords?: string[];
  /** Set true to render an absolute title (no "· BotSpace" template suffix). */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  /** Explicit OG/Twitter images. Omit to let the file-based opengraph-image apply. */
  images?: string[];
  noindex?: boolean;
};

/**
 * Build a fully-populated Metadata object: canonical + hreflang, Open Graph,
 * Twitter card and robots directives. Used by every public page.
 */
export function buildMetadata({
  locale,
  path = "/",
  title,
  description,
  keywords,
  absoluteTitle,
  type = "website",
  images,
  noindex,
}: BuildArgs): Metadata {
  const url = localizedUrl(locale, path);
  return {
    metadataBase: new URL(SITE_URL),
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      ...(images?.length ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      title,
      description,
      ...(images?.length ? { images } : {}),
    },
  };
}
