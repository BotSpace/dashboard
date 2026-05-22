import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bot, Plus, Search } from "lucide-react";
import { ProjectsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {bots.length} {t("title").toLowerCase()}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/bots/new" className="gap-2">
            <Plus className="h-4 w-4" /> {t("new")}
          </Link>
        </Button>
      </header>

      <form className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder={t("search")} className="pl-9" />
      </form>

      {bots.length === 0 ? (
        <Card>
          <CardContent className="grid place-items-center gap-3 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <Bot className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
            <Button asChild>
              <Link href="/app/bots/new">{t("new")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bots.map((b) => (
            <Link
              key={b.id}
              href={`/app/bots/${b.id}`}
              className="group rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <Avatar className="h-12 w-12">
                  {b.avatar && <AvatarImage src={b.avatar} alt={b.name} />}
                  <AvatarFallback>{initials(b.name)}</AvatarFallback>
                </Avatar>
                <Badge variant={b.status === "active" ? "success" : "secondary"}>{b.status ?? "draft"}</Badge>
              </div>
              <div className="mt-4 truncate text-base font-semibold">{b.name}</div>
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
