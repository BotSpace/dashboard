"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
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
import { RunStatusChip, TypingIndicator } from "./typing-indicator";
import { UsageBadge } from "./usage-badge";
import type { ChatTurn, ToolCallView } from "../types";
import type { Project } from "@/shared/types/api";
import {
  deleteThread,
  clearAllThreads,
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

/**
 * Merges backend thread list with localStorage list.
 * Backend entries take precedence for title/lastUpdated.
 * Result is sorted newest-first and deduplicated by id.
 */
function mergeThreadLists(
  local: ThreadMeta[],
  backendRaw: { thread_id: string; title: string; updated_at: string }[]
): ThreadMeta[] {
  const map = new Map<string, ThreadMeta>();
  // Start with local entries as the base
  for (const t of local) {
    map.set(t.id, t);
  }
  // Backend entries overwrite local ones (backend is source of truth for title/time)
  for (const b of backendRaw) {
    const ts = new Date(b.updated_at).getTime();
    const existing = map.get(b.thread_id);
    map.set(b.thread_id, {
      id: b.thread_id,
      title: b.title || existing?.title || "Suhbat",
      lastUpdated: isNaN(ts) ? (existing?.lastUpdated ?? Date.now()) : ts,
    });
  }
  return Array.from(map.values()).sort((a, b) => b.lastUpdated - a.lastUpdated);
}

type Props = {
  projectId: string;
  projects: Project[];
  initialPrompt?: string;
};

type RenderItem =
  | { kind: "user"; id: string; text: string }
  | { kind: "assistant"; id: string; text: string }
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

function pickInitialThreadId(projectId: string): string {
  const list = loadThreads(projectId);
  return list[0]?.id ?? newThreadId();
}

function ChatPanelInner({ projectId, projects, initialPrompt }: Props) {
  const [threads, setThreads] = useState<ThreadMeta[]>(() => loadThreads(projectId));
  const [threadId, setThreadId] = useState<string>(() => pickInitialThreadId(projectId));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // On mount: fetch backend thread list and merge with localStorage
  useEffect(() => {
    let cancelled = false;
    listThreadsAction(projectId).then((res) => {
      if (cancelled || !res) return;
      const local = loadThreads(projectId);
      const merged = mergeThreadLists(local, res.threads);
      setThreads(merged);
      // Persist merged list back to localStorage as write-through cache
      // (import saveThreads lazily to avoid circular issues — it's already imported via storage)
      try {
        localStorage.setItem(
          `bm.agent.threads:${projectId}`,
          JSON.stringify(merged.slice(0, 50))
        );
      } catch {
        /* quota — ignore */
      }
      // If current threadId is not in merged list and merged list is non-empty,
      // keep it (the user might have just created it locally).
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleNewThread = () => {
    setThreadId(newThreadId());
    setSidebarOpen(false);
  };

  const handleSelectThread = (id: string) => {
    setThreadId(id);
    setSidebarOpen(false);
  };

  const handleDeleteThread = (id: string) => {
    const next = deleteThread(projectId, id);
    setThreads(next);
    if (id === threadId) {
      setThreadId(next[0]?.id ?? newThreadId());
    }
    // Also delete on the backend — otherwise the next mount's listThreadsAction
    // merge re-adds it and the deletion "comes back" on refresh.
    void deleteThreadAction(projectId, id);
  };

  const handleClearAllThreads = () => {
    clearAllThreads(projectId);
    setThreads([]);
    setThreadId(newThreadId());
    // Wipe on the backend too so the merge on next mount doesn't restore them.
    void clearAllThreadsAction(projectId);
  };

  return (
    <div className="relative flex h-full overflow-hidden rounded-xl border border-border bg-background">
      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-border md:block">
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
  onThreadsChange: (threads: ThreadMeta[]) => void;
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
  const [stored] = useState(() => loadActiveRun(projectId, threadId));
  const [initialThread] = useState(() => loadThread(projectId, threadId));
  const [input, setInput] = useState(initialPrompt ?? "");
  const [requestId, setRequestId] = useState<string | null>(stored?.requestId ?? null);
  const [pending, start] = useTransition();
  const [usageKey, setUsageKey] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const backendLoadedRef = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stream = useAgentStream({
    projectId,
    requestId,
    initialTurns: initialThread?.turns,
    initialSeq: initialThread?.lastSeq ?? 0,
    initialFinished: initialThread?.finished ?? false,
    onPersist: (snapshot) =>
      saveThread(projectId, threadId, {
        turns: snapshot.turns,
        lastSeq: snapshot.lastSeq,
        finished: snapshot.finished,
      }),
  });

  // Load history from backend when local turns are absent and there is no
  // active streaming run in progress (to avoid disturbing live SSE).
  useEffect(() => {
    // Skip if: already have local turns, active run exists, already attempted
    if (backendLoadedRef.current) return;
    if (initialThread?.turns && initialThread.turns.length > 0) return;
    if (stored?.requestId) return;
    backendLoadedRef.current = true;

    let cancelled = false;
    loadThreadHistoryAction(projectId, threadId).then((res) => {
      if (cancelled || !res || res.turns.length === 0) return;
      // Map backend turns to ChatTurn format (they are already compatible)
      const turns = res.turns as unknown as ChatTurn[];
      // Inject into stream state (only applies if stream is still idle/empty)
      stream.seedTurnsFromBackend(turns);
      // Write-through cache: persist to localStorage so next open is instant
      saveThread(projectId, threadId, {
        turns,
        lastSeq: 0,
        finished: true,
      });
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, threadId]);

  useEffect(() => {
    if (stream.finished && requestId) {
      saveActiveRun(projectId, threadId, null);
    }
  }, [stream.finished, requestId, projectId, threadId]);

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

  useEffect(() => {
    if (stickToBottomRef.current) scrollToBottom();
  }, [stream.turns.length, stream.thinking, stream.phase]);

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

    const existingMeta = loadThreads(projectId).find((t) => t.id === threadId);
    const title = existingMeta?.title ?? titleFromPrompt(msg);
    const updated = upsertThreadMeta(projectId, {
      id: threadId,
      title,
      lastUpdated: Date.now(),
    });
    onThreadsChange(updated);

    stream.pushUserTurn(msg);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    start(async () => {
      const res = await startRunAction({ projectId, prompt: msg, threadId });
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

  const isEmpty = items.length === 0 && !isRunning;

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <>
      {/* Header — mockup: 62px, gradient avatar, name + green dot, subtitle */}
      <header className="flex h-[62px] shrink-0 items-center gap-3 border-b border-border px-4 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={onToggleSidebar}
          aria-label="Suhbatlar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>

        {/* Bot identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary/70">
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <div
              className="flex items-center gap-2 text-[15.5px] font-semibold"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              BotSpace Agent
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500 shadow-[0_0_7px_theme(colors.emerald.500)]" />
              </span>
            </div>
            <div className="text-[12px] text-muted-foreground">
              Botingizni boshqarish va flow yaratishda yordam beraman
            </div>
          </div>
        </div>

        <RunStatusChip
          phase={stream.phase}
          currentTool={stream.currentTool}
          currentSubAgent={stream.currentSubAgent}
        />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <UsageBadge refreshKey={usageKey} />
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
          <div className="mx-auto max-w-[760px] px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-[18px]">
              {items.map((item) => {
                if (item.kind === "user") {
                  return <UserMessage key={item.id} text={item.text} />;
                }
                if (item.kind === "assistant") {
                  return <AssistantMessage key={item.id} text={item.text} />;
                }
                if (item.kind === "sub_agent") {
                  return <SubAgentAccordion key={item.id} turn={item.turn} />;
                }
                return <ToolStrip key={item.id} calls={item.calls} pending={item.pending} />;
              })}

              {stream.thinking && stream.phase === "thinking" && (
                <div className="flex gap-[11px]">
                  <BotAvatar />
                  <div className="max-w-[80%] rounded-[4px_14px_14px_14px] border border-border bg-muted/5 px-4 py-3">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {stream.thinking}
                    </div>
                  </div>
                </div>
              )}

              <TypingIndicator
                phase={stream.phase}
                currentTool={stream.currentSubAgent ? stream.currentTool : null}
                currentSubAgent={stream.currentSubAgent}
              />

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
                <div className="ml-[41px] max-w-md">
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

      {/* Input area — mockup: prompt chips + textarea + send button */}
      <div className="shrink-0 border-t border-border bg-background px-5 pb-5 pt-3.5 sm:px-6">
        <div className="mx-auto max-w-[760px]">
          {/* Prompt suggestion chips — shown only when idle/empty */}
          {!isRunning && items.length === 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="flex items-center gap-1.5 rounded-[9px] border border-border bg-muted/5 px-3 py-2 text-[12.5px] text-muted-foreground transition-all hover:border-primary/35 hover:bg-primary/5 hover:text-foreground"
                >
                  <Sparkles className="h-[15px] w-[15px] shrink-0 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Composer box */}
          <div
            className={cn(
              "flex items-end gap-2.5 rounded-[14px] border border-border bg-muted/5 px-4 py-2.5 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
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
              className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-[14px] leading-[1.5] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              disabled={isRunning}
            />
            {isRunning && requestId ? (
              <button
                type="button"
                onClick={stopRun}
                disabled={pending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-destructive text-white transition-all hover:brightness-110 disabled:opacity-50"
                aria-label="To'xtatish"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || pending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary/80 text-white transition-all hover:brightness-110 disabled:opacity-40"
                aria-label="Yuborish"
              >
                {pending ? (
                  <Loader2 className="h-[15px] w-[15px] animate-spin" />
                ) : (
                  <Send className="h-[15px] w-[15px]" />
                )}
              </button>
            )}
          </div>

          {isRunning && stream.phase !== "waiting" && (
            <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>Agent javob tayyorlamoqda</span>
            </div>
          )}
        </div>
      </div>

    </>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-primary/70">
      <Sparkles className="h-[15px] w-[15px] text-white" />
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div className="max-w-[78%] rounded-[14px_14px_4px_14px] bg-gradient-to-br from-primary to-primary/80 px-4 py-3 text-[14px] leading-[1.55] text-white">
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </motion.div>
  );
}

function AssistantMessage({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-[11px]"
    >
      <BotAvatar />
      <div className="max-w-[80%] rounded-[4px_14px_14px_14px] border border-border bg-muted/5 px-4 py-3 text-[14px] leading-[1.6] text-foreground">
        <MessageMarkdown className="min-w-0">{text}</MessageMarkdown>
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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary to-primary/70 sm:h-20 sm:w-20 sm:rounded-[22px]">
          <Sparkles className="h-8 w-8 text-white sm:h-10 sm:w-10" />
        </div>
        <h2
          className="mb-1 text-lg font-semibold sm:text-xl"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          BotSpace Agent
        </h2>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Botingizni boshqarish, flow&apos;lar yaratish va foydalanuvchilar bilan ishlashda yordam beraman
        </p>
        <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              className="flex items-center gap-2 rounded-[9px] border border-border bg-muted/5 px-4 py-3 text-left text-[12.5px] text-muted-foreground transition-all hover:border-primary/35 hover:bg-primary/5 hover:text-foreground active:scale-[0.98]"
            >
              <Sparkles className="h-[15px] w-[15px] shrink-0 text-primary" />
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
