"use client";

import { useState, useTransition } from "react";
import { Bot, CheckCircle2, Loader2, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { approveMCPAction } from "./mcp-auth-action";

type Props = {
  code: string;
  callback: string;
  redirectUri: string;
  state: string;
};

export function MCPAuthForm({ code, callback, redirectUri, state }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(false);

  if (!code || !callback) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Noto'g'ri havola. MCP client'dan qayta urinib ko'ring.
        </CardContent>
      </Card>
    );
  }

  const handleApprove = () => {
    start(async () => {
      const res = await approveMCPAction({ code, callback, state });
      if (res.error) {
        setError(res.error);
      } else if (res.redirectUrl) {
        setApproved(true);
        window.location.href = res.redirectUrl;
      }
    });
  };

  const handleDeny = () => {
    const sep = redirectUri.includes("?") ? "&" : "?";
    window.location.href = `${redirectUri}${sep}error=access_denied&state=${state}`;
  };

  if (approved) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-sm text-muted-foreground">Ulanish tasdiqlandi. Qaytish...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">BotSpace MCP ulanish</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Tashqi AI agent BotSpace akkauntingizga ulanmoqchi
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Shield className="h-4 w-4 text-primary" />
            Quyidagi ruxsatlar beriladi:
          </div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>- Botlaringizni ko'rish va boshqarish</li>
            <li>- Flow yaratish va tahrirlash</li>
            <li>- Botlarni deploy qilish</li>
            <li>- Environment o'zgaruvchilarni boshqarish</li>
          </ul>
        </div>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDeny} disabled={pending}>
            Rad etish
          </Button>
          <Button className="flex-1" onClick={handleApprove} disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Ruxsat berish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
