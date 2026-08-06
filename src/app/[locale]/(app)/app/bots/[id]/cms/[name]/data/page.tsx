import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database, FileText, Settings2, Table2 } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import { CmsAPI } from "@/shared/api/services";
import { DataGrid } from "@/features/cms/components/data-grid";
import { DeleteCollectionButton } from "@/features/cms/components/delete-collection-button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";
import { cmsCollectionHref, cmsCollectionSlug, getCollectionByRouteParam } from "@/features/cms/lib/routing";

export default async function BotCmsDataPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string }>;
}) {
  const { locale, id, name } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await getCollectionByRouteParam(id, name, "/data");
  if (!collection) notFound();
  // All collections — used to resolve relation fields to their primary_field label.
  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<Database className="h-5 w-5" />}
        title={collection.label || collection.name}
        subtitle={
          <span>
            <code className="font-mono">{collection.name}</code>
            {" · "}v{collection.schema_version}
            {collection.description && <span className="ml-2">{collection.description}</span>}
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
            <Button asChild variant="outline" size="sm">
              <Link href={cmsCollectionHref(id, cmsCollectionSlug(collection))} className="gap-2">
                <Settings2 className="h-4 w-4" />
                {t("schema")}
              </Link>
            </Button>
            {!collection.system && (
              <DeleteCollectionButton
                projectId={id}
                name={collection.name}
                label={collection.label || collection.name}
                variant="button"
                redirectTo={`/app/bots/${id}/cms`}
              />
            )}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <Table2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("openData")}</p>
              <p className="font-semibold">{collection.label || collection.name}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("fields")}</p>
              <p className="font-semibold">{collection.fields?.length ?? collection.fields_count ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("schema")}</p>
              <p className="font-semibold">v{collection.schema_version}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Section
        title={t("openData")}
        icon={<Table2 className="h-4 w-4" />}
        contentClassName="min-w-0"
      >
        <DataGrid
          projectId={id}
          collectionName={cmsCollectionSlug(collection)}
          fields={collection.fields ?? []}
          collections={collections}
        />
      </Section>
    </div>
  );
}
