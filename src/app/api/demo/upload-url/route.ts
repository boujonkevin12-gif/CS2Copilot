import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { generateClientTokenFromReadWriteToken } = await import("@vercel/blob/client");
    const body = await request.json().catch(() => ({}));
    const fileName = body.fileName || `demo-${Date.now()}.dem`;

    const clientToken = await generateClientTokenFromReadWriteToken({
      token: process.env.BLOB_READ_WRITE_TOKEN!,
      pathname: `demos/${fileName}`,
      allowedContentTypes: ["application/octet-stream", "application/x-demo"],
      maximumSizeInBytes: 100 * 1024 * 1024,
      addRandomSuffix: true,
    });

    return NextResponse.json({
      token: clientToken,
      pathname: `demos/${fileName}`,
    });
  } catch (err) {
    console.error("[UploadUrl] Error:", err);
    return NextResponse.json(
      { error: "Error al generar token de subida", details: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
