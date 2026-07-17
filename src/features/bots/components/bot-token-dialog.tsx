"use client";
import { useEffect, useState, useTransition } from "react";
import { KeyRound, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  BotConnectTabs,
  TOKEN_RE,
  type BotConnectLabels,
  type BotMode,
} from "@/features/bots/components/bot-connect-tabs";
import {
  setBotTokenAction,
  deployReleaseAction,
  getManagedBotConfigAction,
  listManagedBotsAction,
} from "@/features/bots/actions";
import { analytics } from "@/shared/analytics/umami";
import type { ManagedBot, ManagedBotConfig } from "@/shared/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string | number;
}

// ---------------------------------------------------------------------------
// "Telegram bot tokeni" dialogi — bot allaqachon yaratilgan (debug/tokensiz
// yoki qayta ulash) holatida chaqiriladi: DeployButton token yo'qligi bilan
// deploy fail bo'lganda, va BotInfoCard "Botni o'zgartirish" tugmasi orqali.
// Ichida create-bot-wizard bilan bir xil shared BotConnectTabs — faqat
// Telegram orqali (managed bot) / Token qo'lda tablari (showDebugTab=false:
// allaqachon ishlayotgan botni qayta "tokensiz sinov"ga o'tkazish ma'nosiz).
// ---------------------------------------------------------------------------

export function BotTokenDialog({ open, onClose, projectId }: Props) {
  const t = useTranslations("bots.botToken");
  const w = useTranslations("bots.wizard");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [managedConfig, setManagedConfig] = useState<ManagedBotConfig | null>(null);
  const [managedBots, setManagedBots] = useState<ManagedBot[]>([]);
  const [selectedManagedId, setSelectedManagedId] = useState<string | null>(null);
  const [botMode, setBotMode] = useState<BotMode>("manual");

  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [tokenTouched, setTokenTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Dialog ochilganda holatni tozalab, managed-bot config/ro'yxatni yuklaymiz.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setToken("");
    setTokenTouched(false);
    setSelectedManagedId(null);
    setName("");

    Promise.all([getManagedBotConfigAction(), listManagedBotsAction()]).then(
      ([cfgRes, botsRes]) => {
        if (cancelled) return;
        if (cfgRes.ok) {
          setManagedConfig(cfgRes.data);
          setBotMode(cfgRes.data.enabled ? "telegram" : "manual");
        } else {
          setManagedConfig(null);
          setBotMode("manual");
        }
        if (botsRes.ok) setManagedBots(botsRes.data);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function pollManagedBots(): Promise<ManagedBot[]> {
    const res = await listManagedBotsAction();
    if (res.ok) {
      setManagedBots(res.data);
      return res.data;
    }
    return managedBots;
  }

  function handleSave() {
    setError(null);

    if (botMode === "telegram") {
      if (selectedManagedId == null) {
        setError(t("selectBotRequired"));
        return;
      }
    } else {
      const trimmed = token.trim();
      if (!trimmed) {
        setError(t("required"));
        return;
      }
      if (!TOKEN_RE.test(trimmed)) {
        setError(w("tokenInvalid"));
        return;
      }
    }

    start(async () => {
      const body =
        botMode === "telegram"
          ? { managed_bot_id: selectedManagedId! }
          : { token: token.trim() };

      const setResult = await setBotTokenAction(projectId, body);
      if (!setResult.ok) {
        analytics.botTokenSetFailed({ mode: botMode, reason: setResult.message ?? "unknown" });
        setError(setResult.message);
        return;
      }
      analytics.botTokenSet({ mode: botMode });

      // Token/managed bot saqlandi — deployni avtomatik qayta urinamiz.
      const deployResult = await deployReleaseAction(projectId);
      if (!deployResult.ok) {
        toast.error(deployResult.message ?? t("deployError"));
        router.refresh();
        onClose();
        return;
      }

      toast.success(t("deployStarted"));
      router.refresh();
      onClose();
    });
  }

  function handleOpenChange(v: boolean) {
    if (!v && !pending) {
      onClose();
    }
  }

  const labels: BotConnectLabels = {
    managedTabTelegram: w("managedTabTelegram"),
    managedTabManual: w("managedTabManual"),
    managedBotSelectLabel: w("managedBotSelectLabel"),
    managedBotUsed: w("managedBotUsed"),
    managedBotNoList: w("managedBotNoList"),
    managedNewBotTitle: w("managedNewBotTitle"),
    managedUsernameLabel: w("managedUsernameLabel"),
    managedUsernamePlaceholder: w("managedUsernamePlaceholder"),
    managedUsernameHint: w("managedUsernameHint"),
    managedOptionalNameLabel: w("managedOptionalNameLabel"),
    managedOpenTelegramBtn: w("managedOpenTelegramBtn"),
    managedCopyLink: w("managedCopyLink"),
    managedCopyLinkDone: w("managedCopyLinkDone"),
    managedCopyLinkFail: w("managedCopyLinkFail"),
    managedWaiting: w("managedWaiting"),
    managedConnected: w("managedConnected"),
    debugTabLabel: w("debugTabLabel"),
    debugInfoText: w("debugInfoText"),
    tokenLabel: w("tokenLabel"),
    tokenPlaceholder: w("tokenPlaceholder"),
    tokenHelp: w("tokenHelp"),
    tokenInvalid: w("tokenInvalid"),
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-500" />
            <DialogTitle>{t("title")}</DialogTitle>
          </div>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("loading")}
          </div>
        ) : (
          <div className="py-1 flex-1 overflow-y-auto -mx-1 px-1">
            <BotConnectTabs
              name={name}
              onNameChange={setName}
              token={token}
              onTokenChange={(v) => {
                setToken(v);
                if (error) setError(null);
              }}
              tokenTouched={tokenTouched}
              onTokenBlur={() => setTokenTouched(true)}
              managedConfig={managedConfig}
              managedBots={managedBots}
              selectedManagedId={selectedManagedId}
              onSelectManaged={(id) => {
                setSelectedManagedId(id);
                if (error) setError(null);
              }}
              onPollManaged={pollManagedBots}
              botMode={botMode}
              onBotModeChange={(m) => {
                setBotMode(m);
                setError(null);
              }}
              labels={labels}
              showDebugTab={false}
            />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={pending || loading} className="gap-2">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
