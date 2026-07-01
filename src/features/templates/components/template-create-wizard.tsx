"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "@/shared/i18n/routing";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Rocket,
  User,
  Bot,
  Key,
  RefreshCw,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { CredentialSlot } from "./credential-slot";
import {
  createProjectFromTemplateAction,
  getManagedBotConfigAction,
  listManagedBotsAction,
  claimManagedBotAction,
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

type StepId = "bot" | "settings" | "connections" | "confirm";

function buildSteps(requirements: TemplateRequirements): StepId[] {
  const steps: StepId[] = ["bot"];
  if ((requirements.envs ?? []).length > 0) steps.push("settings");
  if ((requirements.credentials ?? []).filter((c) => c.required).length > 0)
    steps.push("connections");
  steps.push("confirm");
  return steps;
}

// ---------------------------------------------------------------------------
// Stepper indicator
// ---------------------------------------------------------------------------

const STEP_LABEL_KEYS: Record<StepId, keyof WizardLabels> = {
  bot: "stepBot",
  settings: "stepSettings",
  connections: "stepConnections",
  confirm: "stepConfirm",
};

interface StepperProps {
  steps: StepId[];
  currentIndex: number;
  labels: WizardLabels;
}

function Stepper({ steps, currentIndex, labels }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Desktop: horizontal */}
      <ol className="hidden sm:flex items-center gap-0">
        {steps.map((step, idx) => {
          const done = idx < currentIndex;
          const active = idx === currentIndex;
          const isLast = idx === steps.length - 1;

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {done ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                </div>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap",
                    active
                      ? "text-foreground"
                      : done
                        ? "text-foreground/70"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {labels[STEP_LABEL_KEYS[step]]}
                </span>
              </div>
              {!isLast && (
                <div
                  className={[
                    "h-0.5 flex-1 mx-2 mb-5 transition-colors",
                    done ? "bg-primary" : "bg-muted-foreground/20",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact dots + step name */}
      <div className="flex sm:hidden items-center gap-3">
        <div className="flex gap-1.5">
          {steps.map((step, idx) => (
            <div
              key={step}
              className={[
                "h-1.5 rounded-full transition-all",
                idx < currentIndex
                  ? "w-4 bg-primary"
                  : idx === currentIndex
                    ? "w-6 bg-primary"
                    : "w-4 bg-muted-foreground/30",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {labels[STEP_LABEL_KEYS[steps[currentIndex]]]}
        </span>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Bot name + token (with optional managed-bot flow)
// ---------------------------------------------------------------------------

const TOKEN_RE = /^\d+:.+/;
// Telegram username rules: lowercase letters/numbers/underscore, ends with "bot"
const USERNAME_RE = /^[a-z][a-z0-9_]{3,}bot$/i;

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
  selectedManagedId: number | null;
  onSelectManaged: (id: number | null) => void;
  onPollManaged: () => Promise<ManagedBot[]>;
  botMode: "telegram" | "manual";
  onBotModeChange: (m: "telegram" | "manual") => void;
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
  const tokenInvalid =
    tokenTouched && token.trim() !== "" && !TOKEN_RE.test(token.trim());

  // New-bot creation form (inside telegram tab)
  const [newUsername, setNewUsername] = useState("");
  const [newBotName, setNewBotName] = useState("");
  const [polling, setPolling] = useState(false);
  const [deepLinkOpened, setDeepLinkOpened] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);
  const knownIds = useRef<Set<number>>(new Set(managedBots.map((b) => b.id)));

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setPolling(false);
  }

  // Ro'yxatdan bot tanlash (yoki poll topganda) — spinner'ni ham to'xtatadi
  function pickBot(bot: ManagedBot) {
    stopPolling();
    onSelectManaged(bot.id);
    if (!name.trim()) onNameChange(bot.name || bot.username);
  }

  function buildDeepLink() {
    if (!managedConfig?.deep_link_template) return null;
    const uname = newUsername.trim();
    const bname = newBotName.trim() || uname;
    return managedConfig.deep_link_template
      .replace("{username}", uname)
      .replace("{name}", bname);
  }

  async function handleCopyLink() {
    const link = buildDeepLink();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(labels.managedCopyLinkDone);
    } catch {
      toast.error(labels.managedCopyLinkFail);
    }
  }

  function handleOpenTelegram() {
    const link = buildDeepLink();
    if (!link) return;
    // Oynani AVVAL ochamiz (user-gesture popup-blocker'ga tushmasin), keyin claim.
    window.open(link, "_blank");
    // Botni SHU (login qilgan) foydalanuvchiga bog'lash uchun claim (fire-and-forget) —
    // webhook Telegram-yaratuvchi emas, claim bo'yicha egani aniqlaydi.
    void claimManagedBotAction(newUsername.trim());
    setDeepLinkOpened(true);
    // Snapshot mavjud bot id'lari — shundan keyin paydo bo'lgani "yangi" hisoblanadi
    knownIds.current = new Set(managedBots.map((b) => b.id));
    pollCount.current = 0;
    setPolling(true);
    // Har 3s'da REAL fetch qilib yangi botni qidiradi (max 2 daqiqa)
    pollRef.current = setInterval(async () => {
      pollCount.current += 1;
      try {
        const bots = await onPollManaged();
        const newBot = bots.find((b) => !knownIds.current.has(b.id));
        if (newBot) {
          stopPolling();
          onSelectManaged(newBot.id);
          if (!name.trim()) onNameChange(newBot.name || newBot.username);
          toast.success(labels.managedConnected);
          return;
        }
      } catch {
        // e'tiborsiz — keyingi tick qayta urinadi
      }
      if (pollCount.current >= 40) stopPolling();
    }, 3000);
  }

  const usernameInvalid = newUsername.trim().length > 0 && !USERNAME_RE.test(newUsername.trim());
  const canOpenTelegram =
    !!managedConfig?.deep_link_template &&
    newUsername.trim().length > 0 &&
    USERNAME_RE.test(newUsername.trim());

  // Managed bot mode (enabled:true) → show tabs
  const managedEnabled = managedConfig?.enabled === true;

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

      {managedEnabled ? (
        <Tabs value={botMode} onValueChange={(v) => onBotModeChange(v as "telegram" | "manual")}>
          <TabsList className="w-full">
            <TabsTrigger value="telegram" className="flex-1 gap-1.5">
              <Bot className="h-4 w-4" />
              {labels.managedTabTelegram}
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 gap-1.5">
              <Key className="h-4 w-4" />
              {labels.managedTabManual}
            </TabsTrigger>
          </TabsList>

          {/* TELEGRAM tab */}
          <TabsContent value="telegram" className="mt-4 space-y-4">
            {/* Existing bots list */}
            {managedBots.length > 0 && (
              <div className="space-y-2">
                <Label>{labels.managedBotSelectLabel}</Label>
                <div className="space-y-2">
                  {managedBots.map((bot) => (
                    <label
                      key={bot.id}
                      htmlFor={`mbot-${bot.id}`}
                      className={[
                        "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                        selectedManagedId === bot.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50",
                        bot.used ? "opacity-60" : "",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        id={`mbot-${bot.id}`}
                        name="managed-bot"
                        value={String(bot.id)}
                        checked={selectedManagedId === bot.id}
                        onChange={() => pickBot(bot)}
                        className="accent-primary h-4 w-4 shrink-0"
                      />
                      <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">@{bot.username}</p>
                        {bot.name && (
                          <p className="text-xs text-muted-foreground truncate">{bot.name}</p>
                        )}
                      </div>
                      {bot.used && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {labels.managedBotUsed}
                        </Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {managedBots.length === 0 && !deepLinkOpened && (
              <p className="text-sm text-muted-foreground">{labels.managedBotNoList}</p>
            )}

            {/* Create new bot section */}
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                {labels.managedNewBotTitle}
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="managed-username">
                  {labels.managedUsernameLabel}
                  <span className="ml-1 text-destructive">*</span>
                </Label>
                <Input
                  id="managed-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                  placeholder={labels.managedUsernamePlaceholder}
                  spellCheck={false}
                  autoComplete="off"
                  className={usernameInvalid ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">{labels.managedUsernameHint}</p>
                {usernameInvalid && (
                  <p className="text-xs text-destructive">{labels.managedUsernameHint}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="managed-botname">{labels.managedOptionalNameLabel}</Label>
                <Input
                  id="managed-botname"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder={newUsername ? `${newUsername} Bot` : "My Bot"}
                  maxLength={64}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canOpenTelegram || polling}
                  onClick={handleOpenTelegram}
                  className="flex-1 gap-2"
                >
                  {polling ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {labels.managedWaiting}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      {labels.managedOpenTelegramBtn}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!canOpenTelegram}
                  onClick={handleCopyLink}
                  title={labels.managedCopyLink}
                  aria-label={labels.managedCopyLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* MANUAL tab */}
          <TabsContent value="manual" className="mt-4">
            <ManualTokenInput
              token={token}
              onTokenChange={onTokenChange}
              tokenTouched={tokenTouched}
              onTokenBlur={onTokenBlur}
              tokenInvalid={tokenInvalid}
              labels={labels}
            />
          </TabsContent>
        </Tabs>
      ) : (
        /* Managed disabled → only manual */
        <ManualTokenInput
          token={token}
          onTokenChange={onTokenChange}
          tokenTouched={tokenTouched}
          onTokenBlur={onTokenBlur}
          tokenInvalid={tokenInvalid}
          labels={labels}
        />
      )}
    </div>
  );
}

function ManualTokenInput({
  token,
  onTokenChange,
  tokenTouched,
  onTokenBlur,
  tokenInvalid,
  labels,
}: {
  token: string;
  onTokenChange: (v: string) => void;
  tokenTouched: boolean;
  onTokenBlur: () => void;
  tokenInvalid: boolean;
  labels: WizardLabels;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="wizard-token">
        {labels.tokenLabel}
        <span className="ml-1 text-destructive">*</span>
      </Label>
      <Input
        id="wizard-token"
        value={token}
        onChange={(e) => onTokenChange(e.target.value)}
        onBlur={onTokenBlur}
        placeholder={labels.tokenPlaceholder}
        spellCheck={false}
        autoComplete="off"
        className={
          tokenInvalid
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }
      />
      {tokenInvalid && (
        <p className="text-xs text-destructive">{labels.tokenInvalid}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {labels.tokenHelp}{" "}
        <a
          href="https://t.me/BotFather"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 underline hover:text-foreground"
        >
          @BotFather <ExternalLink className="h-3 w-3" />
        </a>
      </p>
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
          label={cred.label}
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
  managedBot: ManagedBot | null;
  envValues: Record<string, string>;
  credValues: Record<string, number | string>;
  requirements: TemplateRequirements;
  labels: WizardLabels;
}

function StepConfirm({
  name,
  token,
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
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{labels.confirmTitle}</p>

      <div className="rounded-xl border bg-muted/30 divide-y">
        {/* Name */}
        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="text-sm text-muted-foreground shrink-0">
            {labels.summaryName}
          </span>
          <span className="text-sm font-medium text-right">{name}</span>
        </div>

        {/* Token or managed bot */}
        {managedBot ? (
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
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
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
        <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
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
  const [selectedManagedId, setSelectedManagedId] = useState<number | null>(null);
  const [botMode, setBotMode] = useState<"telegram" | "manual">("telegram");

  // Fetch managed bot config + list on mount
  useEffect(() => {
    getManagedBotConfigAction().then((res) => {
      if (res.ok) setManagedConfig(res.data);
    });
    listManagedBotsAction().then((res) => {
      if (res.ok) setManagedBots(res.data);
    });
  }, []);

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

  // ---------------------------------------------------------------------------
  // Validation per step
  // ---------------------------------------------------------------------------

  const isManagedMode = managedConfig?.enabled && botMode === "telegram";

  const botStepValid = isManagedMode
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
      const body = isManagedMode
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

      if (res.ok && (res.project_id || res.project_uuid)) {
        toast.success(labels.success);
        const botId = res.project_uuid ?? res.project_id;
        router.push(`/app/bots/${botId}`);
        router.refresh();
      } else {
        toast.error(res.message ?? labels.error);
      }
    });
  }

  const isLastStep = stepIndex === steps.length - 1;

  const selectedManagedBot = managedBots.find((b) => b.id === selectedManagedId) ?? null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-lg w-full">
      <Stepper steps={steps} currentIndex={stepIndex} labels={labels} />

      {/* Step content */}
      <div className="min-h-[240px]">
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
            managedBot={selectedManagedBot}
            envValues={envValues}
            credValues={credValues}
            requirements={requirements}
            labels={labels}
          />
        )}
      </div>

      <Separator className="my-6" />

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

        {isLastStep ? (
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
    </div>
  );
}
