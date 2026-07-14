import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) {
    return NextResponse.json({ error: "Se requiere el parametro nickname" }, { status: 400 });
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
          level: player.games?.cs2?.level ?? null,
          elo: player.games?.cs2?.elo ?? null,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener datos del jugador" }, { status: 500 });
  }
}
