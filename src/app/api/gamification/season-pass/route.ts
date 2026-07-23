import { NextRequest, NextResponse } from "next/server";
import { getSeasonPassStatus, claimSeasonPassReward } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const status = await getSeasonPassStatus(steamId);
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { level } = body;
  if (!level) return NextResponse.json({ error: "level requerido" }, { status: 400 });

  const result = await claimSeasonPassReward(steamId, level);
  return NextResponse.json(result);
}
