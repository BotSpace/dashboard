import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronDown, PackageOpen, Search } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
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
  const tc = await getTranslations("common");

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
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        icon={<PackageOpen className="h-5 w-5" />}
      />

      <form className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_180px_140px_140px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder={t("search")}
            className="bg-background pl-9"
          />
        </div>
        <div className="relative">
          <select
            name="categories"
            defaultValue={activeCategory}
            className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="" className="bg-background text-foreground">
              {t("allCategories")}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-background text-foreground">
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
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
        <div className="flex gap-1.5">
          <Button type="submit" size="sm">{t("filter")}</Button>
          {hasFilters && (
            <Button asChild type="button" variant="ghost" size="sm">
              <Link href="/app/templates">{t("reset")}</Link>
            </Button>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-7 w-7" />}
          title={t("notFound")}
          description={hasFilters ? "Filtrlarni o'chirib ko'ring" : undefined}
          action={
            hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/app/templates">{t("reset")}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <TemplatesInfiniteLoader
          initialItems={items}
          baseParams={baseParams}
          startPage={firstPage.page}
          initialHasMore={firstPage.hasMore}
          locale={locale}
          freeLabel={t("free")}
          freePromoLabel={t("freePromo")}
          basePath="/app/templates"
          ownedLabel={t("owned")}
          loadingLabel={tc("loading")}
          retryLabel={tc("retry")}
          errorLabel={tc("error")}
        />
      )}
    </div>
  );
}
