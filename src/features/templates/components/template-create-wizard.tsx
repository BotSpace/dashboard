"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "@/shared/i18n/routing";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Loader2,
  Rocket,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { WizardStepper } from "@/shared/components/common/wizard-stepper";
import { BotConnectTabs, TOKEN_RE } from "@/features/bots/components/bot-connect-tabs";
import { BotLaunchStep } from "@/features/bots/components/bot-launch-step";
import { useLaunchPolling } from "@/features/bots/hooks/use-launch-polling";
import { analytics } from "@/shared/analytics/umami";
import { CredentialSlot } from "./credential-slot";
import {
  createProjectFromTemplateAction,
  getManagedBotConfigAction,
  listManagedBotsAction,
} from "@/features/templates/actions";
import type { TemplateRequirements, ManagedBot, ManagedBotConfig } from "@/shared/types/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WizardLabels {
  stepBot: string;
  stepSettings: string;
  stepConnections: string;
  stepConfirm: string;
  stepLaunch: string;
  next: string;
  back: string;
  create: string;
  botNameLabel: string;
  botNamePlaceholder: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  tokenHelp: string;
  tokenInvalid: string;
  envsTitle: string;
  envPlaceholder: string;
  credsTitle: string;
  credentialSelectPlaceholder: string;
  credentialCreateNew: string;
  credentialCreateTitle: string;
  credentialCreateDesc: string;
  cancel: string;
  confirmTitle: string;
  modulesLabel: string;
  modulesNote: string;
  summaryName: string;
  summaryToken: string;
  summaryEnvs: string;
  summaryCreds: string;
  success: string;
  error: string;
  // Managed bot
  managedTabTelegram: string;
  managedTabManual: string;
  managedBotSelectLabel: string;
  managedBotUsed: string;
  managedBotNoList: string;
  managedNewBotTitle: string;
  managedUsernameLabel: string;
  managedUsernamePlaceholder: string;
  managedUsernameHint: string;
  managedOptionalNameLabel: string;
  managedOpenTelegramBtn: string;
  managedCopyLink: string;
  managedCopyLinkDone: string;
  managedCopyLinkFail: string;
  managedWaiting: string;
  managedConnected: string;
  managedSelectRequired: string;
  // Debug (tokensiz sinov) tab
  debugTabLabel: string;
  debugInfoText: string;
  debugConfirmBadge: string;
  debugConfirmNote: string;
  // Launch step
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
}

