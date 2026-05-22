"use client";
import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/features/settings/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function PasswordForm() {
  const t = useTranslations("profile");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<{ ok: boolean; message?: string } | undefined, FormData>(
    changePasswordAction,
    undefined
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(t("changePassword"));
      formRef.current?.reset();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="grid gap-4 sm:max-w-md">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("changePassword")}
        </Button>
      </div>
    </form>
  );
}
