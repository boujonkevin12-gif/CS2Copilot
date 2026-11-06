import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!playerId) {
    return NextResponse.json({ error: "Se requiere el parametro playerId" }, { status: 400 });
  }
  if (!/^[a-z0-9-]{8,64}$/i.test(playerId)) {
    return NextResponse.json({ error: "playerId inválido" }, { status: 400 });
  }

  // Consumo de la API key de FACEIT sin sesión → límite por IP.
  if (!rateLimit(`faceit/matches:ip:${getClientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const safeOffset = Number.isFinite(offset) && offset > 0 ? Math.min(offset, 10_000) : 0;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;

  try {
    const faceit = getFaceitService();
    const matchHistory = await faceit.getMatchHistory(playerId, safeOffset, safeLimit);

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
