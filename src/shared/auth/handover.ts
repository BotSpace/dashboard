import "server-only";
import { SignJWT } from "jose";
import { env } from "@/shared/lib/env";
import type { SessionPayload } from "./session";

/**
 * Issue a short-lived handover token (60s) that the constructor service
 * can exchange for its own session cookie. Requires HANDOVER_SECRET to match
 * on both dashboard and constructor.
 */
export async function issueHandoverToken(session: SessionPayload): Promise<string | null> {
  const secret = env.HANDOVER_SECRET;
  if (!secret) return null;
  return new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90s")
    .sign(new TextEncoder().encode(secret));
}
