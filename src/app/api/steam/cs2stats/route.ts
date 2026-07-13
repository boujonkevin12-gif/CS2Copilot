import { NextRequest, NextResponse } from "next/server";
import { getSteamService } from "@/lib/services";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = JSON.parse(cookie.value);
    const steamService = getSteamService();
    const stats = await steamService.getUserStatsForGame(user.steamId);
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: "Failed to fetch CS2 stats" }, { status: 500 });
  }
}
