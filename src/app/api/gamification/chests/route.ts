import { NextRequest, NextResponse } from "next/server";
import { openChest } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { chestType } = body;
  if (!chestType) return NextResponse.json({ error: "chestType requerido" }, { status: 400 });

  const result = await openChest(steamId, chestType);
  return NextResponse.json(result);
}
