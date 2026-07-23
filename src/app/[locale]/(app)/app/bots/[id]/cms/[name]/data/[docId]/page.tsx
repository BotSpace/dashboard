import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, FileText } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { DocumentDetail } from "@/features/cms/components/document-detail";
import { cmsCollectionHref, cmsCollectionSlug, getCollectionByRouteParam } from "@/features/cms/lib/routing";

export default async function BotCmsDocumentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string; docId: string }>;
}) {
  const { locale, id, name, docId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await getCollectionByRouteParam(id, name, `/data/${encodeURIComponent(docId)}`);
  if (!collection) notFound();
  const collectionName = cmsCollectionSlug(collection);
  const doc = await CmsAPI.getDocument(id, collectionName, docId).catch(() => null);
  if (!doc) notFound();
  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileText className="h-5 w-5" />}
        title={t("viewDocTitle")}
        subtitle={<span><code className="font-mono">{collection.name}</code><span className="mx-2">·</span><code className="font-mono text-xs">{docId}</code></span>}
        actions={<Button asChild variant="ghost" size="sm"><Link href={cmsCollectionHref(id, collectionName, "/data")} className="gap-1"><ArrowLeft className="h-4 w-4" />{t("backToData")}</Link></Button>}
      />
      <DocumentDetail projectId={id} collectionName={collectionName} fields={collection.fields ?? []} collections={collections} doc={doc} />
    </div>
  );
}
