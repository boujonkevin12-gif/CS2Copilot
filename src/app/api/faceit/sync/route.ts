import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  let userData: Record<string, unknown>;
  try {
    userData = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  const playerId = userData.faceitPlayerId as string | undefined;
  if (!playerId) {
    return NextResponse.json({ connected: false });
  }

  try {
    const faceit = getFaceitService();
    const stats = await faceit.getPlayerStats(playerId);
    return NextResponse.json({ connected: true, playerId, stats });
  } catch {
    return NextResponse.json({ error: "Error al obtener estadisticas de FACEIT" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: { playerId?: string; action?: string; nickname?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud invalido" }, { status: 400 });
  }

  if (body.action === "connect") {
    return handleConnect(body.nickname, request);
  }

  if (body.action === "disconnect") {
    return handleDisconnect(request);
  }

  const { playerId } = body;
  if (!playerId) {
    return NextResponse.json({ error: "Se requiere el campo playerId" }, { status: 400 });
  }

  try {
    const faceit = getFaceitService();

    const matchHistory = await faceit.getMatchHistory(playerId, 0, 20);
    if (!matchHistory || matchHistory.items.length === 0) {
      return NextResponse.json({ error: "No se encontraron partidas para este jugador" }, { status: 404 });
    }

    const syncResults = await Promise.all(
      matchHistory.items.map(async (match) => {
        const stats = await faceit.getMatchStats(match.match_id);
        return {
          matchId: match.match_id,
          map: match.map,
          mode: match.mode,
          status: match.status,
          startedAt: match.started_at,
          finishedAt: match.finished_at,
          teams: match.teams,
          stats: stats
            ? {
                rounds: stats.rounds.map((round) => ({
                  roundId: round.round_id,
                  map: round.map,
                  team1: {
                    teamId: round.team1.team_id,
                    name: round.team1.name,
                    score: parseInt(round.team1.team_stats.Score || "0", 10),
                    result: round.team1.team_stats.Result,
                    players: round.team1.players.map((p) => ({
                      playerId: p.player_id,
                      nickname: p.nickname,
                      kills: parseInt(p.player_stats.Kills || "0", 10),
                      deaths: parseInt(p.player_stats.Deaths || "0", 10),
                      assists: parseInt(p.player_stats.Assists || "0", 10),
                      kd: parseFloat(p.player_stats["K/D Ratio"] || "0"),
                      hsPercent: parseFloat(p.player_stats["HS%"] || "0"),
                      headshots: parseInt(p.player_stats.Headshots || "0", 10),
                      totalDamage: parseInt(p.player_stats["Total Damage"] || "0", 10),
                    })),
                  },
                  team2: {
                    teamId: round.team2.team_id,
                    name: round.team2.name,
                    score: parseInt(round.team2.team_stats.Score || "0", 10),
                    result: round.team2.team_stats.Result,
                    players: round.team2.players.map((p) => ({
                      playerId: p.player_id,
                      nickname: p.nickname,
                      kills: parseInt(p.player_stats.Kills || "0", 10),
                      deaths: parseInt(p.player_stats.Deaths || "0", 10),
                      assists: parseInt(p.player_stats.Assists || "0", 10),
                      kd: parseFloat(p.player_stats["K/D Ratio"] || "0"),
                      hsPercent: parseFloat(p.player_stats["HS%"] || "0"),
                      headshots: parseInt(p.player_stats.Headshots || "0", 10),
                      totalDamage: parseInt(p.player_stats["Total Damage"] || "0", 10),
                    })),
                  },
                })),
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      playerId,
      syncedAt: new Date().toISOString(),
      totalMatches: syncResults.length,
      matches: syncResults,
    });
  } catch {
    return NextResponse.json({ error: "Error al sincronizar datos de FACEIT" }, { status: 500 });
  }
}

async function handleConnect(nickname: string | undefined, request: NextRequest) {
  if (!nickname || !nickname.trim()) {
    return NextResponse.json({ error: "Se requiere el nickname de FACEIT" }, { status: 400 });
  }

  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  let userData: Record<string, unknown>;
  try {
    userData = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  try {
    const faceit = getFaceitService();
    const player = await faceit.getPlayerByNickname(nickname.trim());

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado en FACEIT. Verifica el nickname." },
        { status: 404 }
      );
    }

    const updatedUser = { ...userData,
      faceitNickname: player.nickname,
      faceitPlayerId: player.player_id,
      faceitLevel: player.games?.cs2?.level ?? null,
      faceitElo: player.games?.cs2?.elo ?? null,
    };

    const response = NextResponse.json({
      success: true,
      faceit: {
        nickname: player.nickname,
        playerId: player.player_id,
        level: player.games?.cs2?.level ?? null,
        elo: player.games?.cs2?.elo ?? null,
        avatar: player.avatar,
      },
    });

    const isSecure = request.url.startsWith("https://");
    response.cookies.set("cs2pilot_user", JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error al conectar con FACEIT. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

function handleDisconnect(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  let userData: Record<string, unknown>;
  try {
    userData = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  delete userData.faceitNickname;
  delete userData.faceitPlayerId;
  delete userData.faceitLevel;
  delete userData.faceitElo;

  const isSecure = request.url.startsWith("https://");
  const response = NextResponse.json({ success: true });
  response.cookies.set("cs2pilot_user", JSON.stringify(userData), {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
