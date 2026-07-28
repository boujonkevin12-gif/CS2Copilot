import { getDb } from "@/lib/db";
import { getFaceitService } from "@/lib/services/faceit.service";

export interface MatchChallenge {
  id: string;
  creatorSteamId: string;
  opponentSteamId: string;
  creatorName?: string;
  opponentName?: string;
  creatorAvatar?: string | null;
  opponentAvatar?: string | null;
  stake: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  faceitMatchId: string | null;
  winnerSteamId: string | null;
  creatorScore: number;
  opponentScore: number;
  createdAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
}

function generateId(): string {
  return "mc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function createChallenge(creatorSteamId: string, opponentSteamId: string, stake: number): Promise<MatchChallenge | { error: string }> {
  if (creatorSteamId === opponentSteamId) return { error: "No puedes desafiarte a ti mismo" };
  if (stake < 10) return { error: "La apuesta minima es de 10 monedas" };

  // Check both profiles exist and have enough coins
  const [creator, opponent] = await Promise.all([
    getDb().execute({ sql: "SELECT pilot_coins FROM player_profile WHERE steam_id = ?", args: [creatorSteamId] }),
    getDb().execute({ sql: "SELECT pilot_coins FROM player_profile WHERE steam_id = ?", args: [opponentSteamId] }),
  ]);
  if (creator.rows.length === 0) return { error: "Creador no encontrado" };
  if (opponent.rows.length === 0) return { error: "Oponente no encontrado o no registrado en la pagina" };

  const creatorCoins = creator.rows[0].pilot_coins as number;
  if (creatorCoins < stake) return { error: "No tienes suficientes monedas" };

  const id = generateId();
  await getDb().execute({
    sql: "INSERT INTO match_challenges (id, creator_steam_id, opponent_steam_id, stake) VALUES (?, ?, ?, ?)",
    args: [id, creatorSteamId, opponentSteamId, stake],
  });

  // Deduct stake from creator immediately
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ? WHERE steam_id = ?",
    args: [stake, creatorSteamId],
  });

  return getChallenge(id) as Promise<MatchChallenge>;
}

export async function acceptChallenge(challengeId: string, steamId: string): Promise<MatchChallenge | { error: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { error: "Desafio no encontrado" };
  if (challenge.opponentSteamId !== steamId) return { error: "No eres el oponente de este desafio" };
  if (challenge.status !== "pending") return { error: "El desafio ya no esta pendiente" };

  // Check opponent has enough coins
  const opponent = await getDb().execute({ sql: "SELECT pilot_coins FROM player_profile WHERE steam_id = ?", args: [steamId] });
  const opponentCoins = opponent.rows[0]?.pilot_coins as number || 0;
  if (opponentCoins < challenge.stake) return { error: "No tienes suficientes monedas para aceptar" };

  // Deduct stake from opponent
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ? WHERE steam_id = ?",
    args: [challenge.stake, steamId],
  });

  await getDb().execute({
    sql: "UPDATE match_challenges SET status = 'accepted', accepted_at = datetime('now') WHERE id = ?",
    args: [challengeId],
  });

  return getChallenge(challengeId) as Promise<MatchChallenge>;
}

export async function cancelChallenge(challengeId: string, steamId: string): Promise<{ success: boolean; error?: string }> {
  const challenge = await getChallenge(challengeId);
  if (!challenge) return { success: false, error: "Desafio no encontrado" };
  if (challenge.creatorSteamId !== steamId && challenge.opponentSteamId !== steamId) return { success: false, error: "No eres parte de este desafio" };
  if (challenge.status !== "pending") return { success: false, error: "El desafio ya no esta pendiente" };

  // Refund creator's stake
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
    args: [challenge.stake, challenge.creatorSteamId],
  });

  await getDb().execute({
    sql: "UPDATE match_challenges SET status = 'cancelled' WHERE id = ?",
    args: [challengeId],
  });

  return { success: true };
}

export async function getChallenge(id: string): Promise<MatchChallenge | null> {
  const result = await getDb().execute({
    sql: `SELECT mc.*,
          (SELECT steam_name FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_name,
          (SELECT avatar_url FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_avatar,
          (SELECT steam_name FROM player_profile WHERE steam_id = mc.opponent_steam_id) as opponent_name,
          (SELECT avatar_url FROM player_profile WHERE steam_id = mc.opponent_steam_id) as opponent_avatar
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
          (SELECT avatar_url FROM player_profile WHERE steam_id = mc.creator_steam_id) as creator_avatar,
          (SELECT steam_name FROM player_profile WHERE steam_id = mc.opponent_steam_id) as opponent_name,
          (SELECT avatar_url FROM player_profile WHERE steam_id = mc.opponent_steam_id) as opponent_avatar
          FROM match_challenges mc
          WHERE mc.creator_steam_id = ? OR mc.opponent_steam_id = ?
          ORDER BY mc.created_at DESC`,
    args: [steamId, steamId],
  });
  return result.rows.map(mapRow);
}

