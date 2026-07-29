import { getDb } from "@/lib/db";
import { getFaceitService } from "@/lib/services/faceit.service";

export interface MatchChallenge {
  id: string;
  creatorSteamId: string;
  creatorName?: string;
  creatorAvatar?: string | null;
  stake: number;
  maxParticipants: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  faceitMatchId: string | null;
  winnerSteamId: string | null;
  participants: ParticipantInfo[];
  createdAt: string;
  resolvedAt: string | null;
}

export interface ParticipantInfo {
  steamId: string;
  name: string;
  avatar: string | null;
  score: number;
  joinedAt: string;
}

function generateId(): string {
  return "mc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function searchUsers(query: string, limit = 10): Promise<{ steamId: string; name: string; avatar: string | null }[]> {
  const result = await getDb().execute({
    sql: "SELECT steam_id, steam_name, avatar_url FROM player_profile WHERE steam_name LIKE ? AND steam_name != '' ORDER BY steam_level DESC LIMIT ?",
    args: [`%${query}%`, limit],
  });
  return result.rows.map((r) => ({
    steamId: r.steam_id as string,
    name: r.steam_name as string,
    avatar: r.avatar_url as string | null,
  }));
}

export async function createChallenge(creatorSteamId: string, stake: number, maxParticipants = 5): Promise<MatchChallenge | { error: string }> {
  if (stake < 10) return { error: "La apuesta minima es de 10 monedas" };
  if (maxParticipants < 2 || maxParticipants > 5) return { error: "Deben ser entre 2 y 5 participantes" };

  const creator = await getDb().execute({ sql: "SELECT pilot_coins FROM player_profile WHERE steam_id = ?", args: [creatorSteamId] });
  if (creator.rows.length === 0) return { error: "Creador no encontrado" };
  if ((creator.rows[0].pilot_coins as number) < stake) return { error: "No tienes suficientes monedas" };

  const id = generateId();
  await getDb().execute({
    sql: "INSERT INTO match_challenges (id, creator_steam_id, opponent_steam_id, stake, status, max_participants) VALUES (?, ?, ?, ?, 'open', ?)",
    args: [id, creatorSteamId, creatorSteamId, stake, maxParticipants],
  });

  // Creator auto-joins
  await getDb().execute({
    sql: "INSERT INTO match_challenge_participants (challenge_id, steam_id) VALUES (?, ?)",
    args: [id, creatorSteamId],
  });

  // Deduct stake from creator
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ? WHERE steam_id = ?",
    args: [stake, creatorSteamId],
  });

  return getChallenge(id) as Promise<MatchChallenge>;
}

export async function joinChallenge(challengeId: string, steamId: string): Promise<MatchChallenge | { error: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { error: "Desafio no encontrado" };
  if (challenge.status !== "open") return { error: "El desafio ya no esta abierto" };

  // Check if already joined
  if (challenge.participants.some((p) => p.steamId === steamId)) return { error: "Ya estas en este desafio" };

  // Check capacity
  if (challenge.participants.length >= challenge.maxParticipants) return { error: "El desafio esta lleno" };

  // Check coins
  const player = await getDb().execute({ sql: "SELECT pilot_coins FROM player_profile WHERE steam_id = ?", args: [steamId] });
  if (player.rows.length === 0) return { error: "Jugador no encontrado" };
  if ((player.rows[0].pilot_coins as number) < challenge.stake) return { error: "No tienes suficientes monedas" };

  await getDb().execute({
    sql: "INSERT INTO match_challenge_participants (challenge_id, steam_id) VALUES (?, ?)",
    args: [challengeId, steamId],
  });

  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ? WHERE steam_id = ?",
    args: [challenge.stake, steamId],
  });

  return getChallenge(challengeId) as Promise<MatchChallenge>;
}

export async function leaveChallenge(challengeId: string, steamId: string): Promise<{ success: boolean; error?: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { success: false, error: "Desafio no encontrado" };
  if (challenge.status !== "open") return { success: false, error: "El desafio ya no esta abierto" };

  await getDb().execute({
    sql: "DELETE FROM match_challenge_participants WHERE challenge_id = ? AND steam_id = ?",
    args: [challengeId, steamId],
  });

  // Refund stake
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
    args: [challenge.stake, steamId],
  });

  // If no participants left, cancel the challenge
  const remaining = await getDb().execute({
    sql: "SELECT COUNT(*) as c FROM match_challenge_participants WHERE challenge_id = ?",
    args: [challengeId],
  });
  if ((remaining.rows[0].c as number) === 0) {
    await getDb().execute({
      sql: "UPDATE match_challenges SET status = 'cancelled' WHERE id = ?",
      args: [challengeId],
    });
  }

  return { success: true };
}

