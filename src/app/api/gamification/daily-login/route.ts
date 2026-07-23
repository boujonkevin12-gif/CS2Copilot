import { NextRequest, NextResponse } from "next/server";
import { getDailyLoginStatus, claimDailyLogin } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const status = await getDailyLoginStatus(steamId);
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const result = await claimDailyLogin(steamId);
  return NextResponse.json(result);
}
