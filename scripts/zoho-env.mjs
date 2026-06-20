import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseEnvFile(contents) {
  const entries = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    entries[key] = stripWrappingQuotes(value);
  }

  return entries;
}

export function loadLocalEnv() {
  const envPath = path.join(projectRoot, ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(
      "Missing .env.local. Copy .env.example to .env.local and add your Zoho values first.",
    );
  }

  const contents = fs.readFileSync(envPath, "utf8");

  return parseEnvFile(contents);
}

export function getZohoConfig() {
  const env = loadLocalEnv();

  return {
    clientId: env.ZOHO_CLIENT_ID || "",
    clientSecret: env.ZOHO_CLIENT_SECRET || "",
    refreshToken: env.ZOHO_REFRESH_TOKEN || "",
    accountsBaseUrl: env.ZOHO_ACCOUNTS_BASE_URL || "https://accounts.zoho.com",
    apiBaseUrl: env.ZOHO_API_BASE_URL || "https://www.zohoapis.com",
    siteUrl: env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };
}

export function getRedirectUri(config) {
  return new URL("/api/zoho/callback", config.siteUrl).toString();
}
