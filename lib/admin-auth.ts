import { cookies } from "next/headers";

const adminSessionCookie = "rise-admin-session";

function getAdminEmail() {
  return process.env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() || "";
}

function getAdminPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD || "";
}

function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || "";
}

export async function isAdminAuthenticated() {
  if (!getAdminSessionToken()) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(adminSessionCookie)?.value === getAdminSessionToken();
}

export async function createAdminSession() {
  const sessionToken = getAdminSessionToken();

  if (!sessionToken) {
    throw new Error("Admin session token is not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookie);
}

export function validateAdminCredentials(email: string, password: string) {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();

  if (!adminEmail || !adminPassword) {
    return false;
  }

  return (
    email.trim().toLowerCase() === adminEmail &&
    password === adminPassword
  );
}
