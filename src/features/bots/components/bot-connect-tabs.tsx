"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Copy, ExternalLink, Key, Plus, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { claimManagedBotAction } from "@/features/bots/actions";
import type { ManagedBot, ManagedBotConfig } from "@/shared/types/api";

// ---------------------------------------------------------------------------
// Shared "how is this bot connected?" tabs — Telegram orqali (managed bot,
// deep-link + polling + copy link), Token qo'lda (manual), Tokensiz sinov
// (debug). Extracted from the template-create wizard so the plain/blank bot
// wizard (src/app/[locale]/(app)/app/bots/new) can reuse it identically
// instead of re-implementing ~250 lines of managed-bot UX.
// ---------------------------------------------------------------------------

export const TOKEN_RE = /^\d+:.+/;
// Telegram username rules: lowercase letters/numbers/underscore. "bot" suffiksni
// foydalanuvchidan talab qilmaymiz — withBotSuffix avtomatik qo'shadi.
export const USERNAME_RE = /^[a-z][a-z0-9_]+$/;

export function withBotSuffix(v: string) {
  const u = v.trim().toLowerCase();
  return u.endsWith("bot") ? u : `${u}bot`;
}

export type BotMode = "telegram" | "manual" | "debug";

export interface BotConnectLabels {
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
  debugTabLabel: string;
  debugInfoText: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  tokenHelp: string;
  tokenInvalid: string;
}

export interface BotConnectTabsProps {
  /** Bot/project name — auto-filled once a managed bot is picked, if still empty. */
  name: string;
  onNameChange: (v: string) => void;
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
  labels: BotConnectLabels;
  /** "Tokensiz sinov" (debug) tabini ko'rsatish. Default true. Bot allaqachon
   * ishlab turgan joyda (masalan bot detail sahifasidagi "Botni o'zgartirish"
   * dialogi) debug rejimga qaytarish ma'nosiz — false berilsa tab butunlay
   * yashiriladi va botMode "debug" bo'la olmaydi. */
  showDebugTab?: boolean;
}

export function BotConnectTabs({
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
  showDebugTab = true,
}: BotConnectTabsProps) {
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
    const uname = withBotSuffix(newUsername);
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
    void claimManagedBotAction(withBotSuffix(newUsername));
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

  const usernameBase = newUsername.trim().toLowerCase();
  const effectiveUsername = usernameBase ? withBotSuffix(usernameBase) : "";
  const usernameValid =
    USERNAME_RE.test(usernameBase) && effectiveUsername.length >= 5;
  const usernameInvalid = usernameBase.length > 0 && !usernameValid;
  const canOpenTelegram = !!managedConfig?.deep_link_template && usernameValid;

  // Managed bot mode (enabled:true) → show tabs
  const managedEnabled = managedConfig?.enabled === true;

  return (
    <Tabs value={botMode} onValueChange={(v) => onBotModeChange(v as BotMode)}>
      <TabsList className="w-full">
        {managedEnabled && (
          <TabsTrigger value="telegram" className="flex-1 gap-1.5">
            <Bot className="h-4 w-4" />
            {labels.managedTabTelegram}
          </TabsTrigger>
        )}
        <TabsTrigger value="manual" className="flex-1 gap-1.5">
          <Key className="h-4 w-4" />
          {labels.managedTabManual}
        </TabsTrigger>
        {showDebugTab && (
          <TabsTrigger value="debug" className="flex-1 gap-1.5">
            <Sparkles className="h-4 w-4" />
            {labels.debugTabLabel}
          </TabsTrigger>
        )}
      </TabsList>

      {managedEnabled && (
        /* TELEGRAM tab */
        <TabsContent value="telegram" className="mt-4 space-y-4">
          {/* Existing bots list */}
          {managedBots.length > 0 && (
            <div className="space-y-2">
              <Label>{labels.managedBotSelectLabel}</Label>
              {/* Ko'p bot bo'lsa oyna to'lib ketmasin — ro'yxat scroll bo'ladi */}
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
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
              {usernameValid && (
                <p className="text-xs text-primary">@{effectiveUsername}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="managed-botname">{labels.managedOptionalNameLabel}</Label>
              <Input
                id="managed-botname"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                placeholder={effectiveUsername ? `${effectiveUsername} Bot` : "My Bot"}
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
      )}

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

      {/* DEBUG (tokensiz sinov) tab */}
      {showDebugTab && (
        <TabsContent value="debug" className="mt-4">
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 flex gap-3">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{labels.debugInfoText}</p>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}

export function ManualTokenInput({
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
  labels: Pick<BotConnectLabels, "tokenLabel" | "tokenPlaceholder" | "tokenHelp" | "tokenInvalid">;
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
