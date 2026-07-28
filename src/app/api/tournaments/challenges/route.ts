import { NextRequest, NextResponse } from "next/server";
import { getSteamId } from "@/lib/auth-helpers";
import { createChallenge, acceptChallenge, cancelChallenge, getChallengesForUser, getChallenge } from "@/lib/services/match-challenge.service";
import { getFaceitService } from "@/lib/services/faceit.service";

function getUserId(req: NextRequest): string | null {
  const steamId = getSteamId(req);
  if (steamId) return steamId;
  try {
    const cookie = req.cookies.get("cs2pilot_user");
    if (!cookie) return null;
    const userData = JSON.parse(cookie.value);
    return userData.steamId || userData.steam_id || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const steamId = getUserId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const challenges = await getChallengesForUser(steamId);
  return NextResponse.json({ challenges });
}

export async function POST(request: NextRequest) {
  const steamId = getUserId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const action = body.action as string | undefined;

  if (action === "create") {
    const nickname = body.nickname as string | undefined;
    const stake = Number(body.stake) || 0;

    if (!nickname) return NextResponse.json({ error: "Nickname de FACEIT requerido" }, { status: 400 });

    // Lookup opponent by FACEIT nickname
    try {
      const faceit = getFaceitService();
      const faceitPlayer = await faceit.getPlayerByNickname(nickname);
      if (!faceitPlayer?.steam_id_64) return NextResponse.json({ error: "Jugador de FACEIT no encontrado" }, { status: 404 });

      const opponentSteamId = faceitPlayer.steam_id_64;

      // Check opponent exists in our DB
      const { getDb } = await import("@/lib/db");
      const opponent = await getDb().execute({ sql: "SELECT steam_id FROM player_profile WHERE steam_id = ?", args: [opponentSteamId] });
      if (opponent.rows.length === 0) return NextResponse.json({ error: "Ese jugador no esta registrado en la pagina" }, { status: 400 });

      const result = await createChallenge(steamId, opponentSteamId, stake);
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ challenge: result });
    } catch {
      return NextResponse.json({ error: "Error al buscar jugador en FACEIT" }, { status: 500 });
    }
  }

  if (action === "accept") {
    const challengeId = body.challengeId as string | undefined;
    if (!challengeId) return NextResponse.json({ error: "ID de desafio requerido" }, { status: 400 });
    const result = await acceptChallenge(challengeId, steamId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ challenge: result });
  }

  if (action === "cancel") {
    const challengeId = body.challengeId as string | undefined;
    if (!challengeId) return NextResponse.json({ error: "ID de desafio requerido" }, { status: 400 });
    const result = await cancelChallenge(challengeId, steamId);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === "lookup") {
    const nickname = body.nickname as string | undefined;
    if (!nickname) return NextResponse.json({ error: "Nickname requerido" }, { status: 400 });
    try {
      const faceit = getFaceitService();
      const player = await faceit.getPlayerByNickname(nickname);
      if (!player) return NextResponse.json({ error: "No encontrado en FACEIT" }, { status: 404 });
      return NextResponse.json({
        player: {
          nickname: player.nickname,
          avatar: player.avatar,
          level: player.games?.cs2?.skill_level || 0,
          elo: player.games?.cs2?.faceit_elo || 0,
        },
      });
    } catch {
      return NextResponse.json({ error: "Error al buscar en FACEIT" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
}
