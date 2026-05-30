import { getTranslations, setRequestLocale } from "next-intl/server";
import { Database, Plus } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Database className="h-5 w-5 text-primary" />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href={`/app/bots/${projectId}/cms/new`} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("create")}
          </Link>
        </Button>
      </header>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/app/bots/${projectId}/cms/${c.name}/data`}
              className="block"
            >
              <Card className="overflow-hidden transition hover:border-primary/40">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{c.label || c.name}</h3>
                        {c.system && <Badge variant="secondary">{t("system")}</Badge>}
                      </div>
                      <code className="text-xs text-muted-foreground">{c.name}</code>
                    </div>
                  </div>
                  {c.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  )}
                  <div className="pt-2">
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
