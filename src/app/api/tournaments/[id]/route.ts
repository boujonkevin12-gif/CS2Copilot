import { NextRequest, NextResponse } from "next/server";
import { getSteamId } from "@/lib/auth-helpers";
import {
  getTournament,
  getParticipants,
  joinTournament,
  leaveTournament,
  startTournament,
  endTournament,
  autoEndExpiredTournaments,
} from "@/lib/services/tournament.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await autoEndExpiredTournaments();
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const participants = await getParticipants(id);
  return NextResponse.json({ ...tournament, participants });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "join":
        await joinTournament(id, steamId);
        return NextResponse.json({ ok: true });
      case "leave":
        await leaveTournament(id, steamId);
        return NextResponse.json({ ok: true });
      case "start":
        await startTournament(id, steamId);
        return NextResponse.json({ ok: true });
      case "end":
        await endTournament(id, steamId);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
