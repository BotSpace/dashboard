"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Loader2,
  Send,
  Square,
  User,
  Sparkles,
  PanelLeftOpen,
  Plus,
  ArrowDown,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { analytics } from "@/shared/analytics/umami";
import { Button } from "@/shared/components/ui/button";
import {
  cancelRunAction,
  startRunAction,
  listThreadsAction,
  deleteThreadAction,
  clearAllThreadsAction,
  loadThreadHistoryAction,
} from "../actions";
import { useAgentStream } from "../use-agent-stream";
import { ApprovalDialog } from "./approval-dialog";
import { ClarifyDialog } from "./clarify-dialog";
import { MessageMarkdown } from "./message-markdown";
import { PlanPanel } from "./plan-panel";
import { ProjectPicker } from "./project-picker";
import { ThreadsSidebar } from "./threads-sidebar";
import { ToolStrip } from "./tool-strip";
import { SubAgentAccordion } from "./sub-agent-accordion";
import { RunStatusChip } from "./typing-indicator";
import { UsageBadge } from "./usage-badge";
import type { ChatTurn, ToolCallView } from "../types";
import type { Project } from "@/shared/types/api";
import {
  newThreadId,
  titleFromPrompt,
  type ThreadMeta,
} from "../storage";

/**
 * Pure upsert of a thread meta into a list, newest-first, deduped by id.
 * Chat history lives in the backend now (no localStorage); this only keeps the
 * in-memory sidebar list in sync while the user works.
 */
function upsertMeta(list: ThreadMeta[], meta: ThreadMeta): ThreadMeta[] {
  const rest = list.filter((t) => t.id !== meta.id);
  return [meta, ...rest].sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, 50);
}

/** Map the backend thread list into the sidebar's ThreadMeta shape. */
function backendToMeta(
  backendRaw: { thread_id: string; title: string; updated_at: string }[]
): ThreadMeta[] {
  return backendRaw
    .map((b) => {
      const ts = new Date(b.updated_at).getTime();
      return {
        id: b.thread_id,
        title: b.title || "Suhbat",
        lastUpdated: isNaN(ts) ? Date.now() : ts,
      };
    })
    .sort((a, b) => b.lastUpdated - a.lastUpdated);
}

type Props = {
  projectId: string;
  projects: Project[];
  initialPrompt?: string;
};

type RenderItem =
  | { kind: "user"; id: string; text: string }
  | { kind: "assistant"; id: string; text: string; inputTokens?: number; outputTokens?: number }
  | { kind: "tool-group"; id: string; calls: ToolCallView[]; pending: boolean }
  | { kind: "sub_agent"; id: string; turn: Extract<ChatTurn, { kind: "sub_agent" }> };

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
    if (t.kind === "sub_agent") {
      items.push({ kind: "sub_agent", id: t.id, turn: t });
      continue;
    }
    items.push(t as RenderItem);
  }
  const liveRunning = phase !== "done" && phase !== "error" && phase !== "idle";
  flushGroup(liveRunning);
  return items;
}

const SUGGESTIONS = [
  "/start uchun salomlashish flow tuz",
  "VIP foydalanuvchilarga aksiya yubor",
  "Botga FAQ bo'lim qo'sh",
  "Foydalanuvchi statistikasini ko'rsat",
];

export function ChatPanel(props: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <div className="grid h-full place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/10" />
          <span className="text-sm text-muted-foreground">Yuklanmoqda…</span>
        </div>
      </div>
    );
  }
  return <ChatPanelInner {...props} />;
}

