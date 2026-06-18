"use client";
import { useState, useTransition } from "react";
import { KeyRound, Loader2, Save } from "lucide-react";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { setBotTokenAction, deployReleaseAction } from "@/features/bots/actions";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string | number;
}

export function BotTokenDialog({ open, onClose, projectId }: Props) {
  const t = useTranslations("bots.botToken");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSave() {
    const trimmed = token.trim();
    if (!trimmed) {
      setError(t("required"));
      return;
    }
    setError(null);

    start(async () => {
      const setResult = await setBotTokenAction(projectId, trimmed);
      if (!setResult.ok) {
        setError(setResult.message);
        return;
      }

      // Token saved — retry the deploy automatically
      const deployResult = await deployReleaseAction(projectId);
      if (!deployResult.ok) {
        toast.error(deployResult.message ?? t("deployError"));
        onClose();
        return;
      }

      toast.success(t("deployStarted"));
      onClose();
    });
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setToken("");
      setError(null);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-500" />
            <DialogTitle>{t("title")}</DialogTitle>
          </div>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="bot-token-input">{t("label")}</Label>
            <Input
              id="bot-token-input"
              type="password"
              placeholder={t("placeholder")}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (error) setError(null);
              }}
              disabled={pending}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-bwignore
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("hint")}</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={pending || !token.trim()} className="gap-2">
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
