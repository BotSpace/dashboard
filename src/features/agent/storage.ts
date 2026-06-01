import type { ChatTurn } from "./types";

/**
 * LocalStorage layout:
 *   bm.agent.threads:<projectId>             → ThreadMeta[] (ordered, newest first)
 *   bm.agent.thread:<projectId>:<threadId>   → { turns, lastSeq, finished }
 *   bm.agent.activeRun:<projectId>:<threadId> → { requestId, threadId }
 *
 * Per-project isolation keeps chats from leaking across bots.
 */

export type ThreadMeta = {
  id: string;
  title: string;
  lastUpdated: number;
};

export type ThreadData = {
  turns: ChatTurn[];
  lastSeq: number;
  finished: boolean;
};

export type ActiveRun = {
  requestId: string;
  threadId: string;
};

const HISTORY_LIMIT_PER_THREAD = 200;
const MAX_THREADS = 50;

// ── keys ─────────────────────────────────────────────────────────────────────

const threadsKey = (projectId: string) => `bm.agent.threads:${projectId}`;
const threadKey = (projectId: string, threadId: string) =>
  `bm.agent.thread:${projectId}:${threadId}`;
const activeKey = (projectId: string, threadId: string) =>
  `bm.agent.activeRun:${projectId}:${threadId}`;

// ── threads list ─────────────────────────────────────────────────────────────

export function loadThreads(projectId: string): ThreadMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(threadsKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isThreadMeta) : [];
  } catch {
    return [];
  }
}

function isThreadMeta(x: unknown): x is ThreadMeta {
  return (
    !!x &&
    typeof x === "object" &&
    typeof (x as ThreadMeta).id === "string" &&
    typeof (x as ThreadMeta).title === "string" &&
    typeof (x as ThreadMeta).lastUpdated === "number"
  );
}

export function saveThreads(projectId: string, list: ThreadMeta[]): void {
  if (typeof window === "undefined") return;
  const trimmed = list.slice(0, MAX_THREADS);
  try {
    localStorage.setItem(threadsKey(projectId), JSON.stringify(trimmed));
  } catch {
    /* quota — ignore */
  }
}

export function upsertThreadMeta(
  projectId: string,
  meta: ThreadMeta
): ThreadMeta[] {
  const existing = loadThreads(projectId);
  const without = existing.filter((t) => t.id !== meta.id);
  const next = [meta, ...without];
  saveThreads(projectId, next);
  return next;
}

export function renameThread(
  projectId: string,
  threadId: string,
  title: string
): ThreadMeta[] {
  const list = loadThreads(projectId);
  const updated = list.map((t) =>
    t.id === threadId ? { ...t, title, lastUpdated: Date.now() } : t
  );
  saveThreads(projectId, updated);
  return updated;
}

export function deleteThread(projectId: string, threadId: string): ThreadMeta[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(threadKey(projectId, threadId));
    localStorage.removeItem(activeKey(projectId, threadId));
  }
  const list = loadThreads(projectId).filter((t) => t.id !== threadId);
  saveThreads(projectId, list);
  return list;
}

export function clearAllThreads(projectId: string): void {
  if (typeof window === "undefined") return;
  // Remove every per-thread payload + active-run key, then the list itself.
  for (const t of loadThreads(projectId)) {
    localStorage.removeItem(threadKey(projectId, t.id));
    localStorage.removeItem(activeKey(projectId, t.id));
  }
  localStorage.removeItem(threadsKey(projectId));
}

// ── thread data (turns) ──────────────────────────────────────────────────────

export function loadThread(
  projectId: string,
  threadId: string
): ThreadData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(threadKey(projectId, threadId));
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

export function saveThread(
  projectId: string,
  threadId: string,
  data: ThreadData
): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed: ThreadData = {
      ...data,
      turns: data.turns.slice(-HISTORY_LIMIT_PER_THREAD),
    };
    localStorage.setItem(threadKey(projectId, threadId), JSON.stringify(trimmed));
  } catch {
    /* quota — ignore */
  }
}

// ── active run ───────────────────────────────────────────────────────────────

export function loadActiveRun(
  projectId: string,
  threadId: string
): ActiveRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(activeKey(projectId, threadId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.requestId === "string" &&
      typeof parsed.threadId === "string"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveActiveRun(
  projectId: string,
  threadId: string,
  run: ActiveRun | null
): void {
  if (typeof window === "undefined") return;
  const key = activeKey(projectId, threadId);
  if (run) {
    localStorage.setItem(key, JSON.stringify(run));
  } else {
    localStorage.removeItem(key);
  }
}

// ── thread id factory + title from prompt ────────────────────────────────────

export function newThreadId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Pick a sensible thread title from the first user prompt:
 * trim, collapse whitespace, slice to 50 chars.
 */
export function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Yangi suhbat";
  return cleaned.length > 50 ? cleaned.slice(0, 47) + "…" : cleaned;
}
