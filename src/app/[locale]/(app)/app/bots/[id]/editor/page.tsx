import { setRequestLocale } from "next-intl/server";
import { AlertCircle, ExternalLink, Workflow } from "lucide-react";
import { env } from "@/shared/lib/env";
import { readSession } from "@/shared/auth/session";
import { issueHandoverToken } from "@/shared/auth/handover";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { EditorFrame } from "@/features/bots/components/editor-frame";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const constructorBase = env.NEXT_PUBLIC_CONSTRUCTOR_URL;

  if (!constructorBase) {
    return (
      <Card>
        <CardContent className="grid place-items-center gap-3 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Konstruktor URL sozlanmagan</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_CONSTRUCTOR_URL</code> ni{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code> ga qo'shing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const session = await readSession();
  const handover = session ? await issueHandoverToken(session) : null;

  const url = new URL(`${constructorBase.replace(/\/$/, "")}/${locale}/${id}`);
  if (handover) url.searchParams.set("t", handover);
  const editorUrl = url.toString();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Workflow className="h-4 w-4" />
          Vizual konstruktor — node va edge'lar bilan bot mantiqini quring
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={editorUrl} target="_blank" rel="noreferrer" className="gap-2">
            <ExternalLink className="h-4 w-4" /> Yangi oynada ochish
          </a>
        </Button>
      </div>
      <EditorFrame src={editorUrl} />
    </div>
  );
}
