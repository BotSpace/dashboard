import { redirect } from "@/shared/i18n/routing";

// botspace.uz/pricing previously 404'd (the nav only ever linked to the
// in-page #pricing anchor). Redirect any direct visit to the pricing
// section on the locale-aware landing page.
export default async function PricingRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/#pricing", locale });
}
