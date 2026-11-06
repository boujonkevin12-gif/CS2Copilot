import { NextRequest, NextResponse } from "next/server";
import { parseDemoFile } from "@/lib/services/demo-parser";
import { getSession } from "@/lib/session";
import { validateBlobUrl } from "@/lib/blob-url";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_BLOB_BYTES = 100 * 1024 * 1024; // 100MB (igual que el límite de subida)
const FETCH_TIMEOUT_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    // Sesión obligatoria: antes cualquier visitante podía usar el parser
    // como servicio abierto (SSRF + consumo de CPU).
    const user = getSession(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(`demo/parse:${user.steamId}`, 10, 60_000) || !rateLimit(`demo/parse:ip:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Espera un minuto." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const blobUrl = body.blobUrl;

    if (!blobUrl) {
      return NextResponse.json({ error: "Se requiere blobUrl" }, { status: 400 });
    }

    // SSRF: solo dominio de Vercel Blob + namespace demos/ + propiedad.
    const check = validateBlobUrl(blobUrl, user.steamId);
    if (!check.ok) {
      return NextResponse.json({ error: check.reason || "URL de blob no permitida" }, { status: 400 });
    }

    const res = await fetch(blobUrl, {
      redirect: "error", // ninguna redirección: evita saltar a hosts internos
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "No se pudo descargar el blob", status: res.status }, { status: 502 });
    }

    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > MAX_BLOB_BYTES) {
      return NextResponse.json({ error: "La demo supera el tamaño máximo de 100MB" }, { status: 413 });
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BLOB_BYTES) {
      return NextResponse.json({ error: "La demo supera el tamaño máximo de 100MB" }, { status: 413 });
    }
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseDemoFile(buffer, user.steamId);

    if (!parsed) {
      return NextResponse.json({
        error: "No se pudo parsear la demo",
        details: "El formato del archivo puede no ser compatible con CS2",
      }, { status: 422 });
    }

    if (parsed.error) {
      return NextResponse.json({
        warning: parsed.error,
        data: {
          map: parsed.map,
          serverName: parsed.serverName,
          duration: parsed.duration,
          rounds: parsed.rounds.length,
          playerStats: parsed.playerStats,
          allPlayers: parsed.allPlayers,
          teams: parsed.teams,
        },
      });
    }

    return NextResponse.json({
      data: {
        map: parsed.map,
        serverName: parsed.serverName,
        duration: parsed.duration,
        rounds: parsed.rounds.length,
        playerStats: parsed.playerStats,
        allPlayers: parsed.allPlayers,
        teams: parsed.teams,
      },
    });
  } catch (err) {
    console.error("[DemoParseFromBlob] Error:", err);
    return NextResponse.json({
      error: "Error al procesar la demo",
      details: err instanceof Error ? err.message : "error desconocido",
    }, { status: 500 });
  }
}
