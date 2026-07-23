import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getUserPosition, getTotalPlayerCount, type LeaderboardType } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "xp") as LeaderboardType;
  const limit = parseInt(searchParams.get("limit") || "100");
  const country = searchParams.get("country") || undefined;

  const leaderboard = await getLeaderboard(type, limit, country);

  let userPosition = null;
  const steamId = getSteamId(request);
  if (steamId) {
    userPosition = await getUserPosition(steamId, type);
  }

  const totalPlayers = await getTotalPlayerCount();

  return NextResponse.json({ leaderboard, userPosition, totalPlayers });
}
