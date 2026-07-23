import { getTranslations } from "next-intl/server";
import { ArrowRight, Eye, Heart, Tag } from "lucide-react";
import { TemplatesAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";
import { sanitizeRichText } from "@/shared/lib/sanitize";

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
    <section id="templates" className="relative py-24 md:py-32" style={{ background: "#030308" }}>
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
            style={{
              background: "linear-gradient(135deg, #fff 30%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/35 md:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((tpl) => {
            const price = toNumber(tpl.price);
            const original = toNumber(tpl.original_price);
            const isFreePromo = price === 0 && original > 0;
            const hasDiscount = original > 0 && price > 0 && price < original;
            return (
              <Link key={tpl.id} href={`/templates/${tpl.slug}`} className="group">
                <div
                  className="overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="relative aspect-[16/9]" style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.05), rgba(124,58,237,0.05))" }}>
                    {tpl.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={tpl.image} alt={tpl.name} className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <Tag className="h-10 w-10 text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white/80">{tpl.name}</h3>
                    {tpl.short_description && (
                      <div className="line-clamp-2 text-xs leading-relaxed text-white/30" dangerouslySetInnerHTML={{ __html: sanitizeRichText(tpl.short_description) }} />
                    )}
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white/70">
                          {price === 0
                            ? isFreePromo
                              ? tt("freePromo")
                              : tt("free")
                            : formatCurrency(price, "UZS", locale)}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-white/20 line-through">
                            {formatCurrency(original, "UZS", locale)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-white/20">
                        {typeof tpl.views === "number" && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {formatNumber(tpl.views, locale)}
                          </span>
                        )}
                        {typeof tpl.likes_count === "number" && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {formatNumber(tpl.likes_count, locale)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/templates"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white/50 transition-colors hover:text-white/80"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
          >
            {t("viewAll")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
