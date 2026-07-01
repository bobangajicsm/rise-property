import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getStorageConfig, uploadImageToStorage } from "@/lib/storage";

export const runtime = "nodejs";

const maxUploadSize = 10 * 1024 * 1024;
const avatarSize = 512;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!getStorageConfig()) {
    return NextResponse.json(
      { success: false, error: "Storage is not configured." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Missing file." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { success: false, error: "Only image uploads are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxUploadSize) {
    return NextResponse.json(
      { success: false, error: "Image is too large. Max size is 10MB." },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const resizedImage = await sharp(Buffer.from(arrayBuffer))
      .rotate()
      .resize(avatarSize, avatarSize, {
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 82 })
      .toBuffer();
    const result = await uploadImageToStorage({
      bytes: new Uint8Array(resizedImage),
      contentType: "image/webp",
      fileName: `${file.name.replace(/\.[^.]+$/, "") || "agent"}.webp`,
      folder: "agents",
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url ?? result.key,
      width: avatarSize,
      height: avatarSize,
    });
  } catch (error) {
    const config = getStorageConfig();
    const errorMessage = error instanceof Error ? error.message : "Upload failed unexpectedly.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage.includes("SignatureDoesNotMatch")
          ? `R2 rejected the upload signature for bucket "${config?.bucket ?? "unknown"}" using endpoint "${config?.endpoint ?? "missing"}". Check that the bucket, endpoint, access key, and secret belong to the same Cloudflare R2 account.`
          : errorMessage,
      },
      { status: 500 },
    );
  }
}
