import { Download, Eye, Tag } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";
import type { Template } from "@/shared/types/api";

function toNumber(v: number | string | undefined | null): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Pastel gradient pool — cycles by index so cards look distinct */
const BANNER_GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f 0%,#1e4a8f 100%)",
  "linear-gradient(135deg,#3b1f5e 0%,#6b2fa0 100%)",
  "linear-gradient(135deg,#1a4731 0%,#166534 100%)",
  "linear-gradient(135deg,#4a1e1e 0%,#991b1b 100%)",
  "linear-gradient(135deg,#1e3a4a 0%,#0e7490 100%)",
  "linear-gradient(135deg,#3d2a00 0%,#92400e 100%)",
];

function bannerGradient(id: string | number): string {
  const idx = Math.abs(String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  return BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
  const isFreePromo = price === 0 && original > 0;
  const hasDiscount = original > 0 && price > 0 && price < original;

  const priceText =
    price === 0
      ? isFreePromo
        ? freePromoLabel
        : freeLabel
      : formatCurrency(price, "UZS", locale);

  const ctaLabel =
    ownedLabel && tpl.is_order
      ? ownedLabel
      : price === 0
      ? freeLabel
      : "Sotib olish";

  const firstCat = tpl.categories[0]?.name ?? null;

  return (
    <Link href={`${basePath}/${tpl.slug}`} className="group block">
      <div
        className="overflow-hidden rounded-[13px] border border-border/70 bg-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:shadow-lg"
        style={{ cursor: "pointer" }}
      >
        {/* Banner */}
        <div
          className="relative flex items-center justify-center"
          style={{
            height: 104,
            background: tpl.image ? undefined : bannerGradient(tpl.id),
          }}
        >
          {tpl.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={tpl.image}
              alt={tpl.name}
              className="h-full w-full object-cover"
              style={{ height: 104 }}
            />
          ) : (
            <>
              {/* Dot-grid overlay */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,.14) 1px,transparent 1px)",
                  backgroundSize: "16px 16px",
                  opacity: 0.5,
                }}
              />
              {/* Initials badge */}
              <div
                className="relative flex items-center justify-center rounded-[13px] text-white"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(255,255,255,.18)",
                  backdropFilter: "blur(4px)",
                  fontSize: 18,
                  fontFamily: "Space Grotesk",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                }}
              >
                {initials(tpl.name)}
              </div>
            </>
          )}

          {/* Owned badge */}
          {ownedLabel && tpl.is_order && (
            <span
              className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md text-[10px] font-bold"
              style={{
                padding: "3px 8px",
                background: "rgba(0,0,0,.45)",
                color: "#86efac",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                }}
              />
              {ownedLabel}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 14 }}>
          {/* Category chip */}
          {firstCat && (
            <div
              className="mb-2 inline-block"
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,.05)",
                color: "var(--muted-foreground)",
              }}
            >
              {firstCat}
            </div>
          )}

          {/* Title */}
          <h3
            className="line-clamp-1"
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 600,
              fontSize: 14.5,
              margin: "0 0 10px",
              lineHeight: 1.3,
            }}
          >
            {tpl.name}
          </h3>

          {/* Stats */}
          <div
            className="text-muted-foreground"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 11.5,
              marginBottom: 12,
            }}
          >
            {typeof tpl.views === "number" && (
              <span className="flex items-center gap-1">
                <Eye style={{ width: 14, height: 14 }} />
                {formatNumber(tpl.views, locale)}
              </span>
            )}
            {typeof tpl.likes === "number" && (
              <span className="flex items-center gap-1">
                <Download style={{ width: 14, height: 14 }} />
                {formatNumber(tpl.likes, locale)}
              </span>
            )}
            {typeof tpl.views !== "number" && typeof tpl.likes !== "number" && (
              <Tag style={{ width: 12, height: 12, opacity: 0.4 }} />
            )}
          </div>

          {/* Footer: price + CTA */}
          <div
            className="border-t border-border/50"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "Space Grotesk",
                  color: price === 0 ? "#4ade80" : "var(--foreground)",
                }}
              >
                {priceText}
              </span>
              {hasDiscount && (
                <div
                  className="text-muted-foreground line-through"
                  style={{ fontSize: 11 }}
                >
                  {formatCurrency(original, "UZS", locale)}
                </div>
              )}
            </div>

            <button
              type="button"
              className="pointer-events-none"
              style={{
                padding: "6px 13px",
                borderRadius: 8,
                border: "none",
                background: "rgba(59,130,246,.14)",
                color: "#93c5fd",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
