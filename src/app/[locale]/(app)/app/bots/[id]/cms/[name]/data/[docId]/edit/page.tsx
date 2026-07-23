import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, FileEdit } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { CmsAPI } from "@/shared/api/services";
import { DocumentEditForm } from "@/features/cms/components/document-edit-form";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";
import { cmsCollectionHref, cmsCollectionSlug, getCollectionByRouteParam } from "@/features/cms/lib/routing";

export default async function BotCmsEditDocPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string; docId: string }>;
}) {
  const { locale, id, name, docId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await getCollectionByRouteParam(id, name, `/data/${encodeURIComponent(docId)}`);
  if (!collection) notFound();

  const collectionSlug = cmsCollectionSlug(collection);
  const doc = await CmsAPI.getDocument(id, collectionSlug, docId).catch(() => null);
  if (!doc) notFound();

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={<FileEdit className="h-5 w-5" />}
        title={t("editDoc")}
        subtitle={
          <span>
            <code className="font-mono">{collection.name}</code>
            {" · "}
            <code className="font-mono text-xs">{docId}</code>
          </span>
        }
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={cmsCollectionHref(id, collectionSlug, "/data")} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("backToData")}
            </Link>
          </Button>
        }
      />

      <Section className="border-border/70 shadow-sm" title={t("editDoc")} icon={<FileEdit className="h-4 w-4" />}>
        <DocumentEditForm
          projectId={id}
          collectionName={collectionSlug}
          fields={collection.fields ?? []}
          collections={collections}
          doc={doc}
        />
      </Section>
    </div>
  );
}
