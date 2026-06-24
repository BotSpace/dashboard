"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/features/settings/actions";
import { Button } from "@/shared/components/ui/button";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px 11px 40px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "var(--foreground)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "var(--muted-foreground)",
  marginBottom: 7,
};

const MIN = 8;

function PasswordInput({
  id,
  name,
  value,
  onChange,
  invalid,
  ...rest
}: {
  id: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = invalid
    ? "rgba(239,68,68,0.6)"
    : focused
    ? "rgba(59,130,246,0.5)"
    : "rgba(255,255,255,0.1)";

  return (
    <div style={{ position: "relative" }}>
      <Lock
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 16,
          height: 16,
          color: "var(--muted-foreground)",
          pointerEvents: "none",
        }}
      />
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle, paddingRight: 40, borderColor }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted-foreground)",
          display: "flex",
          padding: 0,
        }}
        aria-label={show ? "Yashirish" : "Ko'rsatish"}
        tabIndex={-1}
      >
        {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
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
  const canSubmit = !pending && current.length > 0 && next.length >= MIN && next === confirm;

  return (
    <form ref={formRef} action={action} style={{ maxWidth: 480 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label htmlFor="currentPassword" style={labelStyle}>
            {t("currentPassword")}
          </label>
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            value={current}
            onChange={setCurrent}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label htmlFor="newPassword" style={labelStyle}>
            {t("newPassword")}
          </label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={next}
            onChange={setNext}
            required
            minLength={MIN}
            autoComplete="new-password"
            invalid={tooShort}
          />
          <p
            style={{
              fontSize: 11.5,
              color: tooShort ? "var(--destructive)" : "var(--muted-foreground)",
              marginTop: 5,
            }}
          >
            Kamida {MIN} ta belgi
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" style={labelStyle}>
            Yangi parolni takrorlang
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            invalid={mismatch}
          />
          {mismatch && (
            <p style={{ fontSize: 11.5, color: "var(--destructive)", marginTop: 5 }}>
              Parollar mos kelmadi
            </p>
          )}
        </div>

        <div style={{ marginTop: 4 }}>
          <Button type="submit" disabled={!canSubmit}>
            {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {t("changePassword")}
          </Button>
        </div>
      </div>
    </form>
  );
}
