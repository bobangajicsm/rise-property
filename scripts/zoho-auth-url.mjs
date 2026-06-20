import { getRedirectUri, getZohoConfig } from "./zoho-env.mjs";

const config = getZohoConfig();

if (!config.clientId) {
  throw new Error("Missing ZOHO_CLIENT_ID in .env.local");
}

const scope = "ZohoCRM.modules.leads.CREATE";
const redirectUri = getRedirectUri(config);
const authUrl = new URL("/oauth/v2/auth", config.accountsBaseUrl);

authUrl.searchParams.set("scope", scope);
authUrl.searchParams.set("client_id", config.clientId);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("prompt", "consent");

console.log("Open this URL in your browser and approve access:\n");
console.log(authUrl.toString());
console.log("\nAfter Zoho redirects back, copy the `code` and run:");
console.log("npm run zoho:refresh-token -- YOUR_CODE");
