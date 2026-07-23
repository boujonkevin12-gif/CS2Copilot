import { NextRequest, NextResponse } from "next/server";
import { logAction, syncProfileStats } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { action, value, stats } = body;

  if (action) {
    await logAction(steamId, action, value || 1);
  }

  let newAchievements: string[] = [];
  if (stats) {
    newAchievements = await syncProfileStats(steamId, stats);
  }

  return NextResponse.json({ success: true, newAchievements });
}