interface Props {
  templateId: number | string;
  templateSlug: string;
  defaultName: string;
  requirements: TemplateRequirements;
  labels: WizardLabels;
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

type StepId = "bot" | "settings" | "connections" | "confirm" | "launch";

// Bot ni qanday ulash: Telegram orqali (managed), qo'lda token, yoki
// tokensiz sinov (debug) — BotSpace'ning umumiy test botida ishga tushadi.
type BotMode = "telegram" | "manual" | "debug";

function buildSteps(requirements: TemplateRequirements): StepId[] {
  const steps: StepId[] = ["bot"];
  if ((requirements.envs ?? []).length > 0) steps.push("settings");
  if ((requirements.credentials ?? []).filter((c) => c.required).length > 0)
    steps.push("connections");
  steps.push("confirm");
  // Har doim yakuniy "ishga tushirish" qadami — natija shu yerda ko'rsatiladi.
  steps.push("launch");
  return steps;
}

// ---------------------------------------------------------------------------
// Stepper indicator — generic WizardStepper (shared/components/common),
// just resolve each StepId to its translated label here.
// ---------------------------------------------------------------------------

const STEP_LABEL_KEYS: Record<StepId, keyof WizardLabels> = {
  bot: "stepBot",
  settings: "stepSettings",
  connections: "stepConnections",
  confirm: "stepConfirm",
  launch: "stepLaunch",
};

// ---------------------------------------------------------------------------
// Step 1: Bot name + connection (Telegram orqali / Token qo'lda / Tokensiz
// sinov) — the tabs themselves are the shared BotConnectTabs component.
// ---------------------------------------------------------------------------

interface StepBotProps {
  name: string;
  onNameChange: (v: string) => void;
  token: string;
  onTokenChange: (v: string) => void;
  tokenTouched: boolean;
  onTokenBlur: () => void;
  // managed bot
  managedConfig: ManagedBotConfig | null;
  managedBots: ManagedBot[];
  selectedManagedId: string | null;
  onSelectManaged: (id: string | null) => void;
  onPollManaged: () => Promise<ManagedBot[]>;
  botMode: BotMode;
  onBotModeChange: (m: BotMode) => void;
  labels: WizardLabels;
}

function StepBot({
  name,
  onNameChange,
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
      {/* Bot project name — always shown */}
      <div className="space-y-2">
        <Label htmlFor="wizard-name">
          {labels.botNameLabel}
          <span className="ml-1 text-destructive">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="wizard-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={labels.botNamePlaceholder}
            className="pl-9"
            required
            maxLength={255}
            autoFocus
          />
        </div>
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
// Step 2: Env settings
// ---------------------------------------------------------------------------

interface StepSettingsProps {
  envSpecs: TemplateRequirements["envs"];
  envValues: Record<string, string>;
  onEnvChange: (key: string, val: string) => void;
  labels: WizardLabels;
}

// ENV_KEY → inson o'qiydigan sarlavha: "SUPPORT_USERNAME" → "Support username".
function humanizeEnvKey(key: string): string {
  const words = key.toLowerCase().replace(/_/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}

function StepSettings({
  envSpecs,
  envValues,
  onEnvChange,
  labels,
}: StepSettingsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{labels.envsTitle}</p>
      {envSpecs.map((env) => {
        const title = env.label?.trim() || humanizeEnvKey(env.key);
        const helper = env.description?.trim();
        return (
          <div key={env.key} className="space-y-1.5">
            <Label htmlFor={`env-${env.key}`} className="flex items-center gap-1.5">
              <span>{title}</span>
              {env.required && <span className="text-destructive">*</span>}
            </Label>
            {helper && (
              <p className="text-xs text-muted-foreground">{helper}</p>
            )}
            <Input
              id={`env-${env.key}`}
              value={envValues[env.key] ?? ""}
              onChange={(e) => onEnvChange(env.key, e.target.value)}
              placeholder={labels.envPlaceholder}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Credentials
// ---------------------------------------------------------------------------

interface StepConnectionsProps {
  requiredCreds: TemplateRequirements["credentials"];
  credValues: Record<string, number | string>;
  onCredSelect: (key: string, id: number | string) => void;
  labels: WizardLabels;
}

function StepConnections({
  requiredCreds,
  credValues,
  onCredSelect,
  labels,
}: StepConnectionsProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{labels.credsTitle}</p>
      {requiredCreds.map((cred) => (
        <CredentialSlot
          key={cred.key}
          logicalKey={cred.key}
          typeKey={cred.type}
          label={cred.label?.trim() || humanizeEnvKey(cred.key)}
          description={cred.description}
          selectedId={credValues[cred.key] ?? null}
          onSelect={(id) => onCredSelect(cred.key, id)}
          labels={{
            credentialSelectPlaceholder: labels.credentialSelectPlaceholder,
            credentialCreateNew: labels.credentialCreateNew,
            credentialCreateTitle: labels.credentialCreateTitle,
            credentialCreateDesc: labels.credentialCreateDesc,
            cancel: labels.cancel,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Confirm
// ---------------------------------------------------------------------------

interface StepConfirmProps {
  name: string;
  token: string;
  botMode: BotMode;
  managedBot: ManagedBot | null;
  envValues: Record<string, string>;
  credValues: Record<string, number | string>;
  requirements: TemplateRequirements;
  labels: WizardLabels;
}

function StepConfirm({
  name,
  token,
  botMode,
  managedBot,
  envValues,
  credValues,
  requirements,
  labels,
}: StepConfirmProps) {
  const modules = requirements.modules ?? [];
  const envEntries = Object.entries(envValues);
  const hasCreds = (requirements.credentials ?? []).filter((c) => c.required).length > 0;

  const maskedToken =
    token.length > 12
      ? token.slice(0, 10) + "…" + token.slice(-4)
      : token;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{labels.confirmTitle}</p>

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {/* Name */}
        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="text-sm text-muted-foreground shrink-0">
            {labels.summaryName}
          </span>
          <span className="text-sm font-medium text-right">{name}</span>
        </div>

        {/* Token, managed bot, or debug (tokensiz sinov) */}
        {botMode === "debug" ? (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryToken}
            </span>
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              {labels.debugConfirmBadge}
            </Badge>
          </div>
        ) : managedBot ? (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryToken}
            </span>
            <span className="text-sm font-medium text-right flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              @{managedBot.username}
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground shrink-0">
              {labels.summaryToken}
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

        {/* Envs */}
        {envEntries.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <span className="text-sm text-muted-foreground">
              {labels.summaryEnvs}
            </span>
            <div className="space-y-1">
              {envEntries.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-muted-foreground">
                    {k}
                  </code>
                  <span className="text-xs truncate max-w-[160px]">
                    {v || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creds */}
        {hasCreds && (
          <div className="px-4 py-3 space-y-2">
            <span className="text-sm text-muted-foreground">
              {labels.summaryCreds}
            </span>
            <div className="space-y-1">
              {(requirements.credentials ?? [])
                .filter((c) => c.required)
                .map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      {c.label}
                    </span>
                    {credValues[c.key] != null ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-foreground" />
                    ) : (
                      <span className="text-xs text-destructive">—</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      {modules.length > 0 && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{labels.modulesLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground">{labels.modulesNote}</p>
          <div className="flex flex-wrap gap-1.5">
            {modules.map((m) => (
              <Badge key={m.slug} variant="secondary" className="text-xs">
                {m.slug}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5: Launch — post-create, polls until the bot is running.
// Shared BotLaunchStep component + useLaunchPolling hook (features/bots).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export function TemplateCreateWizard({
  templateId,
  templateSlug,
  defaultName,
  requirements,
  labels,
}: Props) {
  const router = useRouter();

  // Form state
  const [name, setName] = useState(defaultName);
  const [token, setToken] = useState("");
  const [tokenTouched, setTokenTouched] = useState(false);
  const [envValues, setEnvValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((requirements.envs ?? []).map((e) => [e.key, ""]))
  );
  const [credValues, setCredValues] = useState<Record<string, number | string>>(
    {}
  );

  // Managed bot state
  const [managedConfig, setManagedConfig] = useState<ManagedBotConfig | null>(null);
  const [managedBots, setManagedBots] = useState<ManagedBot[]>([]);
  const [selectedManagedId, setSelectedManagedId] = useState<string | null>(null);
  const [botMode, setBotMode] = useState<BotMode>("telegram");

  // Fetch managed bot config + list on mount
  useEffect(() => {
    getManagedBotConfigAction().then((res) => {
      if (res.ok) setManagedConfig(res.data);
    });
    listManagedBotsAction().then((res) => {
      if (res.ok) setManagedBots(res.data);
    });
  }, []);

  // Launch step (post-create) state — shared poller, see features/bots/hooks.
  const [pollTargetId, setPollTargetId] = useState<string | number | null>(null);
  const { launchState, setLaunchState, launchProject, setLaunchProject } = useLaunchPolling(
    pollTargetId,
    { source: "template", template: templateSlug, mode: botMode },
  );

  // Sehrgar ochildi — shablondan bot yaratish voronkasining boshi.
  useEffect(() => {
    analytics.templateCreateClicked({ template: templateSlug });
  }, [templateSlug]);

  // StepBot poll'i chaqiradi: managed botlarni olib state'ni yangilaydi va ro'yxatni qaytaradi
  const pollManagedBots = async (): Promise<ManagedBot[]> => {
    const res = await listManagedBotsAction();
    if (res.ok) {
      setManagedBots(res.data);
      return res.data;
    }
    return managedBots;
  };

  // Stepper state
  const steps = buildSteps(requirements);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  const [pending, startTransition] = useTransition();

  // Qadam nomi bo'yicha yozamiz, indeks bo'yicha emas: qadamlar soni
  // shablonga qarab o'zgaradi (envs/credentials bor-yo'qligiga qarab 3–5 ta),
  // shuning uchun indeks turli shablonlarda turli qadamni bildiradi.
  useEffect(() => {
    analytics.botCreateStep({
      source: "template",
      template: templateSlug,
      step: currentStep,
      mode: botMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, templateSlug]);

  // ---------------------------------------------------------------------------
  // Validation per step
  // ---------------------------------------------------------------------------

  // "Telegram orqali" tabi managedConfig.enabled'dan qat'i nazar ko'rinadi
  // (see bot-connect-tabs.tsx) — shuning uchun bu yerda ham faqat tab
  // tanlanganini tekshiramiz.
  const isManagedMode = botMode === "telegram";
  const isDebugMode = botMode === "debug";

  const botStepValid = isDebugMode
    ? name.trim().length > 0
    : isManagedMode
      ? name.trim().length > 0 && selectedManagedId != null
      : name.trim().length > 0 && TOKEN_RE.test(token.trim());

  const stepValid: Record<StepId, boolean> = {
    bot: botStepValid,
    settings: (requirements.envs ?? [])
      .filter((e) => e.required)
      .every((e) => (envValues[e.key] ?? "").trim().length > 0),
    connections: (requirements.credentials ?? [])
      .filter((c) => c.required)
      .every((c) => credValues[c.key] != null),
    confirm: true,
    launch: true,
  };

  const canNext = stepValid[currentStep];

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  function goNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      // Birinchi qadamdan orqaga = sehrgarni tashlab ketdi.
      analytics.botCreateExit({
        source: "template",
        template: templateSlug,
        step: currentStep,
        mode: botMode,
      });
      router.push(`/app/templates/${templateSlug}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  function handleSubmit() {
    if (!botStepValid) return;

    const envs =
      Object.keys(envValues).length > 0
        ? Object.fromEntries(
            Object.entries(envValues).map(([k, v]) => [k, v.trim()])
          )
        : undefined;

    const credentials =
      Object.keys(credValues).length > 0 ? credValues : undefined;

    startTransition(async () => {
      const body = isDebugMode
        ? {
            template: templateId,
            name: name.trim(),
            mode: "debug" as const,
            ...(envs ? { envs } : {}),
            ...(credentials ? { credentials } : {}),
          }
        : isManagedMode
          ? {
              template: templateId,
              name: name.trim(),
              managed_bot_id: selectedManagedId!,
              ...(envs ? { envs } : {}),
              ...(credentials ? { credentials } : {}),
            }
          : {
              template: templateId,
              name: name.trim(),
              token: token.trim(),
              ...(envs ? { envs } : {}),
              ...(credentials ? { credentials } : {}),
            };

      const res = await createProjectFromTemplateAction(body);

      if (res.ok && res.project) {
        analytics.projectCreated({ source: "template", template: templateSlug, mode: botMode });
        toast.success(labels.success);
        const project = res.project;
        // Raqamli id afzal — barcha status endpointlari pk bilan bir xil ishlaydi.
        const targetId = project.id ?? project.uuid;
        setLaunchProject({
          id: project.id,
          uuid: project.uuid,
          name: project.name,
          bot_mode: project.bot_mode,
          bot_username: project.bot_username,
          bot_link: project.bot_link,
        });
        setLaunchState("starting");
        setStepIndex(steps.length - 1); // "launch" — always the final step
        setPollTargetId(targetId);
      } else {
        analytics.botCreateFailed({
          source: "template",
          template: templateSlug,
          mode: botMode,
          reason: res.message ?? "unknown",
        });
        toast.error(res.message ?? labels.error);
      }
    });
  }

  const selectedManagedBot = managedBots.find((b) => b.id === selectedManagedId) ?? null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-lg">
      <WizardStepper
        steps={steps.map((s) => labels[STEP_LABEL_KEYS[s]])}
        currentIndex={stepIndex}
      />

      {/* Step content */}
      <div className="min-h-[240px] rounded-lg border border-border bg-card p-4">
        {currentStep === "bot" && (
          <StepBot
            name={name}
            onNameChange={setName}
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

        {currentStep === "settings" && (
          <StepSettings
            envSpecs={requirements.envs ?? []}
            envValues={envValues}
            onEnvChange={(key, val) =>
              setEnvValues((prev) => ({ ...prev, [key]: val }))
            }
            labels={labels}
          />
        )}

        {currentStep === "connections" && (
          <StepConnections
            requiredCreds={(requirements.credentials ?? []).filter(
              (c) => c.required
            )}
            credValues={credValues}
            onCredSelect={(key, id) =>
              setCredValues((prev) => ({ ...prev, [key]: id }))
            }
            labels={labels}
          />
        )}

        {currentStep === "confirm" && (
          <StepConfirm
            name={name}
            token={token}
            botMode={botMode}
            managedBot={selectedManagedBot}
            envValues={envValues}
            credValues={credValues}
            requirements={requirements}
            labels={labels}
          />
        )}

        {currentStep === "launch" && (
          <BotLaunchStep state={launchState} project={launchProject} labels={labels} />
        )}
      </div>

      {/* "launch" (yakuniy) qadamda alohida navigatsiya yo'q — StepLaunch
          o'zining "Botni ochish" / "Loyihani ochish" tugmalarini ko'rsatadi. */}
      {currentStep !== "launch" && (
        <>
          <Separator className="my-4" />

          {/* Navigation */}
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
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={pending}
                className="gap-1.5"
              >
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
