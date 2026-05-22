import { getTranslations } from "next-intl/server";
import { ArrowRight, Eye, Heart, Tag } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";

function toNumber(v: number | string | undefined | null): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function TemplatesPreview({ locale }: { locale: string }) {
  const t = await getTranslations("landing.templates");
  const tt = await getTranslations("templates");
  const items = await TemplatesAPI.list().catch(() => []);
  const top = items.slice(0, 6);
  if (top.length === 0) return null;

  return (
    <section id="templates" className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((tpl) => {
          const price = toNumber(tpl.price);
          const original = toNumber(tpl.original_price);
          const hasDiscount = original > 0 && price < original;
          return (
            <Link key={tpl.id} href={`/templates/${tpl.slug}`} className="group">
              <Card className="overflow-hidden transition group-hover:border-primary/40 group-hover:shadow-md h-full flex flex-col">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-fuchsia-500/10">
                  {tpl.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={tpl.image} alt={tpl.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground/40">
                      <Tag className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="line-clamp-1 text-base font-semibold">{tpl.name}</h3>
                  {tpl.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tpl.categories.slice(0, 2).map((c) => (
                        <Badge key={c.id} variant="secondary" className="text-[10px]">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {tpl.short_description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {tpl.short_description}
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">
                        {price === 0 ? tt("free") : formatCurrency(price, "UZS", locale)}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(original, "UZS", locale)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {typeof tpl.views === "number" && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {formatNumber(tpl.views, locale)}
                        </span>
                      )}
                      {typeof tpl.likes === "number" && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {formatNumber(tpl.likes, locale)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/templates" className="gap-2">
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
