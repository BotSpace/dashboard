import { getTranslations, setRequestLocale } from "next-intl/server";
import { Database, Plus } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { DeleteCollectionButton } from "@/features/cms/components/delete-collection-button";

export default async function BotCmsListPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cms");

  const projectId = id;
  const collections = await CmsAPI.listCollections(projectId).catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Database className="h-5 w-5" />}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button asChild>
            <Link href={`/app/bots/${projectId}/cms/new`} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      {collections.length === 0 ? (
        <EmptyState
          icon={<Database className="h-6 w-6" />}
          title={t("empty")}
          action={
            <Button asChild size="sm">
              <Link href={`/app/bots/${projectId}/cms/new`} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("create")}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/app/bots/${projectId}/cms/${c.name}/data`}
              className="block h-full"
            >
              <Card className="h-full overflow-hidden transition hover:border-blue-500/40">
                <CardContent className="flex h-full flex-col space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{c.label || c.name}</h3>
                        {c.system && <Badge variant="secondary">{t("system")}</Badge>}
                      </div>
                      <code className="text-xs text-muted-foreground">{c.name}</code>
                    </div>
                    {!c.system && (
                      <DeleteCollectionButton
                        projectId={projectId}
                        name={c.name}
                        label={c.label || c.name}
                      />
                    )}
                  </div>
                  {c.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <div className="mt-auto pt-2">
                    <div className="text-xs text-muted-foreground">
                      {c.fields_count ?? 0} {t("fields")} · v{c.schema_version}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
