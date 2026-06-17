"use server";
import { CredentialsAPI } from "@/shared/api/services";
import { isApiError } from "@/shared/api/client";

export type CredentialResult = { ok: boolean; message?: string; data?: unknown };

function fail(e: unknown): CredentialResult {
  if (isApiError(e)) {
    const details = e.details as { errors?: Record<string, string>; detail?: string } | undefined;
    if (details?.errors) {
      const flat = Object.entries(details.errors)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      return { ok: false, message: flat || e.message };
    }
    return { ok: false, message: details?.detail || e.message };
  }
  return { ok: false, message: (e as Error).message || "Xatolik" };
}

export async function listCredentialTypesAction() {
  return CredentialsAPI.listTypes();
}

export async function listCredentialsAction(params: {
  type_key?: string;
  page?: number;
  page_size?: number;
} = {}) {
  return CredentialsAPI.list(params);
}

export async function createCredentialAction(body: {
  type_key: string;
  name: string;
  data: Record<string, string>;
}): Promise<CredentialResult> {
  try {
    const data = await CredentialsAPI.create(body);
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function updateCredentialAction(
  id: string | number,
  body: { name?: string; data?: Record<string, string> }
): Promise<CredentialResult> {
  try {
    const data = await CredentialsAPI.update(id, body);
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCredentialAction(id: string | number): Promise<CredentialResult> {
  try {
    await CredentialsAPI.remove(id);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function testCredentialAction(
  id: string | number
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await CredentialsAPI.test(id);
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, message: isApiError(e) ? e.message : "Test xatolik" };
  }
}

/**
 * Server Action: obtain the OAuth2 authorize_url from the backend.
 * The access token is read server-side so it never reaches the browser.
 */
export async function oauthStartAction(
  provider: string,
  type_key: string
): Promise<{ ok: true; authorize_url: string } | { ok: false; message: string }> {
  try {
    const res = await CredentialsAPI.oauthStart(provider, type_key);
    if (!res.authorize_url) return { ok: false, message: "OAuth URL olinmadi" };
    return { ok: true, authorize_url: res.authorize_url };
  } catch (e) {
    const { message } = fail(e);
    return { ok: false, message: message ?? "OAuth boshlashda xatolik" };
  }
}
