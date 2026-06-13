import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/features/landing/components/hero";
import { Features } from "@/features/landing/components/features";
import { FlowBuilder } from "@/features/landing/components/flow-builder";
import { AIAgent } from "@/features/landing/components/ai-agent";
import { Pricing } from "@/features/landing/components/pricing";
import { FAQ } from "@/features/landing/components/faq";
import { CtaBanner } from "@/features/landing/components/cta-banner";
import { JsonLd } from "@/shared/components/common/json-ld";
import { buildMetadata, localizedUrl, SITE_NAME, SITE_URL } from "@/shared/lib/seo";
import type { Locale } from "@/shared/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/",
    title: t("home.title"),
    description: t("home.description"),
    keywords: t.raw("home.keywords") as string[],
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const tFaq = await getTranslations({ locale, namespace: "landing" });
  const faqItems = (tFaq.raw("faq.items") as { q: string; a: string }[]) ?? [];
  const homeUrl = localizedUrl(locale as Locale, "/");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-light.png`,
      description: tSeo("org.description"),
      sameAs: ["https://t.me/botspace_uz", "https://x.com/botspace_uz"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: locale,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: homeUrl,
      description: tSeo("home.description"),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    ...(faqItems.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <Features />
      <FlowBuilder />
      <AIAgent />
      <Pricing />
      <FAQ />
      <CtaBanner />
    </>
  );
}
