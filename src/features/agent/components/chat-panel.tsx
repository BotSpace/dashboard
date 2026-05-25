"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { UsageBadge } from "./usage-badge";
import { Bot, Loader2, Send, Square, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { approveRunAction, cancelRunAction, startRunAction } from "../actions";
import { useAgentStream } from "../use-agent-stream";
import { ClarifyDialog } from "./clarify-dialog";
import { MessageMarkdown } from "./message-markdown";
import { PlanPanel } from "./plan-panel";
import { ThreadsPicker } from "./threads-picker";
import { ToolStrip } from "./tool-strip";
import { RunStatusChip, TypingIndicator } from "./typing-indicator";
import type { ChatTurn, ToolCallView } from "../types";
import {
  deleteThread,
  loadActiveRun,
  loadThread,
  loadThreads,
  newThreadId,
  saveActiveRun,
  saveThread,
  titleFromPrompt,
  upsertThreadMeta,
  type ThreadMeta,
} from "../storage";

type Props = {
  projectId: string;
  initialPrompt?: string;
};

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
  for (const t of turns) {
    if (t.kind === "tool") {
      if (!group) {
        group = [];
        groupStartId = t.id;
      }
      group.push(t.call);
      continue;
    }
    flushGroup(false);
    items.push(t as RenderItem);
  }
  const liveRunning = phase !== "done" && phase !== "error" && phase !== "idle";
  flushGroup(liveRunning);
  return items;
}

export function ChatPanel(props: Props) {
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

function pickInitialThreadId(projectId: string): string {
  const list = loadThreads(projectId);
  return list[0]?.id ?? newThreadId();
}

function ChatPanelInner({ projectId, initialPrompt }: Props) {
  const [threads, setThreads] = useState<ThreadMeta[]>(() => loadThreads(projectId));
  const [threadId, setThreadId] = useState<string>(() => pickInitialThreadId(projectId));

  const picker = (
    <ThreadsPicker
      threads={threads}
      activeId={threadId}
      onSelect={(id) => setThreadId(id)}
      onNew={() => setThreadId(newThreadId())}
      onDelete={(id) => {
        const next = deleteThread(projectId, id);
        setThreads(next);
        if (id === threadId) {
          setThreadId(next[0]?.id ?? newThreadId());
        }
      }}
    />
  );

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1fr_280px]">
      <ChatThread
        key={`${projectId}:${threadId}`}
        projectId={projectId}
        threadId={threadId}
        initialPrompt={initialPrompt}
        onThreadsChange={setThreads}
        headerSlot={picker}
      />
    </div>
  );
}

type ThreadProps = {
  projectId: string;
  threadId: string;
  initialPrompt?: string;
  onThreadsChange: (threads: ThreadMeta[]) => void;
  headerSlot?: React.ReactNode;
};

function ChatThread({
  projectId,
  threadId,
  initialPrompt,
  onThreadsChange,
  headerSlot,
}: ThreadProps) {
  const [stored] = useState(() => loadActiveRun(projectId, threadId));
  const [initialThread] = useState(() => loadThread(projectId, threadId));
  const [input, setInput] = useState(initialPrompt ?? "");
  const [requestId, setRequestId] = useState<string | null>(stored?.requestId ?? null);
  const [pending, start] = useTransition();
  const [usageKey, setUsageKey] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  const stream = useAgentStream({
    projectId,
    requestId,
    initialTurns: initialThread?.turns,
    initialSeq: initialThread?.lastSeq,
    onPersist: (snapshot) =>
      saveThread(projectId, threadId, {
        turns: snapshot.turns,
        lastSeq: snapshot.lastSeq,
        finished: snapshot.finished,
      }),
  });

  // Drop the persisted active-run pointer when the stream is finished so a
  // refresh doesn't try to re-attach to a closed run.
  useEffect(() => {
    if (stream.finished && requestId) {
      saveActiveRun(projectId, threadId, null);
    }
  }, [stream.finished, requestId, projectId, threadId]);

  // Refresh usage badge whenever a run finishes.
  useEffect(() => {
    if (stream.finished) setUsageKey((k) => k + 1);
  }, [stream.finished]);

  // Refresh usage badge as soon as the backend emits usage updates.
  useEffect(() => {
    if (stream.usageRefreshTick > 0) setUsageKey((k) => k + 1);
  }, [stream.usageRefreshTick]);

  // Auto-approve any approval request — destructive operations should run
  // immediately without user confirmation.
  const approvedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!stream.approval || !requestId) return;
    const id = String(
      (stream.approval as { tool_call_id?: string }).tool_call_id ?? "anon"
    );
    if (approvedRef.current.has(id)) return;
    approvedRef.current.add(id);
    approveRunAction({ projectId, requestId, approved: true }).catch(() => {
      /* ignore — agent will retry */
    });
  }, [stream.approval, requestId, projectId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [stream.turns.length, stream.thinking, stream.phase]);

  const isRunning =
    pending || (!stream.finished && stream.phase !== "idle" && stream.phase !== "error");

  const send = () => {
    const text = input.trim();
    if (!text || pending) return;

    // First message of a fresh thread → seed the threads list with a title.
    const existingMeta = loadThreads(projectId).find((t) => t.id === threadId);
    const title = existingMeta?.title ?? titleFromPrompt(text);
    const updated = upsertThreadMeta(projectId, {
      id: threadId,
      title,
      lastUpdated: Date.now(),
    });
    onThreadsChange(updated);

    stream.pushUserTurn(text);
    setInput("");
    start(async () => {
      const res = await startRunAction({ projectId, prompt: text, threadId });
      if (!res.ok || !res.request_id) {
        toast.error(res.message ?? "Run boshlanmadi");
        return;
      }
      setRequestId(res.request_id);
      saveActiveRun(projectId, threadId, { requestId: res.request_id, threadId });
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

  const items = useMemo(
    () => renderTurns(stream.turns, stream.phase),
    [stream.turns, stream.phase]
  );

  return (
    <>
      <div className="flex h-full min-h-0 flex-col rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <div className="hidden text-sm font-medium sm:block">BotSpace Agent</div>
          <div className="shrink-0">
            <RunStatusChip phase={stream.phase} currentTool={null} />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <UsageBadge refreshKey={usageKey} />
            {requestId && (
              <code className="hidden text-[10px] text-muted-foreground sm:inline">
                run: {requestId.slice(0, 8)}
              </code>
            )}
            {headerSlot}
          </div>
        </div>

        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 && !isRunning && (
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

          {items.map((item) => {
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
            return <ToolStrip key={item.id} calls={item.calls} pending={item.pending} />;
          })}

          {stream.thinking && stream.phase === "thinking" && (
            <div className="flex gap-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {stream.thinking}
              </div>
            </div>
          )}

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
            <div className="mt-2 flex items-center gap-1.5 overflow-hidden text-[11px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
              <span className="truncate">Agent javob tayyorlamoqda — qizil tugmani bosib to'xtatishingiz mumkin</span>
            </div>
          )}
        </div>
      </div>

      <PlanSidebar plan={stream.plan} />

      {requestId && (
        <ClarifyDialog projectId={projectId} requestId={requestId} payload={stream.clarify} />
      )}
    </>
  );
}

function PlanSidebar({ plan }: { plan: Parameters<typeof PlanPanel>[0]["plan"] }) {
  return (
    <aside className={`space-y-3 ${plan.length === 0 ? "hidden lg:block" : ""}`}>
      <PlanPanel plan={plan} />
    </aside>
  );
}
