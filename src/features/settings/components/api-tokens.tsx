"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Key, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { createTokenAction, deleteTokenAction, listTokensAction } from "../actions/token-actions";

type TokenMeta = { id: number; name: string; prefix: string; last_used_at: string | null; created_at: string };

export function APITokensPanel() {
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const closeDialog = () => {
    setDialogOpen(false);
    setNewToken(null);
    setName("");
  };

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            API tokenlar orqali tashqi ilovalar BotSpace platformasiga ulanadi.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setNewToken(null); setName(""); } }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Yangi token
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            {!newToken ? (
              <>
                <DialogHeader>
                  <DialogTitle>API token yaratish</DialogTitle>
                  <DialogDescription>
                    Token nomi faqat sizga ko'rinadi — qaysi xizmat uchun ekanligini belgilang.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <Label htmlFor="token-name">Token nomi</Label>
                  <Input
                    id="token-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: MCP Server, CI/CD, Monitoring"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>Bekor qilish</Button>
                  <Button onClick={handleCreate} disabled={pending || !name.trim()}>
                    {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    Yaratish
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Token yaratildi</DialogTitle>
                  <DialogDescription>
                    Bu tokenni hozir nusxalab oling. Xavfsizlik sababli uni qayta ko'ra olmaysiz.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3">
                    <code className="flex-1 overflow-x-auto text-xs font-mono select-all break-all">
                      {newToken}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleCopy(newToken)}
                    >
                      {copied ? <Check className="h-4 w-4 text-foreground" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={closeDialog}>Tayyor</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Token list */}
      {!loaded ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
          <Key className="h-10 w-10 text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium">Tokenlar yo'q</p>
            <p className="text-xs text-muted-foreground">Tashqi xizmatlarni ulash uchun token yarating</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-muted">
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <code>{t.prefix}••••</code>
                    {t.last_used_at ? (
                      <span>· Oxirgi: {new Date(t.last_used_at).toLocaleDateString()}</span>
                    ) : (
                      <span>· Hali ishlatilmagan</span>
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
