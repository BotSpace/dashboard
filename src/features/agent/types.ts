export type AgentEventType =
  | "run_started"
  | "thinking_delta"
  | "assistant_chunk"
  | "assistant_message"
  | "tool_call"
  | "tool_result"
  | "plan_set"
  | "plan_update"
  | "flow_changed"
  | "approval_required"
  | "approval_resolved"
  | "clarification_required"
  | "clarification_resolved"
  | "budget_update"
  | "usage_updated"
  | "run_completed"
  | "run_failed"
  | "close"
  | "event";

export type AgentEvent = {
  seq?: number;
  type: AgentEventType;
  payload: Record<string, unknown>;
  at?: string;
};

export type PlanItem = {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  notes?: string | null;
};

export type ToolCallView = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  isError?: boolean;
  data?: Record<string, unknown> | null;
  hidden?: boolean;
};

export type ChatTurn =
  | { kind: "user"; id: string; text: string }
  | { kind: "assistant"; id: string; text: string }
  | { kind: "tool"; id: string; call: ToolCallView };

export type ApprovalPayload = {
  tool_call_id?: string;
  tool_name?: string;
  arguments?: Record<string, unknown>;
  reason?: string;
};

export type ClarifyPayload = {
  tool_call_id?: string;
  question?: string;
  options?: string[];
};
