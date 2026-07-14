export type AgentEventType =
  | "run_started"
  | "thinking_delta"
  | "assistant_chunk"
  | "assistant_message"
  | "tool_call_pending"
  | "tool_call"
  | "tool_result"
  | "plan_set"
  | "plan_update"
  | "flow_changed"
  | "context_compacted"
  | "approval_required"
  | "approval_resolved"
  | "clarification_required"
  | "clarification_resolved"
  | "budget_update"
  | "usage_updated"
  | "token_usage"
  | "sub_agent_started"
  | "sub_agent_finished"
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

// Sub-agent narrate text (assistant_message) shown inline among tool steps.
export type NarrationStep = { id: string; narration: string };

export type SubAgentStepView = ToolCallView | NarrationStep;

export type SubAgentTurn = {
  kind: "sub_agent";
  id: string;
  sub_agent_id: string;
  name: string;
  description?: string;
  prompt: string;
  steps: SubAgentStepView[];
  toolCalls: number;
  summary?: string;
  ok?: boolean;
  finished: boolean;
};

export type ChatTurn =
  | { kind: "user"; id: string; text: string }
  | {
      kind: "assistant";
      id: string;
      text: string;
      inputTokens?: number;
      outputTokens?: number;
      /** Chain-of-thought captured during this turn (DeepSeek reasoning). Shown
       * as a collapsible "Fikrlash" section; persisted via history. */
      reasoning?: string;
    }
  | { kind: "tool"; id: string; call: ToolCallView }
  | { kind: "plan"; id: string; plan: PlanItem[] }
  | SubAgentTurn;

export type ApprovalPayload = {
  tool_call_id?: string;
  tool_name?: string;
  arguments?: Record<string, unknown>;
  reason?: string;
};

export type ClarifyInputType = "text" | "select" | "multiselect";

export type ClarifyPayload = {
  tool_call_id?: string;
  question?: string;
  /** Structured input type; defaults to "text" when absent */
  input_type?: ClarifyInputType;
  options?: string[];
  placeholder?: string;
};
