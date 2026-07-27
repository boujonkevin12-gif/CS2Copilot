import { NextRequest, NextResponse } from "next/server";
import { getSteamId } from "@/lib/auth-helpers";
import { listTournaments, createTournament, autoEndExpiredTournaments } from "@/lib/services/tournament.service";

export async function GET(request: NextRequest) {
  await autoEndExpiredTournaments();
  const status = request.nextUrl.searchParams.get("status") || undefined;
  const tournaments = await listTournaments(status);
  return NextResponse.json(tournaments);
}

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { name, description, entryFee, durationHours, maxParticipants } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (entryFee < 0) return NextResponse.json({ error: "Entrada inválida" }, { status: 400 });
  if (!durationHours || durationHours < 1) return NextResponse.json({ error: "Duración inválida" }, { status: 400 });

  // Check coins
  if (entryFee > 0) {
    const db = (await import("@/lib/db")).getDb();
    const profile = await db.execute({
      sql: "SELECT pilot_coins FROM player_profile WHERE steam_id = ?",
      args: [steamId],
    });
    const coins = (profile.rows[0]?.pilot_coins as number) || 0;
    if (coins < entryFee) return NextResponse.json({ error: "No tienes suficientes pilot coins" }, { status: 400 });
  }

  const tournament = await createTournament({
    name: name.trim(),
    description: description || "",
    entryFee,
    durationHours,
    maxParticipants: maxParticipants || 0,
    creatorSteamId: steamId,
  });

  return NextResponse.json(tournament);
}
