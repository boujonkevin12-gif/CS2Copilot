import { getDb } from "@/lib/db";
import { getSteamService } from "@/lib/services";
import { getFaceitService } from "@/lib/services/faceit.service";

export interface Tournament {
  id: string;
  name: string;
  creatorSteamId: string;
  description: string;
  entryFee: number;
  prizePool: number;
  durationHours: number;
  status: "pending" | "active" | "completed";
  maxParticipants: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  participantCount?: number;
  creatorName?: string;
}

export interface TournamentParticipant {
  steamId: string;
  name: string;
  avatar: string | null;
  joinedAt: string;
  placement: number | null;
  prizeEarned: number;
  kills?: number;
  deaths?: number;
  mvps?: number;
  kd?: number;
  hsPct?: number;
}

function generateId(): string {
  return "trn_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function createTournament(data: {
  name: string;
  description?: string;
  entryFee: number;
  durationHours: number;
  maxParticipants?: number;
  creatorSteamId: string;
}): Promise<Tournament> {
  const id = generateId();
  const now = new Date().toISOString();
  const endTime = new Date(Date.now() + data.durationHours * 3600000).toISOString();

  await getDb().execute({
    sql: `INSERT INTO tournaments (id, name, creator_steam_id, description, entry_fee, prize_pool, duration_hours, status, max_participants, end_time, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
    args: [id, data.name, data.creatorSteamId, data.description || "", data.entryFee, 0, data.durationHours, data.maxParticipants || 0, endTime, now],
  });

  // Creator auto-joins
  await getDb().execute({
    sql: "INSERT INTO tournament_participants (tournament_id, steam_id) VALUES (?, ?)",
    args: [id, data.creatorSteamId],
  });

  // Creator also pays entry fee
  if (data.entryFee > 0) {
    await getDb().execute({
      sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ? WHERE steam_id = ?",
      args: [data.entryFee, data.creatorSteamId],
    });
    await getDb().execute({
      sql: "UPDATE tournaments SET prize_pool = prize_pool + ? WHERE id = ?",
      args: [data.entryFee, id],
    });
  }

  return getTournament(id) as Promise<Tournament>;
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const result = await getDb().execute({
    sql: `SELECT t.*, (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participant_count,
          (SELECT steam_name FROM player_profile WHERE steam_id = t.creator_steam_id) as creator_name
          FROM tournaments t WHERE t.id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  const r = result.rows[0];
  return {
    id: r.id as string,
    name: r.name as string,
    creatorSteamId: r.creator_steam_id as string,
    description: (r.description as string) || "",
    entryFee: (r.entry_fee as number) || 0,
    prizePool: (r.prize_pool as number) || 0,
    durationHours: (r.duration_hours as number) || 72,
    status: (r.status as Tournament["status"]) || "pending",
    maxParticipants: (r.max_participants as number) || 0,
    startTime: r.start_time as string | null,
    endTime: r.end_time as string | null,
    createdAt: r.created_at as string,
    participantCount: (r.participant_count as number) || 0,
    creatorName: r.creator_name as string,
  };
}

export async function listTournaments(status?: string): Promise<Tournament[]> {
  let sql = `SELECT t.*,
          (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participant_count,
          (SELECT steam_name FROM player_profile WHERE steam_id = t.creator_steam_id) as creator_name
          FROM tournaments t`;
  const args: any[] = [];
  if (status) {
    sql += " WHERE t.status = ?";
    args.push(status);
  }
  sql += " ORDER BY t.created_at DESC";
  const result = await getDb().execute({ sql, args });
  return result.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    creatorSteamId: r.creator_steam_id,
    description: r.description || "",
    entryFee: r.entry_fee || 0,
    prizePool: r.prize_pool || 0,
    durationHours: r.duration_hours || 72,
    status: r.status || "pending",
    maxParticipants: r.max_participants || 0,
    startTime: r.start_time || null,
    endTime: r.end_time || null,
    createdAt: r.created_at,
    participantCount: r.participant_count || 0,
    creatorName: r.creator_name,
  }));
}

export async function joinTournament(tournamentId: string, steamId: string): Promise<void> {
  const t = await getTournament(tournamentId);
  if (!t) throw new Error("Torneo no encontrado");
  if (t.status !== "pending") throw new Error("El torneo ya comenzó o terminó");
  if (t.maxParticipants > 0 && (t.participantCount || 0) >= t.maxParticipants) throw new Error("Torneo lleno");

  await getDb().execute({
    sql: "INSERT OR IGNORE INTO tournament_participants (tournament_id, steam_id) VALUES (?, ?)",
    args: [tournamentId, steamId],
  });

  // Charge entry fee
  if (t.entryFee > 0) {
    await getDb().execute({
      sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ? WHERE steam_id = ? AND pilot_coins >= ?",
      args: [t.entryFee, steamId, t.entryFee],
    });
    await getDb().execute({
      sql: "UPDATE tournaments SET prize_pool = prize_pool + ? WHERE id = ?",
      args: [t.entryFee, tournamentId],
    });
  }
}

