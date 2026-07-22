"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Archive,
  Bot,
  Calendar,
  Clock3,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type {
  KanbanActivity,
  KanbanBoard as Board,
  KanbanCard,
  KanbanComment,
  KanbanPriority,
} from "@/shared/types/api";
import {
  addCommentAction,
  archiveCardAction,
  createCardAction,
  getCardTimelineAction,
  listArchivedCardsAction,
  moveCardAction,
  restoreCardAction,
  updateCardAction,
} from "../actions";

const priorityStyle: Record<KanbanPriority, string> = {
  low: "bg-slate-500/10 text-slate-400",
  normal: "bg-blue-500/10 text-blue-400",
  high: "bg-amber-500/10 text-amber-400",
  urgent: "bg-red-500/10 text-red-400",
};

export function KanbanBoard({
  initialBoard,
  projectFilter,
}: {
  initialBoard: Board;
  projectFilter?: string;
}) {
  const [cards, setCards] = useState(initialBoard.cards ?? []);
  const [selected, setSelected] = useState<KanbanCard | null>(null);
  const [createColumn, setCreateColumn] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archivedCards, setArchivedCards] = useState<KanbanCard[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [restoringCard, setRestoringCard] = useState<string | null>(null);
  const pendingMovesRef = useRef(
    new Map<string, { mutationId: number; columnId: string }>(),
  );
  const moveSequenceRef = useRef(0);
  const router = useRouter();
  const t = useTranslations("kanban");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    // A router refresh may have started before an optimistic move. Merge the
    // server snapshot instead of blindly replacing the newer local location.
    setCards((current) => {
      const localById = new Map(current.map((card) => [card.id, card]));
      const incoming = initialBoard.cards ?? [];
      const merged = incoming.map((serverCard) => {
        const local = localById.get(serverCard.id);
        if (!local) return serverCard;
        if (pendingMovesRef.current.has(serverCard.id)) return local;
        return Date.parse(serverCard.updated_at) >= Date.parse(local.updated_at)
          ? serverCard
          : local;
      });
      const incomingIds = new Set(incoming.map((card) => card.id));
      return [
        ...merged,
        ...current.filter((card) => !incomingIds.has(card.id)),
      ];
    });
  }, [initialBoard.cards]);
  useEffect(() => {
    let refreshTimer: number | undefined;
    const refresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => router.refresh(), 120);
    };
    const source = new EventSource("/api/boards/events");
    const refreshEvents = [
      "kanban_board_updated",
      "kanban_board_linked",
      "kanban_board_unlinked",
      "kanban_column_created",
      "kanban_column_updated",
      "kanban_column_deleted",
      "kanban_columns_reordered",
    ];
    refreshEvents.forEach((name) => source.addEventListener(name, refresh));
    const readCard = (event: Event) => {
      try {
        const card = JSON.parse((event as MessageEvent).data) as KanbanCard;
        return card.board_id === initialBoard.id ? card : null;
      } catch {
        return null;
      }
    };
    const upsertCard = (event: Event) => {
      const card = readCard(event);
      if (!card) return;
      const pendingMove = pendingMovesRef.current.get(card.id);
      // An earlier update/move event may arrive after the user has already
      // dragged this card elsewhere. Never let that stale event snap it back.
      if (pendingMove && card.column_id !== pendingMove.columnId) return;
      setCards((current) => {
        const existing = current.find((item) => item.id === card.id);
        if (
          existing &&
          Date.parse(card.updated_at) < Date.parse(existing.updated_at)
        )
          return current;
        return existing
          ? current.map((item) => (item.id === card.id ? card : item))
          : [...current, card];
      });
      setArchivedCards((current) =>
        current.filter((item) => item.id !== card.id),
      );
    };
    const archiveCard = (event: Event) => {
      const card = readCard(event);
      if (!card) return;
      setCards((current) => current.filter((item) => item.id !== card.id));
      setArchivedCards((current) =>
        current.some((item) => item.id === card.id)
          ? current
          : [card, ...current],
      );
    };
    [
      "kanban_card_created",
      "kanban_card_updated",
      "kanban_card_moved",
      "kanban_card_restored",
    ].forEach((name) => source.addEventListener(name, upsertCard));
    source.addEventListener("kanban_card_archived", archiveCard);
    source.addEventListener("kanban_board_archived", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as {
          id?: string;
        };
        if (data.id === initialBoard.id) router.push("/app/boards");
      } catch {
        // Ignore malformed events; the connection stays active.
      }
    });
    const mutationFailed = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          board_id?: string;
          message?: string;
        };
        if (!data.board_id || data.board_id === initialBoard.id)
          toast.error(data.message ?? t("mutationFailed"));
      } catch {
        toast.error(t("mutationFailed"));
      }
    };
    source.addEventListener(
      "kanban_mutation_failed",
      mutationFailed as EventListener,
    );
    window.addEventListener("focus", refresh);
    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      source.close();
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  async function openArchive() {
    setArchiveOpen(true);
    setArchiveLoading(true);
    try {
      setArchivedCards(
        await listArchivedCardsAction(initialBoard.id, projectFilter),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("archiveLoadFailed"),
      );
    } finally {
      setArchiveLoading(false);
    }
  }

  async function restoreArchivedCard(card: KanbanCard) {
    setRestoringCard(card.id);
    try {
      const restored = await restoreCardAction(card.id);
      setArchivedCards((current) =>
        current.filter((item) => item.id !== card.id),
      );
      setCards((current) =>
        current.some((item) => item.id === restored.id)
          ? current.map((item) => (item.id === restored.id ? restored : item))
          : [...current, restored],
      );
      toast.success(t("cardRestored"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("restoreFailed"));
    } finally {
      setRestoringCard(null);
    }
  }

  const visibleCards = useMemo(
    () =>
      cards.filter((card) => {
        const query = search.trim().toLowerCase();
        return (
          (priorityFilter === "all" || card.priority === priorityFilter) &&
          (!query ||
            card.title.toLowerCase().includes(query) ||
            card.description.toLowerCase().includes(query))
        );
      }),
    [cards, priorityFilter, search],
  );
  const byColumn = useMemo(
    () =>
      Object.fromEntries(
        (initialBoard.columns ?? []).map((column) => [
          column.id,
          visibleCards
            .filter((card) => card.column_id === column.id)
            .sort((a, b) => a.position - b.position),
        ]),
      ),
    [visibleCards, initialBoard.columns],
  );

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!event.over) return;
    const card = cards.find((item) => item.id === String(event.active.id));
    if (!card) return;
    const overCard = cards.find((item) => item.id === String(event.over?.id));
    const columnId =
      overCard?.column_id ?? String(event.over.id).replace("column:", "");
    if (!(initialBoard.columns ?? []).some((column) => column.id === columnId))
      return;
    const destination = cards
      .filter((item) => item.column_id === columnId && item.id !== card.id)
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
    const position = overCard
      ? Math.max(
          0,
          destination.findIndex((item) => item.id === overCard.id),
        )
      : destination.length;
    const current = cards
      .filter((item) => item.column_id === card.column_id)
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
    if (
      card.column_id === columnId &&
      current.findIndex((item) => item.id === card.id) === position
    )
      return;
    const before = cards;
    const mutationId = ++moveSequenceRef.current;
    pendingMovesRef.current.set(card.id, { mutationId, columnId });
    const reordered = [...destination];
    reordered.splice(position, 0, { ...card, column_id: columnId });
    const positions = new Map(
      reordered.map((item, index) => [item.id, (index + 1) * 1024]),
    );
    setCards((items) =>
      items.map((item) =>
        item.id === card.id
          ? { ...item, column_id: columnId, position: positions.get(item.id)! }
          : item.column_id === columnId
            ? { ...item, position: positions.get(item.id) ?? item.position }
            : item,
      ),
    );
    try {
      const moved = await moveCardAction(
        initialBoard.id,
        card.id,
        columnId,
        position,
      );
      const pendingMove = pendingMovesRef.current.get(card.id);
      if (pendingMove?.mutationId !== mutationId) return;
      pendingMovesRef.current.delete(card.id);
      // The mutation response is authoritative and carries the backend's
      // updated_at/version. Keeping it locally also rejects delayed SSE events.
      setCards((items) =>
        items.map((item) => (item.id === moved.id ? moved : item)),
      );
    } catch (error) {
      const pendingMove = pendingMovesRef.current.get(card.id);
      if (pendingMove?.mutationId !== mutationId) return;
      pendingMovesRef.current.delete(card.id);
      setCards(before);
      toast.error(error instanceof Error ? error.message : t("moveFailed"));
    }
  }

  const activeCard = cards.find((card) => card.id === activeId);
  return (
    <>
      {projectFilter && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
          <Bot className="h-4 w-4 text-blue-400" />
          {t("filteredCards")}
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="pl-9"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPriorities")}</SelectItem>
            <SelectItem value="low">{t("priorities.low")}</SelectItem>
            <SelectItem value="normal">{t("priorities.normal")}</SelectItem>
            <SelectItem value="high">{t("priorities.high")}</SelectItem>
            <SelectItem value="urgent">{t("priorities.urgent")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={openArchive}>
          <Archive className="mr-2 h-4 w-4" />
          {t("archive")}
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <div className="flex min-h-[65vh] gap-4 overflow-x-auto pb-4">
          {(initialBoard.columns ?? []).map((column) => (
            <ColumnLane
              key={column.id}
              column={column}
              cards={byColumn[column.id] ?? []}
              onOpen={setSelected}
              onCreate={() => setCreateColumn(column.id)}
              cardLabel={initialBoard.card_type_label}
              projects={initialBoard.projects ?? []}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <CardTile card={activeCard} overlay /> : null}
        </DragOverlay>
      </DndContext>
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("archivedCards")}</DialogTitle>
          </DialogHeader>
          {archiveLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : archivedCards.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t("archivedCardsEmpty")}
            </div>
          ) : (
            <div className="space-y-2">
              {archivedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {card.title}
                    </div>
                    {card.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={restoringCard === card.id}
                    onClick={() => restoreArchivedCard(card)}
                  >
                    {restoringCard === card.id ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-3.5 w-3.5" />
                    )}
                    {t("restore")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CardEditor
        board={initialBoard}
        card={selected}
        createColumnId={createColumn}
        onClose={() => {
          setSelected(null);
          setCreateColumn(null);
        }}
        onSaved={(card) => {
          setCards((current) =>
            current.some((x) => x.id === card.id)
              ? current.map((x) => (x.id === card.id ? card : x))
              : [...current, card],
          );
          setSelected(card);
          setCreateColumn(null);
        }}
        onArchived={(id) => {
          setCards((current) => current.filter((x) => x.id !== id));
          setSelected(null);
        }}
      />
    </>
  );
}

function ColumnLane({
  column,
  cards,
  onOpen,
  onCreate,
  cardLabel,
  projects,
}: {
  column: NonNullable<Board["columns"]>[number];
  cards: KanbanCard[];
  onOpen: (card: KanbanCard) => void;
  onCreate: () => void;
  cardLabel: string;
  projects: NonNullable<Board["projects"]>;
}) {
  const t = useTranslations("kanban");
  const { setNodeRef, isOver } = useDroppable({ id: `column:${column.id}` });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-muted/20 shadow-sm transition-all",
        isOver && "border-blue-500/70 bg-blue-500/[0.06] shadow-blue-500/10",
      )}
    >
      <header className="flex items-center gap-2 border-b bg-card/70 px-4 py-3.5 backdrop-blur">
        <span
          className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_var(--lane-color)]"
          style={
            {
              backgroundColor: column.color,
              "--lane-color": `${column.color}22`,
            } as React.CSSProperties
          }
        />
        <h2 className="font-semibold">{column.name}</h2>
        {column.is_terminal && (
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-[10px] text-emerald-500"
          >
            {t("terminal")}
          </Badge>
        )}
        <Badge variant="secondary" className="ml-auto tabular-nums">
          {cards.length}
          {column.wip_limit ? ` / ${column.wip_limit}` : ""}
        </Badge>
      </header>
      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-28 flex-1 space-y-2.5 p-3">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onOpen={onOpen}
              projectName={
                projects.find(
                  (project) => project.id === card.source_project_id,
                )?.name
              }
            />
          ))}
          {cards.length === 0 && (
            <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
              <Inbox className="mb-2 h-5 w-5 opacity-50" />
              {t("dropHere")}
            </div>
          )}
        </div>
      </SortableContext>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:bg-card hover:text-foreground"
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          {t("add", { type: cardLabel })}
        </Button>
      </div>
    </section>
  );
}

