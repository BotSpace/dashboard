"use client";
import { useState, useTransition } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { deployReleaseAction } from "@/features/bots/actions";
import type { RunningBot } from "@/features/bots/actions";
import { Button } from "@/shared/components/ui/button";
import { analytics } from "@/shared/analytics/umami";
import { RunningBotLimitDialog } from "./running-bot-limit-dialog";
import { BotTokenDialog } from "./bot-token-dialog";

export function DeployButton({ projectId }: { projectId: string | number }) {
  const t = useTranslations("bots");
  const [pending, start] = useTransition();
  const [limitState, setLimitState] = useState<{
    limit: number;
    running: RunningBot[];
  } | null>(null);
  const [botTokenOpen, setBotTokenOpen] = useState(false);

  const onClick = () => {
    start(async () => {
      try {
        const result = await deployReleaseAction(projectId);
        if (result.ok) {
          analytics.botReleased({ projectId });
          toast.success(t("release.deployStarted"));
          return;
        }
        if (result.code === "running_bot_limit" && result.running) {
          setLimitState({ limit: result.limit ?? 10, running: result.running });
          return;
        }
        if (result.code === "bot_token_required") {
          setBotTokenOpen(true);
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

      <BotTokenDialog
        open={botTokenOpen}
        onClose={() => setBotTokenOpen(false)}
        projectId={projectId}
      />
    </>
  );
}
