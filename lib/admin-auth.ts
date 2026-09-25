import { cookies } from "next/headers";
import { getSql } from "@/lib/neon";
import {
  createPasswordHash,
  verifyPasswordHash,
} from "@/lib/password-security";

const adminSessionCookie = "rise-admin-session";
const mainAdminCredentialsId = "main-admin";

interface AdminCredentialsRow {
  password_hash: string | null;
  password_salt: string | null;
}

let adminCredentialsSchemaReadyPromise: Promise<void> | null = null;

function asRows<T>(value: unknown) {
  return value as T[];
}

export function getConfiguredAdminEmail() {
  return process.env.ADMIN_LOGIN_EMAIL?.trim().toLowerCase() || "";
}

function getAdminPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD || "";
}

function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || "";
}

async function ensureAdminCredentialsSchema() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  if (!adminCredentialsSchemaReadyPromise) {
    adminCredentialsSchemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS admin_credentials (
          id TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      adminCredentialsSchemaReadyPromise = null;
      throw error;
    });
  }

  await adminCredentialsSchemaReadyPromise;
}

async function getStoredAdminCredentials() {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  await ensureAdminCredentialsSchema();

  const [row] = asRows<AdminCredentialsRow>(await sql`
    SELECT password_hash, password_salt
    FROM admin_credentials
    WHERE id = ${mainAdminCredentialsId}
    LIMIT 1
  `);

  return row ?? null;
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

export async function validateAdminCredentials(email: string, password: string) {
  const adminEmail = getConfiguredAdminEmail();
  const adminPassword = getAdminPassword();

  if (!adminEmail || !password || email.trim().toLowerCase() !== adminEmail) {
    return false;
  }

  try {
    const storedCredentials = await getStoredAdminCredentials();

    if (storedCredentials?.password_hash && storedCredentials.password_salt) {
      return verifyPasswordHash(
        password,
        storedCredentials.password_salt,
        storedCredentials.password_hash,
      );
    }
  } catch {
    return Boolean(adminPassword && password === adminPassword);
  }

  return Boolean(adminPassword && password === adminPassword);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
) {
  const sql = getSql();
  const adminEmail = getConfiguredAdminEmail();

  if (!sql) {
    throw new Error("Database is required to update the admin password.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  if (!(await validateAdminCredentials(adminEmail, currentPassword))) {
    throw new Error("Current password is incorrect.");
  }

  await ensureAdminCredentialsSchema();

  const nextCredentials = createPasswordHash(newPassword);

  await sql`
    INSERT INTO admin_credentials (
      id,
      password_hash,
      password_salt,
      updated_at
    ) VALUES (
      ${mainAdminCredentialsId},
      ${nextCredentials.hash},
      ${nextCredentials.salt},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      password_salt = EXCLUDED.password_salt,
      updated_at = NOW()
  `;

  return { email: adminEmail };
}
