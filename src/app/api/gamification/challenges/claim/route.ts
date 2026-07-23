import { NextRequest, NextResponse } from "next/server";
import { claimChallenge, claimWeeklyMission, getDailyChestStatus, addCoins } from "@/lib/services/gamification.service";
import { getDb } from "@/lib/db";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { challengeId, type } = body;
  if (!challengeId) return NextResponse.json({ error: "challengeId requerido" }, { status: 400 });

  if (type === "chest" && challengeId === "daily_chest") {
    const chest = await getDailyChestStatus(steamId);
    if (!chest.allDone) return NextResponse.json({ success: false, error: "Completa todos los desafíos primero" }, { status: 400 });
    if (chest.claimed) return NextResponse.json({ success: false, error: "Ya reclamaste el cofre hoy" }, { status: 400 });

    const coins = Math.floor(Math.random() * 91) + 10;
    await addCoins(steamId, coins);
    await getDb().execute({
      sql: "INSERT INTO chest_history (steam_id, chest_type, reward_type, reward_id, reward_amount) VALUES (?, 'daily', 'coins', 'daily_chest', ?)",
      args: [steamId, coins],
    });

    return NextResponse.json({ success: true, type: "coins", amount: coins });
  }

  const result = type === "weekly"
    ? await claimWeeklyMission(steamId, challengeId)
    : await claimChallenge(steamId, challengeId);

  return NextResponse.json(result);
}
