"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentEvent,
  AgentEventType,
  ChatTurn,
  PlanItem,
  ApprovalPayload,
  ClarifyPayload,
  SubAgentTurn,
  ToolCallView,
} from "./types";

type Args = {
  projectId: string;
  requestId: string | null;
  initialTurns?: ChatTurn[];
  initialSeq?: number;
  /** Persisted "run finished" flag from the previous session (refresh). */
  initialFinished?: boolean;
  /**
   * Re-attach to an in-flight run after a page refresh. When `requestId`
   * matches, the SSE reconnects with `since_seq=sinceSeq` so only events the
   * seeded history hasn't already shown are replayed (no duplicate turns).
   */
  resume?: { requestId: string; sinceSeq: number } | null;
  onPersist?: (snapshot: {
    turns: ChatTurn[];
    lastSeq: number;
    finished: boolean;
  }) => void;
};

type RunPhase =
  "idle" | "queued" | "thinking" | "tool" | "waiting" | "done" | "error";

export type CurrentSubAgent = {
  id: string;
  name: string;
};

type State = {
  turns: ChatTurn[];
  plan: PlanItem[];
  approval: ApprovalPayload | null;
  clarify: ClarifyPayload | null;
  usageRefreshTick: number;
  /** This run's cumulative tokens (in+out) from live `token_usage` events. */
  liveTokens: number;
  /** Tokens from all FINISHED runs in this session (thread). Session realtime
   * usage = sessionTokens + liveTokens. */
  sessionTokens: number;
  finished: boolean;
  error: string | null;
  cancelled: boolean;
  reconnecting: boolean;
  connectionError: string | null;
  thinking: string;
  phase: RunPhase;
  currentTool: string | null;
  /** Name of a tool the model is still COMPOSING mid-stream (tool_call_pending),
   * shown as "🔧 <name> yozilmoqda…" until its real tool_call fires. */
  pendingTool: string | null;
  currentSubAgent: CurrentSubAgent | null;
  /** Id of the assistant turn currently being streamed token-by-token via
   * `assistant_chunk`; null when no reply is streaming. The final
   * `assistant_message` finalizes this turn instead of appending a new one. */
  streamingId: string | null;
  /** Model + provider that produced the latest reply (from assistant_message /
   * run_started) — surfaced in the footer so the user sees what's running. */
  model: string | null;
  provider: string | null;
  /** True once the agent has compacted older context into a summary this run. */
  compacted: boolean;
  /** Id of the inline plan turn for the current run (plan_update refreshes it). */
  planTurnId: string | null;
};

/**
 * Marks any unfinished sub-agent turns as finished so the UI stops showing
 * "ishlamoqda" after the run terminated/aborted. Steps still in-flight
 * (result === undefined) are left as-is; the accordion treats a finished
 * turn with no summary as "bajarildi" (ok=true by default unless already set).
 * Returns the same array reference when nothing changed.
 */
function closeDanglingSubAgents(turns: ChatTurn[]): ChatTurn[] {
  let changed = false;
  const out = turns.map((t) => {
    if (t.kind === "sub_agent" && !t.finished) {
      changed = true;
      return { ...t, finished: true, ok: t.ok ?? true };
    }
    return t;
  });
  return changed ? out : turns;
}

