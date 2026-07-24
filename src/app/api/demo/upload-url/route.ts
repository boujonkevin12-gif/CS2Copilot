import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const fileName = body.fileName || `demo-${Date.now()}.dem`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Vercel Blob no configurado. Configurá BLOB_READ_WRITE_TOKEN en Vercel Dashboard > Storage." },
        { status: 500 }
      );
    }

    const { generateClientTokenFromReadWriteToken } = await import("@vercel/blob/client");
    const clientToken = await generateClientTokenFromReadWriteToken({
      token,
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