// Called during profile sync to auto-resolve challenges
export async function checkAndResolveChallenges(steamId: string): Promise<void> {
  const active = await getDb().execute({
    sql: "SELECT * FROM match_challenges WHERE (creator_steam_id = ? OR opponent_steam_id = ?) AND status = 'accepted'",
    args: [steamId, steamId],
  });
  if (active.rows.length === 0) return;

  const faceit = getFaceitService();

  for (const row of active.rows) {
    const challenge = mapRow(row);
    const creatorFaceit = await faceit.getPlayerBySteamId(challenge.creatorSteamId);
    const opponentFaceit = await faceit.getPlayerBySteamId(challenge.opponentSteamId);
    if (!creatorFaceit?.player_id || !opponentFaceit?.player_id) continue;

    // Fetch recent matches for creator (both are in the same match)
    const history = await faceit.getMatchHistory(creatorFaceit.player_id, 0, 10);
    if (!history?.items) continue;

    const acceptedAt = challenge.acceptedAt ? new Date(challenge.acceptedAt).getTime() : 0;

    for (const match of history.items) {
      // Match must have been played AFTER the challenge was accepted
      if ((match.started_at || 0) * 1000 < acceptedAt) continue;
      if (match.status !== "finished") continue;

      const matchStats = await faceit.getMatchStats(match.match_id);
      if (!matchStats?.rounds?.[0]) continue;

      // Find both players in the match
      const round = matchStats.rounds[0];
      let creatorStats: Record<string, string> | null = null;
      let opponentStats: Record<string, string> | null = null;

      for (const team of round.teams) {
        for (const player of team.players) {
          if (player.player_id === creatorFaceit.player_id) creatorStats = player.player_stats;
          if (player.player_id === opponentFaceit.player_id) opponentStats = player.player_stats;
        }
      }

      if (!creatorStats || !opponentStats) continue; // Not the same match

      // Compare performance: primary = Kills, tiebreaker = K/D Ratio
      const cKills = parseInt(creatorStats["Kills"] || "0", 10);
      const oKills = parseInt(opponentStats["Kills"] || "0", 10);
      const cKD = parseFloat(creatorStats["K/D Ratio"] || creatorStats["K/D"] || "0");
      const oKD = parseFloat(opponentStats["K/D Ratio"] || opponentStats["K/D"] || "0");

      const cScore = cKills * 10 + cKD * 5;
      const oScore = oKills * 10 + oKD * 5;

      let winnerSteamId: string;
      if (cScore > oScore) {
        winnerSteamId = challenge.creatorSteamId;
      } else if (oScore > cScore) {
        winnerSteamId = challenge.opponentSteamId;
      } else {
        // Tie — refund both
        await getDb().execute({
          sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id IN (?, ?)",
          args: [challenge.stake, challenge.creatorSteamId, challenge.opponentSteamId],
        });
        await getDb().execute({
          sql: "UPDATE match_challenges SET status = 'completed', faceit_match_id = ?, creator_score = ?, opponent_score = ?, resolved_at = datetime('now') WHERE id = ?",
          args: [match.match_id, cScore, oScore, challenge.id],
        });
        continue;
      }

      // Award pot (both stakes) to winner
      const pot = challenge.stake * 2;
      await getDb().execute({
        sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
        args: [pot, winnerSteamId],
      });

      await getDb().execute({
        sql: "UPDATE match_challenges SET status = 'completed', faceit_match_id = ?, winner_steam_id = ?, creator_score = ?, opponent_score = ?, resolved_at = datetime('now') WHERE id = ?",
        args: [match.match_id, winnerSteamId, cScore, oScore, challenge.id],
      });

      break; // Only resolve the first matching match
    }
  }
}

function mapRow(r: any): MatchChallenge {
  return {
    id: r.id as string,
    creatorSteamId: r.creator_steam_id as string,
    opponentSteamId: r.opponent_steam_id as string,
    creatorName: r.creator_name as string | undefined,
    opponentName: r.opponent_name as string | undefined,
    creatorAvatar: r.creator_avatar as string | null | undefined,
    opponentAvatar: r.opponent_avatar as string | null | undefined,
    stake: r.stake as number,
    status: r.status as MatchChallenge["status"],
    faceitMatchId: r.faceit_match_id as string | null,
    winnerSteamId: r.winner_steam_id as string | null,
    creatorScore: r.creator_score as number,
    opponentScore: r.opponent_score as number,
    createdAt: r.created_at as string,
    acceptedAt: r.accepted_at as string | null,
    resolvedAt: r.resolved_at as string | null,
  };
}