export async function cancelChallenge(challengeId: string, steamId: string): Promise<{ success: boolean; error?: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { success: false, error: "Desafio no encontrado" };
  if (challenge.creatorSteamId !== steamId) return { success: false, error: "Solo el creador puede cancelar" };
  if (challenge.status !== "open") return { success: false, error: "El desafio ya no esta abierto" };

  // Refund all participants
  for (const p of challenge.participants) {
    await getDb().execute({
      sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
      args: [challenge.stake, p.steamId],
    });
  }

  await getDb().execute({
    sql: "DELETE FROM match_challenge_participants WHERE challenge_id = ?",
    args: [challengeId],
  });

  await getDb().execute({
    sql: "DELETE FROM match_challenge_invites WHERE challenge_id = ?",
    args: [challengeId],
  });

  await getDb().execute({
    sql: "UPDATE match_challenges SET status = 'cancelled' WHERE id = ?",
    args: [challengeId],
  });

  return { success: true };
}

export async function inviteToChallenge(challengeId: string, fromSteamId: string, toSteamId: string): Promise<{ success: boolean; error?: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { success: false, error: "Desafio no encontrado" };
  if (challenge.creatorSteamId !== fromSteamId) return { success: false, error: "Solo el creador puede invitar" };
  if (challenge.status !== "open") return { success: false, error: "El desafio ya no esta abierto" };
  if (challenge.participants.length >= challenge.maxParticipants) return { success: false, error: "El desafio esta lleno" };
  if (challenge.participants.some((p) => p.steamId === toSteamId)) return { success: false, error: "Ya esta en el desafio" };

  await getDb().execute({
    sql: "INSERT OR IGNORE INTO match_challenge_invites (challenge_id, from_steam_id, to_steam_id) VALUES (?, ?, ?)",
    args: [challengeId, fromSteamId, toSteamId],
  });

  return { success: true };
}

export async function getPendingInvites(steamId: string): Promise<any[]> {
  const result = await getDb().execute({
    sql: `SELECT mci.*, mc.stake, mc.status as challenge_status,
          (SELECT steam_name FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_name,
          (SELECT steam_name FROM player_profile WHERE steam_id = mci.from_steam_id) as from_name
          FROM match_challenge_invites mci
          JOIN match_challenges mc ON mc.id = mci.challenge_id
          WHERE mci.to_steam_id = ? AND mci.status = 'pending'
          ORDER BY mci.created_at DESC`,
    args: [steamId],
  });
  return result.rows;
}

export async function acceptChallengeInvite(inviteId: number, steamId: string): Promise<{ success: boolean; error?: string }> {
  const result = await getDb().execute({
    sql: "SELECT * FROM match_challenge_invites WHERE id = ? AND to_steam_id = ? AND status = 'pending'",
    args: [inviteId, steamId],
  });
  if (result.rows.length === 0) return { success: false, error: "Invitacion no encontrada" };

  const invite = result.rows[0];
  const joinResult = await joinChallenge(invite.challenge_id as string, steamId);
  if ("error" in joinResult) return { success: false, error: joinResult.error };

  await getDb().execute({
    sql: "UPDATE match_challenge_invites SET status = 'accepted' WHERE id = ?",
    args: [inviteId],
  });

  return { success: true };
}

export async function rejectChallengeInvite(inviteId: number, steamId: string): Promise<{ success: boolean; error?: string }> {
  await getDb().execute({
    sql: "UPDATE match_challenge_invites SET status = 'rejected' WHERE id = ? AND to_steam_id = ? AND status = 'pending'",
    args: [inviteId, steamId],
  });
  return { success: true };
}

export async function startChallenge(challengeId: string, steamId: string): Promise<MatchChallenge | { error: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { error: "Desafio no encontrado" };
  if (challenge.creatorSteamId !== steamId) return { error: "Solo el creador puede iniciar" };
  if (challenge.status !== "open") return { error: "El desafio ya no esta abierto" };
  if (challenge.participants.length < 2) return { error: "Se necesitan al menos 2 participantes" };

  await getDb().execute({
    sql: "UPDATE match_challenges SET status = 'in_progress' WHERE id = ?",
    args: [challengeId],
  });

  return getChallenge(challengeId) as Promise<MatchChallenge>;
}

