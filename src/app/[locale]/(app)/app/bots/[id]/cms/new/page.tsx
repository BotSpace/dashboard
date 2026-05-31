import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { CmsAPI } from "@/shared/api/services";
import { SchemaBuilder } from "@/features/cms/components/schema-builder";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";

export default async function BotCmsCreatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={<Database className="h-5 w-5" />}
        title={t("newTitle")}
        subtitle={t("newSubtitle")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/app/bots/${id}/cms`} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
        }
      />
      <Section>
        <SchemaBuilder projectId={id} collections={collections} />
      </Section>
    </div>
  );
}
