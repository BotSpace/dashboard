import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { TemplatesInfiniteLoader } from "@/features/templates/components/templates-infinite-loader";

type SearchParams = {
  search?: string;
  categories?: string;
  features?: string;
  price_min?: string;
  price_max?: string;
};

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

  const baseParams = {
    search: sp.search || undefined,
    categories: sp.categories || undefined,
    features: sp.features || undefined,
    price_min: sp.price_min || undefined,
    price_max: sp.price_max || undefined,
  };

  const [firstPage, categories] = await Promise.all([
    TemplatesAPI.listPaginated({ ...baseParams, page: 1 }).catch(() => ({
      items: [],
      page: 1,
      totalPages: 1,
      hasMore: false,
    })),
    TemplatesAPI.categories().catch(() => []),
  ]);
  const items = firstPage.items;

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
        <TemplatesInfiniteLoader
          initialItems={items}
          baseParams={baseParams}
          startPage={firstPage.page}
          initialHasMore={firstPage.hasMore}
          locale={locale}
          freeLabel={t("free")}
          basePath="/app/templates"
          ownedLabel={t("owned")}
        />
      )}

    </div>
  );
}