function ChatPanelInner({ projectId, projects, initialPrompt }: Props) {
  // Chat history is backend-only now — start empty, load the thread list from
  // the API on mount. A fresh threadId is used until the list arrives.
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [threadId, setThreadId] = useState<string>(() => newThreadId());
  const [threadPicked, setThreadPicked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // On mount: load the thread list from the backend and open the most recent one
  // (unless the user has already picked/started a thread).
  useEffect(() => {
    let cancelled = false;
    listThreadsAction(projectId).then((res) => {
      if (cancelled || !res) return;
      const list = backendToMeta(res.threads);
      setThreads(list);
      if (!threadPicked && list.length > 0) {
        setThreadId(list[0].id);
      }
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleNewThread = () => {
    setThreadPicked(true);
    setThreadId(newThreadId());
    setSidebarOpen(false);
  };

  const handleSelectThread = (id: string) => {
    setThreadPicked(true);
    setThreadId(id);
    setSidebarOpen(false);
  };

  const handleDeleteThread = (id: string) => {
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    if (id === threadId) {
      setThreadPicked(true);
      setThreadId(next[0]?.id ?? newThreadId());
    }
    void deleteThreadAction(projectId, id);
  };

  const handleClearAllThreads = () => {
    setThreads([]);
    setThreadPicked(true);
    setThreadId(newThreadId());
    void clearAllThreadsAction(projectId);
  };

  return (
    <div className="relative flex h-full overflow-hidden rounded-xl border bg-background">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r md:block">
        <ThreadsSidebar
          threads={threads}
          activeId={threadId}
          onSelect={handleSelectThread}
          onNew={handleNewThread}
          onDelete={handleDeleteThread}
          onClearAll={handleClearAllThreads}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-background md:hidden"
            >
              <ThreadsSidebar
                threads={threads}
                activeId={threadId}
                onSelect={handleSelectThread}
                onNew={handleNewThread}
                onDelete={handleDeleteThread}
                onClearAll={handleClearAllThreads}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatThread
          key={`${projectId}:${threadId}`}
          projectId={projectId}
          projects={projects}
          threadId={threadId}
          initialPrompt={initialPrompt}
          onThreadsChange={setThreads}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onNewThread={handleNewThread}
        />
      </div>
    </div>
  );
}

type ThreadProps = {
  projectId: string;
  projects: Project[];
  threadId: string;
  initialPrompt?: string;
  onThreadsChange: Dispatch<SetStateAction<ThreadMeta[]>>;
  onToggleSidebar: () => void;
  onNewThread: () => void;
};

function ChatThread({
  projectId,
  projects,
  threadId,
  initialPrompt,
  onThreadsChange,
  onToggleSidebar,
  onNewThread,
}: ThreadProps) {
  const [input, setInput] = useState(initialPrompt ?? "");
  const [requestId, setRequestId] = useState<string | null>(null);
  // Set when a refresh re-attaches to an in-flight run so the SSE reconnects
  // with the right seq cursor (replay only unseen events, no duplicate turns).
  const [resume, setResume] = useState<{ requestId: string; sinceSeq: number } | null>(null);
  const [pending, start] = useTransition();
  const [usageKey, setUsageKey] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const backendLoadedRef = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stream = useAgentStream({
    projectId,
    requestId,
    // History is loaded from the backend below (no localStorage seed) and no
    // longer written to localStorage on each turn — the agent persists every
    // run/message/event in Postgres.
    initialTurns: undefined,
    initialSeq: 0,
    initialFinished: false,
    resume,
  });

  // Load this thread's history from the backend when it opens (single source of
  // truth). Skip while a run is actively streaming so we don't disturb live SSE.
  useEffect(() => {
    if (backendLoadedRef.current) return;
    if (requestId) return;
    backendLoadedRef.current = true;

    let cancelled = false;
    loadThreadHistoryAction(projectId, threadId).then((res) => {
      if (cancelled || !res) return;
      // Backend turns are already ChatTurn-compatible.
      if (res.turns.length > 0) {
        stream.seedTurnsFromBackend(res.turns as unknown as ChatTurn[]);
      }
      // A still-running run for this thread — re-attach to its live SSE so a
      // refresh mid-run keeps streaming instead of freezing the transcript.
      if (res.active_run) {
        setResume({
          requestId: res.active_run.request_id,
          sinceSeq: res.active_run.last_seq,
        });
        setRequestId(res.active_run.request_id);
      }
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, threadId]);

  useEffect(() => {
    if (stream.finished) setUsageKey((k) => k + 1);
  }, [stream.finished]);

  useEffect(() => {
    if (stream.usageRefreshTick > 0) setUsageKey((k) => k + 1);
  }, [stream.usageRefreshTick]);

  // Foydalanuvchi pastda turgan bo'lsagina avto-scroll qilamiz. Tepaga
  // chiqib o'qish paytida yangi xabar kelganda joyini "yutib qo'ymaymiz".
  const stickToBottomRef = useRef(true);

  const scrollToBottom = (smooth = true) => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    stickToBottomRef.current = true;
  };

  // Growing length of the last turn's text — during streaming, tokens append to
  // the SAME turn (turns.length is unchanged), so we key auto-scroll on this too;
  // otherwise a streamed reply grows below the fold without following.
  const lastTurn = stream.turns[stream.turns.length - 1];
  const lastTurnLen =
    lastTurn && (lastTurn.kind === "assistant" || lastTurn.kind === "user")
      ? lastTurn.text.length
      : 0;

  useEffect(() => {
    if (stickToBottomRef.current) scrollToBottom();
  }, [stream.turns.length, lastTurnLen, stream.thinking, stream.phase]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      // 80px ostida — "pastda turibdi", auto-scroll OK.
      // 120px tepa — "scroll-to-bottom" tugmasini ko'rsatamiz.
      stickToBottomRef.current = gap < 80;
      setShowScrollBtn(gap > 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const isRunning =
    pending || (!stream.finished && stream.phase !== "idle" && stream.phase !== "error");

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || pending) return;

    // Keep the in-memory sidebar list in sync; the backend creates/updates the
    // thread on run creation (single source of truth).
    onThreadsChange((prev) => {
      const existing = prev.find((t) => t.id === threadId);
      const title = existing?.title ?? titleFromPrompt(msg);
      return upsertMeta(prev, { id: threadId, title, lastUpdated: Date.now() });
    });

    stream.pushUserTurn(msg);
    setResume(null); // a fresh run supersedes any prior resume target
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    analytics.agentPrompt({ projectId, length: msg.length });
    start(async () => {
      const res = await startRunAction({ projectId, prompt: msg, threadId });
      if (!res.ok || !res.request_id) {
        toast.error(res.message ?? "Run boshlanmadi");
        return;
      }
      setRequestId(res.request_id);
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

  const toolCallCount = useMemo(() => {
    let n = 0;
    for (const t of stream.turns) {
      if (t.kind === "tool") n += 1;
      else if (t.kind === "sub_agent") n += t.toolCalls;
    }
    return n;
  }, [stream.turns]);

  const msgCount = useMemo(
    () => stream.turns.filter((t) => t.kind === "user").length,
    [stream.turns]
  );

  const projectName = useMemo(
    () =>
      projectId === "global"
        ? "Umumiy"
        : projects.find((p) => String(p.id) === projectId)?.name ?? `#${projectId}`,
    [projectId, projects]
  );

  const isEmpty = items.length === 0 && !isRunning;

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center gap-2 border-b px-3 py-2 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={onToggleSidebar}
          aria-label="Suhbatlar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">BotSpace Agent</span>
        </div>

        <RunStatusChip
          phase={stream.phase}
          currentTool={stream.currentTool}
          currentSubAgent={stream.currentSubAgent}
        />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ProjectPicker projects={projects} current={projectId} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewThread}
            title="Yangi suhbat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scroller} className="relative flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyState onSend={send} />
        ) : (
          <div className="mx-auto max-w-3xl px-3 py-4 sm:px-6">
            <div className="space-y-5">
              {items.map((item) => {
                if (item.kind === "user") {
                  return <UserMessage key={item.id} text={item.text} />;
                }
                if (item.kind === "assistant") {
                  return (
                    <AssistantMessage
                      key={item.id}
                      text={item.text}
                      inputTokens={item.inputTokens}
                      outputTokens={item.outputTokens}
                    />
                  );
                }
                if (item.kind === "sub_agent") {
                  return <SubAgentAccordion key={item.id} turn={item.turn} />;
                }
                return <ToolStrip key={item.id} calls={item.calls} pending={item.pending} />;
              })}

              {stream.thinking && stream.phase === "thinking" && (
                <div className="flex gap-3">
                  <BotAvatar />
                  <div className="min-w-0 flex-1 rounded-2xl bg-muted/40 px-4 py-3">
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {stream.thinking}
                    </div>
                  </div>
                </div>
              )}

              {/* Inline approval prompt — renders when agent gates a destructive action */}
              {stream.approval && requestId && (
                <ApprovalDialog
                  projectId={projectId}
                  requestId={requestId}
                  payload={stream.approval}
                />
              )}

              {/* Inline clarification prompt — renders when agent asks for info */}
              {stream.clarify && requestId && (
                <ClarifyDialog
                  projectId={projectId}
                  requestId={requestId}
                  payload={stream.clarify}
                />
              )}

              {stream.error && (
                <div className="mx-auto max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {stream.error}
                </div>
              )}

              {stream.plan.length > 0 && (
                <div className="ml-11 max-w-md">
                  <PlanPanel plan={stream.plan} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scroll-to-bottom FAB */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="sticky bottom-3 flex justify-center"
            >
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={() => scrollToBottom()}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="border-t bg-background px-3 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-3">
        <div className="mx-auto max-w-3xl">
          <div
            className={cn(
              "flex items-end gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/20",
              isRunning && "opacity-70"
            )}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={
                stream.phase === "waiting"
                  ? "Yuqoridagi savolga javob bering…"
                  : isRunning
                  ? "Agent ishlamoqda…"
                  : "Xabar yozing…"
              }
              className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 placeholder:text-muted-foreground/60 focus:outline-none"
              disabled={isRunning}
            />
            {isRunning && requestId ? (
              <Button
                onClick={stopRun}
                disabled={pending}
                size="icon"
                variant="destructive"
                className="h-8 w-8 shrink-0 rounded-xl"
                aria-label="To'xtatish"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={() => send()}
                disabled={!input.trim() || pending}
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                aria-label="Yuborish"
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
          <div className="mt-1.5 flex min-h-4 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <UsageBadge refreshKey={usageKey} liveDelta={stream.liveTokens} />
            <span className="flex items-center gap-1" title="Tool chaqiruvlar soni">
              <Wrench className="h-3 w-3" />
              {toolCallCount}
            </span>
            <span className="flex items-center gap-1" title="Xabarlar soni">
              <MessageSquare className="h-3 w-3" />
              {msgCount}
            </span>
            <span className="flex min-w-0 items-center gap-1" title="Joriy loyiha">
              <Bot className="h-3 w-3 shrink-0" />
              <span className="max-w-[140px] truncate">{projectName}</span>
            </span>
            {isRunning &&
              stream.phase !== "waiting" &&
              (() => {
                // Priority: executing tool (amber) → tool being composed
                // mid-stream (sky "🔧 … yozilmoqda") → default reply (emerald).
                const tool = stream.currentTool;
                const pending = !tool ? stream.pendingTool : null;
                return (
                  <span
                    className={cn(
                      "flex items-center gap-1.5",
                      tool
                        ? "text-amber-500/90"
                        : pending
                          ? "text-sky-500/90"
                          : "text-emerald-500",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-1.5 w-1.5 animate-pulse rounded-full",
                        tool ? "bg-amber-400" : pending ? "bg-sky-400" : "bg-emerald-500",
                      )}
                    />
                    {tool ? (
                      <>
                        <span className="font-medium">{tool}</span>
                        <span className="text-muted-foreground/60">bajarilmoqda…</span>
                      </>
                    ) : pending ? (
                      <>
                        <span className="font-medium">🔧 {pending}</span>
                        <span className="text-muted-foreground/60">yozilmoqda…</span>
                      </>
                    ) : (
                      "Agent javob tayyorlamoqda"
                    )}
                  </span>
                );
              })()}
          </div>
        </div>
      </div>

    </>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
      <Bot className="h-4 w-4 text-primary" />
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
      </div>
    </motion.div>
  );
}

function AssistantMessage({
  text,
  inputTokens,
  outputTokens,
}: {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}) {
  const total = (inputTokens ?? 0) + (outputTokens ?? 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
    >
      <BotAvatar />
      <div className="min-w-0 flex-1">
        <MessageMarkdown className="pt-1">{text}</MessageMarkdown>
        {total > 0 && (
          <div className="mt-1 text-[11px] text-muted-foreground" title="Bu javob uchun sarflangan tokenlar (sub-agentlar bilan)">
            🔢 {total.toLocaleString()} token
            {inputTokens != null && outputTokens != null
              ? ` · ${inputTokens.toLocaleString()} in / ${outputTokens.toLocaleString()} out`
              : ""}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent sm:h-20 sm:w-20">
          <Sparkles className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
        </div>
        <h2 className="mb-1 text-lg font-semibold sm:text-xl">BotSpace Agent</h2>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Botingizni boshqarish, flow&apos;lar yaratish va foydalanuvchilar bilan ishlashda yordam beraman
        </p>
        <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              className="rounded-xl border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground active:scale-[0.98]"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
