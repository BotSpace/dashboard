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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Cpu,
  ListPlus,
  Archive,
  Brain,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Check,
  Pencil,
  ShieldCheck,
  CircleStop,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
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
import { ProjectPicker } from "./project-picker";
import { ThinkingEffortControl } from "./thinking-effort-control";
import { ThreadsSidebar } from "./threads-sidebar";
import { ToolStrip } from "./tool-strip";
import { SubAgentAccordion } from "./sub-agent-accordion";
import { RunStatusChip } from "./typing-indicator";
import { UsageBadge } from "./usage-badge";
import type {
  ChatTurn,
  ToolCallView,
  PlanItem,
} from "../types";
import type { Project } from "@/shared/types/api";
import { newThreadId, titleFromPrompt, type ThreadMeta } from "../storage";

/**
 * Pure upsert of a thread meta into a list, newest-first, deduped by id.
 * Chat history lives in the backend now (no localStorage); this only keeps the
 * in-memory sidebar list in sync while the user works.
 */
function upsertMeta(list: ThreadMeta[], meta: ThreadMeta): ThreadMeta[] {
  const rest = list.filter((t) => t.id !== meta.id);
  return [meta, ...rest]
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 50);
}

/** Map the backend thread list into the sidebar's ThreadMeta shape. */
function backendToMeta(
  backendRaw: { thread_id: string; title: string; updated_at: string }[],
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
  | {
      kind: "assistant";
      id: string;
      text: string;
      inputTokens?: number;
      outputTokens?: number;
      reasoning?: string;
    }
  | { kind: "tool-group"; id: string; calls: ToolCallView[]; pending: boolean }
  | { kind: "plan"; id: string; plan: PlanItem[] }
  | {
      kind: "sub_agent";
      id: string;
      turn: Extract<ChatTurn, { kind: "sub_agent" }>;
    };

function renderTurns(turns: ChatTurn[], phase: string): RenderItem[] {
  const items: RenderItem[] = [];
  let group: ToolCallView[] | null = null;
  let groupStartId = "";
  const flushGroup = (pending: boolean) => {
    if (group && group.length) {
      items.push({
        kind: "tool-group",
        id: `tg-${groupStartId}`,
        calls: group,
        pending,
      });
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

const PROJECT_SUGGESTIONS = [
  "Menga ism va telefon yig'adigan lead bot yaratib ber",
  "Collectiondan avtomatik yangilanadigan katalog yarat",
  "Botni boshidan oxirigacha tekshir va buzuq joylarini tuzat",
  "Buyurtma qabul qilib, tanlangan mahsulotni to'g'ri saqlaydigan bot yarat",
];

const GLOBAL_SUGGESTIONS = [
  "Yangi lead yig'adigan bot yaratib ber",
  "Mavjud botlarimdan qaysilarida xato borligini tekshir",
  "Leadlar uchun umumiy Board yaratib botga bog'la",
  "Menga mos dinamik katalog botini rejalashtir",
];

export function ChatPanel(props: Props) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <div className="grid h-full place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-md border bg-muted/40" />
          <span className="text-sm text-muted-foreground">Yuklanmoqda…</span>
        </div>
      </div>
    );
  }
  return <ChatPanelInner {...props} />;
}

function ChatPanelInner({ projectId, projects, initialPrompt }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlThreadId = searchParams.get("thread");
  // Chat history is backend-only. Always enter the page with a fresh thread;
  // existing threads are loaded only when explicitly selected or linked by URL.
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [threadId, setThreadId] = useState<string>(
    () => urlThreadId ?? newThreadId(),
  );
  const [historyThreadId, setHistoryThreadId] = useState<string | null>(
    urlThreadId,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateThreadUrl = (id: string | null, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("thread", id);
    else params.delete("thread");
    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    if (replace) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  };

  // Browser back/forward and a directly opened ?thread= URL must switch the
  // visible conversation as well; state-only switching makes links unusable.
  useEffect(() => {
    if (urlThreadId) {
      setThreadId(urlThreadId);
      setHistoryThreadId(urlThreadId);
      return;
    }
    if (historyThreadId !== null) {
      setThreadId(newThreadId());
      setHistoryThreadId(null);
    }
    // State changes are optimistic; only an actual URL change should run this
    // synchronizer, otherwise the old query briefly reverts a clicked thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlThreadId]);

  // Loading the sidebar must not replace the fresh default thread with history.
  useEffect(() => {
    let cancelled = false;
    listThreadsAction(projectId).then((res) => {
      if (cancelled || !res) return;
      setThreads(backendToMeta(res.threads));
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleNewThread = () => {
    setThreadId(newThreadId());
    setHistoryThreadId(null);
    setSidebarOpen(false);
    updateThreadUrl(null);
  };

  const handleSelectThread = (id: string) => {
    setThreadId(id);
    setHistoryThreadId(id);
    setSidebarOpen(false);
    updateThreadUrl(id);
  };

  const handleDeleteThread = (id: string) => {
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    if (id === threadId) {
      setThreadId(newThreadId());
      setHistoryThreadId(null);
      updateThreadUrl(null, true);
    }
    void deleteThreadAction(projectId, id);
  };

  const handleClearAllThreads = () => {
    setThreads([]);
    setThreadId(newThreadId());
    setHistoryThreadId(null);
    updateThreadUrl(null, true);
    void clearAllThreadsAction(projectId);
  };

  return (
    <div className="relative flex h-full overflow-hidden rounded-lg border bg-background">
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
          loadHistory={historyThreadId === threadId}
          initialPrompt={initialPrompt}
          onThreadsChange={setThreads}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onNewThread={handleNewThread}
          onThreadPersisted={() => updateThreadUrl(threadId, true)}
        />
      </div>
    </div>
  );
}

type ThreadProps = {
  projectId: string;
  projects: Project[];
  threadId: string;
  loadHistory: boolean;
  initialPrompt?: string;
  onThreadsChange: Dispatch<SetStateAction<ThreadMeta[]>>;
  onToggleSidebar: () => void;
  onNewThread: () => void;
  onThreadPersisted: () => void;
};

function ChatThread({
  projectId,
  projects,
  threadId,
  loadHistory,
  initialPrompt,
  onThreadsChange,
  onToggleSidebar,
  onNewThread,
  onThreadPersisted,
}: ThreadProps) {
  const [input, setInput] = useState(initialPrompt ?? "");
  const [requestId, setRequestId] = useState<string | null>(null);
  // Plan mode (Claude-Code style): the run researches + presents a plan without
  // building. When such a run ends, its final message (the plan) awaits approval.
  // Run mode: "agent" (normal), "plan" (research + present a plan, no build),
  // "full" (auto-approve destructive actions). Persisted per project.
  const [mode, setMode] = useState<"agent" | "plan" | "full">("agent");
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const planRunRef = useRef(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`agentMode:${projectId}`);
      if (saved === "plan" || saved === "full" || saved === "agent")
        setMode(saved);
    } catch {
      /* ignore */
    }
  }, [projectId]);
  useEffect(() => {
    try {
      localStorage.setItem(`agentMode:${projectId}`, mode);
    } catch {
      /* ignore */
    }
  }, [mode, projectId]);
  // Set when a refresh re-attaches to an in-flight run so the SSE reconnects
  // with the right seq cursor (replay only unseen events, no duplicate turns).
  const [resume, setResume] = useState<{
    requestId: string;
    sinceSeq: number;
  } | null>(null);
  // Messages typed while the agent is busy — sent one-by-one as each run ends.
  const [queue, setQueue] = useState<string[]>([]);
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
    // A fresh chat is only a client-side draft. Do not even request a backend
    // thread until the user sends its first message; run creation persists it.
    if (!loadHistory) return;
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
        // Refresh mid plan-run: plan mode is persisted per project, so if it's on
        // treat the resumed run as a plan run → its final message gets the approve
        // bar (read localStorage directly to avoid state-restore timing races).
        try {
          if (localStorage.getItem(`agentMode:${projectId}`) === "plan") {
            planRunRef.current = true;
          }
        } catch {
          /* ignore */
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, threadId, loadHistory]);

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

  // A discrete new turn (or phase change) → animate smoothly once.
  useEffect(() => {
    if (stickToBottomRef.current) scrollToBottom(true);
  }, [stream.turns.length, stream.phase]);

  // Streaming token growth (reply text AND thinking deltas) fires every few ms; a
  // fresh `smooth` animation on each token restarts and fights the previous one →
  // visible jitter on mobile. Follow the growing text with an INSTANT scroll
  // instead so it stays glued to the bottom without stutter.
  useEffect(() => {
    if (stickToBottomRef.current) scrollToBottom(false);
  }, [lastTurnLen, stream.thinking]);

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
    pending ||
    (!stream.finished && stream.phase !== "idle" && stream.phase !== "error");

  // Actually start a run for `msg`. Assumes the agent is idle (no active run).
  const doSend = (msg: string) => {
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
    const wasPlan = mode === "plan";
    planRunRef.current = wasPlan;
    start(async () => {
      const res = await startRunAction({
        projectId,
        prompt: msg,
        threadId,
        planMode: wasPlan,
        autoApprove: mode === "full",
      });
      if (!res.ok || !res.request_id) {
        toast.error(res.message ?? "Run boshlanmadi");
        planRunRef.current = false;
        return;
      }
      onThreadPersisted();
      setRequestId(res.request_id);
    });
  };

  // When a PLAN-mode run finishes, its final message is the plan → surface an
  // approve bar. Approving runs it for real (direct mode); editing dismisses it.
  useEffect(() => {
    if (isRunning || !planRunRef.current) return;
    planRunRef.current = false;
    const lastAssistant = [...stream.turns]
      .reverse()
      .find((t) => t.kind === "assistant");
    if (
      lastAssistant &&
      lastAssistant.kind === "assistant" &&
      lastAssistant.text.trim()
    ) {
      setPendingPlan(lastAssistant.text);
    }
    setMode("agent"); // after presenting a plan, drop to normal so approve executes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Submit handler: if the agent is busy, queue the message (auto-sent when the
  // run ends); otherwise send it right away.
  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    if (isRunning) {
      setQueue((q) => [...q, msg]);
    } else {
      doSend(msg);
    }
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  // Drain the queue: when the agent goes idle and messages are waiting, send the
  // next one. doSend flips the run back to busy, so this fires once per run end.
  useEffect(() => {
    if (!isRunning && queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      doSend(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, queue]);

  // After a reply completes, return focus to the input so the user can keep
  // typing without reaching for the mouse.
  useEffect(() => {
    if (stream.finished && !pending) inputRef.current?.focus();
  }, [stream.finished, pending]);

  // "Type to focus": pressing a printable key while not already in a field
  // focuses the input so the keystroke lands there (like a chat app).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return; // only printable single chars
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;
      // Don't steal focus from an open dialog (approval / clarify / sidebar).
      if (document.querySelector('[role="dialog"], [role="alertdialog"]'))
        return;
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    [stream.turns, stream.phase],
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
    [stream.turns],
  );

  const projectName = useMemo(
    () =>
      projectId === "global"
        ? "Umumiy"
        : (projects.find((p) => String(p.id) === projectId)?.name ??
          `#${projectId}`),
    [projectId, projects],
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
          <div className="flex h-7 w-7 items-center justify-center rounded-md border bg-muted/30">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
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
          <EmptyState onSend={send} projectSelected={projectId !== "global"} />
        ) : (
          <div className="mx-auto max-w-3xl px-3 pt-4 pb-28 sm:px-6 xl:max-w-5xl 2xl:max-w-6xl">
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
                      reasoning={item.reasoning}
                    />
                  );
                }
                if (item.kind === "sub_agent") {
                  return <SubAgentAccordion key={item.id} turn={item.turn} />;
                }
                if (item.kind === "plan") {
                  return null; // legacy step-checklist plans are no longer shown
                }
                return (
                  <ToolStrip
                    key={item.id}
                    calls={item.calls}
                    pending={item.pending}
                  />
                );
              })}

              {stream.thinking && stream.phase === "thinking" && (
                <LiveThinking text={stream.thinking} />
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
                <div className="mx-auto flex max-w-xl items-start gap-3 rounded-lg border bg-card px-4 py-3">
                  <div className="mt-0.5 rounded-md border bg-muted/20 p-1.5 text-destructive">
                    <CircleStop className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-destructive">
                      Jarayon bajarilmadi
                    </p>
                    <p className="mt-0.5 break-words text-xs text-muted-foreground">
                      {stream.error}
                    </p>
                  </div>
                </div>
              )}

              {stream.cancelled && (
                <div className="mx-auto flex max-w-xl items-center gap-3 rounded-lg border bg-card px-4 py-3 text-muted-foreground">
                  <div className="rounded-md border bg-muted/20 p-1.5">
                    <CircleStop className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Jarayon bekor qilindi
                    </p>
                    <p className="mt-0.5 text-xs">
                      Agent foydalanuvchi so‘roviga ko‘ra to‘xtatildi.
                    </p>
                  </div>
                </div>
              )}

              {stream.reconnecting && !stream.finished && (
                <div className="mx-auto flex max-w-xl items-center gap-3 rounded-lg border bg-card px-4 py-3 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Qayta ulanmoqda…</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Jarayon davom etmoqda, yangi eventlar avtomatik tiklanadi.
                    </p>
                  </div>
                </div>
              )}

              {stream.connectionError && !stream.finished && (
                <div className="mx-auto flex max-w-xl items-start gap-3 rounded-lg border bg-card px-4 py-3">
                  <div className="mt-0.5 rounded-md border bg-muted/20 p-1.5 text-destructive">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-destructive">
                      Live aloqa uzildi
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stream.connectionError}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8"
                      onClick={stream.retryConnection}
                    >
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      Qayta urinish
                    </Button>
                  </div>
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
                className="h-8 w-8 rounded-md"
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
        <div className="mx-auto max-w-3xl xl:max-w-5xl 2xl:max-w-6xl">
          {mode === "plan" && isRunning && !pendingPlan && (
            <div className="mb-2 flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5 animate-pulse" />
              Reja tuzilmoqda…
            </div>
          )}
          {pendingPlan && (
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-xs font-medium">Reja tayyor</span>
                <span className="text-xs text-muted-foreground">
                  — bajaraymi?
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 px-3.5 text-xs font-medium"
                  onClick={() => {
                    const plan = pendingPlan;
                    setPendingPlan(null);
                    doSend(`Ushbu rejani bajar:\n\n${plan}`);
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                  Tasdiqlash
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 px-3.5 text-xs"
                  onClick={() => setPendingPlan(null)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  O'zgartirish
                </Button>
              </div>
            </div>
          )}
          <div
            className={cn(
              "flex items-end gap-2 rounded-lg border bg-card px-3 py-2 transition-colors focus-within:border-foreground/30 focus-within:ring-1 focus-within:ring-ring",
              mode !== "agent" && "bg-muted/20",
            )}
          >
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as "agent" | "plan" | "full")}
            >
              <SelectTrigger
                title="Rejim: Agent (oddiy) / Plan (avval reja) / Full (barchasiga ruxsat)"
                className={cn(
                  "h-8 w-auto shrink-0 gap-1 rounded-md border-none bg-transparent px-2 text-xs font-medium text-muted-foreground shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60",
                  mode !== "agent" && "text-foreground",
                )}
              >
                {mode === "plan" ? (
                  <ClipboardList className="h-4 w-4" />
                ) : mode === "full" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                <span>
                  {mode === "plan"
                    ? "Plan"
                    : mode === "full"
                      ? "Full"
                      : "Agent"}
                </span>
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[13rem]">
                <SelectItem value="agent" className="text-xs">
                  <span className="flex items-center gap-2">
                    <Bot className="h-3.5 w-3.5" /> Agent — oddiy
                  </span>
                </SelectItem>
                <SelectItem value="plan" className="text-xs">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5" /> Plan — avval reja
                    tuzadi
                  </span>
                </SelectItem>
                <SelectItem value="full" className="text-xs">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> Full — barchasiga
                    ruxsat
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <textarea
              ref={inputRef}
              data-tour="agent-input"
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
                    ? "Yozing — navbatga qo'shiladi…"
                    : mode === "plan"
                      ? "Reja tuzish uchun vazifani yozing…"
                      : "Xabar yozing…"
              }
              className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {isRunning && requestId ? (
              <Button
                onClick={stopRun}
                disabled={pending}
                size="icon"
                variant="destructive"
                className="h-8 w-8 shrink-0 rounded-md"
                aria-label="To'xtatish"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={() => send()}
                disabled={!input.trim() || pending}
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md"
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
            {(() => {
              // Tokens used in THIS session (thread), updated in real time as the
              // agent works. Shown right next to the remaining-limit badge.
              const t = stream.sessionTokens + stream.liveTokens;
              if (t <= 0) return null;
              const label =
                t >= 1_000_000
                  ? `${(t / 1_000_000).toFixed(1)}M`
                  : t >= 1_000
                    ? `${Math.round(t / 1_000)}K`
                    : `${t}`;
              return (
                <span
                  className={cn(
                    "flex items-center gap-1 tabular-nums",
                    stream.liveTokens > 0 && "text-foreground",
                  )}
                  title={`Shu sessiyada ishlatilgan token (realtime): ${t.toLocaleString()}`}
                >
                  <Sparkles className="h-3 w-3 shrink-0" />
                  {label}
                </span>
              );
            })()}
            <span
              className="flex items-center gap-1"
              title="Tool chaqiruvlar soni"
            >
              <Wrench className="h-3 w-3" />
              {toolCallCount}
            </span>
            <span className="flex items-center gap-1" title="Xabarlar soni">
              <MessageSquare className="h-3 w-3" />
              {msgCount}
            </span>
            <span
              className="flex min-w-0 items-center gap-1"
              title="Joriy loyiha"
            >
              <Bot className="h-3 w-3 shrink-0" />
              <span className="max-w-[140px] truncate">{projectName}</span>
            </span>
            <ThinkingEffortControl projectId={projectId} />
            {(stream.model || stream.provider) && (
              <span
                className="flex min-w-0 items-center gap-1"
                title="Ishlayotgan model / provayder"
              >
                <Cpu className="h-3 w-3 shrink-0" />
                <span className="max-w-[200px] truncate">
                  {stream.provider ? `${stream.provider} · ` : ""}
                  {stream.model ?? "—"}
                </span>
              </span>
            )}
            {queue.length > 0 && (
              <span
                className="flex items-center gap-1 text-foreground"
                title="Navbatdagi xabarlar"
              >
                <ListPlus className="h-3 w-3 shrink-0" />
                {queue.length} navbatda
              </span>
            )}
            {stream.compacted && (
              <span
                className="flex items-center gap-1 text-muted-foreground/70"
                title="Kontekst to'lgani uchun eski suhbat ixcham xulosaga yig'ildi (yo'qotilmadi)"
              >
                <Archive className="h-3 w-3 shrink-0" />
                qisqartirildi
              </span>
            )}
            {isRunning &&
              stream.phase !== "waiting" &&
              (() => {
                // Keep the compact run state visible without introducing decorative color.
                const tool = stream.currentTool;
                const pending = !tool ? stream.pendingTool : null;
                return (
                  <span
                    className={cn(
                      "flex min-w-0 max-w-full shrink items-center gap-1.5",
                      "text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full",
                        "bg-foreground",
                      )}
                    />
                    {tool ? (
                      <>
                        <span className="max-w-[110px] truncate font-medium">
                          {tool}
                        </span>
                        <span className="shrink-0 text-muted-foreground/60">
                          bajarilmoqda…
                        </span>
                      </>
                    ) : pending ? (
                      <>
                        <span className="max-w-[110px] truncate font-medium">
                          🔧 {pending}
                        </span>
                        <span className="shrink-0 text-muted-foreground/60">
                          yozilmoqda…
                        </span>
                      </>
                    ) : (
                      <span className="whitespace-nowrap">
                        Agent javob tayyorlamoqda
                      </span>
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
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/30">
      <Bot className="h-4 w-4 text-muted-foreground" />
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/30">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {text}
        </div>
      </div>
    </motion.div>
  );
}

// Live reasoning stream: a short fixed-height window (~5 lines) that keeps the
// newest text at the bottom and lets older lines scroll up and fade out. No card
// background — it blends into the page.
function LiveThinking({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [text]);
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="min-w-0 flex-1">
        <div className="mb-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
          <Brain className="h-3 w-3 animate-pulse" /> Fikrlaymoqda…
        </div>
        <div
          ref={ref}
          className="max-h-[6.5rem] overflow-y-auto whitespace-pre-wrap text-xs leading-5 text-muted-foreground/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 1.75rem)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 1.75rem)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function ReasoningDisclosure({ reasoning }: { reasoning: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <Brain className="h-3 w-3" />
        Fikrlash
      </button>
      {open && (
        <div className="mt-1 whitespace-pre-wrap border-l-2 border-muted pl-3 text-xs leading-5 text-muted-foreground/70">
          {reasoning}
        </div>
      )}
    </div>
  );
}

function AssistantMessage({
  text,
  inputTokens,
  outputTokens,
  reasoning,
}: {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  reasoning?: string;
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
        {reasoning ? <ReasoningDisclosure reasoning={reasoning} /> : null}
        <MessageMarkdown className="pt-1">{text}</MessageMarkdown>
        {total > 0 && (
          <div
            className="mt-1 text-[11px] text-muted-foreground"
            title="Bu javob uchun sarflangan tokenlar (sub-agentlar bilan)"
          >
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

function EmptyState({
  onSend,
  projectSelected,
}: {
  onSend: (text: string) => void;
  projectSelected: boolean;
}) {
  const suggestions = projectSelected
    ? PROJECT_SUGGESTIONS
    : GLOBAL_SUGGESTIONS;
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border bg-muted/30 sm:h-14 sm:w-14">
          <Sparkles className="h-6 w-6 text-muted-foreground sm:h-7 sm:w-7" />
        </div>
        <h2 className="mb-1 text-lg font-semibold sm:text-xl">
          BotSpace Agent
        </h2>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Botingizni boshqarish, flow&apos;lar yaratish va foydalanuvchilar
          bilan ishlashda yordam beraman
        </p>
        <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              className="rounded-md border bg-card px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted/20 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
