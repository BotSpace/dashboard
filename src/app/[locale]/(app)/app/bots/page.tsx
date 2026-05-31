import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bot, Plus, Search } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { initials } from "@/shared/lib/utils";

export default async function BotsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("bots");

  const bots = await ProjectsAPI.list(q).catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={`${bots.length} ${t("title").toLowerCase()}`}
        actions={
          <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20">
            <Link href="/app/bots/new">
              <Plus className="h-4 w-4" /> {t("new")}
            </Link>
          </Button>
        }
      />

      <form className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder={t("search")} className="pl-9 bg-muted/40 focus-visible:bg-background" />
      </form>

      {bots.length === 0 ? (
        <EmptyState
          icon={<Bot className="h-7 w-7" />}
          title={t("empty")}
          action={
            <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/app/bots/new">
                <Plus className="h-4 w-4" /> {t("new")}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bots.map((b) => (
            <Link
              key={b.id}
              href={`/app/bots/${b.id}`}
              className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5"
            >
              <div className="flex items-start justify-between">
                <Avatar className="h-12 w-12 ring-2 ring-border/40 transition-all group-hover:ring-blue-500/20">
                  {b.avatar && <AvatarImage src={b.avatar} alt={b.name} />}
                  <AvatarFallback className="text-xs font-semibold">{initials(b.name)}</AvatarFallback>
                </Avatar>
                <Badge variant={b.status === "active" ? "success" : "secondary"} className="text-[11px]">
                  {b.status ?? "draft"}
                </Badge>
              </div>
              <div className="mt-4 truncate text-base font-semibold leading-tight">{b.name}</div>
              <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {b.description ?? (b.username ? `@${b.username}` : "—")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
