import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Eye, Heart, ExternalLink, Tag, Info, Sparkles, KeyRound } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";
import { sanitizeRichText } from "@/shared/lib/sanitize";
import { TemplateActions } from "@/features/templates/components/template-actions";
import { PageHeader } from "@/shared/components/common/page-header";
import { LazyImage } from "@/shared/components/common/lazy-image";
import { Section } from "@/shared/components/common/section";

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
  const isOwned = Boolean(tpl.is_ordered);

  return (
    <div className="space-y-5">
      <PageHeader
        title={tpl.name}
        subtitle={
          tpl.categories.length > 0 ? (
            <span className="flex flex-wrap gap-1.5 mt-1">
              {tpl.categories.map((c) => (
                <Badge key={c.id} variant="secondary">{c.name}</Badge>
              ))}
            </span>
          ) : undefined
        }
        icon={<Tag className="h-5 w-5" />}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/templates" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted/40">
            {tpl.image ? (
              <LazyImage src={tpl.image} alt={tpl.name} eager />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground/40">
                <Tag className="h-16 w-16" />
              </div>
            )}
          </div>

          {tpl.short_description && (
            <p
              className="text-base text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(tpl.short_description) }}
            />
          )}

          {tpl.video && (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={tpl.video} controls className="w-full" />
            </div>
          )}

          {tpl.description && (
            <Section title={t("about")} icon={<Info className="h-4 w-4" />}>
              <div
                className="text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(tpl.description) }}
              />
            </Section>
          )}

          {tpl.features.length > 0 && (
            <Section title={t("features")} icon={<Sparkles className="h-4 w-4" />}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {tpl.features.map((f) => (
                  <li key={f.id} className="rounded-md border border-border bg-card p-3">
                    <div className="text-sm font-medium">{f.name}</div>
                    {f.value && (
                      <div className="mt-1 text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeRichText(f.value) }} />
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(tpl.required_envs?.length ?? 0) > 0 && (
            <Section title={t("requiredEnvsTitle")} icon={<KeyRound className="h-4 w-4" />}>
              <ul className="space-y-2">
                {(tpl.required_envs ?? []).map((env) => (
                  <li key={env.key} className="flex flex-col gap-0.5">
                    <code className="self-start rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-sm">
                      {env.key}
                    </code>
                    {env.description && (
                      <span className="text-xs text-muted-foreground">{env.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Section>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-semibold tracking-tight">
                  {isFree ? t("free") : formatCurrency(price, "UZS", locale)}
                </div>
                {hasDiscount && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatCurrency(original, "UZS", locale)}
                  </div>
                )}
              </div>

              <TemplateActions
                templateId={tpl.id}
                templateSlug={tpl.slug ?? String(tpl.id)}
                isFree={isFree}
                isOwned={isOwned}
                orderLabels={{
                  buy: t("buy"),
                  use: t("use"),
                  owned: t("owned"),
                  success: t("orderSuccess"),
                  error: t("orderError"),
                }}
                createLabel={t("createProject")}
              />

              {tpl.demo_url && (
                <Button asChild variant="outline" className="w-full">
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
                    {formatNumber(toNumber(tpl.likes_count), locale)} {t("likes")}
                  </span>
                </div>
              </div>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
