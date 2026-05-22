"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Bot, Loader2, Plus, Send, Square, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { cancelRunAction, startRunAction } from "../actions";
import { useAgentStream } from "../use-agent-stream";
import { ApprovalDialog } from "./approval-dialog";
import { ClarifyDialog } from "./clarify-dialog";
import { MessageMarkdown } from "./message-markdown";
import { PlanPanel } from "./plan-panel";
import { ToolStrip } from "./tool-strip";
import { RunStatusChip, TypingIndicator } from "./typing-indicator";
import type { ChatTurn, ToolCallView } from "../types";

type Props = {
  projectId: string;
  initialPrompt?: string;
};

const STORE_KEY = (projectId: string) => `bm.agent.activeRun:${projectId}`;
const HISTORY_KEY = (projectId: string) => `bm.agent.history:${projectId}`;
const HISTORY_LIMIT = 200;

type StoredRun = { requestId: string; threadId: string };
type StoredHistory = {
  turns: import("../types").ChatTurn[];
  lastSeq: number;
  finished: boolean;
};

function loadStored(projectId: string): StoredRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.requestId === "string" && typeof parsed?.threadId === "string") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveStored(projectId: string, run: StoredRun | null) {
  if (typeof window === "undefined") return;
  if (run) {
    localStorage.setItem(STORE_KEY(projectId), JSON.stringify(run));
  } else {
    localStorage.removeItem(STORE_KEY(projectId));
  }
}

function loadHistory(projectId: string): StoredHistory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HISTORY_KEY(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.turns)) {
      return {
        turns: parsed.turns,
        lastSeq: typeof parsed.lastSeq === "number" ? parsed.lastSeq : 0,
        finished: Boolean(parsed.finished),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveHistory(projectId: string, snapshot: StoredHistory) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = {
      ...snapshot,
      turns: snapshot.turns.slice(-HISTORY_LIMIT),
    };
    localStorage.setItem(HISTORY_KEY(projectId), JSON.stringify(trimmed));
  } catch {
    /* quota exceeded — ignore */
  }
}

type RenderItem =
  | { kind: "user"; id: string; text: string }
  | { kind: "assistant"; id: string; text: string }
  | { kind: "tool-group"; id: string; calls: ToolCallView[]; pending: boolean };

function renderTurns(turns: ChatTurn[], phase: string): RenderItem[] {
  const items: RenderItem[] = [];
  let group: ToolCallView[] | null = null;
  let groupStartId = "";
  const flushGroup = (pending: boolean) => {
    if (group && group.length) {
      items.push({ kind: "tool-group", id: `tg-${groupStartId}`, calls: group, pending });
    }
    group = null;
    groupStartId = "";
  };
  turns.forEach((t, idx) => {
    if (t.kind === "tool") {
      if (!group) {
        group = [];
        groupStartId = t.id;
      }
      group.push(t.call);
      return;
    }
    // The trailing group's "pending" follows the live phase only if it sits at
    // the very end of the turn list while the run is still active.
    flushGroup(false);
    items.push(t as RenderItem);
    // mark unused index to satisfy lints
    void idx;
  });
  const liveRunning = phase !== "done" && phase !== "error" && phase !== "idle";
  flushGroup(liveRunning);
  return items;
}

export function ChatPanel(props: Props) {
  // Wait until the component is mounted on the client, then render the inner
  // panel which can synchronously read localStorage from useState initialisers
  // — that's the only way useAgentStream's initial turns/seq are honoured.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        Yuklanmoqda…
      </div>
    );
  }
  return <ChatPanelInner {...props} />;
}

