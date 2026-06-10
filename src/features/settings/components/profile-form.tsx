"use client";
import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/features/settings/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function ProfileForm({
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
}: {
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [state, action, pending] = useActionState<{ ok: boolean; message?: string } | undefined, FormData>(
    updateProfileAction,
    undefined
  );

  useEffect(() => {
    if (state?.ok) toast.success(t("updated"));
    else if (state?.message) toast.error(state.message);
  }, [state, t]);

  return (
    <form action={action} className="grid gap-4 sm:max-w-md">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Ism</Label>
          <Input id="first_name" name="first_name" defaultValue={defaultFirstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Familiya</Label>
          <Input id="last_name" name="last_name" defaultValue={defaultLastName} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" name="email" type="email" defaultValue={defaultEmail} className="pl-9" placeholder="email@example.com" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="phone" name="phone" defaultValue={defaultPhone} disabled className="pl-9" />
        </div>
        <p className="text-xs text-muted-foreground">
          Telefon raqamini o&apos;zgartirish uchun support&apos;ga murojaat qiling
        </p>
      </div>
      <div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
