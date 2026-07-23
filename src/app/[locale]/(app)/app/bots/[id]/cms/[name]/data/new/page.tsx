import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { CmsAPI } from "@/shared/api/services";
import { DocumentForm } from "@/features/cms/components/document-form";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";
import { cmsCollectionHref, cmsCollectionSlug, getCollectionByRouteParam } from "@/features/cms/lib/routing";

export default async function BotCmsNewDocPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string }>;
}) {
  const { locale, id, name } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await getCollectionByRouteParam(id, name, "/data/new");
  if (!collection) notFound();

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={<FilePlus2 className="h-5 w-5" />}
        title={t("newDoc")}
        subtitle={<code className="font-mono">{collection.name}</code>}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={cmsCollectionHref(id, cmsCollectionSlug(collection), "/data")} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("backToData")}
            </Link>
          </Button>
        }
      />

      <Section className="border-border/70 shadow-sm" title={t("newDoc")} icon={<FilePlus2 className="h-4 w-4" />}>
        <DocumentForm
          projectId={id}
          collectionName={cmsCollectionSlug(collection)}
          fields={collection.fields ?? []}
          collections={collections}
        />
      </Section>
    </div>
  );
}
