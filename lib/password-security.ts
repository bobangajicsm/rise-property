import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const iterations = 120_000;
const keyLength = 64;
const digest = "sha512";

export function normalizeLoginUsername(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");

  return { hash, salt };
}

export function verifyPasswordHash(
  password: string,
  salt?: string | null,
  expectedHash?: string | null,
) {
  if (!password || !salt || !expectedHash) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, salt, iterations, keyLength, digest);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return (
    actualHash.length === expectedBuffer.length &&
    timingSafeEqual(actualHash, expectedBuffer)
  );
}
