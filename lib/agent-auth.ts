import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  getAgentById,
  validateAgentCredentials,
} from "@/lib/agents-store";

const agentSessionCookie = "rise-agent-session";
const sessionMaxAge = 60 * 60 * 12;

function getAgentSessionSecret() {
  return (
    process.env.AGENT_SESSION_SECRET ||
    process.env.ADMIN_SESSION_TOKEN ||
    ""
  );
}

function signSessionPayload(agentId: string, issuedAt: number) {
  const secret = getAgentSessionSecret();
  return createHmac("sha256", secret)
    .update(`${agentId}.${issuedAt}`)
    .digest("hex");
}

function timingSafeStringEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
}

function createSessionToken(agentId: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const signature = signSessionPayload(agentId, issuedAt);

  return `${encodeURIComponent(agentId)}.${issuedAt}.${signature}`;
}

function parseSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [encodedAgentId, issuedAtValue, signature] = token.split(".");
  const issuedAt = Number(issuedAtValue);

  if (!encodedAgentId || !Number.isFinite(issuedAt) || !signature) {
    return null;
  }

  const age = Math.floor(Date.now() / 1000) - issuedAt;

  if (age < 0 || age > sessionMaxAge) {
    return null;
  }

  const agentId = decodeURIComponent(encodedAgentId);
  const expectedSignature = signSessionPayload(agentId, issuedAt);

  if (!timingSafeStringEqual(signature, expectedSignature)) {
    return null;
  }

  return agentId;
}

export async function loginAgentWithCredentials(username: string, password: string) {
  return validateAgentCredentials(username, password);
}

export async function createAgentSession(agentId: string) {
  if (!getAgentSessionSecret()) {
    throw new Error("Agent session secret is not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set(agentSessionCookie, createSessionToken(agentId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge,
  });
}

export async function clearAgentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(agentSessionCookie);
}

export async function getAuthenticatedAgentId() {
  if (!getAgentSessionSecret()) {
    return null;
  }

  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(agentSessionCookie)?.value);
}

export async function getAuthenticatedAgent() {
  const agentId = await getAuthenticatedAgentId();

  if (!agentId) {
    return null;
  }

  const agent = await getAgentById(agentId, { includeInactive: true });

  if (!agent?.isActive || !agent.canLogin) {
    return null;
  }

  return agent;
}

export async function isAgentAuthenticated() {
  return Boolean(await getAuthenticatedAgent());
}
