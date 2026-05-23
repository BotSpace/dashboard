import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

export default async function BotPlanPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/app/billing`);
}
