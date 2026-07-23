import { NextRequest, NextResponse } from "next/server";
import { claimChallenge, claimWeeklyMission } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { challengeId, type } = body;
  if (!challengeId) return NextResponse.json({ error: "challengeId requerido" }, { status: 400 });

  const result = type === "weekly"
    ? await claimWeeklyMission(steamId, challengeId)
    : await claimChallenge(steamId, challengeId);

  return NextResponse.json(result);
}
