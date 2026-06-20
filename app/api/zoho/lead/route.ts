import { NextResponse } from "next/server";
import { siteWebsiteUrl } from "@/lib/site";

export const runtime = "nodejs";

interface LeadPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyId?: string | number;
  propertyReference?: string;
  propertyTitle?: string;
  propertyUrl?: string;
  propertyType?: string;
  listingType?: string;
  usage?: string;
  area?: string;
  location?: string;
  price?: string | number;
  beds?: string | number;
  baths?: string | number;
  sqft?: string;
  inquiryType?: string;
  preferredDate?: string;
  preferredTime?: string;
  source?: string;
  channel?: string;
  pageUrl?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
}

const requiredEnvKeys = [
  "ZOHO_CLIENT_ID",
  "ZOHO_CLIENT_SECRET",
  "ZOHO_REFRESH_TOKEN",
] as const;

function getZohoAccountsBaseUrl() {
  return process.env.ZOHO_ACCOUNTS_BASE_URL?.trim() || "https://accounts.zoho.com";
}

function getZohoApiBaseUrl() {
  return process.env.ZOHO_API_BASE_URL?.trim() || "https://www.zohoapis.com";
}

async function parseJson(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function normalizeCurrencyValue(value?: string | number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function isValidPublicUrl(value?: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1" &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: LeadPayload;

  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const message = body.message?.trim();
  const propertyId = String(body.propertyId ?? "").trim();
  const propertyReference = body.propertyReference?.trim();
  const propertyTitle = body.propertyTitle?.trim();
  const propertyUrl = body.propertyUrl?.trim();
  const propertyType = body.propertyType?.trim();
  const listingType = body.listingType?.trim();
  const usage = body.usage?.trim();
  const area = body.area?.trim();
  const location = body.location?.trim();
  const price = String(body.price ?? "").trim();
  const beds = String(body.beds ?? "").trim();
  const baths = String(body.baths ?? "").trim();
  const sqft = body.sqft?.trim();
  const inquiryType = body.inquiryType?.trim();
  const preferredDate = body.preferredDate?.trim();
  const preferredTime = body.preferredTime?.trim();
  const source = body.source?.trim();
  const channel = body.channel?.trim();
  const pageUrl = body.pageUrl?.trim();
  const agentName = body.agentName?.trim();
  const agentEmail = body.agentEmail?.trim();
  const agentPhone = body.agentPhone?.trim();
  const normalizedPrice = normalizeCurrencyValue(body.price);
  const zohoWebsiteUrl = isValidPublicUrl(propertyUrl)
    ? propertyUrl
    : isValidPublicUrl(pageUrl)
      ? pageUrl
      : isValidPublicUrl(siteWebsiteUrl)
        ? siteWebsiteUrl
        : undefined;
  const isWhatsAppLead =
    channel?.toLowerCase() === "whatsapp" ||
    source?.toLowerCase().includes("whatsapp");
  const normalizedFirstName = firstName || (isWhatsAppLead ? "WhatsApp" : undefined);
  const normalizedLastName =
    lastName || (isWhatsAppLead ? propertyTitle || "Website Lead" : undefined);
  const normalizedMessage =
    message ||
    (isWhatsAppLead ? "Visitor opened a WhatsApp conversation from the website." : undefined);

  if (
    !normalizedFirstName ||
    !normalizedLastName ||
    !normalizedMessage ||
    (!isWhatsAppLead && (!email || !phone))
  ) {
    return NextResponse.json(
      { success: false, error: "All contact form fields are required." },
      { status: 400 },
    );
  }

  const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key]);

  if (missingEnvKeys.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing Zoho environment variables: ${missingEnvKeys.join(", ")}`,
      },
      { status: 500 },
    );
  }

  try {
    const accountsBaseUrl = getZohoAccountsBaseUrl();
    const apiBaseUrl = getZohoApiBaseUrl();

    const tokenResponse = await fetch(`${accountsBaseUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });

    const tokenData = await parseJson(tokenResponse);
    const accessToken = tokenData.access_token as string | undefined;

    if (!tokenResponse.ok || !accessToken) {
      throw new Error(
        `Failed to get Zoho access token from ${accountsBaseUrl}: ${JSON.stringify(tokenData)}`,
      );
    }

    const descriptionLines = [
      channel ? `Channel: ${channel}` : null,
      source ? `Source: ${source}` : null,
      inquiryType ? `Inquiry Type: ${inquiryType}` : null,
      propertyId ? `Property ID: ${propertyId}` : null,
      propertyReference ? `Property Reference: ${propertyReference}` : null,
      propertyTitle ? `Property: ${propertyTitle}` : null,
      propertyUrl ? `Property URL: ${propertyUrl}` : null,
      propertyUrl ? `Direct Property Link: ${propertyUrl}` : null,
      propertyType ? `Property Type: ${propertyType}` : null,
      listingType ? `Listing Type: ${listingType}` : null,
      usage ? `Usage: ${usage}` : null,
      area ? `Area: ${area}` : null,
      location ? `Location: ${location}` : null,
      price ? `Price: ${price}` : null,
      beds ? `Bedrooms: ${beds}` : null,
      baths ? `Bathrooms: ${baths}` : null,
      sqft ? `Size: ${sqft}` : null,
      agentName ? `Assigned Agent: ${agentName}` : null,
      agentEmail ? `Agent Email: ${agentEmail}` : null,
      agentPhone ? `Agent Phone: ${agentPhone}` : null,
      pageUrl ? `Page URL: ${pageUrl}` : null,
      preferredDate ? `Preferred Date: ${preferredDate}` : null,
      preferredTime ? `Preferred Time: ${preferredTime}` : null,
      `Message: ${normalizedMessage}`,
    ].filter(Boolean);

    const leadResponse = await fetch(`${apiBaseUrl}/crm/v2/Leads`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            First_Name: normalizedFirstName,
            Last_Name: normalizedLastName,
            Company: propertyTitle || "Rise Property Website Lead",
            ...(email ? { Email: email } : {}),
            ...(phone ? { Phone: phone } : {}),
            ...(phone ? { Mobile: phone } : {}),
            ...(zohoWebsiteUrl ? { Website: zohoWebsiteUrl } : {}),
            ...(inquiryType ? { Designation: inquiryType } : {}),
            ...(normalizedPrice ? { Annual_Revenue: normalizedPrice } : {}),
            Description: descriptionLines.join("\n"),
            Lead_Source: source || (isWhatsAppLead ? "Website WhatsApp" : "Website"),
          },
        ],
      }),
      cache: "no-store",
    });

    const leadData = await parseJson(leadResponse);

    if (!leadResponse.ok || leadData?.data?.[0]?.status !== "success") {
      throw new Error(
        `Failed to create Zoho lead via ${apiBaseUrl}: ${JSON.stringify(leadData)}`,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead created successfully in Zoho CRM",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Zoho integration error.";

    console.error("Zoho Integration Error:", error);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
