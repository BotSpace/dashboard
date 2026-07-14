"use server";
import {
  createAgentRun,
  clarifyAgentRun,
  approveAgentRun,
  cancelAgentRun,
  getAgentRun,
  getAgentUsage,
  listAgentThreads,
  getAgentThreadHistory,
  deleteAgentThread,
  deleteAllAgentThreads,
  getProjectSettings,
  setProjectSettings,
  type AgentRunStatus,
  type AgentUsage,
  type AgentThreadMeta,
  type AgentThreadTurn,
  type AgentActiveRun,
  type ThinkingEffort,
} from "@/shared/api/agent";

export type RunCreateState = { ok: boolean; request_id?: string; message?: string };

export async function startRunAction(args: {
  projectId: string;
  prompt: string;
  threadId?: string;
  planMode?: boolean;
  autoApprove?: boolean;
}): Promise<RunCreateState> {
  try {
    const res = await createAgentRun(args.projectId, {
      prompt: args.prompt,
      thread_id: args.threadId,
      plan_mode: args.planMode,
      auto_approve: args.autoApprove,
    });
    return { ok: true, request_id: res.request_id };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function clarifyRunAction(args: {
  projectId: string;
  requestId: string;
  /** text / select → string; multiselect → string[] */
  answer: string | string[];
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await clarifyAgentRun(args.projectId, args.requestId, args.answer);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function approveRunAction(args: {
  projectId: string;
  requestId: string;
  approved: boolean;
  reason?: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await approveAgentRun(args.projectId, args.requestId, args.approved, args.reason);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function cancelRunAction(args: {
  projectId: string;
  requestId: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await cancelAgentRun(args.projectId, args.requestId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function getRunStatusAction(args: {
  projectId: string;
  requestId: string;
}): Promise<AgentRunStatus | { error: string }> {
  try {
    return await getAgentRun(args.projectId, args.requestId);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function getUsageAction(): Promise<AgentUsage | null> {
  try {
    return await getAgentUsage();
  } catch {
    return null;
  }
}

export async function getThinkingEffortAction(
  projectId: string,
): Promise<ThinkingEffort | null> {
  try {
    return (await getProjectSettings(projectId)).thinking_effort;
  } catch {
    return null;
  }
}

export async function setThinkingEffortAction(
  projectId: string,
  effort: ThinkingEffort | null,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await setProjectSettings(projectId, effort);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "failed" };
  }
}

export async function listThreadsAction(
  projectId: string
): Promise<{ threads: AgentThreadMeta[] } | null> {
  try {
    return await listAgentThreads(projectId);
  } catch {
    return null;
  }
}

export async function deleteThreadAction(
  projectId: string,
  threadId: string
): Promise<{ ok: boolean }> {
  try {
    await deleteAgentThread(projectId, threadId);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function clearAllThreadsAction(
  projectId: string
): Promise<{ ok: boolean }> {
  try {
    await deleteAllAgentThreads(projectId);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function loadThreadHistoryAction(
  projectId: string,
  threadId: string
): Promise<{ thread_id: string; turns: AgentThreadTurn[]; active_run?: AgentActiveRun | null } | null> {
  try {
    return await getAgentThreadHistory(projectId, threadId);
  } catch {
    return null;
  }
}
