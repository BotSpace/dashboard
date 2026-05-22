import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { SchemaBuilder } from "@/features/cms/components/schema-builder";

export default async function BotCmsCreatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/app/bots/${id}/cms`} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t("backToList")}
        </Link>
      </Button>
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Database className="h-5 w-5 text-primary" />
          {t("newTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("newSubtitle")}</p>
      </header>
      <SchemaBuilder projectId={id} />
    </div>
  );
}
