import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);
  return <LoginForm from={from} />;
}
