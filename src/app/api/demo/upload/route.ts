import { NextRequest, NextResponse } from "next/server";
import { parseDemoFile } from "@/lib/services/demo-parser";
import { getSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Sesión obligatoria: el parser es costoso y no debe ser un servicio abierto.
    const user = getSession(request);
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const ip = getClientIp(request);
    if (!rateLimit(`demo/upload:${user.steamId}`, 10, 60_000) || !rateLimit(`demo/upload:ip:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Demasiadas subidas. Espera un minuto." }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("demo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se envio ningun archivo" }, { status: 400 });
    }

    if (!file.name.endsWith(".dem")) {
      return NextResponse.json({ error: "El archivo debe ser un .dem" }, { status: 400 });
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 100MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
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
    console.error("[DemoUpload] Route error:", err);
    return NextResponse.json(
      {
        error: "Error al procesar la demo",
        details: err instanceof Error ? err.message : "error desconocido",
        hint: "Asegurate de que el archivo sea una demo valida de CS2 (.dem)",
      },
      { status: 500 }
    );
  }
}
