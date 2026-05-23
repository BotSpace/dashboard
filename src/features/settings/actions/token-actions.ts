"use server";

import { APITokensAPI } from "@/shared/api/services";

export async function listTokensAction() {
  return APITokensAPI.list();
}

export async function createTokenAction(name: string) {
  return APITokensAPI.create(name);
}

export async function deleteTokenAction(id: number | string) {
  await APITokensAPI.remove(id);
}
