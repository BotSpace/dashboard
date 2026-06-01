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
  onPersist?: (snapshot: { turns: ChatTurn[]; lastSeq: number; finished: boolean }) => void;
};

type RunPhase = "idle" | "queued" | "thinking" | "tool" | "waiting" | "done" | "error";

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
  finished: boolean;
  error: string | null;
  thinking: string;
  phase: RunPhase;
  currentTool: string | null;
  currentSubAgent: CurrentSubAgent | null;
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
    finished: Boolean(initialFinished),
    error: null,
    thinking: "",
    phase: initialFinished ? "done" : "idle",
    currentTool: null,
    currentSubAgent: null,
  });
  const esRef = useRef<EventSource | null>(null);
  const finishedRef = useRef(Boolean(initialFinished));
  const toolViewMap = useRef<Record<string, ToolCallView>>({});
  // Map sub_agent_id → ChatTurn id (so child tool_call/result events can be
  // routed into the SubAgentAccordion they belong to instead of bubbling up
  // to the main chat).
  const subAgentTurnIdMap = useRef<Record<string, string>>({});
  const lastSeqRef = useRef<number>(initialSeq ?? 0);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  const close = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  useEffect(() => {
    if (!requestId) return;
    // Oldingi sessiya allaqachon tugagan (refresh + run finished/abort) — o'lik
    // run'ning SSE'siga ulanmaymiz. Aks holda phase "queued"ga o'tib osilardi.
    if (finishedRef.current) return;
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
          for (const step of t.steps) toolViewMap.current[step.id] = step;
        }
      }
      return {
        ...s,
        phase: s.finished ? s.phase : s.phase === "idle" ? "queued" : s.phase,
        error: null,
      };
    });

    const handler = (type: AgentEventType) => (e: MessageEvent) => {
      let ev: AgentEvent;
      try {
        // Agent sends: {"seq": N, "type": "...", "payload": {...}, "at": "..."}.
        // SSE data is the whole envelope — unwrap `payload` so consumers see it directly.
        const parsed = JSON.parse(e.data);
        const isEnvelope =
          parsed && typeof parsed === "object" && "payload" in parsed && "type" in parsed;
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
      if (typeof ev.seq === "number" && ev.seq > lastSeqRef.current) {
        lastSeqRef.current = ev.seq;
      }
      setState((s) => {
        const next = { ...s };
        switch (ev.type) {
          case "run_started":
            next.error = null;
            next.phase = "thinking";
            next.currentTool = null;
            break;
          case "thinking_delta": {
            const delta = (ev.payload as { delta?: string }).delta ?? "";
            next.thinking = s.thinking + delta;
            next.phase = "thinking";
            break;
          }
          case "assistant_message": {
            const p = ev.payload as { text?: string; sub_agent_id?: string };
            const text = p.text ?? "";
            // Sub-agent ichki assistant matni asosiy chatga KO'TARILMAYDI —
            // u sub_agent_finished summary'sida (accordion'da) ko'rinadi.
            // Faqat main agent (sub_agent_id YO'Q) matnini turns'ga qo'shamiz.
            if (text && !p.sub_agent_id) {
              next.turns = [
                ...s.turns,
                {
                  kind: "assistant",
                  id: `a-${requestId ?? "x"}-${ev.seq ?? Date.now()}-${s.turns.length}`,
                  text,
                },
              ];
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
                  ? { ...t, steps: [...t.steps, view], toolCalls: t.toolCalls + 1 }
                  : t,
              );
              next.phase = "tool";
              next.currentTool = `${p.name}`;
              break;
            }
            // Main agent tool_call (task.run bundan mustasno — accordion ko'rsatadi)
            if (!view.hidden) {
              next.turns = [...s.turns, { kind: "tool", id: `t-${p.id}`, call: view }];
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
            if (Array.isArray(p.plan)) next.plan = p.plan;
            next.phase = "thinking";
            break;
          }
          case "plan_update": {
            const p = ev.payload as { plan?: PlanItem[]; item?: PlanItem };
            if (Array.isArray(p.plan)) {
              next.plan = p.plan;
            } else if (p.item?.id) {
              next.plan = s.plan.map((item) => (item.id === p.item?.id ? p.item : item));
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
                        step.id === id ? { ...step, result: p.content, isError: p.is_error, data: p.data ?? null } : step,
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
          case "run_completed":
          case "run_failed":
          case "close":
            next.finished = true;
            finishedRef.current = true;
            next.currentTool = null;
            next.currentSubAgent = null;
            // Run tugadi/to'xtadi — tugallanmagan sub_agent turn'larni yopamiz,
            // aks holda accordion abadiy "ishlamoqda" bo'lib qoladi.
            next.turns = closeDanglingSubAgents(s.turns);
            if (ev.type === "run_failed") {
              const p = ev.payload as { error?: string };
              next.error = p.error ?? "Run failed";
              next.phase = "error";
            } else {
              next.phase = "done";
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
      "assistant_message",
      "tool_call",
      "tool_result",
      "plan_set",
      "plan_update",
      "approval_required",
      "approval_resolved",
      "clarification_required",
      "clarification_resolved",
      "usage_updated",
      "sub_agent_started",
      "sub_agent_finished",
      "run_completed",
      "run_failed",
      "close",
    ];
    for (const t of types) es.addEventListener(t, handler(t) as EventListener);
    es.onerror = () => {
      // If the run already completed (we explicitly closed the source), this
      // is a benign "connection closed" — not a real failure.
      if (finishedRef.current) return;
      // CONNECTING means the browser is still trying to (re)connect — also benign.
      if (es.readyState === EventSource.CONNECTING) return;
      // Ulanish uzildi va qayta urinmayapti — tugallanmagan sub_agent
      // turn'larni yopamiz, "ishlamoqda" abadiy spin bo'lib qolmasin.
      setState((s) => ({
        ...s,
        error: s.error ?? "Stream connection lost",
        turns: closeDanglingSubAgents(s.turns),
      }));
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [projectId, requestId]);

  const pushUserTurn = useCallback((text: string) => {
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
        phase: "queued",
        currentTool: null,
        currentSubAgent: null,
      };
      if (persistRef.current) {
        persistRef.current({ turns: next.turns, lastSeq: 0, finished: false });
      }
      return next;
    });
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

  return { ...state, pushUserTurn, close, seedTurnsFromBackend };
}
