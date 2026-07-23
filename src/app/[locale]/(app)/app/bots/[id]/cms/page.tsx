import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Boxes, Database, Layers3, Plus, Table2 } from "lucide-react";
import { CmsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { DeleteCollectionButton } from "@/features/cms/components/delete-collection-button";
import { cmsCollectionHref, cmsCollectionSlug } from "@/features/cms/lib/routing";

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
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-blue-500/20 bg-blue-500/[0.04]">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">{collections.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("collectionsCount")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-violet-500/20 bg-violet-500/[0.04]">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">{collections.reduce((sum, c) => sum + (c.fields_count ?? c.fields?.length ?? 0), 0)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("fieldsConfigured")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 bg-emerald-500/[0.04]">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Table2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">{collections.filter((c) => !c.system).length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("customCollections")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {collections.map((c) => {
              const slug = cmsCollectionSlug(c);
              const title = c.label || c.name;
              const fieldCount = c.fields_count ?? c.fields?.length ?? 0;
              return (
                <Card
                  key={c.id}
                  className="group relative overflow-hidden border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className={c.system ? "h-1 bg-slate-400/50" : "h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"} />
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={cmsCollectionHref(projectId, slug, "/data")} className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <div className={c.system ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"}>
                          <Database className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold tracking-tight">{title}</h3>
                            {c.system && <Badge variant="secondary" className="shrink-0 text-[10px]">{t("system")}</Badge>}
                          </div>
                          <code className="mt-0.5 block truncate text-xs text-muted-foreground">{c.name}</code>
                        </div>
                      </Link>
                      {!c.system && <DeleteCollectionButton projectId={projectId} name={slug} label={title} />}
                    </div>

                    <Link href={cmsCollectionHref(projectId, slug, "/data")} className="mt-5 flex flex-1 flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                        {c.description || t("noDescription")}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                        <span>{fieldCount} {t("fields")}</span>
                        <span>v{c.schema_version}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
                        {t("openData")} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
