import { NextRequest, NextResponse } from "next/server";
import { getShopItems, getOrCreateProfile } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [items, profile] = await Promise.all([
    getShopItems(steamId),
    getOrCreateProfile(steamId),
  ]);

  return NextResponse.json({ items, coins: profile.pilot_coins, level: profile.level });
}
