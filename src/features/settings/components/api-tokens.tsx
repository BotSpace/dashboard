"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, Key, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { createTokenAction, deleteTokenAction, listTokensAction } from "../actions/token-actions";

type TokenMeta = { id: number; name: string; prefix: string; last_used_at: string | null; created_at: string };

export function APITokensPanel() {
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    listTokensAction().then(setTokens).catch(() => {});
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;
    start(async () => {
      const res = await createTokenAction(name.trim());
      if (res.token) {
        setNewToken(res.token);
        setName("");
        const updated = await listTokensAction();
        setTokens(updated);
        toast.success("Token yaratildi");
      }
    });
  };

  const handleDelete = (id: number) => {
    start(async () => {
      await deleteTokenAction(id);
      setTokens((prev) => prev.filter((t) => t.id !== id));
      toast.success("Token o'chirildi");
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nusxalandi");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          API tokenlar tashqi xizmatlar (MCP server, CI/CD) uchun ishlatiladi. Token yaratib, uni
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">POST /auth/token/exchange/</code>
          ga yuborib JWT olasiz.
        </p>
      </div>

      {/* Create new token */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token nomi (masalan: MCP Server)"
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={pending || !name.trim()} size="sm">
          {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
          Yaratish
        </Button>
      </div>

      {/* Newly created token (shown once) */}
      {newToken && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Token yaratildi — uni hozir nusxalab oling, keyinchalik ko'ra olmaysiz:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-auto rounded bg-muted px-3 py-2 text-xs">{newToken}</code>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleCopy(newToken)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setNewToken(null)}>
            Yopish
          </Button>
        </div>
      )}

      {/* Token list */}
      <div className="space-y-2">
        {tokens.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Hali token yaratmagansiz</p>
        ) : (
          tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    <code>{t.prefix}•••</code>
                    {t.last_used_at && (
                      <span className="ml-2">Oxirgi: {new Date(t.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {new Date(t.created_at).toLocaleDateString()}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
