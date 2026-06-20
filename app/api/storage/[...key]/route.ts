import { NextResponse } from "next/server";
import { downloadObjectFromStorage } from "@/lib/storage";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    key: string[];
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { key } = await context.params;
  const objectKey = key.join("/");

  if (!objectKey) {
    return NextResponse.json(
      { success: false, error: "Missing object key." },
      { status: 400 },
    );
  }

  try {
    const object = await downloadObjectFromStorage(objectKey);

    return new NextResponse(object.body, {
      status: 200,
      headers: {
        "Content-Type": object.contentType,
        "Cache-Control": object.cacheControl,
        ...(object.etag ? { ETag: object.etag } : {}),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to read object from storage.",
      },
      { status: 404 },
    );
  }
}
