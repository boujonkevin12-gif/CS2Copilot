import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";
import { getSession, setSessionCookie, SessionProfile } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function checkRateLimit(request: NextRequest, steamId: string): boolean {
  const ip = getClientIp(request);
  return (
    rateLimit(`faceit/sync:${steamId}`, 30, 60_000) &&
    rateLimit(`faceit/sync:ip:${ip}`, 60, 60_000)
  );
}

function parseUserCookie(request: NextRequest): SessionProfile | null {
  return getSession(request);
}

function setCookie(request: NextRequest, data: SessionProfile): NextResponse {
  const response = NextResponse.json({ success: true });
  if (!setSessionCookie(response, data, request)) {
    return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
  }
  return response;
}

function getUserJsonResponse(data: Record<string, unknown>, extra?: Record<string, unknown>) {
  return { ...data, ...extra };
}

export async function GET(request: NextRequest) {
  const userData = parseUserCookie(request);
  if (!userData) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  if (!checkRateLimit(request, userData.steamId)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
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
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Rate limit por sesión (si hay) + por IP para todas las acciones.
  const sessionUser = parseUserCookie(request);
  const ip = getClientIp(request);
  const userKey = sessionUser ? sessionUser.steamId : `anon:${ip}`;
  if (!checkRateLimit(request, userKey)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const action = body.action as string | undefined;

  if (action === "connect" || action === "autolink") {
    return handleAutoLink(request);
  }

  if (action === "connect-by-nickname") {
    return handleConnectByNickname(body.nickname as string | undefined, request);
  }

  if (action === "disconnect") {
    return handleDisconnect(request);
  }

  const playerId = body.playerId as string | undefined;
  if (!playerId) {
    return NextResponse.json({ error: "Se requiere el campo playerId" }, { status: 400 });
  }

  // Sincronización solo permitida para el propio usuario autenticado.
  const userData = parseUserCookie(request);
  if (!userData) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }
  if (userData.faceitPlayerId !== playerId) {
    return NextResponse.json(
      { error: "No puedes sincronizar estadísticas de otro jugador" },
      { status: 403 }
    );
  }

  return handleSyncMatches(playerId);
}

async function handleAutoLink(request: NextRequest) {
  const userData = parseUserCookie(request);
  if (!userData) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  const steamId = userData.steamId as string | undefined;
  if (!steamId) {
    return NextResponse.json({ error: "No se encontro Steam ID en la sesion" }, { status: 400 });
  }

  try {
    const faceit = getFaceitService();
    const player = await faceit.getPlayerBySteamId(steamId);

    if (!player) {
      return NextResponse.json(
        { error: "No se encontro una cuenta de FACEIT vinculada a tu Steam.", linked: false },
        { status: 404 }
      );
    }

    if (player.steam_id_64 && player.steam_id_64 !== steamId) {
      return NextResponse.json(
        { error: "La cuenta de FACEIT encontrada no coincide con tu Steam ID." },
        { status: 403 }
      );
    }

    const updatedUser = {
      ...userData,
      faceitPlayerId: player.player_id,
      faceitNickname: player.nickname,
      faceitLevel: player.games?.cs2?.skill_level ?? null,
      faceitElo: player.games?.cs2?.faceit_elo ?? null,
      faceitLinkedAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      linked: true,
      faceit: {
        nickname: player.nickname,
        playerId: player.player_id,
        level: player.games?.cs2?.skill_level ?? null,
        elo: player.games?.cs2?.faceit_elo ?? null,
        avatar: player.avatar,
      },
    });

    if (!setSessionCookie(response, updatedUser, request)) {
      return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error al buscar cuenta de FACEIT. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

async function handleConnectByNickname(nickname: string | undefined, request: NextRequest) {
  if (!nickname || !nickname.trim()) {
    return NextResponse.json({ error: "Se requiere el nickname de FACEIT" }, { status: 400 });
  }

  const userData = parseUserCookie(request);
  if (!userData) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
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

    const steamId = userData.steamId as string | undefined;
    if (steamId && player.steam_id_64 && player.steam_id_64 !== steamId) {
      return NextResponse.json(
        { error: "Esa cuenta de FACEIT no esta vinculada a tu Steam." },
        { status: 403 }
      );
    }

    const updatedUser = {
      ...userData,
      faceitPlayerId: player.player_id,
      faceitNickname: player.nickname,
      faceitLevel: player.games?.cs2?.skill_level ?? null,
      faceitElo: player.games?.cs2?.faceit_elo ?? null,
      faceitLinkedAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      linked: true,
      faceit: {
        nickname: player.nickname,
        playerId: player.player_id,
        level: player.games?.cs2?.skill_level ?? null,
        elo: player.games?.cs2?.faceit_elo ?? null,
        avatar: player.avatar,
      },
    });

    if (!setSessionCookie(response, updatedUser, request)) {
      return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error al conectar con FACEIT. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

function handleDisconnect(request: NextRequest) {
  const userData = parseUserCookie(request);
  if (!userData) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  delete userData.faceitPlayerId;
  delete userData.faceitNickname;
  delete userData.faceitLevel;
  delete userData.faceitElo;
  delete userData.faceitLinkedAt;

  const response = NextResponse.json({ success: true });
  if (!setSessionCookie(response, userData, request)) {
    return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
  }

  return response;
}

async function handleSyncMatches(playerId: string) {
  try {
    const faceit = getFaceitService();

    const matchHistory = await faceit.getMatchHistory(playerId, 0, 20);
    if (!matchHistory || matchHistory.items.length === 0) {
      return NextResponse.json({
        playerId,
        syncedAt: new Date().toISOString(),
        totalMatches: 0,
        matches: [],
      });
    }

    const syncResults = await Promise.all(
      matchHistory.items.map(async (match) => {
        const stats = await faceit.getMatchStats(match.match_id);

        let mapName = "";
        let resultTeam = "";
        let scoreTeam = "";
        let playerStats: Record<string, string> | null = null;

        if (stats && stats.rounds && stats.rounds.length > 0) {
          const round = stats.rounds[0];
          mapName = round.round_stats?.Map || "";
          scoreTeam = round.round_stats?.Score || "";

          const teamEntries = round.teams;
          if (teamEntries && teamEntries.length >= 2) {
            for (const team of teamEntries) {
              const isPlayerTeam = team.players.some((p) => p.player_id === playerId);
              if (isPlayerTeam) {
                resultTeam = team.team_stats?.["Team Win"] === "1" ? "win" : "lose";
                const foundPlayer = team.players.find((p) => p.player_id === playerId);
                if (foundPlayer) {
                  playerStats = foundPlayer.player_stats;
                }
                break;
              }
            }
          }
        }

        return {
          matchId: match.match_id,
          map: mapName,
          mode: match.game_mode || "",
          status: match.status,
          startedAt: match.started_at,
          finishedAt: match.finished_at,
          teams: match.teams,
          results: match.results,
          playerResult: resultTeam,
          playerScore: scoreTeam,
          playerStats,
        };
      })
    );

    return NextResponse.json({
      playerId,
      syncedAt: new Date().toISOString(),
      totalMatches: syncResults.length,
      matches: syncResults,
    });
  } catch (err) {
    console.error("[SyncMatches] Error:", err);
    return NextResponse.json({ error: "Error al sincronizar datos de FACEIT" }, { status: 500 });
  }
}
