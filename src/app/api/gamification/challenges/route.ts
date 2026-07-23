import { NextRequest, NextResponse } from "next/server";
import { getDailyChallenges, getWeeklyMissions, getDailyChestStatus } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [daily, weekly, chest] = await Promise.all([
    getDailyChallenges(steamId),
    getWeeklyMissions(steamId),
    getDailyChestStatus(steamId),
  ]);

  return NextResponse.json({ daily, weekly, chest });
}
