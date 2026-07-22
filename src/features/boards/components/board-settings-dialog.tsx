"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/i18n/routing";
import { useTranslations } from "next-intl";
import type { KanbanBoard, Project } from "@/shared/types/api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  archiveBoardAction,
  createColumnAction,
  removeColumnAction,
  reorderColumnsAction,
  setBoardProjectAction,
  updateBoardAction,
  updateColumnAction,
} from "../actions";

type Field = { key: string; label: string; type: string };

export function BoardSettingsDialog({
  board,
  projects,
}: {
  board: KanbanBoard;
  projects: Project[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [cardLabel, setCardLabel] = useState(board.card_type_label);
  const [columns, setColumns] = useState(
    (board.columns ?? []).map((column) => ({ ...column })),
  );
  const [fields, setFields] = useState<Field[]>(board.field_schema ?? []);
  const [linked, setLinked] = useState(board.project_ids ?? []);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [botSearch, setBotSearch] = useState("");
  const t = useTranslations("kanban");
  const visibleProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(botSearch.trim().toLowerCase()),
      ),
    [botSearch, projects],
  );
  function save() {
    startTransition(async () => {
      try {
        await updateBoardAction(board.id, {
          name,
          description,
          icon: board.icon,
          color: board.color,
          card_type_label: cardLabel,
          field_schema: fields.filter(
            (field) => field.key.trim() && field.label.trim(),
          ),
        });
        const savedColumns = await Promise.all(
          columns.map((column) =>
            column.id.startsWith("new:")
              ? createColumnAction(board.id, {
                  name: column.name,
                  color: column.color,
                  wip_limit: column.wip_limit,
                  is_terminal: column.is_terminal,
                })
              : updateColumnAction(board.id, column.id, {
                  name: column.name,
                  color: column.color,
                  wip_limit: column.wip_limit,
                  is_terminal: column.is_terminal,
                }),
          ),
        );
        await reorderColumnsAction(
          board.id,
          savedColumns.map((column) => (column as { id: string }).id),
        );
        const before = new Set(board.project_ids);
        const after = new Set(linked);
        await Promise.all(
          projects
            .filter((p) => before.has(p.id) !== after.has(p.id))
            .map((p) => setBoardProjectAction(board.id, p.id, after.has(p.id))),
        );
        toast.success(t("settingsSaved"));
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("settingsFailed"),
        );
      }
    });
  }
  function moveColumn(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= columns.length) return;
    setColumns((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function archiveBoard() {
    if (!window.confirm(t("archiveConfirm", { name: board.name }))) return;
    startTransition(async () => {
      try {
        await archiveBoardAction(board.id);
        toast.success(t("boardArchived"));
        setOpen(false);
        router.push("/app/boards");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("boardArchiveFailed"),
        );
      }
    });
  }
  function removeColumn(id: string) {
    if (id.startsWith("new:")) {
      setColumns((current) => current.filter((column) => column.id !== id));
      return;
    }
    startTransition(async () => {
      try {
        await removeColumnAction(board.id, id);
        setColumns((current) => current.filter((column) => column.id !== id));
      } catch {
        toast.error(t("removeColumnFailed"));
      }
    });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          {t("settings")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("settingsTitle")}</DialogTitle>
          <DialogDescription>{t("settingsDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("cardType")}</Label>
              <Input
                value={cardLabel}
                onChange={(e) => setCardLabel(e.target.value)}
                placeholder="Lead"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("descriptionField")}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>
          <section className="space-y-3 rounded-xl border bg-muted/15 p-4">
            <div>
              <Label className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-blue-500" />
                {t("linkBots")}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("linkBotsHint")}
              </p>
            </div>
            {linked.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {linked.map((id) => {
                  const project = projects.find((item) => item.id === id);
                  return project ? (
                    <button
                      type="button"
                      key={id}
                      onClick={() =>
                        setLinked((current) =>
                          current.filter((item) => item !== id),
                        )
                      }
                      className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-500 transition hover:bg-blue-500/15"
                    >
                      <Bot className="h-3 w-3" />
                      {project.name}
                      <X className="h-3 w-3" />
                    </button>
                  ) : null;
                })}
              </div>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={botSearch}
                onChange={(e) => setBotSearch(e.target.value)}
                placeholder={t("findBot")}
                className="pl-9"
              />
            </div>
            <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
              {visibleProjects.map((project) => {
                const selected = linked.includes(project.id);
                return (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() =>
                      setLinked((current) =>
                        selected
                          ? current.filter((id) => id !== project.id)
                          : [...current, project.id],
                      )
                    }
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${selected ? "border-blue-500/40 bg-blue-500/10" : "bg-card hover:border-foreground/20 hover:bg-muted/40"}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium">
                      {project.name}
                    </span>
                  </button>
                );
              })}
              {visibleProjects.length === 0 && (
                <p className="col-span-2 py-6 text-center text-sm text-muted-foreground">
                  {t("botNotFound")}
                </p>
              )}
            </div>
          </section>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("columns")}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setColumns((current) => [
                    ...current,
                    {
                      id: `new:${Date.now()}`,
                      board_id: board.id,
                      name: t("newColumn"),
                      color: "#64748b",
                      position: current.length,
                      wip_limit: null,
                      is_terminal: false,
                      created_at: "",
                      updated_at: "",
                    },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("column")}
              </Button>
            </div>
            {columns.map((column, index) => (
              <div key={column.id} className="rounded-xl border bg-card p-3">
                <div className="grid grid-cols-[64px_1fr_82px_82px_36px] gap-2">
                  <div className="flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveColumn(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === columns.length - 1}
                      onClick={() => moveColumn(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={column.name}
                    onChange={(e) =>
                      setColumns((current) =>
                        current.map((item) =>
                          item.id === column.id
                            ? { ...item, name: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="color"
                    value={column.color}
                    onChange={(e) =>
                      setColumns((current) =>
                        current.map((item) =>
                          item.id === column.id
                            ? { ...item, color: e.target.value }
                            : item,
                        ),
                      )
                    }
                    className="p-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={column.wip_limit ?? ""}
                    placeholder="WIP"
                    onChange={(e) =>
                      setColumns((current) =>
                        current.map((item) =>
                          item.id === column.id
                            ? {
                                ...item,
                                wip_limit: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={columns.length <= 1}
                    onClick={() => removeColumn(column.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="radio"
                    name="terminal-column"
                    checked={column.is_terminal}
                    onChange={() =>
                      setColumns((current) =>
                        current.map((item) => ({
                          ...item,
                          is_terminal: item.id === column.id,
                        })),
                      )
                    }
                  />
                  {t("terminalColumn")}
                </label>
              </div>
            ))}
          </section>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("customFields")}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFields((current) => [
                    ...current,
                    { key: "", label: "", type: "text" },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("field")}
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="rounded border border-dashed p-3 text-xs text-muted-foreground">
                {t("noFields")}
              </p>
            )}
            {fields.map((field, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_120px_36px] gap-2"
              >
                <Input
                  value={field.key}
                  placeholder="phone"
                  onChange={(e) =>
                    setFields((current) =>
                      current.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              key: e.target.value
                                .replace(/\s+/g, "_")
                                .toLowerCase(),
                            }
                          : item,
                      ),
                    )
                  }
                />
                <Input
                  value={field.label}
                  placeholder="Telefon"
                  onChange={(e) =>
                    setFields((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, label: e.target.value } : item,
                      ),
                    )
                  }
                />
                <Select
                  value={field.type}
                  onValueChange={(value) =>
                    setFields((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, type: value } : item,
                      ),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">{t("fieldTypes.text")}</SelectItem>
                    <SelectItem value="number">{t("fieldTypes.number")}</SelectItem>
                    <SelectItem value="date">{t("fieldTypes.date")}</SelectItem>
                    <SelectItem value="boolean">{t("fieldTypes.boolean")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFields((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
          </section>
          <section className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-red-400">
                  {t("dangerZone")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("dangerHint")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={archiveBoard}
                disabled={pending}
              >
                <Archive className="mr-2 h-4 w-4" />
                {t("archive")}
              </Button>
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            disabled={pending || !name.trim() || !cardLabel.trim()}
            onClick={save}
          >
            {pending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
