"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Link } from "@/shared/i18n/routing";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { LaunchStatus, LaunchProject } from "@/features/bots/hooks/use-launch-polling";

// Final "Ishga tushirish" wizard step — shared by the template-create wizard
// and the blank-bot wizard. Polls (via useLaunchPolling) until the bot comes
// online and shows its @username / t.me link, or a graceful fallback state
// when it can't.

export interface BotLaunchLabels {
  launchStartingTitle: string;
  launchStartingText: string;
  launchRunningTitle: string;
  launchOpenBotBtn: string;
  launchOpenProjectBtn: string;
  launchDebugBadge: string;
  launchDebugHint: string;
  launchFailedTitle: string;
  launchFailedText: string;
  launchTimeoutTitle: string;
  launchTimeoutText: string;
  // Only reachable via the blank-bot wizard's "no token/managed-bot yet"
  // fallback — optional so wizards that never produce a "no_connect" state
  // (e.g. template-create) don't need to supply translations for it.
  launchNoConnectTitle?: string;
  launchNoConnectText?: string;
}

interface BotLaunchStepProps {
  state: LaunchStatus;
  project: LaunchProject | null;
  labels: BotLaunchLabels;
}

export function BotLaunchStep({ state, project, labels }: BotLaunchStepProps) {
  // Raqamli id afzal — backend GET /projects/:id path parametrini uuid emas,
  // primary key (id) bilan solishtiradi (see shared/api/services.ts ProjectsAPI.get).
  const projectId = project?.id ?? project?.uuid;
  const projectHref = projectId != null ? `/app/bots/${projectId}` : "/app/bots";
  const isDebug = project?.bot_mode === "debug";

  if (state === "starting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium">{labels.launchStartingTitle}</p>
        <p className="text-xs text-muted-foreground">{labels.launchStartingText}</p>
      </div>
    );
  }

  if (state === "no_connect") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {labels.launchNoConnectTitle ?? labels.launchFailedTitle}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {labels.launchNoConnectText ?? labels.launchFailedText}
        </p>
        <Button asChild className="mt-2 gap-1.5">
          <Link href={projectHref}>
            {labels.launchOpenProjectBtn}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (state === "failed" || state === "timeout") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <AlertTriangle className="h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium">
          {state === "failed" ? labels.launchFailedTitle : labels.launchTimeoutTitle}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {state === "failed" ? labels.launchFailedText : labels.launchTimeoutText}
        </p>
        <Button asChild className="mt-2 gap-1.5">
          <Link href={projectHref}>
            {labels.launchOpenProjectBtn}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // running
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted">
        <CheckCircle2 className="h-6 w-6 text-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold">{labels.launchRunningTitle}</p>
        <p className="text-sm text-muted-foreground">{project?.name}</p>
        {project?.bot_username && (
          <p className="text-sm text-muted-foreground">@{project.bot_username}</p>
        )}
      </div>

      {isDebug && (
        <div className="w-full space-y-1.5 rounded-lg border border-dashed bg-muted/20 p-3">
          <Badge variant="warn" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {labels.launchDebugBadge}
          </Badge>
          <p className="text-xs text-muted-foreground">{labels.launchDebugHint}</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        {project?.bot_link && (
          <Button asChild size="lg" className="flex-1 gap-1.5">
            <a href={project.bot_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {labels.launchOpenBotBtn}
            </a>
          </Button>
        )}
        <Button
          asChild
          variant={project?.bot_link ? "outline" : "default"}
          size="lg"
          className="flex-1 gap-1.5"
        >
          <Link href={projectHref}>{labels.launchOpenProjectBtn}</Link>
        </Button>
      </div>
    </div>
  );
}
