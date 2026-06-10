"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/features/settings/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const MIN = 8;

function PasswordInput({
  id,
  name,
  value,
  onChange,
  ...rest
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-10"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Yashirish" : "Ko'rsatish"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PasswordForm() {
  const t = useTranslations("profile");
  const formRef = useRef<HTMLFormElement>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, action, pending] = useActionState<{ ok: boolean; message?: string } | undefined, FormData>(
    changePasswordAction,
    undefined
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(t("changePassword"));
      formRef.current?.reset();
      setCurrent("");
      setNext("");
      setConfirm("");
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, t]);

  const tooShort = next.length > 0 && next.length < MIN;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit =
    !pending && current.length > 0 && next.length >= MIN && next === confirm;

  return (
    <form ref={formRef} action={action} className="grid gap-4 sm:max-w-md">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          value={current}
          onChange={setCurrent}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          value={next}
          onChange={setNext}
          required
          minLength={MIN}
          autoComplete="new-password"
          aria-invalid={tooShort}
        />
        <p className={`text-xs ${tooShort ? "text-destructive" : "text-muted-foreground"}`}>
          Kamida {MIN} ta belgi
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Yangi parolni takrorlang</Label>
        <PasswordInput
          id="confirmPassword"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          aria-invalid={mismatch}
        />
        {mismatch && <p className="text-xs text-destructive">Parollar mos kelmadi</p>}
      </div>

      <div>
        <Button type="submit" disabled={!canSubmit}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("changePassword")}
        </Button>
      </div>
    </form>
  );
}
