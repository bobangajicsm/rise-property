import { NextResponse } from "next/server";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPage(content: string) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Zoho Callback</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        background: #0f1115;
        color: #f4f5f7;
      }
      .wrap {
        max-width: 760px;
        margin: 0 auto;
        padding: 48px 20px 64px;
      }
      .card {
        background: #171a21;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 24px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.35);
      }
      h1 {
        margin: 0 0 10px;
        font-size: 28px;
      }
      p {
        margin: 0 0 14px;
        line-height: 1.65;
        color: rgba(244,245,247,0.82);
      }
      code, pre {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .code {
        overflow-wrap: anywhere;
        margin: 18px 0;
        border-radius: 10px;
        background: #0d0f14;
        border: 1px solid rgba(255,255,255,0.08);
        padding: 16px;
        color: #7de2d2;
      }
      .muted {
        font-size: 14px;
        color: rgba(244,245,247,0.62);
      }
      .error {
        color: #ff8f8f;
      }
      ol {
        margin: 18px 0 0;
        padding-left: 18px;
        color: rgba(244,245,247,0.85);
      }
      li {
        margin-bottom: 10px;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      ${content}
    </main>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return renderPage(`
      <section class="card">
        <h1>Zoho Authorization Error</h1>
        <p class="error"><strong>${escapeHtml(error)}</strong></p>
        ${
          errorDescription
            ? `<p>${escapeHtml(errorDescription)}</p>`
            : `<p>Zoho returned an OAuth error while redirecting back to your app.</p>`
        }
        <p class="muted">Check your client domain, redirect URI, and OAuth setup, then retry the authorization flow.</p>
      </section>
    `);
  }

  if (!code) {
    return renderPage(`
      <section class="card">
        <h1>Zoho Callback Ready</h1>
        <p>This URL is only used after Zoho redirects you back with an authorization code.</p>
        <p>So if you open <code>/api/zoho/callback</code> directly, seeing no code here is normal.</p>
        <ol>
          <li>Create your Zoho server-based application and copy the <strong>Client ID</strong>.</li>
          <li>Open the Zoho authorization URL from the guide.</li>
          <li>Approve access in Zoho.</li>
          <li>Zoho will redirect here with <code>?code=...</code>.</li>
          <li>Copy that code and exchange it for the refresh token.</li>
        </ol>
      </section>
    `);
  }

  return renderPage(`
    <section class="card">
      <h1>Zoho Authorization Code Received</h1>
      <p>Good, this means the OAuth redirect worked. Copy the code below and use it immediately in your token exchange request.</p>
      <pre class="code">${escapeHtml(code)}</pre>
      <p class="muted">Important: the code expires quickly and can only be used once.</p>
    </section>
  `);
}
