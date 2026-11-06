import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) {
    return NextResponse.json({ error: "Se requiere el parametro nickname" }, { status: 400 });
  }
  if (nickname.length > 64) {
    return NextResponse.json({ error: "Nickname demasiado largo" }, { status: 400 });
  }

  // Consumo de la API key de FACEIT sin sesión → límite por IP.
  if (!rateLimit(`faceit/player:ip:${getClientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  try {
    const faceit = getFaceitService();
    const player = await faceit.getPlayerByNickname(nickname);

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado en FACEIT" }, { status: 404 });
    }

    return NextResponse.json({
      id: player.player_id,
      nickname: player.nickname,
      avatar: player.avatar,
      country: player.country,
      games: {
        cs2: {
          level: player.games?.cs2?.skill_level ?? null,
          elo: player.games?.cs2?.faceit_elo ?? null,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener datos del jugador" }, { status: 500 });
  }
}
