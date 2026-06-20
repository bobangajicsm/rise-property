import { getRedirectUri, getZohoConfig } from "./zoho-env.mjs";

const code = process.argv[2]?.trim();

if (!code) {
  throw new Error("Missing authorization code. Usage: npm run zoho:refresh-token -- YOUR_CODE");
}

const config = getZohoConfig();

if (!config.clientId) {
  throw new Error("Missing ZOHO_CLIENT_ID in .env.local");
}

if (!config.clientSecret) {
  throw new Error("Missing ZOHO_CLIENT_SECRET in .env.local");
}

const response = await fetch(new URL("/oauth/v2/token", config.accountsBaseUrl), {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: getRedirectUri(config),
    code,
  }),
});

const data = await response.json().catch(() => null);

if (!response.ok || !data?.refresh_token) {
  console.error("Zoho token exchange failed.\n");
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("Refresh token created successfully:\n");
console.log(data.refresh_token);
console.log("\nSave it in .env.local as:");
console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}`);
