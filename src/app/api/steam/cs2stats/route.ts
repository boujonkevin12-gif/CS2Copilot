import { NextRequest, NextResponse } from "next/server";
import { getSteamService } from "@/lib/services";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = getSession(request);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const steamService = getSteamService();
    const stats = await steamService.getUserStatsForGame(user.steamId);
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: "Failed to fetch CS2 stats" }, { status: 500 });
  }
}
