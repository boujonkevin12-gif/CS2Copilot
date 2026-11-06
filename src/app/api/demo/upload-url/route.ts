import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_FILENAME_LEN = 100;

/**
 * Sanitiza el nombre de archivo para que no permita path traversal
 * ni caracteres raros. Devuelve null si el nombre es inválido.
 */
function sanitizeFileName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // Quitar cualquier separador de ruta y normalizar.
  const base = raw.split(/[\\/]/).pop() || "";
  const cleaned = base.replace(/[^\w.\- ]+/g, "_").trim();
  if (!cleaned || cleaned === "." || cleaned === "..") return null;
  if (cleaned.length > MAX_FILENAME_LEN) return null;
  if (!cleaned.toLowerCase().endsWith(".dem")) return null;
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    // Sesión obligatoria: antes cualquiera podía pedir tokens de subida.
    const user = getSession(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(`demo/upload-url:${user.steamId}`, 10, 60_000) || !rateLimit(`demo/upload-url:ip:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Demasiadas subidas. Espera un minuto." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const fileName = sanitizeFileName(body.fileName) || `demo-${Date.now()}.dem`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Vercel Blob no configurado. Configurá BLOB_READ_WRITE_TOKEN en Vercel Dashboard > Storage." },
        { status: 500 }
      );
    }

    // Namespace por usuario: permite verificar la propiedad al parsear.
    const pathname = `demos/${user.steamId}/${fileName}`;

    const { generateClientTokenFromReadWriteToken } = await import("@vercel/blob/client");
    const clientToken = await generateClientTokenFromReadWriteToken({
      token,
      pathname,
      allowedContentTypes: ["application/octet-stream", "application/x-demo"],
      maximumSizeInBytes: 100 * 1024 * 1024,
      addRandomSuffix: true,
    });

    return NextResponse.json({
      token: clientToken,
      pathname,
    });
  } catch (err) {
    console.error("[UploadUrl] Error:", err);
    return NextResponse.json(
      { error: "Error al generar token de subida", details: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
