import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database, Settings2, Table } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { FieldEditor } from "@/features/cms/components/field-editor";

export default async function BotCmsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string }>;
}) {
  const { locale, id, name } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await CmsAPI.getCollection(id, name).catch(() => null);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/bots/${id}/cms`} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/app/bots/${id}/cms/${name}/data`} className="gap-2">
            <Table className="h-4 w-4" />
            {t("openData")}
          </Link>
        </Button>
      </div>

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Database className="h-5 w-5 text-primary" />
          {collection.label || collection.name}
          {collection.system && (
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {t("system")}
            </Badge>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono">{collection.name}</code> · v
          {collection.schema_version} · {collection.fields?.length ?? 0} {t("fields")}
        </p>
        {collection.description && (
          <p className="mt-2 text-sm text-muted-foreground">{collection.description}</p>
        )}
      </header>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              {t("schema")}
            </h2>
          </div>
          <Separator className="my-4" />
          <FieldEditor
            projectId={id}
            collectionName={collection.name}
            initialFields={collection.fields ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
