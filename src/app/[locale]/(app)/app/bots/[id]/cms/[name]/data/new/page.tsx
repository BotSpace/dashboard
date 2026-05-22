import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CmsAPI } from "@/shared/api/services";
import { DocumentForm } from "@/features/cms/components/document-form";

export default async function BotCmsNewDocPage({
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
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/app/bots/${id}/cms/${name}/data`} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t("backToData")}
        </Link>
      </Button>
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <FilePlus2 className="h-5 w-5 text-primary" />
          {t("newDoc")}
        </h1>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono">{collection.name}</code>
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <DocumentForm
            projectId={id}
            collectionName={collection.name}
            fields={collection.fields ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
