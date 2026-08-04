"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/shared/i18n/routing";
import { useTranslations } from "next-intl";
import { Bot, Check, Kanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { createBoardAction } from "../actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import type { Project } from "@/shared/types/api";

const templateKeys = [
  "blank",
  "leads",
  "support",
  "orders",
  "hiring",
  "tasks",
] as const;
type TemplateKey = (typeof templateKeys)[number];
type TemplateCopy = { label: string; card: string; columns: string[] };

export function BoardCreateDialog({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<TemplateKey>("leads");
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("kanban");

  function submit() {
    if (!name.trim()) return;
    const selected = t.raw(`templates.${template}`) as TemplateCopy;
    startTransition(async () => {
      try {
        const board = await createBoardAction({
          name: name.trim(),
          card_type_label: selected.card,
          project_ids: projectIds,
          field_schema: [],
          columns: selected.columns.map((column, index) => ({
            name: column,
            color: ["#64748b", "#3b82f6", "#f59e0b", "#22c55e"][
              Math.min(index, 3)
            ],
            is_terminal: index === selected.columns.length - 1,
          })),
        });
        setOpen(false);
        router.push(`/app/boards/${board.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("createFailed"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("newBoard")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("newBoardTitle")}</DialogTitle>
          <DialogDescription>{t("newBoardDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">{t("name")}</Label>
            <Input
              id="board-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("template")}</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {templateKeys.map((key) => {
                const item = t.raw(`templates.${key}`) as TemplateCopy;
                const active = template === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setTemplate(key)}
                    className={`rounded-xl border p-3 text-left transition ${active ? "border-primary/50 bg-primary/10 shadow-sm" : "bg-card hover:border-foreground/20"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {active ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Kanban className="h-4 w-4" />
                        )}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.columns.map((column) => (
                        <span
                          key={column}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {projects.length > 0 && (
            <div className="space-y-2">
              <div>
                <Label className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  {t("linkBots")}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("linkBotsCreateHint")}
                </p>
              </div>
              <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border bg-muted/10 p-2 sm:grid-cols-2">
                {projects.map((project) => {
                  const selected = projectIds.includes(project.id);
                  return (
                    <button
                      type="button"
                      key={project.id}
                      onClick={() =>
                        setProjectIds((current) =>
                          selected
                            ? current.filter((id) => id !== project.id)
                            : [...current, project.id],
                        )
                      }
                      className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition ${selected ? "border-blue-500/40 bg-blue-500/10" : "border-transparent bg-card hover:border-foreground/15"}`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-md ${selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        {selected ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {project.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={pending || !name.trim()}>
            {pending ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
