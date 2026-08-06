import { setRequestLocale } from "next-intl/server";
import { KeyRound } from "lucide-react";
import { EnvAPI } from "@/shared/api/services";
import { EnvList } from "@/features/bots/components/env-list";
import { PageHeader } from "@/shared/components/common/page-header";

export default async function EnvPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const items = await EnvAPI.list(id).catch(() => []);
  return (
    <div className="space-y-5">
      <PageHeader
        icon={<KeyRound className="h-5 w-5" />}
        title="Muhit o'zgaruvchilari"
        subtitle="Bot uchun maxfiy kalit va konfiguratsiya qiymatlari"
      />
      <EnvList projectId={id} items={items} />
    </div>
  );
}
