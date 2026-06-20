import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { slugifyPropertyValue } from "@/lib/property-slug";

interface StorageConfig {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  publicBaseUrl: string;
  region: string;
  secretAccessKey: string;
}

let storageClient: S3Client | null = null;
let cachedConfig: StorageConfig | null | undefined;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeEndpoint(endpoint: string, bucket: string) {
  const trimmed = trimTrailingSlash(endpoint);

  try {
    const url = new URL(trimmed);
    if (url.pathname === `/${bucket}`) {
      url.pathname = "";
    } else if (url.pathname.endsWith(`/${bucket}`)) {
      url.pathname = url.pathname.slice(0, -(`/${bucket}`).length);
    }

    return trimTrailingSlash(url.toString());
  } catch {
    return trimmed;
  }
}

export function getStorageConfig() {
  if (cachedConfig !== undefined) {
    return cachedConfig;
  }

  const endpoint = process.env.S3_ENDPOINT?.trim();
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
  const region = process.env.S3_REGION?.trim() || "auto";

  if (
    !endpoint ||
    !bucket ||
    !accessKeyId ||
    !secretAccessKey ||
    !publicBaseUrl
  ) {
    cachedConfig = null;
    return cachedConfig;
  }

  cachedConfig = {
    endpoint: normalizeEndpoint(endpoint, bucket),
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: trimTrailingSlash(publicBaseUrl),
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
    url: `${config.publicBaseUrl}/${key}`,
  };
}