export async function invitePlayer(tournamentId: string, fromSteamId: string, toSteamId: string): Promise<void> {
  const t = await getTournament(tournamentId);
  if (!t) throw new Error("Torneo no encontrado");
  if (t.creatorSteamId !== fromSteamId) throw new Error("Solo el creador puede invitar");

  await getDb().execute({
    sql: "INSERT OR IGNORE INTO tournament_invites (tournament_id, from_steam_id, to_steam_id) VALUES (?, ?, ?)",
    args: [tournamentId, fromSteamId, toSteamId],
  });
}

export async function getInvites(steamId: string): Promise<any[]> {
  const result = await getDb().execute({
    sql: `SELECT ti.*, t.name as tournament_name, t.entry_fee,
          (SELECT steam_name FROM player_profile WHERE steam_id = ti.from_steam_id) as from_name
          FROM tournament_invites ti JOIN tournaments t ON t.id = ti.tournament_id
          WHERE ti.to_steam_id = ? AND ti.status = 'pending'
          ORDER BY ti.created_at DESC`,
    args: [steamId],
  });
  return result.rows;
}

export async function acceptInvite(inviteId: number, steamId: string): Promise<void> {
  const result = await getDb().execute({
    sql: "SELECT * FROM tournament_invites WHERE id = ? AND to_steam_id = ? AND status = 'pending'",
    args: [inviteId, steamId],
  });
  if (result.rows.length === 0) throw new Error("Invitación no encontrada");

  const invite = result.rows[0];
  await joinTournament(invite.tournament_id as string, steamId);
  await getDb().execute({
    sql: "UPDATE tournament_invites SET status = 'accepted' WHERE id = ?",
    args: [inviteId],
  });
}

export async function leaveTournament(tournamentId: string, steamId: string): Promise<void> {
  const t = await getTournament(tournamentId);
  if (!t) throw new Error("Torneo no encontrado");
  if (t.status !== "pending") throw new Error("No puedes salir de un torneo activo o finalizado");
  if (t.creatorSteamId === steamId) throw new Error("El creador no puede salir, debe cancelar el torneo");

  await getDb().execute({
    sql: "DELETE FROM tournament_participants WHERE tournament_id = ? AND steam_id = ?",
    args: [tournamentId, steamId],
  });

  // Refund entry fee
  if (t.entryFee > 0) {
    await getDb().execute({
      sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
      args: [t.entryFee, steamId],
    });
    await getDb().execute({
      sql: "UPDATE tournaments SET prize_pool = MAX(0, prize_pool - ?) WHERE id = ?",
      args: [t.entryFee, tournamentId],
    });
  }
}

export async function startTournament(tournamentId: string, steamId: string): Promise<void> {
  const t = await getTournament(tournamentId);
  if (!t) throw new Error("Torneo no encontrado");
  if (t.creatorSteamId !== steamId) throw new Error("Solo el creador puede iniciar el torneo");
  if (t.status !== "pending") throw new Error("El torneo ya comenzó o terminó");

  const now = new Date().toISOString();
  const endTime = new Date(Date.now() + t.durationHours * 3600000).toISOString();
  await getDb().execute({
    sql: "UPDATE tournaments SET status = 'active', start_time = ?, end_time = ? WHERE id = ?",
    args: [now, endTime, tournamentId],
  });
}

export async function getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
  const result = await getDb().execute({
    sql: `SELECT tp.*, pp.steam_name as name, pp.avatar_url as avatar
          FROM tournament_participants tp
          JOIN player_profile pp ON pp.steam_id = tp.steam_id
          WHERE tp.tournament_id = ?
          ORDER BY tp.placement IS NULL, tp.placement ASC, tp.joined_at ASC`,
    args: [tournamentId],
  });
  return result.rows.map((r: any) => ({
    steamId: r.steam_id,
    name: r.name || "Jugador",
    avatar: r.avatar || null,
    joinedAt: r.joined_at,
    placement: r.placement,
    prizeEarned: r.prize_earned || 0,
  }));
}

