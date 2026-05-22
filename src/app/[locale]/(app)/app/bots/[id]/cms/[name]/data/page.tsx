import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database, Settings2 } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { CmsAPI } from "@/shared/api/services";
import { DataGrid } from "@/features/cms/components/data-grid";

export default async function BotCmsDataPage({
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
        <Button asChild variant="outline" size="sm">
          <Link href={`/app/bots/${id}/cms/${name}`} className="gap-2">
            <Settings2 className="h-4 w-4" />
            {t("schema")}
          </Link>
        </Button>
      </div>

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Database className="h-5 w-5 text-primary" />
          {collection.label || collection.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono">{collection.name}</code> · v{collection.schema_version}
        </p>
      </header>

      <DataGrid
        projectId={id}
        collectionName={collection.name}
        fields={collection.fields ?? []}
      />
    </div>
  );
}
