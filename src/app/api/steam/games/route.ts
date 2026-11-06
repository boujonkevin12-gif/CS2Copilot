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
    const games = await steamService.getOwnedGames(user.steamId);
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
