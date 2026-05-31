import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, FileEdit } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { CmsAPI } from "@/shared/api/services";
import { DocumentEditForm } from "@/features/cms/components/document-edit-form";
import { PageHeader } from "@/shared/components/common/page-header";
import { Section } from "@/shared/components/common/section";

export default async function BotCmsEditDocPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; name: string; docId: string }>;
}) {
  const { locale, id, name, docId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const collection = await CmsAPI.getCollection(id, name).catch(() => null);
  if (!collection) notFound();

  const doc = await CmsAPI.getDocument(id, name, docId).catch(() => null);
  if (!doc) notFound();

  const collections = await CmsAPI.listCollections(id).catch(() => []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
            <Link href={`/app/bots/${id}/cms/${name}/data`} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("backToData")}
            </Link>
          </Button>
        }
      />

      <Section>
        <DocumentEditForm
          projectId={id}
          collectionName={collection.name}
          fields={collection.fields ?? []}
          collections={collections}
          doc={doc}
        />
      </Section>
    </div>
  );
}
