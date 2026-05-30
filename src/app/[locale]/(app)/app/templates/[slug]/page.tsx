import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Eye, Heart, ExternalLink, Tag } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";
import { OrderButton } from "@/features/templates/components/order-button";
import { CreateProjectButton } from "@/features/templates/components/create-project-button";

function toNumber(v: number | string | undefined | null): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("templates");

  const tpl = await TemplatesAPI.get(slug).catch(() => null);
  if (!tpl) notFound();

  const price = toNumber(tpl.price);
  const original = toNumber(tpl.original_price);
  const hasDiscount = original > 0 && price < original;
  const isFree = price === 0;
  const isOwned = Boolean(tpl.is_order);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/templates" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-fuchsia-500/10 aspect-[16/9]">
            {tpl.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={tpl.image} alt={tpl.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground/40">
                <Tag className="h-16 w-16" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{tpl.name}</h1>
            {tpl.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tpl.categories.map((c) => (
                  <Badge key={c.id} variant="secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
            {tpl.short_description && (
              <div className="mt-4 text-base text-muted-foreground" dangerouslySetInnerHTML={{ __html: tpl.short_description }} />
            )}
          </div>

          {tpl.video && (
            <div className="overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={tpl.video} controls className="w-full" />
            </div>
          )}

          {tpl.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">{t("about")}</h2>
                <div
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: tpl.description }}
                />
              </CardContent>
            </Card>
          )}

          {tpl.features.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">{t("features")}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tpl.features.map((f) => (
                    <li key={f.id} className="rounded-md border p-3">
                      <div className="text-sm font-medium">{f.name}</div>
                      {f.value && (
                        <div className="mt-1 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: f.value }} />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <div className="text-3xl font-bold">
                  {isFree ? t("free") : formatCurrency(price, "UZS", locale)}
                </div>
                {hasDiscount && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatCurrency(original, "UZS", locale)}
                  </div>
                )}
              </div>

              <OrderButton
                templateId={tpl.id}
                isFree={isFree}
                isOwned={isOwned}
                labels={{
                  buy: t("buy"),
                  use: t("use"),
                  owned: t("owned"),
                  success: t("orderSuccess"),
                  error: t("orderError"),
                }}
              />

              {isOwned && (
                <CreateProjectButton
                  templateId={tpl.id}
                  defaultName={tpl.name}
                  labels={{
                    cta: t("createProject"),
                    title: t("createProjectTitle"),
                    description: t("createProjectDescription"),
                    nameLabel: t("projectNameLabel"),
                    namePlaceholder: t("projectNamePlaceholder"),
                    tokenLabel: t("botTokenLabel"),
                    tokenPlaceholder: t("botTokenPlaceholder"),
                    tokenHelp: t("botTokenHelp"),
                    botFatherLink: "@BotFather",
                    submit: t("createSubmit"),
                    success: t("createSuccess"),
                    cancel: t("cancel"),
                  }}
                />
              )}

              {tpl.demo_url && (
                <Button asChild variant="outline" className="w-full" size="lg">
                  <a href={tpl.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {t("preview")}
                  </a>
                </Button>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>
                    {formatNumber(toNumber(tpl.views), locale)} {t("views")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>
                    {formatNumber(toNumber(tpl.likes), locale)} {t("likes")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
