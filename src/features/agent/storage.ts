/**
 * Agent chat metadata helpers.
 *
 * Chat history is now stored ENTIRELY in the backend (Postgres: agent_runs /
 * agent_messages / agent_events, exposed via the /projects/{id}/threads API).
 * localStorage is no longer used — the frontend loads the thread list and each
 * thread's turns from the backend. Only pure, storage-less helpers remain here.
 */

export type ThreadMeta = {
  id: string;
  title: string;
  lastUpdated: number;
};

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