export function useAgentStream({
  projectId,
  requestId,
  initialTurns,
  initialSeq,
  initialFinished,
  resume,
  onPersist,
}: Args) {
  // Refresh paytida oldingi sessiya "tugagan" bo'lsa, tugallanmagan
  // sub_agent turn'larni darhol yopamiz — aks holda accordion "ishlamoqda"
  // holatida osilib qoladi (backend run allaqachon tugagan, yangi event yo'q).
  const restoredTurns = initialFinished
    ? closeDanglingSubAgents(initialTurns ?? [])
    : (initialTurns ?? []);
  const [state, setState] = useState<State>({
    turns: restoredTurns,
    plan: [],
    approval: null,
    clarify: null,
    usageRefreshTick: 0,
    liveTokens: 0,
    sessionTokens: 0,
    finished: Boolean(initialFinished),
    error: null,
    cancelled: false,
    reconnecting: false,
    connectionError: null,
    thinking: "",
    phase: initialFinished ? "done" : "idle",
    currentTool: null,
    pendingTool: null,
    currentSubAgent: null,
    streamingId: null,
    model: null,
    provider: null,
    compacted: false,
    planTurnId: null,
  });
  const esRef = useRef<EventSource | null>(null);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const reconnectDeadlineRef = useRef<number | null>(null);
  const finishedRef = useRef(Boolean(initialFinished));
  const toolViewMap = useRef<Record<string, ToolCallView>>({});
  // Map sub_agent_id → ChatTurn id (so child tool_call/result events can be
  // routed into the SubAgentAccordion they belong to instead of bubbling up
  // to the main chat).
  const subAgentTurnIdMap = useRef<Record<string, string>>({});
  const lastSeqRef = useRef<number>(initialSeq ?? 0);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;
  // Kept in a ref so the connect effect can read the latest resume target
  // without re-running when `resume` changes on an unrelated render.
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  const close = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  useEffect(() => {
    if (!requestId) return;
    // Oldingi sessiya allaqachon tugagan (refresh + run finished/abort) — o'lik
    // run'ning SSE'siga ulanmaymiz. Aks holda phase "queued"ga o'tib osilardi.
    if (finishedRef.current) return;
    // On refresh, re-attach to the in-flight run: prime the seq cursor from the
    // resume target (only when it belongs to THIS run — a fresh prompt gets a
    // new requestId, so a stale resume never skips its opening events).
    const rsm = resumeRef.current;
    if (
      rsm &&
      rsm.requestId === requestId &&
      rsm.sinceSeq > (lastSeqRef.current ?? 0)
    ) {
      lastSeqRef.current = rsm.sinceSeq;
    }
    const sinceSeq = lastSeqRef.current ?? 0;
    const url =
      `/api/agent/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/events` +
      (sinceSeq > 0 ? `?since_seq=${sinceSeq}` : "");
    const es = new EventSource(url);
    esRef.current = es;
    finishedRef.current = false;
    toolViewMap.current = {};
    subAgentTurnIdMap.current = {};
    // Rebuild tool view map from any restored tool turns so a tool_result
    // arriving in replay can be matched to its earlier tool_call.
    setState((s) => {
      for (const t of s.turns) {
        if (t.kind === "tool") {
          toolViewMap.current[t.call.id] = t.call;
        } else if (t.kind === "sub_agent") {
          subAgentTurnIdMap.current[t.sub_agent_id] = t.id;
          for (const step of t.steps) {
            // Only tool steps go in the result-match map (narration has no name).
            if (!("narration" in step)) toolViewMap.current[step.id] = step;
          }
        }
      }
      return {
        ...s,
        phase: s.finished ? s.phase : s.phase === "idle" ? "queued" : s.phase,
        error: null,
      };
    });

    let reconnectTimer: number | undefined;
    let failureTimer: number | undefined;
    const armFailureTimeout = () => {
      if (reconnectDeadlineRef.current === null) {
        reconnectDeadlineRef.current = Date.now() + 12_000;
      }
      if (failureTimer !== undefined) window.clearTimeout(failureTimer);
      const remaining = Math.max(0, reconnectDeadlineRef.current - Date.now());
      failureTimer = window.setTimeout(() => {
        es.close();
        setState((s) => ({
          ...s,
          reconnecting: false,
          connectionError:
            "Agent bilan live aloqa tiklanmadi. Internetni tekshirib, qayta urinib ko‘ring.",
        }));
      }, remaining);
    };
    if (reconnectDeadlineRef.current !== null) armFailureTimeout();

    es.onopen = () => {
      reconnectDeadlineRef.current = null;
      if (failureTimer !== undefined) window.clearTimeout(failureTimer);
      setState((s) =>
        s.reconnecting || s.connectionError
          ? { ...s, reconnecting: false, connectionError: null }
          : s,
      );
    };

    const handler = (type: AgentEventType) => (e: MessageEvent) => {
      let ev: AgentEvent;
      try {
        // Agent sends: {"seq": N, "type": "...", "payload": {...}, "at": "..."}.
        // SSE data is the whole envelope — unwrap `payload` so consumers see it directly.
        const parsed = JSON.parse(e.data);
        const isEnvelope =
          parsed &&
          typeof parsed === "object" &&
          "payload" in parsed &&
          "type" in parsed;
        ev = isEnvelope
          ? {
              seq: parsed.seq,
              type: (parsed.type ?? type) as AgentEventType,
              payload: parsed.payload ?? {},
              at: parsed.at,
            }
          : { type, payload: parsed ?? {} };
      } catch {
        ev = { type, payload: { raw: e.data } };
      }
      apply(ev);
    };

    const apply = (ev: AgentEvent) => {
      // Reconnects can replay events from the old `since_seq` URL. Ignore
      // anything already applied so messages/tool calls are never duplicated.
      if (
        typeof ev.seq === "number" &&
        ev.seq > 0 &&
        ev.seq <= lastSeqRef.current
      )
        return;
      if (typeof ev.seq === "number" && ev.seq > lastSeqRef.current) {
        lastSeqRef.current = ev.seq;
      }
      setState((s) => {
        reconnectDeadlineRef.current = null;
        if (failureTimer !== undefined) window.clearTimeout(failureTimer);
        const next = {
          ...s,
          reconnecting: false,
          connectionError: null,
        };
        switch (ev.type) {
          case "run_started": {
            next.error = null;
            next.cancelled = false;
            next.phase = "thinking";
            next.currentTool = null;
            next.pendingTool = null;
            next.liveTokens = 0;
            next.streamingId = null;
            const rp = ev.payload as { provider?: string };
            if (rp.provider) next.provider = rp.provider;
            next.compacted = false;
            next.planTurnId = null;
            break;
          }
          case "context_compacted":
            next.compacted = true;
            break;
          case "tool_call_pending": {
            // Model is mid-stream composing a tool call — show its name before
            // the real tool_call/execution. Sub-agents don't stream, so main only.
            const p = ev.payload as { name?: string; sub_agent_id?: string };
            if (!p.name || p.sub_agent_id) break;
            next.pendingTool = p.name;
            next.phase = "thinking";
            break;
          }
          case "assistant_chunk": {
            // Live token delta for the main agent's reply (ephemeral, not
            // persisted). Build/append the streaming assistant turn so text
            // renders as it arrives; sub-agent chunks aren't streamed.
            const p = ev.payload as { delta?: string; sub_agent_id?: string };
            const delta = p.delta ?? "";
            if (!delta || p.sub_agent_id) break;
            if (s.streamingId) {
              const id = s.streamingId;
              next.turns = s.turns.map((t) =>
                t.kind === "assistant" && t.id === id
                  ? { ...t, text: t.text + delta }
                  : t,
              );
            } else {
              const id = `stream-${requestId ?? "x"}-${Date.now()}-${s.turns.length}`;
              next.streamingId = id;
              next.turns = [...s.turns, { kind: "assistant", id, text: delta }];
            }
            next.thinking = "";
            next.phase = "thinking";
            break;
          }
          case "thinking_delta": {
            const delta = (ev.payload as { delta?: string }).delta ?? "";
            next.thinking = s.thinking + delta;
            next.phase = "thinking";
            break;
          }
          case "assistant_message": {
            const p = ev.payload as {
              text?: string;
              sub_agent_id?: string;
              model?: string;
              provider?: string;
              reasoning?: string;
            };
            const text = p.text ?? "";
            // Reasoning to attach to the finalized main-agent turn: prefer the
            // authoritative payload, fall back to what streamed live this turn.
            const reasoning = p.sub_agent_id
              ? undefined
              : p.reasoning || s.thinking || undefined;
            // Track the main agent's current model + provider for the footer.
            if (!p.sub_agent_id) {
              if (p.model) next.model = p.model;
              if (p.provider) next.provider = p.provider;
            }
            if (
              text &&
              p.sub_agent_id &&
              subAgentTurnIdMap.current[p.sub_agent_id]
            ) {
              // Sub-agent narrate matni — accordion ichida tool qadamlari
              // orasida (xronologik) ko'rsatamiz.
              const turnId = subAgentTurnIdMap.current[p.sub_agent_id];
              const narration = {
                id: `narr-${ev.seq ?? Date.now()}`,
                narration: text,
              };
              next.turns = s.turns.map((t) =>
                t.kind === "sub_agent" && t.id === turnId
                  ? { ...t, steps: [...t.steps, narration] }
                  : t,
              );
            } else if (!p.sub_agent_id) {
              // Main agent turn. If it was streamed via assistant_chunk,
              // finalize THAT turn with the authoritative final text (no
              // duplicate); otherwise append a fresh turn (non-streamed path).
              const streamId = s.streamingId;
              if (streamId) {
                next.turns = s.turns.map((t) =>
                  t.kind === "assistant" && t.id === streamId
                    ? {
                        ...t,
                        text: text || t.text,
                        ...(reasoning ? { reasoning } : {}),
                      }
                    : t,
                );
                next.streamingId = null;
              } else if (text) {
                next.turns = [
                  ...s.turns,
                  {
                    kind: "assistant",
                    id: `a-${requestId ?? "x"}-${ev.seq ?? Date.now()}-${s.turns.length}`,
                    text,
                    ...(reasoning ? { reasoning } : {}),
                  },
                ];
              }
            }
            next.thinking = "";
            // Stay in `thinking` — the model might dispatch tools next.
            next.phase = "thinking";
            break;
          }
          case "tool_call": {
            const p = ev.payload as {
              id?: string;
              name?: string;
              arguments?: Record<string, unknown>;
              hidden?: boolean;
              sub_agent_id?: string;
            };
            if (!p.id || !p.name) break;
            // Real tool call dispatched — the "yozilmoqda…" pending state is over.
            next.pendingTool = null;
            // `task.run` main agent tomonidan chaqirilsa, uning natijasi
            // SubAgentAccordion (sub_agent_started/finished orqali) sifatida
            // ko'rsatiladi. Tool-strip'da takror chiqarmaymiz — `hidden=true`.
            const isTaskRun = p.name === "task.run" && !p.sub_agent_id;
            const view: ToolCallView = {
              id: p.id,
              name: p.name,
              arguments: p.arguments ?? {},
              hidden: Boolean(p.hidden) || isTaskRun,
            };
            toolViewMap.current[p.id] = view;
            // Sub-agent ichida — accordion ostiga joylaymiz
            if (p.sub_agent_id && subAgentTurnIdMap.current[p.sub_agent_id]) {
              const turnId = subAgentTurnIdMap.current[p.sub_agent_id];
              next.turns = s.turns.map((t) =>
                t.kind === "sub_agent" && t.id === turnId
                  ? {
                      ...t,
                      steps: [...t.steps, view],
                      toolCalls: t.toolCalls + 1,
                    }
                  : t,
              );
              next.phase = "tool";
              next.currentTool = `${p.name}`;
              break;
            }
            // Main agent tool_call (task.run bundan mustasno — accordion ko'rsatadi)
            if (!view.hidden) {
              next.turns = [
                ...s.turns,
                { kind: "tool", id: `t-${p.id}`, call: view },
              ];
              next.phase = "tool";
              next.currentTool = p.name;
            }
            break;
          }
          case "sub_agent_started": {
            const p = ev.payload as {
              sub_agent_id?: string;
              name?: string;
              description?: string;
              prompt?: string;
            };
            if (!p.sub_agent_id || !p.name) break;
            const turnId = `sa-${p.sub_agent_id}`;
            subAgentTurnIdMap.current[p.sub_agent_id] = turnId;
            const turn: SubAgentTurn = {
              kind: "sub_agent",
              id: turnId,
              sub_agent_id: p.sub_agent_id,
              name: p.name,
              description: p.description,
              prompt: p.prompt ?? "",
              steps: [],
              toolCalls: 0,
              finished: false,
            };
            next.turns = [...s.turns, turn];
            next.phase = "tool";
            next.currentTool = null;
            next.currentSubAgent = { id: p.sub_agent_id, name: p.name };
            break;
          }
          case "sub_agent_finished": {
            const p = ev.payload as {
              sub_agent_id?: string;
              ok?: boolean;
              summary?: string;
              tool_calls?: number;
            };
            if (!p.sub_agent_id) break;
            const turnId = subAgentTurnIdMap.current[p.sub_agent_id];
            if (!turnId) break;
            next.turns = s.turns.map((t) =>
              t.kind === "sub_agent" && t.id === turnId
                ? {
                    ...t,
                    finished: true,
                    ok: p.ok,
                    summary: p.summary,
                    toolCalls: p.tool_calls ?? t.toolCalls,
                  }
                : t,
            );
            next.phase = "thinking";
            next.currentTool = null;
            // Faqat shu sub-agent tugagan bo'lsa, currentSubAgent'ni tozalaymiz
            if (s.currentSubAgent && s.currentSubAgent.id === p.sub_agent_id) {
              next.currentSubAgent = null;
            }
            break;
          }
          case "plan_set": {
            const p = ev.payload as { plan?: PlanItem[] };
            if (Array.isArray(p.plan)) {
              next.plan = p.plan;
              // Render the plan inline in the message flow, at the point it was
              // created. plan_update refreshes this same turn.
              if (s.planTurnId) {
                next.turns = s.turns.map((t) =>
                  t.kind === "plan" && t.id === s.planTurnId
                    ? { ...t, plan: p.plan! }
                    : t,
                );
              } else {
                const id = `plan-${requestId ?? "x"}-${ev.seq ?? Date.now()}`;
                next.planTurnId = id;
                next.turns = [...s.turns, { kind: "plan", id, plan: p.plan }];
              }
            }
            next.phase = "thinking";
            break;
          }
          case "plan_update": {
            const p = ev.payload as { plan?: PlanItem[]; item?: PlanItem };
            let newPlan = s.plan;
            if (Array.isArray(p.plan)) {
              newPlan = p.plan;
            } else if (p.item?.id) {
              newPlan = s.plan.map((item) =>
                item.id === p.item?.id ? p.item! : item,
              );
            }
            next.plan = newPlan;
            if (s.planTurnId) {
              next.turns = s.turns.map((t) =>
                t.kind === "plan" && t.id === s.planTurnId
                  ? { ...t, plan: newPlan }
                  : t,
              );
            }
            next.phase = "thinking";
            break;
          }
          case "tool_result": {
            const p = ev.payload as {
              tool_call_id?: string;
              content?: string;
              is_error?: boolean;
              data?: Record<string, unknown>;
              hidden?: boolean;
              sub_agent_id?: string;
            };
            const id = p.tool_call_id;
            if (!id) break;
            const view = toolViewMap.current[id];
            if (view && !view.hidden) {
              view.result = p.content;
              view.isError = p.is_error;
              view.data = p.data ?? null;
            }
            if (p.data && typeof p.data === "object") {
              const plan = (p.data as { plan?: PlanItem[] }).plan;
              if (Array.isArray(plan)) next.plan = plan;
            }
            // Sub-agent ichida — accordion turn'ini refresh qilamiz
            if (p.sub_agent_id && subAgentTurnIdMap.current[p.sub_agent_id]) {
              const turnId = subAgentTurnIdMap.current[p.sub_agent_id];
              next.turns = s.turns.map((t) =>
                t.kind === "sub_agent" && t.id === turnId
                  ? {
                      ...t,
                      steps: t.steps.map((step) =>
                        step.id === id
                          ? {
                              ...step,
                              result: p.content,
                              isError: p.is_error,
                              data: p.data ?? null,
                            }
                          : step,
                      ),
                    }
                  : t,
              );
              break;
            }
            if (!Boolean(p.hidden)) {
              next.turns = [...s.turns];
              next.phase = "thinking";
              next.currentTool = null;
            }
            break;
          }
          case "approval_required": {
            next.approval = ev.payload as ApprovalPayload;
            next.phase = "waiting";
            break;
          }
          case "approval_resolved": {
            next.approval = null;
            next.phase = "thinking";
            break;
          }
          case "clarification_required": {
            next.clarify = ev.payload as ClarifyPayload;
            next.phase = "waiting";
            break;
          }
          case "clarification_resolved": {
            next.clarify = null;
            next.phase = "thinking";
            break;
          }
          case "usage_updated": {
            next.usageRefreshTick = s.usageRefreshTick + 1;
            break;
          }
          case "token_usage": {
            // Live per-turn usage — this run's cumulative tokens so the badge
            // ticks up in real time.
            const p = ev.payload as {
              total_tokens?: number;
              input_tokens?: number;
              output_tokens?: number;
            };
            const total =
              p.total_tokens ?? (p.input_tokens ?? 0) + (p.output_tokens ?? 0);
            if (typeof total === "number") next.liveTokens = total;
            break;
          }
          case "run_completed":
          case "run_failed":
          case "close":
            next.finished = true;
            finishedRef.current = true;
            next.currentTool = null;
            next.pendingTool = null;
            next.currentSubAgent = null;
            next.streamingId = null;
            // Roll this run's tokens into the session total, then zero the live
            // counter so a trailing `close` after run_completed doesn't re-add.
            next.sessionTokens = s.sessionTokens + s.liveTokens;
            next.liveTokens = 0;
            // Run tugadi/to'xtadi — tugallanmagan sub_agent turn'larni yopamiz,
            // aks holda accordion abadiy "ishlamoqda" bo'lib qoladi.
            next.turns = closeDanglingSubAgents(s.turns);
            if (ev.type === "run_failed") {
              const p = ev.payload as { error?: string; cancelled?: boolean };
              const cancelled =
                p.cancelled === true ||
                (p.error ?? "").trim().toLowerCase() === "cancelled by user";
              next.cancelled = cancelled;
              next.error = cancelled ? null : (p.error ?? "Run failed");
              next.phase = cancelled ? "done" : "error";
            } else {
              if (ev.type === "run_completed") next.cancelled = false;
              next.phase = "done";
              if (ev.type === "run_completed") {
                // Per-prompt token usage (includes sub-agent tokens) — attach
                // to the last assistant turn so the UI can show it.
                const p = ev.payload as {
                  input_tokens?: number;
                  output_tokens?: number;
                };
                if (p.input_tokens != null || p.output_tokens != null) {
                  const turns = [...next.turns];
                  for (let i = turns.length - 1; i >= 0; i--) {
                    const t = turns[i];
                    if (t.kind === "assistant") {
                      turns[i] = {
                        ...t,
                        inputTokens: p.input_tokens,
                        outputTokens: p.output_tokens,
                      };
                      break;
                    }
                  }
                  next.turns = turns;
                }
              }
            }
            esRef.current?.close();
            esRef.current = null;
            break;
        }
        // Persist incremental state on every event so a refresh can resume.
        if (persistRef.current) {
          persistRef.current({
            turns: next.turns,
            lastSeq: lastSeqRef.current,
            finished: next.finished,
          });
        }
        return next;
      });
    };

    const types: AgentEventType[] = [
      "run_started",
      "thinking_delta",
      "assistant_chunk",
      "assistant_message",
      "tool_call_pending",
      "tool_call",
      "tool_result",
      "plan_set",
      "plan_update",
      "approval_required",
      "approval_resolved",
      "clarification_required",
      "clarification_resolved",
      "usage_updated",
      "token_usage",
      "sub_agent_started",
      "sub_agent_finished",
      "context_compacted",
      "run_completed",
      "run_failed",
      "close",
    ];
    for (const t of types) es.addEventListener(t, handler(t) as EventListener);
    es.onerror = () => {
      // If the run already completed (we explicitly closed the source), this
      // is a benign "connection closed" — not a real failure.
      if (finishedRef.current) return;
      // A transport interruption is not a run failure. Native EventSource
      // retries while CONNECTING; if it becomes CLOSED, recreate it with the
      // latest seq cursor so persisted events are replayed without gaps.
      setState((s) => ({ ...s, reconnecting: true }));
      armFailureTimeout();
      if (
        es.readyState === EventSource.CLOSED &&
        reconnectTimer === undefined
      ) {
        reconnectTimer = window.setTimeout(
          () => setConnectionAttempt((attempt) => attempt + 1),
          1500,
        );
      }
    };

    return () => {
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      if (failureTimer !== undefined) window.clearTimeout(failureTimer);
      es.close();
      esRef.current = null;
    };
  }, [projectId, requestId, connectionAttempt]);

  const pushUserTurn = useCallback((text: string) => {
    reconnectDeadlineRef.current = null;
    finishedRef.current = false;
    lastSeqRef.current = 0; // new run — reset seq cursor
    setState((s) => {
      const next: State = {
        ...s,
        turns: [
          ...s.turns,
          {
            kind: "user",
            id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            text,
          },
        ],
        finished: false,
        error: null,
        cancelled: false,
        reconnecting: false,
        connectionError: null,
        phase: "queued",
        currentTool: null,
        pendingTool: null,
        currentSubAgent: null,
        streamingId: null,
        planTurnId: null,
      };
      if (persistRef.current) {
        persistRef.current({ turns: next.turns, lastSeq: 0, finished: false });
      }
      return next;
    });
  }, []);

  const retryConnection = useCallback(() => {
    reconnectDeadlineRef.current = Date.now() + 12_000;
    finishedRef.current = false;
    setState((s) => ({
      ...s,
      reconnecting: true,
      connectionError: null,
    }));
    setConnectionAttempt((attempt) => attempt + 1);
  }, []);

  /**
   * Seed turns from an external source (e.g. backend history fetch) when the
   * stream has not yet received any turns and is idle (no live run).
   * Safe to call multiple times — only applies when turns are empty.
   */
  const seedTurnsFromBackend = useCallback((turns: ChatTurn[]) => {
    setState((s) => {
      if (s.turns.length > 0 || s.phase !== "idle") return s;
      return { ...s, turns };
    });
  }, []);

  return {
    ...state,
    pushUserTurn,
    close,
    retryConnection,
    seedTurnsFromBackend,
  };
}
