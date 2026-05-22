"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type Status = "loading" | "ready" | "error";

export function EditorFrame({ src }: { src: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [key, setKey] = useState(0); // bump to force reload

  useEffect(() => {
    setStatus("loading");
    const timeout = window.setTimeout(() => {
      // If load event never fires within 8s, assume the constructor service is down.
      setStatus((s) => (s === "loading" ? "error" : s));
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [key, src]);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted/20">
      <iframe
        key={key}
        ref={ref}
        src={src}
        title="Bot Constructor"
        className="h-[calc(100svh-220px)] min-h-[560px] w-full"
        allow="clipboard-read; clipboard-write"
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Konstruktor yuklanmoqda…
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-background/95">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Konstruktorga ulanib bo'lmadi</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5">bot-constructor-panel</code> servisi ishga
              tushmagan ko'rinadi. Uni alohida terminalda ishga tushiring:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-left text-xs">
              <code>cd bot-constructor-panel{"\n"}npm run dev</code>
            </pre>
            <p className="mt-3 break-all text-xs text-muted-foreground">URL: {src}</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setKey((k) => k + 1)}>
                <RefreshCw className="h-3.5 w-3.5" /> Qayta urinish
              </Button>
              <Button size="sm" asChild>
                <a href={src} target="_blank" rel="noreferrer" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> Yangi oynada ochish
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