export async function endTournament(tournamentId: string, steamId: string): Promise<void> {
  const t = await getTournament(tournamentId);
  if (!t) throw new Error("Torneo no encontrado");
  if (t.creatorSteamId !== steamId) throw new Error("Solo el creador puede finalizar el torneo");
  if (t.status !== "active") throw new Error("El torneo no está activo");

  const participants = await getParticipants(tournamentId);
  const totalPlayers = participants.length;
  if (totalPlayers === 0) {
    await getDb().execute({
      sql: "UPDATE tournaments SET status = 'completed', end_time = datetime('now') WHERE id = ?",
      args: [tournamentId],
    });
    return;
  }

  // Fetch stats for each participant from FACEIT
  const faceit = getFaceitService();
  const statsMap: Record<string, { kills: number; deaths: number; mvps: number; kd: number; hsPct: number }> = {};

  await Promise.all(participants.map(async (p) => {
    try {
      const player = await faceit.getPlayerBySteamId(p.steamId);
      if (player?.player_id) {
        const playerStats = await faceit.getPlayerStats(player.player_id);
        if (playerStats?.lifetime) {
          const kills = parseInt(String(playerStats.lifetime["Kills"] || "0"));
          const deaths = parseInt(String(playerStats.lifetime["Deaths"] || "0"));
          const mvps = parseInt(String(playerStats.lifetime["MVPs"] || "0"));
          statsMap[p.steamId] = {
            kills,
            deaths,
            mvps,
            kd: parseFloat(String(playerStats.lifetime["Average K/D Ratio"] || "0")),
            hsPct: parseFloat(String(playerStats.lifetime["Average Headshots %"] || "0")),
          };
        }
      }
    } catch { /* skip */ }
  }));

  // Calculate scores and rank
  const ranked = participants.map((p) => {
    const s = statsMap[p.steamId];
    const score = s ? (s.kd * 50) + (s.mvps * 5) + (s.hsPct * 0.5) : 0;
    return { ...p, ...s, score };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  // Assign placements and prizes
  const pool = t.prizePool;
  const distributions = [
    { pct: 0.5, label: "1°" },
    { pct: 0.3, label: "2°" },
    { pct: 0.15, label: "3°" },
    { pct: 0.05, label: "4°" },
  ];

  const now = new Date().toISOString();
  for (let i = 0; i < ranked.length; i++) {
    const placement = i + 1;
    const dist = i < distributions.length ? distributions[i] : null;
    const prize = dist ? Math.floor(pool * dist.pct) : 0;

    await getDb().execute({
      sql: "UPDATE tournament_participants SET placement = ?, prize_earned = ? WHERE tournament_id = ? AND steam_id = ?",
      args: [placement, prize, tournamentId, ranked[i].steamId],
    });

    if (prize > 0) {
      await getDb().execute({
        sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
        args: [prize, ranked[i].steamId],
      });
    }
  }

  await getDb().execute({
    sql: "UPDATE tournaments SET status = 'completed', end_time = ? WHERE id = ?",
    args: [now, tournamentId],
  });
}

export async function autoEndExpiredTournaments(): Promise<number> {
  const result = await getDb().execute({
    sql: "SELECT id, prize_pool FROM tournaments WHERE status = 'active' AND end_time IS NOT NULL AND end_time <= datetime('now')",
  });
  for (const row of result.rows) {
    const tid = row.id as string;
    const pool = (row.prize_pool as number) || 0;

    // Fetch participants directly
    const parts = await getDb().execute({
      sql: `SELECT tp.*, pp.steam_name as name, pp.avatar_url as avatar
            FROM tournament_participants tp
            JOIN player_profile pp ON pp.steam_id = tp.steam_id
            WHERE tp.tournament_id = ?`,
      args: [tid],
    });
    const participants = parts.rows.length;

    if (participants === 0) {
      await getDb().execute({
        sql: "UPDATE tournaments SET status = 'completed', end_time = datetime('now') WHERE id = ?",
        args: [tid],
      });
      continue;
    }

    // Fetch stats for each participant
    const faceit = getFaceitService();
    const statsMap: Record<string, { kills: number; deaths: number; mvps: number; kd: number; hsPct: number }> = {};
    await Promise.all(parts.rows.map(async (p: any) => {
      try {
        const player = await faceit.getPlayerBySteamId(p.steam_id);
        if (player?.player_id) {
          const playerStats = await faceit.getPlayerStats(player.player_id);
          if (playerStats?.lifetime) {
            statsMap[p.steam_id] = {
              kills: parseInt(String(playerStats.lifetime["Kills"] || "0")),
              deaths: parseInt(String(playerStats.lifetime["Deaths"] || "0")),
              mvps: parseInt(String(playerStats.lifetime["MVPs"] || "0")),
              kd: parseFloat(String(playerStats.lifetime["Average K/D Ratio"] || "0")),
              hsPct: parseFloat(String(playerStats.lifetime["Average Headshots %"] || "0")),
            };
          }
        }
      } catch { /* skip */ }
    }));

    const distributions = [
      { pct: 0.5, label: "1°" },
      { pct: 0.3, label: "2°" },
      { pct: 0.15, label: "3°" },
      { pct: 0.05, label: "4°" },
    ];

    const ranked = parts.rows.map((p: any) => {
      const s = statsMap[p.steam_id];
      const score = s ? (s.kd * 50) + (s.mvps * 5) + (s.hsPct * 0.5) : 0;
      return { ...p, ...s, score };
    }).sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    for (let i = 0; i < ranked.length; i++) {
      const placement = i + 1;
      const dist = i < distributions.length ? distributions[i] : null;
      const prize = dist ? Math.floor(pool * dist.pct) : 0;

      await getDb().execute({
        sql: "UPDATE tournament_participants SET placement = ?, prize_earned = ? WHERE tournament_id = ? AND steam_id = ?",
        args: [placement, prize, tid, ranked[i].steam_id],
      });

      if (prize > 0) {
        await getDb().execute({
          sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ? WHERE steam_id = ?",
          args: [prize, ranked[i].steam_id],
        });
      }
    }

    await getDb().execute({
      sql: "UPDATE tournaments SET status = 'completed', end_time = datetime('now') WHERE id = ?",
      args: [tid],
    });
  }
  return result.rows.length;
}
