import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadCount } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(steamId),
    getUnreadCount(steamId),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
