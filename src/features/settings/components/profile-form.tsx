"use client";
import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/features/settings/actions";
import { Button } from "@/shared/components/ui/button";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
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
    <form action={action}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div>
          <label htmlFor="first_name" style={labelStyle}>
            {t("name")}
          </label>
          <input
            id="first_name"
            name="first_name"
            defaultValue={defaultFirstName}
            required
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
        <div>
          <label htmlFor="last_name" style={labelStyle}>
            Familiya
          </label>
          <input
            id="last_name"
            name="last_name"
            defaultValue={defaultLastName}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <label htmlFor="email" style={labelStyle}>
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="email@example.com"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
        <div>
          <label htmlFor="phone" style={labelStyle}>
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={defaultPhone}
            disabled
            style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
          />
          <p style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 5 }}>
            Telefon raqamni o&apos;zgartirish uchun support&apos;ga murojaat qiling
          </p>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
