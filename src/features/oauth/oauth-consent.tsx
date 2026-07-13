"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Bot, CheckCircle2, Loader2, Shield, AlertTriangle, User, Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  approveOAuthAction,
  type OAuthParams,
  type OAuthMeta,
  type ApproveErrorKind,
} from "./oauth-consent-action";

type SessionUser = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
};

function userDisplayName(u: SessionUser): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.username || u.email || u.phone || String(u.id);
}

type Props = {
  params: OAuthParams;
  meta: OAuthMeta;
  user: SessionUser;
};

export function OAuthConsent({ params, meta, user }: Props) {
  const t = useTranslations("oauth");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<ApproveErrorKind | null>(null);
  const [approved, setApproved] = useState(false);

  const handleApprove = () => {
    start(async () => {
      setError("");
      setErrorKind(null);
      const res = await approveOAuthAction(params);
      if (res.error) {
        setError(res.error);
        setErrorKind(res.errorKind ?? "generic");
      } else if (res.redirectUrl) {
        setApproved(true);
        window.location.href = res.redirectUrl;
      }
    });
  };

  // Prefer a friendly, localized message by kind; fall back to the raw server
  // string only when we have no better classification.
  const errorMessage = errorKind
    ? errorKind === "server"
      ? t("errorServer")
      : errorKind === "auth"
        ? t("errorAuth")
        : t("errorGeneric")
    : error;

  const handleDeny = () => {
    const base = params.redirect_uri;
    const sep = base.includes("?") ? "&" : "?";
    const stateParam = params.state ? `&state=${encodeURIComponent(params.state)}` : "";
    window.location.href = `${base}${sep}error=access_denied${stateParam}`;
  };

  if (approved) {
    return (
      <Card className="w-full max-w-md border-white/10 bg-white/[0.04] backdrop-blur-sm">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
              boxShadow: "0 0 40px rgba(139,92,246,0.4)",
            }}
          >
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm text-white/60">{t("redirecting")}</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = userDisplayName(user);

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/[0.04] backdrop-blur-sm">
      <CardHeader className="pb-4 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl text-white">{t("title")}</CardTitle>
        <p className="mt-1.5 text-sm text-white/55">
          {t("subtitle", { clientName: meta.client_name })}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Logged-in user badge */}
        <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
            <User className="h-3.5 w-3.5 text-white/70" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/40">{t("loggedInAs")}</p>
            <p className="truncate text-sm font-medium text-white/85">{displayName}</p>
          </div>
        </div>

        {/* Permissions */}
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
            <Shield className="h-4 w-4 text-cyan-400" />
            {t("permissionsTitle")}
          </div>
          <ul className="space-y-2 text-[13px] text-white/55">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {t("perm1")}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {t("perm2")}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {t("perm3")}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {t("perm4")}
            </li>
          </ul>
        </div>

        {errorMessage && (
          <div className="space-y-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
            {errorKind === "server" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-destructive/30 bg-transparent text-xs text-destructive hover:bg-destructive/15 hover:text-destructive"
                onClick={handleApprove}
                disabled={pending}
              >
                {t("retry")}
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1 border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
            onClick={handleDeny}
            disabled={pending}
          >
            {t("deny")}
          </Button>
          <Button
            className="flex-1"
            onClick={handleApprove}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("approve")}
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/30">
          <Lock className="h-3 w-3 shrink-0" />
          {t("redirectNote", { uri: meta.redirect_uri })}
        </p>
      </CardContent>
    </Card>
  );
}
