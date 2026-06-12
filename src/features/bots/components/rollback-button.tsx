"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rollbackReleaseAction } from "@/features/bots/actions";
import type { RunningBot } from "@/features/bots/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { RunningBotLimitDialog } from "./running-bot-limit-dialog";

/**
 * Per-row "rollback to this version" control: re-deploys the selected release's
 * saved flow snapshot as a new release and restores it as the project draft.
 */
export function RollbackButton({
  projectId,
  releaseId,
  version,
}: {
  projectId: string | number;
  releaseId: string | number;
  version: string | number;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, start] = useTransition();
  const [limitState, setLimitState] = useState<{
    limit: number;
    running: RunningBot[];
  } | null>(null);

  const onConfirm = () => {
    start(async () => {
      const result = await rollbackReleaseAction(projectId, releaseId);
      if (result.ok) {
        toast.success(`v${version} ga qaytarildi — yangi release deploy qilinmoqda`);
        setConfirmOpen(false);
        return;
      }
      if (result.code === "running_bot_limit" && result.running) {
        setConfirmOpen(false);
        setLimitState({ limit: result.limit ?? 10, running: result.running });
        return;
      }
      toast.error(result.message ?? "Qaytarish muvaffaqiyatsiz");
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => setConfirmOpen(true)}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Qaytarish
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>v{version} ga qaytarilsinmi?</DialogTitle>
            <DialogDescription>
              Shu versiyaning flow&apos;i bilan yangi release deploy qilinadi va loyihaning
              joriy (draft) flow&apos;i ham shu versiyaga almashadi. Hozir ishlab turgan
              release to&apos;xtatiladi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Bekor qilish
              </Button>
            </DialogClose>
            <Button onClick={onConfirm} disabled={pending} className="gap-2">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Qaytarish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {limitState && (
        <RunningBotLimitDialog
          open
          onClose={() => setLimitState(null)}
          limit={limitState.limit}
          running={limitState.running}
          projectId={projectId}
        />
      )}
    </>
  );
}
