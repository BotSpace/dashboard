import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackageOpen, Search } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
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
    <div style={{ padding: "28px 32px", maxWidth: 1240 }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1
          className="tracking-tight"
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: 27,
            margin: "0 0 5px",
            letterSpacing: "-0.6px",
          }}
        >
          {t("title")}
        </h1>
        <p className="text-muted-foreground" style={{ margin: 0, fontSize: 14 }}>
          {t("subtitle")}
        </p>
      </div>

      {/* Search + price filter */}
      <form>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 240, maxWidth: 360 }}>
            <Search
              className="text-muted-foreground"
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                pointerEvents: "none",
              }}
            />
            <Input
              name="search"
              defaultValue={sp.search ?? ""}
              placeholder={t("search")}
              style={{ paddingLeft: 38 }}
              className="bg-muted/30 focus-visible:bg-background"
            />
          </div>

          {/* Price range */}
          <div
            className="text-muted-foreground"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}
          >
            <span style={{ fontSize: 13 }}>Narx:</span>
            <Input
              name="price_min"
              type="number"
              min={0}
              defaultValue={sp.price_min ?? ""}
              placeholder={t("priceFrom")}
              className="bg-muted/30 focus-visible:bg-background"
              style={{ width: 84, fontSize: 13 }}
            />
            <span className="text-muted-foreground/60">—</span>
            <Input
              name="price_max"
              type="number"
              min={0}
              defaultValue={sp.price_max ?? ""}
              placeholder={t("priceTo")}
              className="bg-muted/30 focus-visible:bg-background"
              style={{ width: 84, fontSize: 13 }}
            />
          </div>

          {/* Submit / reset */}
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit" size="sm">
              {t("filter")}
            </Button>
            {hasFilters && (
              <Button asChild type="button" variant="ghost" size="sm">
                <Link href="/app/templates">{t("reset")}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <Link
              href="/app/templates"
              className={[
                "inline-flex items-center rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                activeCategory === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70",
              ].join(" ")}
            >
              {t("allCategories")}
            </Link>
            {categories.map((c) => {
              const isActive = activeCategory === String(c.id);
              const params = new URLSearchParams();
              params.set("categories", String(c.id));
              if (sp.search) params.set("search", sp.search);
              if (sp.price_min) params.set("price_min", sp.price_min);
              if (sp.price_max) params.set("price_max", sp.price_max);
              return (
                <Link
                  key={c.id}
                  href={`/app/templates?${params.toString()}`}
                  className={[
                    "inline-flex items-center rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70",
                  ].join(" ")}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        )}
      </form>

      {/* Grid / empty */}
      {items.length === 0 ? (
        <div
          className="text-muted-foreground"
          style={{ padding: 60, textAlign: "center", fontSize: 14 }}
        >
          {hasFilters ? (
            <>
              {t("notFound")}{" "}
              <Button asChild variant="ghost" size="sm">
                <Link href="/app/templates">{t("reset")}</Link>
              </Button>
            </>
          ) : (
            <EmptyState
              icon={<PackageOpen className="h-7 w-7" />}
              title={t("notFound")}
            />
          )}
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
