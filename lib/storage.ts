import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { slugifyPropertyValue } from "@/lib/property-slug";

interface StorageConfig {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  publicBaseUrl: string | null;
  region: string;
  secretAccessKey: string;
}

let storageClient: S3Client | null = null;
let cachedConfig: StorageConfig | null = null;
let cachedConfigKey: string | null = null;

function cleanEnvValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isPublicAssetBaseUrl(value: string) {
  try {
    const url = new URL(value);
    return !url.hostname.endsWith(".r2.cloudflarestorage.com");
  } catch {
    return false;
  }
}

function readStorageEnv() {
  const endpoint = cleanEnvValue(process.env.R2_ENDPOINT || process.env.S3_ENDPOINT);
  const bucket = cleanEnvValue(process.env.R2_BUCKET || process.env.S3_BUCKET);
  const accessKeyId = cleanEnvValue(
    process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID,
  );
  const secretAccessKey = cleanEnvValue(
    process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY,
  );
  const publicBaseUrl = cleanEnvValue(
    process.env.R2_PUBLIC_BASE_URL || process.env.S3_PUBLIC_BASE_URL,
  );
  const region =
    cleanEnvValue(process.env.R2_REGION || process.env.S3_REGION) || "auto";

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    region,
  };
}

export function getStorageConfig() {
  const {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    region,
  } = readStorageEnv();

  const configKey = [
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    region,
  ].join("|");

  if (cachedConfigKey === configKey) {
    return cachedConfig;
  }

  storageClient = null;
  cachedConfigKey = configKey;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    cachedConfig = null;
    return cachedConfig;
  }

  cachedConfig = {
    endpoint: trimTrailingSlash(endpoint),
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl ? trimTrailingSlash(publicBaseUrl) : null,
    region,
  };

  return cachedConfig;
}

function getStorageClient() {
  const config = getStorageConfig();

  if (!config) {
    return null;
  }

  if (!storageClient) {
    storageClient = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return storageClient;
}

export function buildPublicUrl(key: string) {
  const config = getStorageConfig();

  if (config?.publicBaseUrl && isPublicAssetBaseUrl(config.publicBaseUrl)) {
    return `${config.publicBaseUrl}/${key}`;
  }

  return `/api/storage/${key}`;
}

export async function uploadImageToStorage(params: {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
}) {
  const config = getStorageConfig();
  const client = getStorageClient();

  if (!config || !client) {
    throw new Error("Storage is not configured.");
  }

  const extension =
    params.fileName.split(".").pop()?.toLowerCase() ||
    params.contentType.split("/").pop() ||
    "bin";
  const baseName =
    params.fileName.replace(/\.[^.]+$/, "") || `upload-${Date.now()}`;
  const key = `properties/${Date.now()}-${slugifyPropertyValue(baseName)}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: params.bytes,
      ContentType: params.contentType,
    }),
  );

  return {
    key,
    url: buildPublicUrl(key),
  };
}

export async function deleteObjectFromStorage(key: string) {
  const config = getStorageConfig();
  const client = getStorageClient();

  if (!config || !client) {
    throw new Error("Storage is not configured.");
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

export async function downloadObjectFromStorage(key: string) {
  const config = getStorageConfig();
  const client = getStorageClient();

  if (!config || !client) {
    throw new Error("Storage is not configured.");
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("File not found or empty.");
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return {
    body: Buffer.concat(chunks),
    contentType: response.ContentType ?? "application/octet-stream",
    cacheControl: response.CacheControl ?? "public, max-age=31536000, immutable",
    etag: response.ETag ?? undefined,
  };
}
