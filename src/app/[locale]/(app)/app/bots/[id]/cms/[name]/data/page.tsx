import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Database, Settings2 } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { CmsAPI } from "@/shared/api/services";
import { DataGrid } from "@/features/cms/components/data-grid";
import { DeleteCollectionButton } from "@/features/cms/components/delete-collection-button";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";

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
  // All collections — used to resolve relation fields to their primary_field label.
  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Database className="h-5 w-5" />}
        title={collection.label || collection.name}
        subtitle={
          <span>
            <code className="font-mono">{collection.name}</code>
            {" · "}v{collection.schema_version}
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
              <Link href={`/app/bots/${id}/cms/${name}`} className="gap-2">
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

      <Section>
        <DataGrid
          projectId={id}
          collectionName={collection.name}
          fields={collection.fields ?? []}
          collections={collections}
        />
      </Section>
    </div>
  );
}
