import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bot, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { initials } from "@/shared/lib/utils";

const PAGE_SIZE = 12;

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
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={`${totalItems} ${t("title").toLowerCase()}`}
        actions={
          <Button asChild className="gap-2 shadow-sm shadow-blue-500/20">
            <Link href="/app/bots/new?src=bots-header">
              <Plus className="h-4 w-4" /> {t("new")}
            </Link>
          </Button>
        }
      />

      <form className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder={t("search")} className="pl-9 bg-muted/40 focus-visible:bg-background" />
        {/* Reset page on new search */}
        <input type="hidden" name="page" value="1" />
      </form>

      {bots.length === 0 ? (
        <EmptyState
          icon={<Bot className="h-7 w-7" />}
          title={t("empty")}
          action={
            <Button asChild className="gap-2">
              <Link href="/app/bots/new?src=bots-empty">
                <Plus className="h-4 w-4" /> {t("new")}
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bots.map((b) => (
              <Link
                key={b.id}
                href={`/app/bots/${b.id}`}
                className="group min-w-0 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between">
                  <Avatar className="h-12 w-12 ring-2 ring-border/40 transition-all group-hover:ring-blue-500/20">
                    <AvatarFallback className="text-xs font-semibold">{initials(b.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-4 truncate text-base font-semibold leading-tight">{b.name}</div>
                <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {b.description ?? (b.username ? `@${b.username}` : "—")}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
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
