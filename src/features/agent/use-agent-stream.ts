"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentEvent,
  AgentEventType,
  ChatTurn,
  PlanItem,
  ApprovalPayload,
  ClarifyPayload,
  ToolCallView,
} from "./types";

type Args = {
  projectId: string;
  requestId: string | null;
  initialTurns?: ChatTurn[];
  initialSeq?: number;
  onPersist?: (snapshot: { turns: ChatTurn[]; lastSeq: number; finished: boolean }) => void;
};

type RunPhase = "idle" | "queued" | "thinking" | "tool" | "waiting" | "done" | "error";

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
};

export function useAgentStream({
  projectId,
  requestId,
  initialTurns,
  initialSeq,
  onPersist,
}: Args) {
  const [state, setState] = useState<State>({
    turns: initialTurns ?? [],
    plan: [],
    approval: null,
    clarify: null,
    usageRefreshTick: 0,
    finished: false,
    error: null,
    thinking: "",
    phase: "idle",
    currentTool: null,
  });
  const esRef = useRef<EventSource | null>(null);
  const finishedRef = useRef(false);
  const toolViewMap = useRef<Record<string, ToolCallView>>({});
  const lastSeqRef = useRef<number>(initialSeq ?? 0);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  const close = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  useEffect(() => {
    if (!requestId) return;
    const sinceSeq = lastSeqRef.current ?? 0;
    const url =
      `/api/agent/${encodeURIComponent(projectId)}/runs/${encodeURIComponent(requestId)}/events` +
      (sinceSeq > 0 ? `?since_seq=${sinceSeq}` : "");
    const es = new EventSource(url);
    esRef.current = es;
    finishedRef.current = false;
    toolViewMap.current = {};
    // Rebuild tool view map from any restored tool turns so a tool_result
    // arriving in replay can be matched to its earlier tool_call.
    setState((s) => {
      for (const t of s.turns) {
        if (t.kind === "tool") toolViewMap.current[t.call.id] = t.call;
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
            const p = ev.payload as { text?: string };
            const text = p.text ?? "";
            if (text) {
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
            };
            if (!p.id || !p.name) break;
            const view: ToolCallView = {
              id: p.id,
              name: p.name,
              arguments: p.arguments ?? {},
            };
            toolViewMap.current[p.id] = view;
            next.turns = [...s.turns, { kind: "tool", id: `t-${p.id}`, call: view }];
            next.phase = "tool";
            next.currentTool = p.name;
            break;
          }
          case "tool_result": {
            const p = ev.payload as {
              tool_call_id?: string;
              content?: string;
              is_error?: boolean;
              data?: Record<string, unknown>;
            };
            const id = p.tool_call_id;
            if (!id) break;
            const view = toolViewMap.current[id];
            if (view) {
              view.result = p.content;
              view.isError = p.is_error;
              view.data = p.data ?? null;
            }
            if (p.data && typeof p.data === "object") {
              const plan = (p.data as { plan?: PlanItem[] }).plan;
              if (Array.isArray(plan)) next.plan = plan;
            }
            next.turns = [...s.turns];
            next.phase = "thinking";
            next.currentTool = null;
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
      setState((s) => ({ ...s, error: s.error ?? "Stream connection lost" }));
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
      };
      if (persistRef.current) {
        persistRef.current({ turns: next.turns, lastSeq: 0, finished: false });
      }
      return next;
    });
  }, []);

  return { ...state, pushUserTurn, close };
}
