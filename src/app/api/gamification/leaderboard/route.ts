import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getUserPosition, getTotalPlayerCount, type LeaderboardType } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "xp") as LeaderboardType;
    const limit = parseInt(searchParams.get("limit") || "100");
    const country = searchParams.get("country") || undefined;

    const leaderboard = await getLeaderboard(type, limit, country);

    let userPosition = null;
    const steamId = getSteamId(request);
    if (steamId) {
      try {
        userPosition = await getUserPosition(steamId, type);
      } catch (e) {
        console.error("[Leaderboard] getUserPosition error:", e);
      }
    }

    let totalPlayers = 0;
    try {
      totalPlayers = await getTotalPlayerCount();
    } catch (e) {
      console.error("[Leaderboard] getTotalPlayerCount error:", e);
    }

    return NextResponse.json({ leaderboard, userPosition, totalPlayers });
  } catch (e) {
    console.error("[Leaderboard] Error:", e);
    return NextResponse.json({ error: "Error interno", leaderboard: [], userPosition: null, totalPlayers: 0 }, { status: 200 });
  }
}
