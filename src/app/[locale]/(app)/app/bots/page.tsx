import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus, Search, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { initials, formatLongDate } from "@/shared/lib/utils";

const PAGE_SIZE = 12;

// Deterministic avatar gradient per bot id
const AVATAR_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-orange-400 to-rose-600",
  "from-pink-500 to-fuchsia-700",
  "from-cyan-500 to-sky-700",
];

function avatarGradient(id: number | string) {
  const n = typeof id === "number" ? id : parseInt(String(id), 10) || 0;
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Faol
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-500/10 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      Qoralama
    </span>
  );
}

export default async function BotsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { q, page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("bots");

  const page = Math.max(1, Number(pageParam) || 1);

  const paged = await ProjectsAPI.listPaged({ search: q, page, page_size: PAGE_SIZE }).catch(() => ({
    results: [],
    total_items: 0,
    total_pages: 1,
    current_page: 1,
    page_size: PAGE_SIZE,
  }));

  const bots = paged.results;
  const totalPages = paged.total_pages;
  const totalItems = paged.total_items;
  const activeCount = bots.filter((b) => b.status === "active").length;
  const draftCount = bots.filter((b) => b.status !== "active").length;

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    sp.set("page", String(p));
    return `/app/bots?${sp.toString()}`;
  }

  const pageNumbers: number[] = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="px-8 py-7 max-w-[1240px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="font-semibold text-[27px] tracking-[-0.6px] leading-tight text-foreground"
            style={{ fontFamily: "Space Grotesk" }}
          >
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jami {totalItems} ta bot
            {totalItems > 0 && (
              <> &bull; {activeCount} faol, {draftCount} qoralama</>
            )}
          </p>
        </div>
        <Button
          asChild
          className="flex items-center gap-2 px-[17px] py-[11px] h-auto rounded-[10px] bg-gradient-to-br from-blue-400 to-blue-600 hover:brightness-110 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 border-0"
        >
          <Link href="/app/bots/new">
            <Plus className="h-[18px] w-[18px]" />
            {t("new")}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form className="relative max-w-[420px] mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder={t("search")}
          className="w-full rounded-[10px] border border-border/40 bg-white/[.03] px-3.5 py-[11px] pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <input type="hidden" name="page" value="1" />
      </form>

      {bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Plus className="h-7 w-7" />
          </div>
          <p className="text-base font-medium text-foreground">{t("empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground mb-5">
            Birinchi botingizni yarating
          </p>
          <Button
            asChild
            className="flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-blue-400 to-blue-600 hover:brightness-110 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 border-0"
          >
            <Link href="/app/bots/new">
              <Plus className="h-4 w-4" />
              {t("new")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Bot cards grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {bots.map((b) => (
              <Link
                key={b.id}
                href={`/app/bots/${b.uuid ?? b.id}`}
                className="group block rounded-[13px] border border-white/[.07] bg-white/[.025] p-[18px] cursor-pointer transition-all duration-200 hover:border-blue-500/35 hover:bg-blue-500/[.04] hover:-translate-y-0.5"
              >
                {/* Top row: avatar + status */}
                <div className="flex items-start justify-between mb-3.5">
                  {b.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="h-[46px] w-[46px] rounded-[12px] object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${avatarGradient(b.id)} text-[16px] font-semibold text-white`}
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {initials(b.name)}
                    </div>
                  )}
                  <StatusBadge status={b.status} />
                </div>

                {/* Bot name */}
                <h3
                  className="font-semibold text-[15.5px] leading-snug text-foreground mb-1 truncate"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {b.name}
                </h3>

                {/* Description / username */}
                <p className="mb-3.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground min-h-[36px]">
                  {b.description ?? (b.username ? `@${b.username}` : " ")}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-1.5 border-t border-white/[.05] pt-3 text-[11.5px] text-muted-foreground/70">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatLongDate(b.created_at, locale)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-6">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={pageHref(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span><ChevronLeft className="h-4 w-4" /></span>
                )}
              </Button>

              {pageNumbers[0] > 1 && (
                <>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href={pageHref(1)}>1</Link>
                  </Button>
                  {pageNumbers[0] > 2 && (
                    <span className="px-1 text-muted-foreground text-sm">…</span>
                  )}
                </>
              )}

              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild={p !== page}
                >
                  {p !== page ? (
                    <Link href={pageHref(p)}>{p}</Link>
                  ) : (
                    <span>{p}</span>
                  )}
                </Button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-muted-foreground text-sm">…</span>
                  )}
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href={pageHref(totalPages)}>{totalPages}</Link>
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={pageHref(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span><ChevronRight className="h-4 w-4" /></span>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