function SortableCard({
  card,
  onOpen,
  projectName,
}: {
  card: KanbanCard;
  onOpen: (card: KanbanCard) => void;
  projectName?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-30")}
    >
      <CardTile
        card={card}
        onOpen={onOpen}
        dragProps={{ ...attributes, ...listeners }}
        projectName={projectName}
      />
    </div>
  );
}

function CardTile({
  card,
  onOpen,
  dragProps,
  overlay,
  projectName,
}: {
  card: KanbanCard;
  onOpen?: (card: KanbanCard) => void;
  dragProps?: Record<string, unknown>;
  overlay?: boolean;
  projectName?: string;
}) {
  const t = useTranslations("kanban");
  return (
    <article
      {...dragProps}
      className={cn(
        "group relative cursor-grab touch-none overflow-hidden rounded-xl border bg-card p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
        overlay && "w-[295px] rotate-2 shadow-xl",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          card.priority === "urgent"
            ? "bg-red-500"
            : card.priority === "high"
              ? "bg-amber-500"
              : card.priority === "low"
                ? "bg-slate-500"
                : "bg-blue-500",
        )}
      />
      <button
        className="block min-w-0 w-full text-left"
        onClick={() => onOpen?.(card)}
      >
        <div className="font-medium leading-snug">{card.title}</div>
        {card.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {card.description}
          </p>
        )}
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge
          className={cn("border-0 text-[10px]", priorityStyle[card.priority])}
        >
          {t(`priorities.${card.priority}`)}
        </Badge>
        {card.due_at && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(card.due_at).toLocaleDateString()}
          </span>
        )}
        {card.source_project_id && (
          <span
            className="ml-auto flex max-w-[130px] items-center gap-1 truncate text-[10px] text-blue-400"
            title={projectName}
          >
            <Bot className="h-3.5 w-3.5 shrink-0" />
            {projectName ?? t("bot")}
          </span>
        )}
      </div>
    </article>
  );
}

