"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Key, Loader2, Plus, Terminal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { createTokenAction, deleteTokenAction, listTokensAction } from "../actions/token-actions";

type TokenMeta = { id: number; name: string; prefix: string; last_used_at: string | null; created_at: string };

export function APITokensPanel() {
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listTokensAction()
      .then((t) => { setTokens(t); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const handleCreate = () => {
    const n = name.trim();
    if (!n) return;
    start(async () => {
      try {
        const res = await createTokenAction(n);
        if (res.token) {
          setNewToken(res.token);
          setName("");
          const updated = await listTokensAction();
          setTokens(updated);
          toast.success("Token yaratildi");
        }
      } catch {
        toast.error("Token yaratishda xatolik");
      }
    });
  };

  const handleDelete = (id: number) => {
    start(async () => {
      try {
        await deleteTokenAction(id);
        setTokens((prev) => prev.filter((t) => t.id !== id));
        toast.success("Token o'chirildi");
      } catch {
        toast.error("O'chirishda xatolik");
      }
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Nusxalandi");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="rounded-lg border border-dashed p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Tashqi xizmatlar uchun API token</p>
            <p className="text-muted-foreground">
              MCP server, CI/CD yoki boshqa integratsiyalar uchun token yarating.
              Token bilan <code className="rounded bg-muted px-1 py-0.5 text-xs">POST /auth/token/exchange/</code> ga
              so'rov yuborib JWT olasiz.
            </p>
          </div>
        </div>
      </div>

      {/* Create form */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token nomi (masalan: MCP Server)"
          className="max-w-sm"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          disabled={pending}
        />
        <Button onClick={handleCreate} disabled={pending || !name.trim()} size="sm" className="shrink-0">
          {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
          Yaratish
        </Button>
      </div>

      {/* New token display */}
      {newToken && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Token yaratildi — hozir nusxalab oling, keyinchalik ko'ra olmaysiz:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs font-mono select-all">
                {newToken}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => handleCopy(newToken)}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground" onClick={() => setNewToken(null)}>
              Yopish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Token list */}
      {!loaded ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Key className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Hali token yaratmagansiz</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <code className="rounded bg-muted px-1 py-0.5">{t.prefix}••••••</code>
                    {t.last_used_at && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span>Oxirgi: {new Date(t.last_used_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {new Date(t.created_at).toLocaleDateString()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(t.id)}
                  disabled={pending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
