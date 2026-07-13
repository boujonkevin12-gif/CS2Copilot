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
    const friends = await steamService.getFriendsList(user.steamId);
    return NextResponse.json({ friends });
  } catch {
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}