export async function getChallenge(id: string): Promise<MatchChallenge | null> {
  const result = await getDb().execute({
    sql: `SELECT mc.*,
          (SELECT steam_name FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_name,
          (SELECT avatar_url FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_avatar
          FROM match_challenges mc WHERE mc.id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function getChallengesForUser(steamId: string): Promise<MatchChallenge[]> {
  const result = await getDb().execute({
    sql: `SELECT mc.*,
          (SELECT steam_name FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_name,
          (SELECT avatar_url FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_avatar
          FROM match_challenges mc
          WHERE mc.id IN (SELECT challenge_id FROM match_challenge_participants WHERE steam_id = ?)
          ORDER BY mc.created_at DESC`,
    args: [steamId],
  });
  return Promise.all(result.rows.map((r) => mapRow(r)));
}

// Called during profile sync to auto-resolve challenges
export async function checkAndResolveChallenges(steamId: string): Promise<void> {
  const active = await getDb().execute({
    sql: `SELECT mc.* FROM match_challenges mc
          WHERE mc.status = 'in_progress'
          AND mc.id IN (SELECT challenge_id FROM match_challenge_participants WHERE steam_id = ?)`,
    args: [steamId],
  });
  if (active.rows.length === 0) return;

  const faceit = getFaceitService();

  for (const row of active.rows) {
    const challenge = await mapRow(row);

    // Get FACEIT player IDs for all participants
    const faceitIds: { steamId: string; faceitId: string }[] = [];
    for (const p of challenge.participants) {
      const fp = await faceit.getPlayerBySteamId(p.steamId);
      if (fp?.player_id) faceitIds.push({ steamId: p.steamId, faceitId: fp.player_id });
    }
    if (faceitIds.length < 2) continue;

    // Fetch recent matches for first participant
    const history = await faceit.getMatchHistory(faceitIds[0].faceitId, 0, 10);
    if (!history?.items) continue;

    for (const match of history.items) {
      if (match.status !== "finished") continue;

      const matchStats = await faceit.getMatchStats(match.match_id);
      if (!matchStats?.rounds?.[0]) continue;

      const round = matchStats.rounds[0];

      // Find all participants in this match
      const scores: { steamId: string; score: number }[] = [];

      for (const fi of faceitIds) {
        for (const team of round.teams) {
          const player = team.players.find((p) => p.player_id === fi.faceitId);
          if (player?.player_stats) {
            const kills = parseInt(player.player_stats["Kills"] || "0", 10);
            const kd = parseFloat(player.player_stats["K/D Ratio"] || player.player_stats["K/D"] || "0");
            const score = kills * 10 + kd * 5;
            scores.push({ steamId: fi.steamId, score });
            // Update participant score
            await getDb().execute({
              sql: "UPDATE match_challenge_participants SET score = ? WHERE challenge_id = ? AND steam_id = ?",
              args: [score, challenge.id, fi.steamId],
            });
            break;
          }
        }
      }

      // All participants must be found in the same match
      if (scores.length < faceitIds.length) continue;

      // Find winner
      scores.sort((a, b) => b.score - a.score);
      const winnerSteamId = scores[0].steamId;

      // Award pot to winner
      const pot = challenge.stake * challenge.participants.length;
      await getDb().execute({
        sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
        args: [pot, winnerSteamId],
      });

      await getDb().execute({
        sql: "UPDATE match_challenges SET status = 'completed', faceit_match_id = ?, winner_steam_id = ?, resolved_at = datetime('now') WHERE id = ?",
        args: [match.match_id, winnerSteamId, challenge.id],
      });

      break;
    }
  }
}

async function mapRow(r: any): Promise<MatchChallenge> {
  const id = r.id as string;
  const participantsResult = await getDb().execute({
    sql: `SELECT mcp.*, pp.steam_name, pp.avatar_url
          FROM match_challenge_participants mcp
          LEFT JOIN player_profile pp ON pp.steam_id = mcp.steam_id
          WHERE mcp.challenge_id = ?`,
    args: [id],
  });

  const participants: ParticipantInfo[] = participantsResult.rows.map((p) => ({
    steamId: p.steam_id as string,
    name: (p.steam_name as string) || "Desconocido",
    avatar: p.avatar_url as string | null,
    score: p.score as number,
    joinedAt: p.joined_at as string,
  }));

  return {
    id,
    creatorSteamId: r.creator_steam_id as string,
    creatorName: r.creator_name as string | undefined,
    creatorAvatar: r.creator_avatar as string | null | undefined,
    stake: r.stake as number,
    maxParticipants: (r.max_participants as number) || 5,
    status: r.status as MatchChallenge["status"],
    faceitMatchId: r.faceit_match_id as string | null,
    winnerSteamId: r.winner_steam_id as string | null,
    participants,
    createdAt: r.created_at as string,
    resolvedAt: r.resolved_at as string | null,
  };
}
