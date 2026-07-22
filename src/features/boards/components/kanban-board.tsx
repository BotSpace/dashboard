"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, Bot, Calendar, Clock3, GripVertical, MessageSquare, Plus, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { KanbanActivity, KanbanBoard as Board, KanbanCard, KanbanComment, KanbanPriority } from "@/shared/types/api";
import { addCommentAction, archiveCardAction, createCardAction, getCardTimelineAction, moveCardAction, updateCardAction } from "../actions";

const priorityStyle: Record<KanbanPriority, string> = {
  low: "bg-slate-500/10 text-slate-400",
  normal: "bg-blue-500/10 text-blue-400",
  high: "bg-amber-500/10 text-amber-400",
  urgent: "bg-red-500/10 text-red-400",
};

export function KanbanBoard({ initialBoard, projectFilter }: { initialBoard: Board; projectFilter?: string }) {
  const [cards, setCards] = useState(initialBoard.cards ?? []);
  const [selected, setSelected] = useState<KanbanCard | null>(null);
  const [createColumn, setCreateColumn] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [priorityFilter, setPriorityFilter] = useState("all");
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => setCards(initialBoard.cards ?? []), [initialBoard.cards]);
  useEffect(() => {
    const refresh = () => router.refresh();
    const timer = window.setInterval(refresh, 8000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [router]);

	const visibleCards = useMemo(() => cards.filter((card) => {
		const query = search.trim().toLowerCase();
		return (priorityFilter === "all" || card.priority === priorityFilter) && (!query || card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query));
	}), [cards, priorityFilter, search]);
  const byColumn = useMemo(() => Object.fromEntries((initialBoard.columns ?? []).map((column) => [column.id, visibleCards.filter((card) => card.column_id === column.id).sort((a, b) => a.position - b.position)])), [visibleCards, initialBoard.columns]);

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!event.over) return;
    const card = cards.find((item) => item.id === String(event.active.id));
    if (!card) return;
    const overCard = cards.find((item) => item.id === String(event.over?.id));
    const columnId = overCard?.column_id ?? String(event.over.id).replace("column:", "");
    if (!(initialBoard.columns ?? []).some((column) => column.id === columnId)) return;
    const destination = byColumn[columnId] ?? [];
    const position = overCard ? Math.max(0, overCard.position - 1) : ((destination.at(-1)?.position ?? 0) + 1024);
    if (card.column_id === columnId && card.position === position) return;
    const before = cards;
    setCards((current) => current.map((item) => item.id === card.id ? { ...item, column_id: columnId, position } : item));
    try { await moveCardAction(initialBoard.id, card.id, columnId, position); }
    catch (error) { setCards(before); toast.error(error instanceof Error ? error.message : "Karta ko‘chirilmadi"); }
  }

  const activeCard = cards.find((card) => card.id === activeId);
  return <>
    {projectFilter && <div className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm"><Bot className="h-4 w-4 text-blue-400" />Kartalar tanlangan bot bo‘yicha filtrlangan</div>}
	<div className="mb-4 flex flex-wrap gap-2"><div className="relative min-w-[240px] flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kartalarni qidirish…" className="pl-9" /></div><Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Barcha muhimlik</SelectItem><SelectItem value="low">Past</SelectItem><SelectItem value="normal">Oddiy</SelectItem><SelectItem value="high">Yuqori</SelectItem><SelectItem value="urgent">Shoshilinch</SelectItem></SelectContent></Select></div>
    <DndContext sensors={sensors} onDragStart={(event) => setActiveId(String(event.active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}>
      <div className="flex min-h-[65vh] gap-4 overflow-x-auto pb-4">
        {(initialBoard.columns ?? []).map((column) => <ColumnLane key={column.id} column={column} cards={byColumn[column.id] ?? []} onOpen={setSelected} onCreate={() => setCreateColumn(column.id)} cardLabel={initialBoard.card_type_label} />)}
      </div>
      <DragOverlay>{activeCard ? <CardTile card={activeCard} overlay /> : null}</DragOverlay>
    </DndContext>
    <CardEditor board={initialBoard} card={selected} createColumnId={createColumn} onClose={() => { setSelected(null); setCreateColumn(null); }} onSaved={(card) => { setCards((current) => current.some((x) => x.id === card.id) ? current.map((x) => x.id === card.id ? card : x) : [...current, card]); setSelected(card); setCreateColumn(null); }} onArchived={(id) => { setCards((current) => current.filter((x) => x.id !== id)); setSelected(null); }} />
  </>;
}

function ColumnLane({ column, cards, onOpen, onCreate, cardLabel }: { column: NonNullable<Board["columns"]>[number]; cards: KanbanCard[]; onOpen: (card: KanbanCard) => void; onCreate: () => void; cardLabel: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${column.id}` });
  return <section ref={setNodeRef} className={cn("w-[310px] shrink-0 rounded-xl border bg-muted/25 p-3 transition", isOver && "border-blue-500/60 bg-blue-500/5")}>
    <header className="mb-3 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} /><h2 className="font-medium">{column.name}</h2><Badge variant="secondary" className="ml-auto">{cards.length}{column.wip_limit ? `/${column.wip_limit}` : ""}</Badge></header>
    <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}><div className="space-y-2">{cards.map((card) => <SortableCard key={card.id} card={card} onOpen={onOpen} />)}</div></SortableContext>
    <Button variant="ghost" className="mt-2 w-full justify-start gap-2 text-muted-foreground" onClick={onCreate}><Plus className="h-4 w-4" /> {cardLabel} qo‘shish</Button>
  </section>;
}

function SortableCard({ card, onOpen }: { card: KanbanCard; onOpen: (card: KanbanCard) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "opacity-30")}><CardTile card={card} onOpen={onOpen} dragProps={{ ...attributes, ...listeners }} /></div>;
}

function CardTile({ card, onOpen, dragProps, overlay }: { card: KanbanCard; onOpen?: (card: KanbanCard) => void; dragProps?: Record<string, unknown>; overlay?: boolean }) {
  return <article className={cn("rounded-lg border bg-card p-3 shadow-sm", overlay && "w-[290px] rotate-2 shadow-xl")}>
    <div className="flex items-start gap-2"><button className="mt-0.5 cursor-grab touch-none text-muted-foreground active:cursor-grabbing" {...dragProps}><GripVertical className="h-4 w-4" /></button><button className="min-w-0 flex-1 text-left" onClick={() => onOpen?.(card)}><div className="font-medium leading-snug">{card.title}</div>{card.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>}</button></div>
    <div className="mt-3 flex flex-wrap items-center gap-2"><Badge className={cn("border-0 text-[10px]", priorityStyle[card.priority])}>{card.priority}</Badge>{card.due_at && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" />{new Date(card.due_at).toLocaleDateString()}</span>}{card.source_project_id && <Bot className="ml-auto h-3.5 w-3.5 text-blue-400" />}</div>
  </article>;
}

function CardEditor({ board, card, createColumnId, onClose, onSaved, onArchived }: { board: Board; card: KanbanCard | null; createColumnId: string | null; onClose: () => void; onSaved: (card: KanbanCard) => void; onArchived: (id: string) => void }) {
  const open = Boolean(card || createColumnId);
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [priority, setPriority] = useState<KanbanPriority>("normal"); const [due, setDue] = useState("");
	const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [activities, setActivities] = useState<KanbanActivity[]>([]); const [comments, setComments] = useState<KanbanComment[]>([]); const [comment, setComment] = useState(""); const [pending, startTransition] = useTransition();
  useEffect(() => { setTitle(card?.title ?? ""); setDescription(card?.description ?? ""); setPriority(card?.priority ?? "normal"); setDue(card?.due_at?.slice(0, 10) ?? ""); setCustomFields(card?.custom_fields ?? {}); setActivities([]); setComments([]); if (card) getCardTimelineAction(card.id).then((data) => { setActivities(data.activities); setComments(data.comments); }).catch(() => undefined); }, [card, createColumnId]);
  function save() { if (!title.trim()) return; startTransition(async () => { try { const body = { title: title.trim(), description, priority, kind: card?.kind ?? "item", due_at: due ? new Date(`${due}T12:00:00`).toISOString() : null, custom_fields: customFields }; const saved = card ? await updateCardAction(board.id, card.id, body) : await createCardAction(board.id, { ...body, column_id: createColumnId }); onSaved(saved); toast.success("Saqlandi"); } catch (error) { toast.error(error instanceof Error ? error.message : "Saqlanmadi"); } }); }
  function archive() { if (!card) return; startTransition(async () => { try { await archiveCardAction(board.id, card.id); onArchived(card.id); } catch { toast.error("Karta arxivlanmadi"); } }); }
  function sendComment() { if (!card || !comment.trim()) return; startTransition(async () => { try { const saved = await addCommentAction(board.id, card.id, comment); setComments((current) => [...current, saved]); setComment(""); } catch { toast.error("Izoh yuborilmadi"); } }); }
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{card ? card.title : `Yangi ${board.card_type_label.toLowerCase()}`}</DialogTitle></DialogHeader><div className="grid gap-6 md:grid-cols-[1fr_280px]">
    <div className="space-y-4"><div className="space-y-2"><Label>Sarlavha</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div><div className="space-y-2"><Label>Tavsif</Label><Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Muhimlik</Label><Select value={priority} onValueChange={(value) => setPriority(value as KanbanPriority)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Past</SelectItem><SelectItem value="normal">Oddiy</SelectItem><SelectItem value="high">Yuqori</SelectItem><SelectItem value="urgent">Shoshilinch</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Muddat</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div></div>
	  {(board.field_schema ?? []).length > 0 && <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">{board.field_schema.map((field) => <div key={field.key} className="space-y-2"><Label>{field.label}</Label>{field.type === "boolean" ? <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm"><input type="checkbox" checked={Boolean(customFields[field.key])} onChange={(e) => setCustomFields((current) => ({ ...current, [field.key]:e.target.checked }))} />Ha</label> : <Input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={String(customFields[field.key] ?? "")} onChange={(e) => setCustomFields((current) => ({ ...current, [field.key]:field.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value }))} />}</div>)}</div>}
      {card && <div className="space-y-3 border-t pt-4"><h3 className="flex items-center gap-2 text-sm font-medium"><MessageSquare className="h-4 w-4" /> Izohlar</h3>{comments.map((item) => <div key={item.id} className="rounded-lg bg-muted p-3 text-sm"><p>{item.body}</p><span className="mt-1 block text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span></div>)}<div className="flex gap-2"><Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Izoh yozing…" onKeyDown={(e) => e.key === "Enter" && sendComment()} /><Button size="icon" onClick={sendComment} disabled={pending}><Send className="h-4 w-4" /></Button></div></div>}
    </div>
    <aside className="space-y-3 border-l pl-4"><h3 className="flex items-center gap-2 text-sm font-medium"><Clock3 className="h-4 w-4" /> Faoliyat</h3>{activities.length === 0 ? <p className="text-xs text-muted-foreground">Hozircha faoliyat yo‘q</p> : activities.map((item) => <div key={item.id} className="border-l-2 pl-3 text-xs"><div className="font-medium">{item.event}</div><div className="text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div></div>)}</aside>
  </div><DialogFooter className="justify-between sm:justify-between">{card ? <Button variant="ghost" className="text-red-400" onClick={archive}><Archive className="mr-2 h-4 w-4" /> Arxivlash</Button> : <span />}<div className="flex gap-2"><Button variant="outline" onClick={onClose}>Bekor qilish</Button><Button onClick={save} disabled={pending || !title.trim()}>{pending ? "Saqlanmoqda…" : "Saqlash"}</Button></div></DialogFooter></DialogContent></Dialog>;
}
