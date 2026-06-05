"use client";
import { useState, useTransition } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { deployReleaseAction } from "@/features/bots/actions";
import type { RunningBot } from "@/features/bots/actions";
import { Button } from "@/shared/components/ui/button";
import { RunningBotLimitDialog } from "./running-bot-limit-dialog";

export function DeployButton({ projectId }: { projectId: string | number }) {
  const t = useTranslations("bots");
  const [pending, start] = useTransition();
  const [limitState, setLimitState] = useState<{
    limit: number;
    running: RunningBot[];
  } | null>(null);

  const onClick = () => {
    start(async () => {
      try {
        const result = await deployReleaseAction(projectId);
        if (result.ok) {
          toast.success(t("release.deployStarted"));
          return;
        }
        if (result.code === "running_bot_limit" && result.running) {
          setLimitState({ limit: result.limit ?? 10, running: result.running });
          return;
        }
        toast.error(result.message ?? t("release.deployFailed"));
      } catch {
        toast.error(t("release.deployFailed"));
      }
    });
  };

  return (
    <>
      <Button onClick={onClick} disabled={pending} className="gap-2">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
        {t("release.deploy")}
      </Button>

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
