"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "@/shared/i18n/routing";
import { ArrowLeft, ArrowRight, Bot, Loader2, Rocket, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { WizardStepper } from "@/shared/components/common/wizard-stepper";
import {
  BotConnectTabs,
  TOKEN_RE,
  type BotConnectLabels,
  type BotMode,
} from "@/features/bots/components/bot-connect-tabs";
import { BotLaunchStep, type BotLaunchLabels } from "@/features/bots/components/bot-launch-step";
import { useLaunchPolling } from "@/features/bots/hooks/use-launch-polling";
import {
  createBlankBotAction,
  getManagedBotConfigAction,
  listManagedBotsAction,
} from "@/features/bots/actions";
import type { ManagedBot, ManagedBotConfig } from "@/shared/types/api";

// ---------------------------------------------------------------------------
// Blank-bot wizard — src/app/[locale]/(app)/app/bots/new. Same step-by-step
// UX as the template-create wizard (features/templates/components/
// template-create-wizard.tsx), minus the envs/credentials steps a blank
// project never has: Bot → Tasdiqlash → Ishga tushirish. Reuses
// WizardStepper, BotConnectTabs (Telegram orqali / Token qo'lda / Tokensiz
// sinov) and BotLaunchStep/useLaunchPolling verbatim.
// ---------------------------------------------------------------------------

type StepId = "bot" | "confirm" | "launch";
const STEPS: StepId[] = ["bot", "confirm", "launch"];

export interface CreateBotWizardLabels extends BotConnectLabels, BotLaunchLabels {
  stepBot: string;
  stepConfirm: string;
  stepLaunch: string;
  next: string;
  back: string;
  create: string;
  nameLabel: string;
  namePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  confirmTitle: string;
  summaryName: string;
  summaryDescription: string;
  summaryConnection: string;
  debugConfirmBadge: string;
  debugConfirmNote: string;
  success: string;
  error: string;
}

interface Props {
  labels: CreateBotWizardLabels;
}

const STEP_LABEL_KEYS: Record<StepId, "stepBot" | "stepConfirm" | "stepLaunch"> = {
  bot: "stepBot",
  confirm: "stepConfirm",
  launch: "stepLaunch",
};

// ---------------------------------------------------------------------------
// Step 1: name + description + connection tabs
// ---------------------------------------------------------------------------

interface StepBotProps {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  token: string;
  onTokenChange: (v: string) => void;
  tokenTouched: boolean;
  onTokenBlur: () => void;
  managedConfig: ManagedBotConfig | null;
  managedBots: ManagedBot[];
  selectedManagedId: number | null;
  onSelectManaged: (id: number | null) => void;
  onPollManaged: () => Promise<ManagedBot[]>;
  botMode: BotMode;
  onBotModeChange: (m: BotMode) => void;
  labels: CreateBotWizardLabels;
}

function StepBot({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  token,
  onTokenChange,
  tokenTouched,
  onTokenBlur,
  managedConfig,
  managedBots,
  selectedManagedId,
  onSelectManaged,
  onPollManaged,
  botMode,
  onBotModeChange,
  labels,
}: StepBotProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="wizard-bot-name">
          {labels.nameLabel}
          <span className="ml-1 text-destructive">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="wizard-bot-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={labels.namePlaceholder}
            className="pl-9"
            required
            maxLength={255}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wizard-bot-description">{labels.descriptionLabel}</Label>
        <Textarea
          id="wizard-bot-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={labels.descriptionPlaceholder}
          rows={2}
        />
      </div>

      <BotConnectTabs
        name={name}
        onNameChange={onNameChange}
        token={token}
        onTokenChange={onTokenChange}
        tokenTouched={tokenTouched}
        onTokenBlur={onTokenBlur}
        managedConfig={managedConfig}
        managedBots={managedBots}
        selectedManagedId={selectedManagedId}
        onSelectManaged={onSelectManaged}
        onPollManaged={onPollManaged}
        botMode={botMode}
        onBotModeChange={onBotModeChange}
        labels={labels}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Confirm
// ---------------------------------------------------------------------------

interface StepConfirmProps {
  name: string;
  description: string;
  token: string;
  botMode: BotMode;
  managedBot: ManagedBot | null;
  labels: CreateBotWizardLabels;
}

function StepConfirm({ name, description, token, botMode, managedBot, labels }: StepConfirmProps) {
  const maskedToken = token.length > 12 ? token.slice(0, 10) + "…" + token.slice(-4) : token;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{labels.confirmTitle}</p>

      <div className="rounded-xl border bg-muted/30 divide-y">
        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="text-sm text-muted-foreground shrink-0">{labels.summaryName}</span>
          <span className="text-sm font-medium text-right">{name}</span>
        </div>

        {description.trim() && (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryDescription}
            </span>
            <span className="text-sm text-right max-w-[220px]">{description}</span>
          </div>
        )}

        {botMode === "debug" ? (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryConnection}
            </span>
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              {labels.debugConfirmBadge}
            </Badge>
          </div>
        ) : managedBot ? (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryConnection}
            </span>
            <span className="text-sm font-medium text-right flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              @{managedBot.username}
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryConnection}
            </span>
            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-right">
              {maskedToken}
            </code>
          </div>
        )}

        {botMode === "debug" && (
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{labels.debugConfirmNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export function CreateBotWizard({ labels }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [token, setToken] = useState("");
  const [tokenTouched, setTokenTouched] = useState(false);

  const [managedConfig, setManagedConfig] = useState<ManagedBotConfig | null>(null);
  const [managedBots, setManagedBots] = useState<ManagedBot[]>([]);
  const [selectedManagedId, setSelectedManagedId] = useState<number | null>(null);
  const [botMode, setBotMode] = useState<BotMode>("telegram");

  useEffect(() => {
    getManagedBotConfigAction().then((res) => {
      if (res.ok) setManagedConfig(res.data);
    });
    listManagedBotsAction().then((res) => {
      if (res.ok) setManagedBots(res.data);
    });
  }, []);

  // Agar "Telegram orqali" o'chirilgan bo'lsa, mavjud bo'lmagan tabga
  // tushib qolmaslik uchun "manual"ga o'tkazamiz.
  useEffect(() => {
    if (managedConfig && !managedConfig.enabled && botMode === "telegram") {
      setBotMode("manual");
    }
  }, [managedConfig, botMode]);

  const [pollTargetId, setPollTargetId] = useState<string | number | null>(null);
  const { launchState, setLaunchState, launchProject, setLaunchProject } =
    useLaunchPolling(pollTargetId);

  const pollManagedBots = async (): Promise<ManagedBot[]> => {
    const res = await listManagedBotsAction();
    if (res.ok) {
      setManagedBots(res.data);
      return res.data;
    }
    return managedBots;
  };

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex];
  const [pending, startTransition] = useTransition();

  const isManagedMode = managedConfig?.enabled && botMode === "telegram";
  const isDebugMode = botMode === "debug";

  const botStepValid = isDebugMode
    ? name.trim().length > 0
    : isManagedMode
      ? name.trim().length > 0 && selectedManagedId != null
      : name.trim().length > 0 && TOKEN_RE.test(token.trim());

  const canNext = currentStep === "bot" ? botStepValid : true;

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      router.push("/app/bots");
    }
  }

  function handleSubmit() {
    if (!botStepValid) return;

    startTransition(async () => {
      const res = await createBlankBotAction({
        name: name.trim(),
        description: description.trim() || undefined,
        ...(isDebugMode
          ? { mode: "debug" as const }
          : isManagedMode
            ? { managed_bot_id: selectedManagedId! }
            : { token: token.trim() }),
      });

      if (res.ok) {
        toast.success(labels.success);
        const project = res.project;
        const targetId = project.uuid ?? project.id;
        setLaunchProject({
          id: project.id,
          uuid: project.uuid,
          name: project.name,
          bot_mode: project.bot_mode,
          bot_username: project.bot_username,
          bot_link: project.bot_link,
        });
        setStepIndex(STEPS.length - 1); // "launch" — always the final step
        if (res.noConnect) {
          // No token/managed-bot ended up attached (see createBlankBotAction's
          // gap note) — polling would just spin to a timeout, so skip it.
          setLaunchState("no_connect");
        } else {
          setLaunchState("starting");
          setPollTargetId(targetId);
        }
      } else {
        toast.error(res.message ?? labels.error);
      }
    });
  }

  const selectedManagedBot = managedBots.find((b) => b.id === selectedManagedId) ?? null;

  return (
    <div className="mx-auto max-w-lg w-full">
      <WizardStepper
        steps={STEPS.map((s) => labels[STEP_LABEL_KEYS[s]])}
        currentIndex={stepIndex}
      />

      <div className="min-h-[240px]">
        {currentStep === "bot" && (
          <StepBot
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
            token={token}
            onTokenChange={setToken}
            tokenTouched={tokenTouched}
            onTokenBlur={() => setTokenTouched(true)}
            managedConfig={managedConfig}
            managedBots={managedBots}
            selectedManagedId={selectedManagedId}
            onSelectManaged={setSelectedManagedId}
            onPollManaged={pollManagedBots}
            botMode={botMode}
            onBotModeChange={setBotMode}
            labels={labels}
          />
        )}

        {currentStep === "confirm" && (
          <StepConfirm
            name={name}
            description={description}
            token={token}
            botMode={botMode}
            managedBot={selectedManagedBot}
            labels={labels}
          />
        )}

        {currentStep === "launch" && (
          <BotLaunchStep state={launchState} project={launchProject} labels={labels} />
        )}
      </div>

      {currentStep !== "launch" && (
        <>
          <Separator className="my-6" />
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={pending}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              {labels.back}
            </Button>

            {currentStep === "confirm" ? (
              <Button type="button" onClick={handleSubmit} disabled={pending} className="gap-1.5">
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {labels.create}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                disabled={!canNext || pending}
                className="gap-1.5"
              >
                {labels.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
