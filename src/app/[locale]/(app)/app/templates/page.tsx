import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search, Eye, Heart, Tag } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";

type SearchParams = {
  search?: string;
  categories?: string;
  features?: string;
  price_min?: string;
  price_max?: string;
};

function toNumber(v: number | string | undefined | null): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function TemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("templates");

  const [items, categories] = await Promise.all([
    TemplatesAPI.list({
      search: sp.search || undefined,
      categories: sp.categories || undefined,
      features: sp.features || undefined,
      price_min: sp.price_min || undefined,
      price_max: sp.price_max || undefined,
    }).catch(() => []),
    TemplatesAPI.categories().catch(() => []),
  ]);

  const activeCategory = sp.categories ?? "";
  const hasFilters = Boolean(
    sp.search || sp.categories || sp.features || sp.price_min || sp.price_max
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </header>

      <form className="grid gap-3 md:grid-cols-[1fr_180px_140px_140px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder={t("search")}
            className="pl-9"
          />
        </div>
        <select
          name="categories"
          defaultValue={activeCategory}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          name="price_min"
          type="number"
          min={0}
          defaultValue={sp.price_min ?? ""}
          placeholder={t("priceFrom")}
        />
        <Input
          name="price_max"
          type="number"
          min={0}
          defaultValue={sp.price_max ?? ""}
          placeholder={t("priceTo")}
        />
        <div className="flex gap-2">
          <Button type="submit">{t("filter")}</Button>
          {hasFilters && (
            <Button asChild type="button" variant="ghost">
              <Link href="/app/templates">{t("reset")}</Link>
            </Button>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          {t("notFound")}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((tpl) => {
            const price = toNumber(tpl.price);
            const original = toNumber(tpl.original_price);
            const hasDiscount = original > 0 && price < original;
            return (
              <Link key={tpl.id} href={`/app/templates/${tpl.slug}`} className="group">
                <Card className="overflow-hidden transition group-hover:border-primary/40 group-hover:shadow-md h-full flex flex-col">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-fuchsia-500/10">
                    {tpl.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={tpl.image}
                        alt={tpl.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground/40">
                        <Tag className="h-10 w-10" />
                      </div>
                    )}
                    {tpl.is_order && (
                      <Badge className="absolute right-2 top-2" variant="success">
                        {t("owned")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-base font-semibold">{tpl.name}</h3>
                    </div>
                    {tpl.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tpl.categories.slice(0, 3).map((c) => (
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
                          {price === 0
                            ? t("free")
                            : formatCurrency(price, "UZS", locale)}
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
      )}

    </div>
  );
}
