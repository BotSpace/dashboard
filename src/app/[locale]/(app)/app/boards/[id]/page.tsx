import { ArrowLeft, Bot, Kanban } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { KanbanAPI, ProjectsAPI } from "@/shared/api/services";
import { Link } from "@/shared/i18n/routing";
import { PageHeader } from "@/shared/components/common/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { KanbanBoard } from "@/features/boards/components/kanban-board";
import { BoardSettingsDialog } from "@/features/boards/components/board-settings-dialog";

export default async function BoardPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ bot?: string }> }) {
  const { locale, id } = await params; const { bot } = await searchParams; setRequestLocale(locale);
  const [board, projects] = await Promise.all([KanbanAPI.get(id, bot).catch(() => null), ProjectsAPI.list().catch(() => [])]); if (!board) notFound();
  return <div className="space-y-5"><PageHeader title={board.name} subtitle={board.description || `${board.card_type_label} jarayoni`} icon={<Kanban className="h-5 w-5" />} actions={<><Badge variant="outline">{board.card_count} {board.card_type_label.toLowerCase()}</Badge>{(board.projects?.length ?? 0) > 0 && <Badge variant="secondary"><Bot className="mr-1 h-3 w-3" />{board.projects!.length} bot</Badge>}<BoardSettingsDialog board={board} projects={projects} /><Button variant="outline" size="sm" asChild><Link href="/app/boards"><ArrowLeft className="mr-2 h-4 w-4" />Boardlar</Link></Button></>} /><KanbanBoard initialBoard={board} projectFilter={bot} /></div>;
}
