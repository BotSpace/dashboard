import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database, Settings2, Table } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { FieldEditor } from "@/features/cms/components/field-editor";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";
import { cmsCollectionHref, cmsCollectionSlug, getCollectionByRouteParam } from "@/features/cms/lib/routing";

export default async function BotCmsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string }>;
}) {
  const { locale, id, name } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await getCollectionByRouteParam(id, name);
  if (!collection) notFound();

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Database className="h-5 w-5" />}
        title={
          <span className="flex items-center gap-2">
            {collection.label || collection.name}
            {collection.system && (
              <Badge variant="secondary" className="text-[10px]">
                {t("system")}
              </Badge>
            )}
          </span>
        }
        subtitle={
          <span>
            <code className="font-mono">{collection.name}</code>
            {" · "}v{collection.schema_version}
            {" · "}
            {collection.fields?.length ?? 0} {t("fields")}
            {collection.description && (
              <span className="ml-2 text-muted-foreground">{collection.description}</span>
            )}
          </span>
        }
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/bots/${id}/cms`} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {t("backToList")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={cmsCollectionHref(id, cmsCollectionSlug(collection), "/data")} className="gap-2">
                <Table className="h-4 w-4" />
                {t("openData")}
              </Link>
            </Button>
          </>
        }
      />

      <Section
        icon={<Settings2 className="h-4 w-4" />}
        title={t("schema")}
      >
        <FieldEditor
          projectId={id}
          collectionName={cmsCollectionSlug(collection)}
          initialFields={collection.fields ?? []}
          collections={collections}
          primaryField={collection.primary_field}
        />
      </Section>
    </div>
  );
}
