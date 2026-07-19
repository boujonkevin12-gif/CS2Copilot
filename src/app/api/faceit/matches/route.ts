import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!playerId) {
    return NextResponse.json({ error: "Se requiere el parametro playerId" }, { status: 400 });
  }

  try {
    const faceit = getFaceitService();
    const matchHistory = await faceit.getMatchHistory(playerId, offset, limit);

    if (!matchHistory) {
      return NextResponse.json({ error: "No se pudo obtener el historial de partidas" }, { status: 404 });
    }

    const matches = matchHistory.items.map((match) => ({
      matchId: match.match_id,
      mode: match.game_mode,
      status: match.status,
      teams: match.teams,
      results: match.results,
      startedAt: match.started_at,
      finishedAt: match.finished_at,
    }));

    return NextResponse.json({
      matches,
      start: matchHistory.start,
      end: matchHistory.end,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener historial de partidas" }, { status: 500 });
  }
}
