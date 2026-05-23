import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/features/landing/components/hero";
import { TrustedBy } from "@/features/landing/components/trusted-by";
import { Features } from "@/features/landing/components/features";
import { AIAgent } from "@/features/landing/components/ai-agent";
import { TemplatesPreview } from "@/features/landing/components/templates-preview";
import { Pricing } from "@/features/landing/components/pricing";
import { FAQ } from "@/features/landing/components/faq";
import { CtaBanner } from "@/features/landing/components/cta-banner";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <TrustedBy />
      <Features />
      <AIAgent />
      <TemplatesPreview locale={locale} />
      <Pricing />
      <FAQ />
      <CtaBanner />
    </>
  );
}
