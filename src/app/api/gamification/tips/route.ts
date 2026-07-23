import { NextRequest, NextResponse } from "next/server";
import { getDailyTips } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const tips = await getDailyTips(steamId);
  return NextResponse.json({ tips });
}
