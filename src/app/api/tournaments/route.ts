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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.slice(0, 500) : "";
  const entryFee = body.entryFee;
  const durationHours = body.durationHours;
  const maxParticipants = body.maxParticipants;

  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (name.length > 80) return NextResponse.json({ error: "Nombre demasiado largo" }, { status: 400 });
  if (typeof entryFee !== "number" || !Number.isInteger(entryFee) || entryFee < 0 || entryFee > 1_000_000) {
    return NextResponse.json({ error: "Entrada inválida" }, { status: 400 });
  }
  if (typeof durationHours !== "number" || !Number.isInteger(durationHours) || durationHours < 1 || durationHours > 24 * 30) {
    return NextResponse.json({ error: "Duración inválida" }, { status: 400 });
  }
  if (
    maxParticipants !== undefined &&
    (typeof maxParticipants !== "number" || !Number.isInteger(maxParticipants) || maxParticipants < 0 || maxParticipants > 64)
  ) {
    return NextResponse.json({ error: "Máximo de participantes inválido" }, { status: 400 });
  }

  try {
    const tournament = await createTournament({
      name,
      description,
      entryFee,
      durationHours,
      maxParticipants: (maxParticipants as number | undefined) || 0,
      creatorSteamId: steamId,
    });
    return NextResponse.json(tournament);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear el torneo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
