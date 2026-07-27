import { NextRequest, NextResponse } from "next/server";
import { getSteamId } from "@/lib/auth-helpers";
import { getInvites, acceptInvite, invitePlayer } from "@/lib/services/tournament.service";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const invites = await getInvites(steamId);
  return NextResponse.json(invites);
}

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();

  // Accept invite
  if (body.inviteId) {
    try {
      await acceptInvite(body.inviteId, steamId);
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
    }
  }

  // Send invite
  if (body.tournamentId && body.toSteamId) {
    try {
      await invitePlayer(body.tournamentId, steamId, body.toSteamId);
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
}
