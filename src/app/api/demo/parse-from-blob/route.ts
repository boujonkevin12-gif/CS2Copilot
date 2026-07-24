import { NextRequest, NextResponse } from "next/server";
import { parseDemoFile } from "@/lib/services/demo-parser";

export async function POST(request: NextRequest) {
  try {
    const { blobUrl } = await request.json();

    if (!blobUrl) {
      return NextResponse.json({ error: "Se requiere blobUrl" }, { status: 400 });
    }

    const res = await fetch(blobUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "No se pudo descargar el blob", status: res.status }, { status: 502 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parseDemoFile(buffer);

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
