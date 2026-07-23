import { NextRequest, NextResponse } from "next/server";
import { equipShopItem } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { itemId } = body;
  if (!itemId) return NextResponse.json({ error: "itemId requerido" }, { status: 400 });

  const result = await equipShopItem(steamId, itemId);
  return NextResponse.json(result);
}
