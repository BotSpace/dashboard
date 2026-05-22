import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/features/landing/components/hero";
import { Features } from "@/features/landing/components/features";
import { TemplatesPreview } from "@/features/landing/components/templates-preview";
import { Pricing } from "@/features/landing/components/pricing";
import { CtaBanner } from "@/features/landing/components/cta-banner";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Features />
      <TemplatesPreview locale={locale} />
      <Pricing />
      <CtaBanner />
    </>
  );
}