function ChatPanelInner({ projectId, initialPrompt }: Props) {
  // Synchronously hydrate from localStorage on first render.
  const [stored] = useState<StoredRun | null>(() => loadStored(projectId));
  const [initialHistory] = useState<StoredHistory | null>(() => loadHistory(projectId));
  const [input, setInput] = useState(initialPrompt ?? "");
  const [requestId, setRequestId] = useState<string | null>(stored?.requestId ?? null);
  const [threadId, setThreadId] = useState<string>(
    () => stored?.threadId ?? `t-${Date.now().toString(36)}`
  );
  const [pending, start] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);

  const stream = useAgentStream({
    projectId,
    requestId,
    initialTurns: initialHistory?.turns,
    initialSeq: initialHistory?.lastSeq,
    onPersist: (snapshot) => saveHistory(projectId, snapshot),
  });

  // Once a run finishes, drop the persisted record so a refresh does not
  // re-attach to a completed stream.
  useEffect(() => {
    if (stream.finished && requestId) {
      saveStored(projectId, null);
    }
  }, [stream.finished, requestId, projectId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [stream.turns.length, stream.thinking, stream.phase]);

  const isRunning =
    pending || (!stream.finished && stream.phase !== "idle" && stream.phase !== "error");

  const send = () => {
    const text = input.trim();
    if (!text || pending) return;
    stream.pushUserTurn(text);
    setInput("");
    start(async () => {
      const res = await startRunAction({ projectId, prompt: text, threadId });
      if (!res.ok || !res.request_id) {
        toast.error(res.message ?? "Run boshlanmadi");
        return;
      }
      setRequestId(res.request_id);
      saveStored(projectId, { requestId: res.request_id, threadId });
    });
  };

  const stopRun = () => {
    if (!requestId) return;
    start(async () => {
      const res = await cancelRunAction({ projectId, requestId });
      if (!res.ok) {
        toast.error(res.message ?? "To'xtatib bo'lmadi");
        return;
      }
      toast.success("To'xtatildi");
    });
  };

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1fr_300px]">
      <div className="flex h-full min-h-0 flex-col rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-sm font-medium">Botmother Agent</div>
          <div className="ml-2">
            <RunStatusChip phase={stream.phase} currentTool={null} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {requestId && (
              <code className="text-[10px] text-muted-foreground">
                run: {requestId.slice(0, 8)}
              </code>
            )}
            {stream.turns.length > 0 && !isRunning && (
              <Button
                onClick={() => {
                  saveStored(projectId, null);
                  saveHistory(projectId, { turns: [], lastSeq: 0, finished: false });
                  window.location.reload();
                }}
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                title="Yangi suhbat"
              >
                <Plus className="h-3 w-3" />
                Yangi
              </Button>
            )}
          </div>
        </div>

        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
          {stream.turns.length === 0 && !isRunning && (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <Bot className="mx-auto mb-3 h-8 w-8 text-primary/40" />
                Botingiz haqida nima qilmoqchisiz?
                <div className="mt-1 text-xs">
                  Misol: &ldquo;/start uchun salomlashish flow tuz&rdquo;,
                  &ldquo;VIP foydalanuvchilarga aksiya yubor&rdquo;
                </div>
              </div>
            </div>
          )}

          {renderTurns(stream.turns, stream.phase).map((item) => {
            if (item.kind === "user") {
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 whitespace-pre-wrap text-sm">{item.text}</div>
                </div>
              );
            }
            if (item.kind === "assistant") {
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <MessageMarkdown className="flex-1 min-w-0">{item.text}</MessageMarkdown>
                </div>
              );
            }
            return (
              <ToolStrip key={item.id} calls={item.calls} pending={item.pending} />
            );
          })}

          <TypingIndicator phase={stream.phase} currentTool={null} />

          {stream.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {stream.error}
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={
                isRunning
                  ? "Agent ishlamoqda… javobni kuting"
                  : "Agent bilan tabiiy tilda gaplashing… (⌘+Enter — yuborish)"
              }
              className={cn(
                "min-h-[40px] flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                isRunning && "opacity-60"
              )}
              disabled={isRunning}
            />
            {isRunning && requestId ? (
              <Button
                onClick={stopRun}
                disabled={pending}
                size="icon"
                variant="destructive"
                className={cn("h-10 w-10")}
                aria-label="To'xtatish"
                title="Agent ishini to'xtatish"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={send}
                disabled={!input.trim() || pending}
                size="icon"
                className={cn("h-10 w-10")}
                aria-label="Yuborish"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {isRunning && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Agent javob tayyorlamoqda — qizil tugmani bosib to'xtatishingiz mumkin
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-3">
        <PlanPanel plan={stream.plan} />
      </aside>

      {requestId && (
        <>
          <ApprovalDialog projectId={projectId} requestId={requestId} payload={stream.approval} />
          <ClarifyDialog projectId={projectId} requestId={requestId} payload={stream.clarify} />
        </>
      )}
    </div>
  );
}
