import { setRequestLocale } from "next-intl/server";
import {
  MessagesSquare,
  ImageIcon,
  Video,
  AlignLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Radio,
} from "lucide-react";
import { MessagesAPI } from "@/shared/api/services";
import { BroadcastComposer } from "@/features/messages/components/broadcast-composer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import type { BroadcastMessage } from "@/shared/types/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "warn" | "destructive" | "secondary";
type IconComponent = React.ElementType<{ className?: string }>;

function MediaTypeChip({ type }: { type: BroadcastMessage["message_type"] }) {
  if (type === "photo")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <ImageIcon className="h-3 w-3" />
        Rasm
      </span>
    );
  if (type === "video")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <Video className="h-3 w-3" />
        Video
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <AlignLeft className="h-3 w-3" />
      Matn
    </span>
  );
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: BadgeVariant; Icon: IconComponent }
> = {
  done: { label: "Yuborildi", variant: "success", Icon: CheckCircle2 },
  progress: { label: "Jarayonda", variant: "warn", Icon: Clock },
  failed: { label: "Xato", variant: "destructive", Icon: XCircle },
};

function StatusBadge({ status }: { status?: string }) {
  const found = STATUS_MAP[status ?? ""];
  const variant: BadgeVariant = found?.variant ?? "secondary";
  const label = found?.label ?? status ?? "—";
  const Icon: IconComponent = found?.Icon ?? MessagesSquare;
  return (
    <Badge variant={variant} className="shrink-0 gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function ProgressCell({ done, total, status }: { done?: number; total?: number; status?: string }) {
  const d = done ?? 0;
  const t = total ?? 0;
  if (t === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const pct = Math.round((d / t) * 100);
  return (
    <div className="flex min-w-[90px] flex-col gap-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="tabular-nums">
          {d}/{t}
        </span>
        <span className="tabular-nums font-medium">{pct}%</span>
      </div>
      <Progress
        value={d}
        max={t}
        className={cn(
          "h-1.5",
          status === "failed" && "[&>div]:bg-destructive",
          status === "progress" && "[&>div]:bg-amber-500",
        )}
      />
    </div>
  );
}

function HistoryEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
        <Radio className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Yuborilgan broadcastlar yo&apos;q</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Yuqoridagi forma orqali birinchi broadcast yuboring
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BotMessagesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const items = await MessagesAPI.list(id).catch(() => []);

  return (
    <div className="space-y-5">
      <BroadcastComposer projectId={id} />

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Yuborilgan broadcastlar</CardTitle>
          <CardDescription>
            {items.length > 0 ? `Jami ${items.length} ta broadcast` : "Hali broadcast yuborilmagan"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <HistoryEmpty />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5",
                    "sm:flex-nowrap",
                    "transition-colors hover:bg-muted/40",
                  )}
                >
                  {/* Media type chip */}
                  <MediaTypeChip type={m.message_type} />

                  {/* Caption */}
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {m.caption?.trim() || (
                      <span className="italic text-muted-foreground">Matn yo&apos;q</span>
                    )}
                  </span>

                  {/* Progress */}
                  <ProgressCell done={m.done} total={m.total} status={m.status} />

                  {/* Status badge */}
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
