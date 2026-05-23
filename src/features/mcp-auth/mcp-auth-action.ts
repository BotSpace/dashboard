"use server";

import { readSession } from "@/shared/auth/session";
import { APITokensAPI } from "@/shared/api/services";

type ApproveInput = {
  code: string;
  callback: string;
  state: string;
};

export async function approveMCPAction(input: ApproveInput): Promise<{ redirectUrl?: string; error?: string }> {
  const session = await readSession();
  if (!session) {
    return { error: "Avval tizimga kiring" };
  }

  try {
    const result = await APITokensAPI.create("MCP Agent");
    const apiToken = result.token;

    const callbackUrl = new URL(input.callback);
    callbackUrl.searchParams.set("code", input.code);
    callbackUrl.searchParams.set("api_token", apiToken);
    callbackUrl.searchParams.set("state", input.state);

    return { redirectUrl: callbackUrl.toString() };
  } catch {
    return { error: "Token yaratishda xatolik" };
  }
}
