import { setRequestLocale } from "next-intl/server";
import { EnvAPI } from "@/shared/api/services";
import { EnvList } from "@/features/bots/components/env-list";

export default async function EnvPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const items = await EnvAPI.list(id).catch(() => []);
  return <EnvList projectId={id} items={items} />;
}
