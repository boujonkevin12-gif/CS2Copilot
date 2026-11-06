import { NextRequest, NextResponse } from "next/server";
import { getSteamId } from "@/lib/auth-helpers";
import { createChallenge, joinChallenge, leaveChallenge, cancelChallenge, startChallenge, getChallengesForUser, getChallenge, searchUsers, inviteToChallenge, getPendingInvites, acceptChallengeInvite, rejectChallengeInvite } from "@/lib/services/match-challenge.service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/** ID de desafío/torneo: alfanumérico + guion bajo, longitud razonable. */
const ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

function getUserId(req: NextRequest): string | null {
  return getSteamId(req);
}

export async function GET(request: NextRequest) {
  const steamId = getUserId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const challenges = await getChallengesForUser(steamId);
  const pendingInvites = await getPendingInvites(steamId);
  return NextResponse.json({ challenges, pendingInvites });
}

export async function POST(request: NextRequest) {
  const steamId = getUserId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Frenar spam de acciones económicas (crear/unirse/reembolsos).
  const ip = getClientIp(request);
  if (!rateLimit(`challenges:${steamId}`, 60, 60_000) || !rateLimit(`challenges:ip:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const action = body.action as string | undefined;

  if (action === "create") {
    const stake = Number(body.stake) || 0;
    const maxPlayers = Math.min(5, Math.max(2, Number(body.maxPlayers) || 5));

    const result = await createChallenge(steamId, stake, maxPlayers);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ challenge: result });
  }

  if (action === "join") {
    const challengeId = body.challengeId as string | undefined;
    if (!challengeId || !ID_REGEX.test(challengeId)) return NextResponse.json({ error: "ID de desafio requerido" }, { status: 400 });
    const result = await joinChallenge(challengeId, steamId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ challenge: result });
  }

  if (action === "leave") {
    const challengeId = body.challengeId as string | undefined;
    if (!challengeId || !ID_REGEX.test(challengeId)) return NextResponse.json({ error: "ID de desafio requerido" }, { status: 400 });
    const result = await leaveChallenge(challengeId, steamId);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === "cancel") {
    const challengeId = body.challengeId as string | undefined;
    if (!challengeId || !ID_REGEX.test(challengeId)) return NextResponse.json({ error: "ID de desafio requerido" }, { status: 400 });
    const result = await cancelChallenge(challengeId, steamId);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === "start") {
    const challengeId = body.challengeId as string | undefined;
    if (!challengeId || !ID_REGEX.test(challengeId)) return NextResponse.json({ error: "ID de desafio requerido" }, { status: 400 });
    const result = await startChallenge(challengeId, steamId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ challenge: result });
  }

  if (action === "search_users") {
    const query = typeof body.query === "string" ? body.query.slice(0, 50) : "";
    if (query.length < 2) return NextResponse.json({ users: [] });
    const users = await searchUsers(query);
    return NextResponse.json({ users });
  }

  if (action === "invite") {
    const challengeId = body.challengeId as string | undefined;
    const toSteamId = body.toSteamId as string | undefined;
    if (!challengeId || !ID_REGEX.test(challengeId) || !toSteamId || !/^\d{17}$/.test(toSteamId)) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }
    const result = await inviteToChallenge(challengeId, steamId, toSteamId);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === "accept_invite") {
    const inviteId = Number(body.inviteId);
    if (!inviteId) return NextResponse.json({ error: "Invitacion requerida" }, { status: 400 });
    const result = await acceptChallengeInvite(inviteId, steamId);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (action === "reject_invite") {
    const inviteId = Number(body.inviteId);
    if (!inviteId) return NextResponse.json({ error: "Invitacion requerida" }, { status: 400 });
    await rejectChallengeInvite(inviteId, steamId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
}
