import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Columns3, Database, KeyRound, Settings2, Table } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
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

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Columns3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("fields")}</p>
              <p className="font-semibold">{collection.fields?.length ?? collection.fields_count ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Primary field</p>
              <p className="truncate font-mono text-sm">{collection.primary_field || "_id"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
        icon={<Settings2 className="h-4 w-4" />}
        title={t("schema")}
        contentClassName="space-y-5"
      >
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          {t("schemaHint")}
        </div>
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
