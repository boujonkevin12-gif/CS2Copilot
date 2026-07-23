import { NextRequest, NextResponse } from "next/server";
import { markNotificationsRead } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  await markNotificationsRead(steamId);
  return NextResponse.json({ success: true });
}
