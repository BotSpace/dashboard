import { Eye, Heart, Tag } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { LazyImage } from "@/shared/components/common/lazy-image";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";
import type { Template } from "@/shared/types/api";

function toNumber(v: number | string | undefined | null): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

interface Props {
  tpl: Template;
  locale: string;
  freeLabel: string;
  freePromoLabel: string;
  basePath?: string;
  ownedLabel?: string;
}

export function TemplateCard({
  tpl,
  locale,
  freeLabel,
  freePromoLabel,
  basePath = "/templates",
  ownedLabel,
}: Props) {
  const price = toNumber(tpl.price);
  const original = toNumber(tpl.original_price);
  // "Free with a struck-through 380,000" confused users. If the template is
  // free but had a list price, it's a promo → show "Free (promo)" and drop
  // the old price. A genuine paid discount still shows the struck original.
  const isFreePromo = price === 0 && original > 0;
  const hasDiscount = original > 0 && price > 0 && price < original;
  return (
    <Link href={`${basePath}/${tpl.slug}`} className="group">
      <Card className="overflow-hidden transition group-hover:border-primary/40 group-hover:shadow-md h-full flex flex-col">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 via-primary/5 to-sky-500/10">
          {tpl.image ? (
            <LazyImage src={tpl.image} alt={tpl.name} />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground/40">
              <Tag className="h-10 w-10" />
            </div>
          )}
          {ownedLabel && tpl.is_ordered && (
            <Badge className="absolute right-2 top-2" variant="success">
              {ownedLabel}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="line-clamp-1 text-base font-semibold">{tpl.name}</h3>
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
                  ? isFreePromo
                    ? freePromoLabel
                    : freeLabel
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
}