function CardEditor({
  board,
  card,
  createColumnId,
  onClose,
  onSaved,
  onArchived,
}: {
  board: Board;
  card: KanbanCard | null;
  createColumnId: string | null;
  onClose: () => void;
  onSaved: (card: KanbanCard) => void;
  onArchived: (id: string) => void;
}) {
  const t = useTranslations("kanban");
  const activityNames: Record<string, string> = {
    created: t("activities.created"),
    updated: t("activities.updated"),
    moved: t("activities.moved"),
    archived: t("activities.archived"),
    restored: t("activities.restored"),
    commented: t("activities.commented"),
  };
  const open = Boolean(card || createColumnId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<KanbanPriority>("normal");
  const [due, setDue] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [activities, setActivities] = useState<KanbanActivity[]>([]);
  const [comments, setComments] = useState<KanbanComment[]>([]);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setPriority(card?.priority ?? "normal");
    setDue(card?.due_at?.slice(0, 10) ?? "");
    setCustomFields(card?.custom_fields ?? {});
    setActivities([]);
    setComments([]);
    if (card)
      getCardTimelineAction(card.id)
        .then((data) => {
          setActivities(data.activities);
          setComments(data.comments);
        })
        .catch(() => undefined);
  }, [card, createColumnId]);
  function save() {
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        const body = {
          title: title.trim(),
          description,
          priority,
          kind: card?.kind ?? "item",
          due_at: due ? new Date(`${due}T12:00:00`).toISOString() : null,
          custom_fields: customFields,
        };
        const saved = card
          ? await updateCardAction(board.id, card.id, body)
          : await createCardAction(board.id, {
              ...body,
              column_id: createColumnId,
            });
        onSaved(saved);
        toast.success(t("saved"));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("saveFailed"));
      }
    });
  }
  function archive() {
    if (!card) return;
    startTransition(async () => {
      try {
        await archiveCardAction(board.id, card.id);
        onArchived(card.id);
      } catch {
        toast.error(t("archiveFailed"));
      }
    });
  }
  function sendComment() {
    if (!card || !comment.trim()) return;
    startTransition(async () => {
      try {
        const saved = await addCommentAction(board.id, card.id, comment);
        setComments((current) => [...current, saved]);
        setComment("");
      } catch {
        toast.error(t("commentFailed"));
      }
    });
  }
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[92vh] w-[min(96vw,1024px)] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {card
              ? card.title
              : t("newCard", { type: board.card_type_label.toLowerCase() })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("titleField")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("descriptionField")}</Label>
            <Textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("priority")}</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as KanbanPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("priorities.low")}</SelectItem>
                  <SelectItem value="normal">
                    {t("priorities.normal")}
                  </SelectItem>
                  <SelectItem value="high">{t("priorities.high")}</SelectItem>
                  <SelectItem value="urgent">
                    {t("priorities.urgent")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("due")}</Label>
              <Input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
          {(board.field_schema ?? []).length > 0 && (
            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
              {board.field_schema.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "boolean" ? (
                    <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(customFields[field.key])}
                        onChange={(e) =>
                          setCustomFields((current) => ({
                            ...current,
                            [field.key]: e.target.checked,
                          }))
                        }
                      />
                      {t("yes")}
                    </label>
                  ) : (
                    <Input
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : "text"
                      }
                      value={String(customFields[field.key] ?? "")}
                      onChange={(e) =>
                        setCustomFields((current) => ({
                          ...current,
                          [field.key]:
                            field.type === "number" && e.target.value !== ""
                              ? Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {card && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                {t("comments")}
              </h3>
              {comments.map((item) => (
                <div key={item.id} className="rounded-lg bg-muted p-3 text-sm">
                  <p>{item.body}</p>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("commentPlaceholder")}
                  onKeyDown={(e) => e.key === "Enter" && sendComment()}
                />
                <Button size="icon" onClick={sendComment} disabled={pending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {card && (
            <details className="group border-t pt-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground [&::-webkit-details-marker]:hidden">
                <Clock3 className="h-3.5 w-3.5" />
                {t("activity")}
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activities.length}
                </Badge>
              </summary>
              <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
                {activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t("noActivity")}
                  </p>
                ) : (
                  activities.map((item) => (
                    <div key={item.id} className="border-l-2 pl-3 text-xs">
                      <div className="font-medium">
                        {activityNames[item.event] ?? item.event}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </details>
          )}
        </div>
        <DialogFooter className="justify-between sm:justify-between">
          {card ? (
            <Button variant="ghost" className="text-red-400" onClick={archive}>
              <Archive className="mr-2 h-4 w-4" />
              {t("archive")}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button onClick={save} disabled={pending || !title.trim()}>
              {pending ? t("saving") : t("save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
