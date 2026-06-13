import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { TemplatesInfiniteLoader } from "@/features/templates/components/templates-infinite-loader";
import { buildMetadata } from "@/shared/lib/seo";
import type { Locale } from "@/shared/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/templates",
    title: t("templates.title"),
    description: t("templates.description"),
    keywords: t.raw("templates.keywords") as string[],
  });
}

type SearchParams = {
  search?: string;
  categories?: string;
  features?: string;
  price_min?: string;
  price_max?: string;
};

export default async function PublicTemplatesPage({
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
    <div className="container-page space-y-8 pb-12 pt-28 md:pt-32">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
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
              <Link href="/templates">{t("reset")}</Link>
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
          freePromoLabel={t("freePromo")}
          loadingLabel={tc("loading")}
          retryLabel={tc("retry")}
          errorLabel={tc("error")}
        />
      )}
    </div>
  );
}
