"use client";
import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { stopDebugAction, stopReleaseAction, deployReleaseAction } from "@/features/bots/actions";
import type { RunningBot } from "@/features/bots/actions";

interface Props {
  open: boolean;
  onClose: () => void;
  limit: number;
  running: RunningBot[];
  /** The project to deploy after stopping */
  projectId: string | number;
}

export function RunningBotLimitDialog({ open, onClose, limit, running, projectId }: Props) {
  const t = useTranslations("bots.runningLimit");
  const [selected, setSelected] = useState<number | null>(running[0]?.project_id ?? null);
  const [pending, start] = useTransition();

  function handleStop() {
    if (selected === null) return;
    const bot = running.find((b) => b.project_id === selected);
    if (!bot) return;

    start(async () => {
      // Stop selected bot
      const stopResult =
        bot.kind === "release" && bot.release_id
          ? await stopReleaseAction(bot.release_id)
          : await stopDebugAction(bot.project_id);

      if (!stopResult.ok) {
        toast.error(stopResult.message ?? t("stopError"));
        return;
      }

      // Retry the original deploy
      const deployResult = await deployReleaseAction(projectId);
      if (!deployResult.ok) {
        toast.error(deployResult.message ?? t("deployError"));
        return;
      }

      toast.success(t("deployStarted"));
      onClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>{t("title")}</DialogTitle>
          </div>
          <DialogDescription>{t("description", { limit })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {running.map((bot) => (
            <label
              key={`${bot.project_id}-${bot.kind}`}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                selected === bot.project_id
                  ? "border-blue-500/60 bg-blue-500/5"
                  : "border-border/60 hover:border-border"
              }`}
            >
              <input
                type="radio"
                name="stop-bot"
                className="sr-only"
                checked={selected === bot.project_id}
                onChange={() => setSelected(bot.project_id)}
              />
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate font-medium text-sm">{bot.name}</span>
                <Badge
                  variant={bot.kind === "release" ? "success" : "secondary"}
                  className="shrink-0 text-[11px]"
                >
                  {bot.kind === "release" ? t("release") : t("debug")}
                </Badge>
              </div>
              <div
                className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                  selected === bot.project_id ? "border-blue-500 bg-blue-500" : "border-border"
                }`}
              />
            </label>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleStop}
            disabled={pending || selected === null}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <StopCircle className="h-4 w-4" />
            )}
            {t("stopAndDeploy")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
