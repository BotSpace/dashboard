import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/features/landing/components/hero";
import { Features } from "@/features/landing/components/features";
import { FlowBuilder } from "@/features/landing/components/flow-builder";
import { AIAgent } from "@/features/landing/components/ai-agent";
import { Pricing } from "@/features/landing/components/pricing";
import { FAQ } from "@/features/landing/components/faq";
import { CtaBanner } from "@/features/landing/components/cta-banner";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
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
