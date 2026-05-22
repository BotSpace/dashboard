"use client";
import { useActionState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBotAction } from "@/features/bots/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

type State = { ok: boolean; message?: string } | undefined;

export function CreateBotForm() {
  const t = useTranslations("bots.create");
  const locale = useLocale();
  const [state, action, pending] = useActionState<State, FormData>(createBotAction, undefined);

  useEffect(() => {
    if (state?.ok === false && state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" placeholder={t("namePlaceholder")} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="token">{t("token")}</Label>
        <Input id="token" name="token" placeholder={t("tokenPlaceholder")} />
        <p className="text-xs text-muted-foreground">{t("tokenHint")}</p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
