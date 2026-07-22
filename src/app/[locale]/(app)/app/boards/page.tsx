import { Kanban, ArrowRight, Bot } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { KanbanAPI, ProjectsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { PageHeader } from "@/shared/components/common/page-header";
import { EmptyState } from "@/shared/components/common/empty-state";
import { Badge } from "@/shared/components/ui/badge";
import { BoardCreateDialog } from "@/features/boards/components/board-create-dialog";

export default async function BoardsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ bot?: string }> }) {
  const { locale } = await params;
  const { bot } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("kanban");
  const [boards, projects] = await Promise.all([KanbanAPI.list(bot).catch(() => []), ProjectsAPI.list().catch(() => [])]);
  const filteredBot = projects.find((project) => project.id === bot);

  return <div className="space-y-6">
    <PageHeader title={t("title")} subtitle={filteredBot ? t("linkedSubtitle", { name: filteredBot.name }) : t("subtitle")} icon={<Kanban className="h-5 w-5" />} actions={<BoardCreateDialog projects={projects} />} />
    {filteredBot && <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm"><Bot className="h-4 w-4 text-blue-400" /><span>{t("filtered", { name: filteredBot.name })}</span><Link href="/app/boards" className="ml-auto text-blue-400 hover:underline">{t("viewAll")}</Link></div>}
    {boards.length === 0 ? <EmptyState icon={<Kanban className="h-7 w-7" />} title={t("emptyTitle")} description={t("emptyDescription")} action={<BoardCreateDialog projects={projects} />} /> :
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{boards.map((board) => <Link key={board.id} href={`/app/boards/${board.id}${bot ? `?bot=${bot}` : ""}`} className="group rounded-xl border bg-card p-5 transition hover:border-blue-500/40 hover:shadow-md">
        <div className="flex items-start gap-3"><span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: board.color }} /><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{board.name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{board.description || t("manage", { type: board.card_type_label })}</p></div><ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" /></div>
        <div className="mt-5 flex items-center gap-2"><Badge variant="secondary">{board.card_count} {board.card_type_label.toLowerCase()}</Badge>{board.project_ids.length > 0 && <Badge variant="outline"><Bot className="mr-1 h-3 w-3" />{t("botCount", { count: board.project_ids.length })}</Badge>}</div>
      </Link>)}</div>}
  </div>;
}
