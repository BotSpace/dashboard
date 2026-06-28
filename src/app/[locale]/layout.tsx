import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Script from "next/script";
import { notFound } from "next/navigation";
import { routing } from "@/shared/i18n/routing";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { Toaster } from "@/shared/providers/toaster";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* Umami analytics (self-hosted) — landing + app tashriflarini kuzatadi.
            website-id ommaviy (script tegida ko'rinadi), sir emas. */}
        <Script
          defer
          src="https://umami.botspace.uz/script.js"
          data-website-id="2699cd62-0385-4c4a-9d52-2c47e5512e53"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <NextIntlClientProvider>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
