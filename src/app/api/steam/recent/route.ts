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
    const games = await steamService.getRecentlyPlayedGames(user.steamId);
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "Failed to fetch recent games" }, { status: 500 });
  }
}
