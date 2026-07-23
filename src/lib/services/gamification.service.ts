import { getDb } from "@/lib/db";
import { initializeDatabase } from "@/lib/db-schema";

let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getMonday(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  return monday.toISOString().split("T")[0];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getCurrentSeasonId(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-S${Math.ceil(week / 8)}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── ACHIEVEMENTS ───────────────────────────────────────────────
export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  target: number;
  stat: string;
  xp: number;
  coins: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_win", name: "Primera Victoria", desc: "Gana tu primera partida", icon: "🏆", category: "combate", target: 1, stat: "wins", xp: 100, coins: 50, rarity: "common" },
  { id: "10_wins", name: "En Racha", desc: "Gana 10 victorias", icon: "🔥", category: "combate", target: 10, stat: "wins", xp: 200, coins: 100, rarity: "common" },
  { id: "50_wins", name: "Dominador", desc: "Gana 50 victorias", icon: "⚔️", category: "combate", target: 50, stat: "wins", xp: 400, coins: 200, rarity: "rare" },
  { id: "100_wins", name: "Máquina de Guerra", desc: "Gana 100 victorias", icon: "💎", category: "combate", target: 100, stat: "wins", xp: 500, coins: 300, rarity: "epic" },
  { id: "500_kills", name: "Cazador", desc: "Consigue 500 kills", icon: "🎯", category: "combate", target: 500, stat: "kills", xp: 300, coins: 150, rarity: "common" },
  { id: "1000_kills", name: "Asesino", desc: "Consigue 1000 kills", icon: "💀", category: "combate", target: 1000, stat: "kills", xp: 500, coins: 250, rarity: "rare" },
  { id: "5000_kills", name: "Leyenda Oscura", desc: "Consigue 5000 kills", icon: "🗡️", category: "combate", target: 5000, stat: "kills", xp: 1000, coins: 500, rarity: "epic" },
  { id: "10000_kills", name: "Demoledor", desc: "Consigue 10000 kills", icon: "☠️", category: "combate", target: 10000, stat: "kills", xp: 2000, coins: 1000, rarity: "legendary" },
  { id: "100_hs", name: "Headshot Machine", desc: "1000 headshots", icon: "🎯", category: "precisión", target: 100, stat: "headshots", xp: 200, coins: 100, rarity: "common" },
  { id: "500_hs", name: "Puntero Elite", desc: "500 headshots", icon: "🔫", category: "precisión", target: 500, stat: "headshots", xp: 400, coins: 200, rarity: "rare" },
  { id: "1000_hs", name: "Headshot Master", desc: "1000 headshots", icon: "💀", category: "precisión", target: 1000, stat: "headshots", xp: 600, coins: 300, rarity: "epic" },
  { id: "5000_hs", name: "Headshot God", desc: "5000 headshots", icon: "⚡", category: "precisión", target: 5000, stat: "headshots", xp: 1500, coins: 750, rarity: "legendary" },
  { id: "10_clutch", name: "Clutch Beginner", desc: "10 clutches ganados", icon: "👑", category: "clutch", target: 10, stat: "clutches", xp: 300, coins: 150, rarity: "common" },
  { id: "50_clutch", name: "Clutch King", desc: "50 clutches ganados", icon: "👑", category: "clutch", target: 50, stat: "clutches", xp: 500, coins: 250, rarity: "rare" },
  { id: "100_clutch", name: "Clutch Master", desc: "100 clutches ganados", icon: "👑", category: "clutch", target: 100, stat: "clutches", xp: 800, coins: 400, rarity: "epic" },
  { id: "500_clutch", name: "Clutch Legend", desc: "500 clutches ganados", icon: "💎", category: "clutch", target: 500, stat: "clutches", xp: 2000, coins: 1000, rarity: "legendary" },
  { id: "500_awp", name: "AWPer", desc: "500 kills con AWP", icon: "🦅", category: "arma", target: 500, stat: "awp_kills", xp: 500, coins: 250, rarity: "rare" },
  { id: "1000_awp", name: "AWP God", desc: "1000 kills con AWP", icon: "🦅", category: "arma", target: 1000, stat: "awp_kills", xp: 800, coins: 400, rarity: "epic" },
  { id: "100_bombs", name: "Bomb Expert", desc: "100 bombas plantadas", icon: "💣", category: "objetivo", target: 100, stat: "wins", xp: 400, coins: 200, rarity: "rare" },
  { id: "200_entry", name: "Entry Fragger", desc: "200 primeras bajas", icon: "⚡", category: "combate", target: 200, stat: "kills", xp: 300, coins: 150, rarity: "rare" },
  { id: "100h", name: "Dedicado", desc: "100 horas jugadas", icon: "⏰", category: "tiempo", target: 100, stat: "hours", xp: 300, coins: 150, rarity: "common" },
  { id: "500h", name: "Hardcore", desc: "500 horas jugadas", icon: "🕐", category: "tiempo", target: 500, stat: "hours", xp: 400, coins: 200, rarity: "rare" },
  { id: "1000h", name: "Veteran", desc: "1000 horas jugadas", icon: "👑", category: "tiempo", target: 1000, stat: "hours", xp: 500, coins: 300, rarity: "epic" },
  { id: "20_mvp", name: "Estrella", desc: "20 MVPs", icon: "⭐", category: "combate", target: 20, stat: "mvps", xp: 300, coins: 150, rarity: "common" },
  { id: "50_mvp", name: "Referente", desc: "50 MVPs", icon: "🌟", category: "combate", target: 50, stat: "mvps", xp: 500, coins: 250, rarity: "rare" },
  { id: "100_mvp", name: "MVP Machine", desc: "100 MVPs", icon: "🏅", category: "combate", target: 100, stat: "mvps", xp: 800, coins: 400, rarity: "epic" },
  { id: "7_streak", name: "Constancia", desc: "7 días seguidos", icon: "📅", category: "login", target: 7, stat: "streak", xp: 300, coins: 150, rarity: "common" },
  { id: "30_streak", name: "Obsesivo", desc: "30 días seguidos", icon: "🔥", category: "login", target: 30, stat: "streak", xp: 1000, coins: 500, rarity: "epic" },
  { id: "90_streak", name: "Inquebrantable", desc: "90 días seguidos", icon: "💪", category: "login", target: 90, stat: "streak", xp: 3000, coins: 1500, rarity: "legendary" },
  { id: "ace", name: "Primer Ace", desc: "Consigue un ace", icon: "🎯", category: "combate", target: 1, stat: "aces", xp: 500, coins: 250, rarity: "rare" },
  { id: "10_aces", name: "Ace Machine", desc: "10 aces", icon: "🃏", category: "combate", target: 10, stat: "aces", xp: 1000, coins: 500, rarity: "epic" },
  { id: "level_10", name: "Rising Star", desc: "Sube 10 niveles", icon: "🆙", category: "progreso", target: 10, stat: "level", xp: 500, coins: 250, rarity: "common" },
  { id: "level_25", name: "Elite Operator", desc: "Alcanza nivel 25", icon: "💎", category: "progreso", target: 25, stat: "level", xp: 1000, coins: 500, rarity: "rare" },
  { id: "level_50", name: "Leyenda", desc: "Alcanza nivel 50", icon: "👑", category: "progreso", target: 50, stat: "level", xp: 2000, coins: 1000, rarity: "legendary" },
  { id: "world_traveler", name: "World Traveler", desc: "Juega en todos los mapas", icon: "🌍", category: "exploración", target: 7, stat: "maps", xp: 600, coins: 300, rarity: "epic" },
  { id: "hs_40_pct", name: "En Forma", desc: "HS% mayor a 40%", icon: "🎖️", category: "precisión", target: 40, stat: "hs_pct", xp: 200, coins: 100, rarity: "common" },
  { id: "hs_50_pct", name: "Puntero Pro", desc: "HS% mayor a 50%", icon: "🏅", category: "precisión", target: 50, stat: "hs_pct", xp: 400, coins: 200, rarity: "rare" },
  { id: "kd_120", name: "Letal", desc: "K/D mayor a 1.20", icon: "⚡", category: "combate", target: 120, stat: "kd_x100", xp: 300, coins: 150, rarity: "rare" },
  { id: "kd_150", name: "Destructor", desc: "K/D mayor a 1.50", icon: "🌟", category: "combate", target: 150, stat: "kd_x100", xp: 500, coins: 250, rarity: "epic" },
  { id: "faceit_10", name: "FACEIT Demon", desc: "FACEIT Level 10", icon: "😈", category: "faceit", target: 10, stat: "faceit_level", xp: 2000, coins: 1000, rarity: "legendary" },
  { id: "elo_2000", name: "ELO Hunter", desc: "2000+ ELO FACEIT", icon: "📈", category: "faceit", target: 2000, stat: "elo", xp: 1000, coins: 500, rarity: "epic" },
  { id: "premier_15000", name: "Premier Beast", desc: "Premier Rating 15000+", icon: "🚀", category: "premier", target: 15000, stat: "premier", xp: 1000, coins: 500, rarity: "epic" },
];

interface PlayerStats {
  wins: number;
  kills: number;
  headshots: number;
  kd_x100: number;
  hs_pct: number;
  hours: number;
  mvps: number;
  clutches: number;
  streak: number;
  aces: number;
  level: number;
  maps: number;
  awp_kills: number;
  faceit_level: number;
  elo: number;
  premier: number;
}

export interface PlayerProfile {
  steam_id: string;
  steam_name: string;
  avatar_url: string | null;
  profile_url: string | null;
  country: string | null;
  steam_level: number;
  cs2_hours: number;
  xp: number;
  level: number;
  pilot_coins: number;
  current_title: string;
  equipped_frame: string | null;
  equipped_background: string | null;
  equipped_effect: string | null;
  equipped_emoji: string | null;
  equipped_color: string | null;
  streak_days: number;
  last_login_date: string | null;
  daily_login_day: number;
  last_daily_claim: string | null;
  total_login_days: number;
  total_wins: number;
  total_kills: number;
  total_headshots: number;
  total_mvps: number;
  total_hours: number;
  best_kd: number;
  best_hs_pct: number;
  best_elo: number;
  best_faceit_level: number;
  best_premier: number;
  total_clutches: number;
  total_aces: number;
  total_awp_kills: number;
  maps_played: string;
  created_at: string;
  updated_at: string;
}

// ─── PROFILE ────────────────────────────────────────────────────
export async function getOrCreateProfile(steamId: string): Promise<PlayerProfile> {
  await ensureDb();
  const result = await getDb().execute({ sql: "SELECT * FROM player_profile WHERE steam_id = ?", args: [steamId] });
  if (result.rows.length > 0) return result.rows[0] as unknown as PlayerProfile;
  await getDb().execute({ sql: "INSERT INTO player_profile (steam_id) VALUES (?)", args: [steamId] });
  const created = await getDb().execute({ sql: "SELECT * FROM player_profile WHERE steam_id = ?", args: [steamId] });
  return created.rows[0] as unknown as PlayerProfile;
}

export async function syncSteamData(steamId: string, data: {
  name?: string;
  avatar?: string;
  profileUrl?: string;
  country?: string | null;
  steamLevel?: number;
  cs2Hours?: number;
}) {
  await ensureDb();
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  if (data.name !== undefined) { sets.push("steam_name = ?"); args.push(data.name); }
  if (data.avatar !== undefined) { sets.push("avatar_url = ?"); args.push(data.avatar); }
  if (data.profileUrl !== undefined) { sets.push("profile_url = ?"); args.push(data.profileUrl); }
  if (data.country !== undefined) { sets.push("country = ?"); args.push(data.country); }
  if (data.steamLevel !== undefined) { sets.push("steam_level = ?"); args.push(data.steamLevel); }
  if (data.cs2Hours !== undefined) { sets.push("cs2_hours = ?"); args.push(data.cs2Hours); }

  if (sets.length === 0) return;

  sets.push("updated_at = datetime('now')");
  args.push(steamId);

  await getDb().execute({
    sql: `UPDATE player_profile SET ${sets.join(", ")} WHERE steam_id = ?`,
    args: args as (string | number | null)[],
  });
}

// ─── XP & COINS ─────────────────────────────────────────────────
export async function addXP(steamId: string, amount: number): Promise<{ newLevel: number; leveledUp: boolean }> {
  await ensureDb();
  const profile = await getOrCreateProfile(steamId);
  const oldLevel = profile.level;
  const newXP = profile.xp + amount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;

  await getDb().execute({
    sql: "UPDATE player_profile SET xp = ?, level = ?, updated_at = datetime('now') WHERE steam_id = ?",
    args: [newXP, newLevel, steamId],
  });

  if (leveledUp) {
    await getDb().execute({
      sql: "INSERT INTO notifications (steam_id, type, title, message) VALUES (?, 'level_up', ?, ?)",
      args: [steamId, "¡Subiste de nivel!", `Ahora eres Nivel ${newLevel}. ¡Sigue así!`],
    });
    await addCoins(steamId, 200);
  }

  return { newLevel, leveledUp };
}

export async function addCoins(steamId: string, amount: number): Promise<number> {
  await ensureDb();
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins + ?, updated_at = datetime('now') WHERE steam_id = ?",
    args: [amount, steamId],
  });
  const profile = await getOrCreateProfile(steamId);
  return profile.pilot_coins;
}

// ─── ACHIEVEMENTS ───────────────────────────────────────────────
export async function getAchievements(steamId: string) {
  await ensureDb();
  const result = await getDb().execute({
    sql: "SELECT achievement_id, progress, unlocked, unlocked_at FROM achievements WHERE steam_id = ?",
    args: [steamId],
  });
  const map = new Map<string, { progress: number; unlocked: number; unlockedAt: string | null }>();
  for (const row of result.rows) {
    map.set(row.achievement_id as string, { progress: row.progress as number, unlocked: row.unlocked as number, unlockedAt: row.unlocked_at as string | null });
  }
  return ACHIEVEMENTS.map((a) => {
    const saved = map.get(a.id);
    return {
      ...a,
      progress: saved?.progress || 0,
      unlocked: (saved?.unlocked || 0) === 1,
      unlockedAt: saved?.unlockedAt || null,
    };
  });
}

export async function updateAchievementProgress(steamId: string, achievementId: string, progress: number): Promise<boolean> {
  await ensureDb();
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return false;

  const existing = await getDb().execute({
    sql: "SELECT id, progress, unlocked FROM achievements WHERE steam_id = ? AND achievement_id = ?",
    args: [steamId, achievementId],
  });

  if (existing.rows.length === 0) {
    await getDb().execute({
      sql: "INSERT INTO achievements (steam_id, achievement_id, progress, unlocked) VALUES (?, ?, ?, ?)",
      args: [steamId, achievementId, Math.min(progress, achievement.target), progress >= achievement.target ? 1 : 0],
    });
  } else {
    const row = existing.rows[0] as any;
    if (row.unlocked === 1) return false;
    await getDb().execute({
      sql: "UPDATE achievements SET progress = ?, unlocked = ?, unlocked_at = CASE WHEN ? = 1 AND unlocked = 0 THEN datetime('now') ELSE unlocked_at END WHERE steam_id = ? AND achievement_id = ?",
      args: [Math.min(progress, achievement.target), progress >= achievement.target ? 1 : 0, progress >= achievement.target ? 1 : 0, steamId, achievementId],
    });
  }

  if (progress >= achievement.target) {
    const recheck = await getDb().execute({
      sql: "SELECT unlocked FROM achievements WHERE steam_id = ? AND achievement_id = ?",
      args: [steamId, achievementId],
    });
    if ((recheck.rows[0] as any)?.unlocked === 1) {
      const alreadyRewarded = await getDb().execute({
        sql: "SELECT id FROM notifications WHERE steam_id = ? AND type = 'achievement' AND title LIKE ?",
        args: [steamId, `%${achievement.name}%`],
      });
      if (alreadyRewarded.rows.length === 0) {
        await addXP(steamId, achievement.xp);
        await addCoins(steamId, achievement.coins);
        await getDb().execute({
          sql: "INSERT INTO notifications (steam_id, type, title, message) VALUES (?, 'achievement', ?, ?)",
          args: [steamId, `¡Logro: ${achievement.name}!`, `${achievement.desc}. +${achievement.xp} XP, +${achievement.coins} coins`],
        });
        return true;
      }
    }
  }
  return false;
}

export async function checkAchievementsFromStats(steamId: string, stats: PlayerStats): Promise<string[]> {
  const unlocked: string[] = [];
  for (const a of ACHIEVEMENTS) {
    const val = (stats as any)[a.stat] ?? 0;
    const wasNew = await updateAchievementProgress(steamId, a.id, val);
    if (wasNew) unlocked.push(a.id);
  }
  return unlocked;
}

// ─── DAILY CHALLENGES ───────────────────────────────────────────
const DAILY_EASY = [
  { id: "deasy_play1", name: "Jugar 1 partida", target: 1, xp: 100, coins: 0, action: "match_played" },
  { id: "deasy_kill10", name: "Consigue 10 kills", target: 10, xp: 100, coins: 0, action: "kill" },
  { id: "deasy_hs3", name: "Haz 3 headshots", target: 3, xp: 100, coins: 0, action: "headshot" },
  { id: "deasy_mvp1", name: "Consigue 1 MVP", target: 1, xp: 100, coins: 0, action: "mvp" },
  { id: "deasy_demo", name: "Analiza 1 demo", target: 1, xp: 100, coins: 0, action: "demo_analyzed" },
];

const DAILY_MEDIUM = [
  { id: "dmed_kill25", name: "Consigue 25 kills", target: 25, xp: 200, coins: 20, action: "kill" },
  { id: "dmed_hs10", name: "Haz 10 headshots", target: 10, xp: 200, coins: 20, action: "headshot" },
  { id: "dmed_play3", name: "Juega 3 partidas", target: 3, xp: 200, coins: 20, action: "match_played" },
  { id: "dmed_mvp3", name: "Consigue 3 MVPs", target: 3, xp: 200, coins: 20, action: "mvp" },
  { id: "dmed_win1", name: "Gana 1 partida", target: 1, xp: 200, coins: 20, action: "match_won" },
];

const DAILY_HARD = [
  { id: "dhard_win3", name: "Gana 3 partidas", target: 3, xp: 500, coins: 50, action: "match_won", badge: true },
  { id: "dhard_kill50", name: "Consigue 50 kills", target: 50, xp: 500, coins: 50, action: "kill", badge: true },
  { id: "dhard_hs20", name: "Haz 20 headshots", target: 20, xp: 500, coins: 50, action: "headshot", badge: true },
  { id: "dhard_ace", name: "Consigue 1 ace", target: 1, xp: 500, coins: 50, action: "ace", badge: true },
  { id: "dhard_clutch3", name: "Gana 3 clutches", target: 3, xp: 500, coins: 50, action: "clutch", badge: true },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

export async function generateDailyChallenges(steamId: string) {
  await ensureDb();
  const today = getToday();

  const existing = await getDb().execute({
    sql: "SELECT challenge_id FROM daily_challenges WHERE steam_id = ? AND challenge_date = ?",
    args: [steamId, today],
  });
  if (existing.rows.length > 0) return;

  const easy = pickRandom(DAILY_EASY, 1);
  const medium = pickRandom(DAILY_MEDIUM, 1);
  const hard = pickRandom(DAILY_HARD, 1);

  const all = [
    ...easy.map((c) => ({ ...c, difficulty: "easy" as const })),
    ...medium.map((c) => ({ ...c, difficulty: "medium" as const })),
    ...hard.map((c) => ({ ...c, difficulty: "hard" as const })),
  ];

  for (const ch of all) {
    await getDb().execute({
      sql: "INSERT OR IGNORE INTO daily_challenges (steam_id, challenge_id, challenge_date, difficulty, target) VALUES (?, ?, ?, ?, ?)",
      args: [steamId, ch.id, today, ch.difficulty, ch.target],
    });
  }
}

export async function getDailyChallenges(steamId: string) {
  await ensureDb();
  const today = getToday();
  await generateDailyChallenges(steamId);

  const result = await getDb().execute({
    sql: "SELECT * FROM daily_challenges WHERE steam_id = ? AND challenge_date = ?",
    args: [steamId, today],
  });

  const allChallenges = [...DAILY_EASY, ...DAILY_MEDIUM, ...DAILY_HARD];

  return result.rows.map((row) => {
    const ch = allChallenges.find((c) => c.id === row.challenge_id);
    return {
      id: row.challenge_id as string,
      name: ch?.name || row.challenge_id as string,
      difficulty: row.difficulty as string,
      progress: row.progress as number,
      target: row.target as number,
      completed: (row.completed as number) === 1,
      claimed: (row.claimed as number) === 1,
      xp: ch?.xp || 0,
      coins: ch?.coins || 0,
      badge: (ch as any)?.badge || false,
    };
  });
}

export async function getDailyChestStatus(steamId: string) {
  await ensureDb();
  const today = getToday();
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as done FROM daily_challenges WHERE steam_id = ? AND challenge_date = ?",
    args: [steamId, today],
  });
  const row = result.rows[0] as any;
  const total = row?.total || 0;
  const done = row?.done || 0;

  const claimed = await getDb().execute({
    sql: "SELECT id FROM chest_history WHERE steam_id = ? AND chest_type = 'daily' AND date(opened_at) = ?",
    args: [steamId, today],
  });

  return { total, completed: done, allDone: total > 0 && done >= total, claimed: claimed.rows.length > 0 };
}

// ─── WEEKLY MISSIONS ────────────────────────────────────────────
const WEEKLY_MISSIONS = [
  { id: "w_kills100", name: "100 kills totales", target: 100, xp: 300, coins: 50, action: "kill" },
  { id: "w_wins10", name: "10 victorias", target: 10, xp: 400, coins: 75, action: "match_won" },
  { id: "w_hs50", name: "50 headshots", target: 50, xp: 300, coins: 50, action: "headshot" },
  { id: "w_mvp20", name: "20 MVPs", target: 20, xp: 350, coins: 60, action: "mvp" },
  { id: "w_demos5", name: "5 demos analizadas", target: 5, xp: 250, coins: 40, action: "demo_analyzed" },
  { id: "w_play20", name: "Jugar 20 partidas", target: 20, xp: 300, coins: 50, action: "match_played" },
];

export async function generateWeeklyMissions(steamId: string) {
  await ensureDb();
  const weekStart = getMonday();
  const existing = await getDb().execute({
    sql: "SELECT mission_id FROM weekly_missions WHERE steam_id = ? AND week_start = ?",
    args: [steamId, weekStart],
  });
  if (existing.rows.length > 0) return;

  const picked = pickRandom(WEEKLY_MISSIONS, 3);
  for (const m of picked) {
    await getDb().execute({
      sql: "INSERT OR IGNORE INTO weekly_missions (steam_id, mission_id, week_start, target) VALUES (?, ?, ?, ?)",
      args: [steamId, m.id, weekStart, m.target],
    });
  }
}

export async function getWeeklyMissions(steamId: string) {
  await ensureDb();
  const weekStart = getMonday();
  await generateWeeklyMissions(steamId);

  const result = await getDb().execute({
    sql: "SELECT * FROM weekly_missions WHERE steam_id = ? AND week_start = ?",
    args: [steamId, weekStart],
  });

  return result.rows.map((row) => {
    const m = WEEKLY_MISSIONS.find((mm) => mm.id === row.mission_id);
    return {
      id: row.mission_id as string,
      name: m?.name || row.mission_id as string,
      progress: row.progress as number,
      target: row.target as number,
      completed: (row.completed as number) === 1,
      claimed: (row.claimed as number) === 1,
      xp: m?.xp || 0,
      coins: m?.coins || 0,
    };
  });
}

// ─── CHALLENGE PROGRESS ─────────────────────────────────────────
export async function updateChallengeProgress(steamId: string, challengeId: string, increment: number = 1) {
  await ensureDb();
  const today = getToday();

  await getDb().execute({
    sql: `UPDATE daily_challenges SET progress = MIN(progress + ?, target) WHERE steam_id = ? AND challenge_id = ? AND challenge_date = ? AND completed = 0`,
    args: [increment, steamId, challengeId, today],
  });
  await getDb().execute({
    sql: `UPDATE daily_challenges SET completed = 1 WHERE steam_id = ? AND challenge_id = ? AND challenge_date = ? AND progress >= target AND completed = 0`,
    args: [steamId, challengeId, today],
  });
}

export async function updateWeeklyProgress(steamId: string, missionId: string, increment: number = 1) {
  await ensureDb();
  const weekStart = getMonday();

  await getDb().execute({
    sql: `UPDATE weekly_missions SET progress = MIN(progress + ?, target) WHERE steam_id = ? AND mission_id = ? AND week_start = ? AND completed = 0`,
    args: [increment, steamId, missionId, weekStart],
  });
  await getDb().execute({
    sql: `UPDATE weekly_missions SET completed = 1 WHERE steam_id = ? AND mission_id = ? AND week_start = ? AND progress >= target AND completed = 0`,
    args: [steamId, missionId, weekStart],
  });
}

export async function claimChallenge(steamId: string, challengeId: string): Promise<{ success: boolean; xp: number; coins: number }> {
  await ensureDb();
  const today = getToday();
  const result = await getDb().execute({
    sql: "SELECT * FROM daily_challenges WHERE steam_id = ? AND challenge_id = ? AND challenge_date = ? AND completed = 1 AND claimed = 0",
    args: [steamId, challengeId, today],
  });
  if (result.rows.length === 0) return { success: false, xp: 0, coins: 0 };

  const allChallenges = [...DAILY_EASY, ...DAILY_MEDIUM, ...DAILY_HARD];
  const ch = allChallenges.find((c) => c.id === challengeId);
  if (!ch) return { success: false, xp: 0, coins: 0 };

  await getDb().execute({
    sql: "UPDATE daily_challenges SET claimed = 1 WHERE steam_id = ? AND challenge_id = ? AND challenge_date = ?",
    args: [steamId, challengeId, today],
  });

  await addXP(steamId, ch.xp);
  if (ch.coins > 0) await addCoins(steamId, ch.coins);

  return { success: true, xp: ch.xp, coins: ch.coins };
}

export async function claimWeeklyMission(steamId: string, missionId: string): Promise<{ success: boolean; xp: number; coins: number }> {
  await ensureDb();
  const weekStart = getMonday();
  const result = await getDb().execute({
    sql: "SELECT * FROM weekly_missions WHERE steam_id = ? AND mission_id = ? AND week_start = ? AND completed = 1 AND claimed = 0",
    args: [steamId, missionId, weekStart],
  });
  if (result.rows.length === 0) return { success: false, xp: 0, coins: 0 };

  const m = WEEKLY_MISSIONS.find((mm) => mm.id === missionId);
  if (!m) return { success: false, xp: 0, coins: 0 };

  await getDb().execute({
    sql: "UPDATE weekly_missions SET claimed = 1 WHERE steam_id = ? AND mission_id = ? AND week_start = ?",
    args: [steamId, missionId, weekStart],
  });

  await addXP(steamId, m.xp);
  await addCoins(steamId, m.coins);

  return { success: true, xp: m.xp, coins: m.coins };
}

// ─── DAILY LOGIN REWARDS ────────────────────────────────────────
const DAILY_LOGIN_REWARDS = [
  { day: 1, type: "xp", amount: 100, label: "100 XP", icon: "⚡" },
  { day: 2, type: "xp", amount: 150, label: "150 XP", icon: "⚡" },
  { day: 3, type: "xp", amount: 200, label: "200 XP", icon: "⚡" },
  { day: 4, type: "coins", amount: 100, label: "100 Pilot Coins", icon: "🪙" },
  { day: 5, type: "title", amount: 1, label: "Título Aleatorio", icon: "🏅" },
  { day: 6, type: "frame", amount: 1, label: "Marco Aleatorio", icon: "🖼️" },
  { day: 7, type: "chest", amount: 1, label: "Cofre Semanal", icon: "📦" },
];

const RANDOM_TITLES = ["Recluta", "Soldado", "Veterano", "Élite", "Operador", "Asesino", "Estratega", "Leyenda"];
const RANDOM_FRAMES = ["frame_bronce", "frame_plata"];

export async function getDailyLoginStatus(steamId: string) {
  await ensureDb();
  const profile = await getOrCreateProfile(steamId);
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentDay = profile.daily_login_day;
  if (profile.last_daily_claim !== today) {
    if (profile.last_daily_claim === yesterday) {
      currentDay = (currentDay % 7) + 1;
    } else {
      currentDay = 1;
    }
  }

  const claimedToday = profile.last_daily_claim === today;
  const currentReward = DAILY_LOGIN_REWARDS.find((r) => r.day === currentDay) || DAILY_LOGIN_REWARDS[0];

  return {
    currentDay,
    claimedToday,
    rewards: DAILY_LOGIN_REWARDS,
    currentReward,
    streak: profile.streak_days,
  };
}

export async function claimDailyLogin(steamId: string): Promise<{ success: boolean; reward?: any; error?: string }> {
  await ensureDb();
  const profile = await getOrCreateProfile(steamId);
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (profile.last_daily_claim === today) return { success: false, error: "Ya reclamaste hoy" };

  let currentDay = profile.daily_login_day;
  if (profile.last_daily_claim === yesterday) {
    currentDay = (currentDay % 7) + 1;
  } else if (profile.last_daily_claim !== today) {
    currentDay = 1;
  }

  const reward = DAILY_LOGIN_REWARDS.find((r) => r.day === currentDay) || DAILY_LOGIN_REWARDS[0];

  await getDb().execute({
    sql: "UPDATE player_profile SET daily_login_day = ?, last_daily_claim = ?, streak_days = CASE WHEN last_login_date = ? THEN streak_days ELSE streak_days + 1 END, last_login_date = ?, total_login_days = total_login_days + 1, updated_at = datetime('now') WHERE steam_id = ?",
    args: [currentDay, today, yesterday, today, steamId],
  });

  switch (reward.type) {
    case "xp":
      await addXP(steamId, reward.amount);
      break;
    case "coins":
      await addCoins(steamId, reward.amount);
      break;
    case "title":
      await getDb().execute({
        sql: "UPDATE player_profile SET current_title = ?, updated_at = datetime('now') WHERE steam_id = ?",
        args: [RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)], steamId],
      });
      break;
    case "frame":
      await getDb().execute({
        sql: "UPDATE player_profile SET equipped_frame = ?, updated_at = datetime('now') WHERE steam_id = ?",
        args: [RANDOM_FRAMES[Math.floor(Math.random() * RANDOM_FRAMES.length)], steamId],
      });
      break;
    case "chest":
      break;
  }

  await getDb().execute({
    sql: "INSERT INTO notifications (steam_id, type, title, message) VALUES (?, 'daily_login', ?, ?)",
    args: [steamId, `¡Login Día ${currentDay}!`, `Recompensa: ${reward.label}`],
  });

  return { success: true, reward };
}

// ─── CHESTS ─────────────────────────────────────────────────────
const CHEST_POOLS = [
  { type: "xp", id: "xp_50", amount: 50, weight: 30, label: "50 XP" },
  { type: "xp", id: "xp_100", amount: 100, weight: 25, label: "100 XP" },
  { type: "xp", id: "xp_200", amount: 200, weight: 15, label: "200 XP" },
  { type: "coins", id: "coins_25", amount: 25, weight: 20, label: "25 Pilot Coins" },
  { type: "coins", id: "coins_50", amount: 50, weight: 10, label: "50 Pilot Coins" },
  { type: "title", id: "random_title", amount: 1, weight: 5, label: "Título Aleatorio" },
  { type: "frame", id: "random_frame", amount: 1, weight: 3, label: "Marco Aleatorio" },
  { type: "background", id: "random_bg", amount: 1, weight: 2, label: "Fondo Aleatorio" },
  { type: "effect", id: "random_effect", amount: 1, weight: 1, label: "Efecto Aleatorio" },
];

function rollChest() {
  const total = CHEST_POOLS.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of CHEST_POOLS) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return CHEST_POOLS[0];
}

const CHEST_COSTS: Record<string, number> = { daily: 0, weekly: 0, standard: 100, premium: 300 };

export async function openChest(steamId: string, chestType: string): Promise<{ success: boolean; reward?: any; error?: string }> {
  await ensureDb();
  const cost = CHEST_COSTS[chestType] ?? 100;
  const profile = await getOrCreateProfile(steamId);

  if (cost > 0 && profile.pilot_coins < cost) return { success: false, error: "No tienes suficientes Pilot Coins" };

  if (cost > 0) {
    await getDb().execute({
      sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ?, updated_at = datetime('now') WHERE steam_id = ?",
      args: [cost, steamId],
    });
  }

  const loot = rollChest();
  let actualAmount = loot.amount;
  let rewardLabel = loot.label;

  switch (loot.type) {
    case "xp":
      await addXP(steamId, loot.amount);
      break;
    case "coins":
      await addCoins(steamId, loot.amount);
      break;
    case "title":
      const t = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
      await getDb().execute({ sql: "UPDATE player_profile SET current_title = ?, updated_at = datetime('now') WHERE steam_id = ?", args: [t, steamId] });
      rewardLabel = t;
      break;
    case "frame":
      const f = RANDOM_FRAMES[Math.floor(Math.random() * RANDOM_FRAMES.length)];
      await getDb().execute({ sql: "UPDATE player_profile SET equipped_frame = ?, updated_at = datetime('now') WHERE steam_id = ?", args: [f, steamId] });
      rewardLabel = f;
      break;
    case "background":
      const bgs = ["bg_dust2", "bg_mirage", "bg_inferno"];
      const bg = bgs[Math.floor(Math.random() * bgs.length)];
      await getDb().execute({ sql: "UPDATE player_profile SET equipped_background = ?, updated_at = datetime('now') WHERE steam_id = ?", args: [bg, steamId] });
      rewardLabel = bg;
      break;
    case "effect":
      const effs = ["effect_glow", "effect_fire", "effect_electric"];
      const eff = effs[Math.floor(Math.random() * effs.length)];
      await getDb().execute({ sql: "UPDATE player_profile SET equipped_effect = ?, updated_at = datetime('now') WHERE steam_id = ?", args: [eff, steamId] });
      rewardLabel = eff;
      break;
  }

  await getDb().execute({
    sql: "INSERT INTO chest_history (steam_id, chest_type, reward_type, reward_id, reward_amount) VALUES (?, ?, ?, ?, ?)",
    args: [steamId, chestType, loot.type, loot.id, actualAmount],
  });

  await getDb().execute({
    sql: "INSERT INTO notifications (steam_id, type, title, message) VALUES (?, 'chest', ?, ?)",
    args: [steamId, `¡Cofre ${chestType} abierto!`, `Obtuviste: ${rewardLabel}`],
  });

  return { success: true, reward: { type: loot.type, label: rewardLabel, amount: actualAmount } };
}

// ─── SEASON PASS ────────────────────────────────────────────────
const SEASON_PASS_LEVELS = 100;

export async function getSeasonPassStatus(steamId: string) {
  await ensureDb();
  const seasonId = getCurrentSeasonId();
  const profile = await getOrCreateProfile(steamId);

  const result = await getDb().execute({
    sql: "SELECT * FROM season_pass WHERE steam_id = ? AND season_id = ?",
    args: [steamId, seasonId],
  });

  let passData;
  if (result.rows.length === 0) {
    await getDb().execute({
      sql: "INSERT INTO season_pass (steam_id, season_id) VALUES (?, ?)",
      args: [steamId, seasonId],
    });
    passData = { pass_level: 0, pass_xp: 0, claimed_rewards: "[]" };
  } else {
    passData = result.rows[0] as any;
  }

  const xpPerLevel = 500;
  const totalXP = profile.xp;
  const passLevel = Math.min(SEASON_PASS_LEVELS, Math.floor(totalXP / xpPerLevel));
  const claimed = JSON.parse(passData.claimed_rewards || "[]");

  const rewards: Array<{ level: number; type: string; label: string; claimed: boolean }> = [];
  for (let i = 1; i <= Math.min(20, SEASON_PASS_LEVELS); i++) {
    let type = "xp";
    let label = `${i * 50} XP`;
    if (i % 10 === 0) { type = "chest"; label = "Cofre Premium"; }
    else if (i % 5 === 0) { type = "coins"; label = `${i * 10} Coins`; }
    else if (i === 7) { type = "title"; label = "Título Exclusivo"; }
    else if (i === 15) { type = "frame"; label = "Marco Premium"; }
    rewards.push({ level: i, type, label, claimed: claimed.includes(i) });
  }

  return {
    seasonId,
    passLevel,
    totalLevels: SEASON_PASS_LEVELS,
    xpPerLevel,
    rewards,
    nextReward: rewards.find((r) => !r.claimed && r.level > passLevel) || null,
  };
}

export async function claimSeasonPassReward(steamId: string, level: number) {
  await ensureDb();
  const seasonId = getCurrentSeasonId();
  const profile = await getOrCreateProfile(steamId);
  const passLevel = Math.min(100, Math.floor(profile.xp / 500));

  if (level > passLevel) return { success: false, error: "No has alcanzado este nivel" };

  const result = await getDb().execute({
    sql: "SELECT claimed_rewards FROM season_pass WHERE steam_id = ? AND season_id = ?",
    args: [steamId, seasonId],
  });
  const claimed = JSON.parse((result.rows[0] as any)?.claimed_rewards || "[]");
  if (claimed.includes(level)) return { success: false, error: "Ya reclamaste esta recompensa" };

  claimed.push(level);
  await getDb().execute({
    sql: "UPDATE season_pass SET claimed_rewards = ? WHERE steam_id = ? AND season_id = ?",
    args: [JSON.stringify(claimed), steamId, seasonId],
  });

  await addXP(steamId, level * 50);
  await addCoins(steamId, level * 5);

  return { success: true };
}

// ─── SHOP ───────────────────────────────────────────────────────
export interface ShopItem {
  id: string;
  name: string;
  category: "frame" | "background" | "title" | "effect" | "emoji";
  price: number;
  levelReq: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  desc: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "frame_neon_blue", name: "Neon Blue", category: "frame", price: 200, levelReq: 5, rarity: "common", desc: "Marco azul neón brillante" },
  { id: "frame_neon_purple", name: "Neon Purple", category: "frame", price: 200, levelReq: 5, rarity: "common", desc: "Marco púrpura neón" },
  { id: "frame_gold", name: "Gold", category: "frame", price: 500, levelReq: 15, rarity: "rare", desc: "Marco dorado premium" },
  { id: "frame_diamond", name: "Diamond", category: "frame", price: 1000, levelReq: 25, rarity: "epic", desc: "Marco de diamante" },
  { id: "frame_crimson", name: "Crimson", category: "frame", price: 800, levelReq: 20, rarity: "rare", desc: "Marco carmesí" },
  { id: "frame_holographic", name: "Holographic", category: "frame", price: 1500, levelReq: 30, rarity: "legendary", desc: "Marco holográfico" },

  { id: "bg_mirage", name: "Mirage", category: "background", price: 300, levelReq: 5, rarity: "common", desc: "Fondo de Mirage" },
  { id: "bg_inferno", name: "Inferno", category: "background", price: 300, levelReq: 5, rarity: "common", desc: "Fondo de Inferno" },
  { id: "bg_dust2", name: "Dust2", category: "background", price: 300, levelReq: 5, rarity: "common", desc: "Fondo de Dust2" },
  { id: "bg_anubis", name: "Anubis", category: "background", price: 300, levelReq: 5, rarity: "common", desc: "Fondo de Anubis" },
  { id: "bg_galaxy", name: "Galaxy", category: "background", price: 600, levelReq: 15, rarity: "rare", desc: "Fondo galáctico" },
  { id: "bg_cyberpunk", name: "Cyberpunk", category: "background", price: 800, levelReq: 20, rarity: "rare", desc: "Fondo cyberpunk" },
  { id: "bg_matrix", name: "Matrix", category: "background", price: 1000, levelReq: 25, rarity: "epic", desc: "Fondo Matrix" },
  { id: "bg_purple_smoke", name: "Purple Smoke", category: "background", price: 600, levelReq: 15, rarity: "rare", desc: "Humo púrpura" },

  { id: "title_rookie", name: "Rookie", category: "title", price: 100, levelReq: 1, rarity: "common", desc: "Título de principiante" },
  { id: "title_entry_fragger", name: "Entry Fragger", category: "title", price: 300, levelReq: 10, rarity: "common", desc: "El primero en entrar" },
  { id: "title_clutch_master", name: "Clutch Master", category: "title", price: 500, levelReq: 15, rarity: "rare", desc: "Maestro del clutch" },
  { id: "title_awp_god", name: "AWP God", category: "title", price: 500, levelReq: 15, rarity: "rare", desc: "Dios de la AWP" },
  { id: "title_the_grinder", name: "The Grinder", category: "title", price: 400, levelReq: 12, rarity: "common", desc: "El que nunca para" },
  { id: "title_mirage_king", name: "Mirage King", category: "title", price: 600, levelReq: 18, rarity: "rare", desc: "Rey de Mirage" },
  { id: "title_premier_beast", name: "Premier Beast", category: "title", price: 1000, levelReq: 30, rarity: "epic", desc: "Bestia de Premier" },
  { id: "title_faceit_demon", name: "FACEIT Demon", category: "title", price: 1200, levelReq: 35, rarity: "epic", desc: "Demonio de FACEIT" },

  { id: "effect_glow", name: "Glow", category: "effect", price: 400, levelReq: 10, rarity: "common", desc: "Brillo en el nombre" },
  { id: "effect_fire", name: "Nombre Brillante", category: "effect", price: 600, levelReq: 15, rarity: "rare", desc: "Nombre con fuego" },
  { id: "effect_electric", name: "Borde Eléctrico", category: "effect", price: 800, levelReq: 20, rarity: "rare", desc: "Borde eléctrico" },
  { id: "effect_holographic", name: "Avatar Animado", category: "effect", price: 1000, levelReq: 25, rarity: "epic", desc: "Avatar con efecto" },

  { id: "emoji_fire", name: "Fuego", category: "emoji", price: 100, levelReq: 1, rarity: "common", desc: "🔥 Emoji exclusivo" },
  { id: "emoji_skull", name: "Calavera", category: "emoji", price: 100, levelReq: 1, rarity: "common", desc: "💀 Emoji exclusivo" },
  { id: "emoji_crown", name: "Corona", category: "emoji", price: 200, levelReq: 5, rarity: "common", desc: "👑 Emoji exclusivo" },
  { id: "emoji_lightning", name: "Rayo", category: "emoji", price: 200, levelReq: 5, rarity: "common", desc: "⚡ Emoji exclusivo" },
  { id: "emoji_diamond", name: "Diamante", category: "emoji", price: 300, levelReq: 10, rarity: "rare", desc: "💎 Emoji exclusivo" },
  { id: "emoji_star", name: "Estrella", category: "emoji", price: 300, levelReq: 10, rarity: "rare", desc: "⭐ Emoji exclusivo" },
];

export async function getShopItems(steamId: string) {
  await ensureDb();
  const purchases = await getDb().execute({
    sql: "SELECT item_id FROM shop_purchases WHERE steam_id = ?",
    args: [steamId],
  });
  const owned = new Set(purchases.rows.map((r) => r.item_id as string));
  const profile = await getOrCreateProfile(steamId);

  return SHOP_ITEMS.map((item) => ({
    ...item,
    owned: owned.has(item.id),
    equipped: item.category === "frame" ? profile.equipped_frame === item.id
      : item.category === "background" ? profile.equipped_background === item.id
      : item.category === "effect" ? profile.equipped_effect === item.id
      : item.category === "title" ? profile.current_title === item.name
      : item.category === "emoji" ? profile.equipped_emoji === item.id
      : false,
  }));
}

export async function buyShopItem(steamId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
  await ensureDb();
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { success: false, error: "Ítem no encontrado" };

  const profile = await getOrCreateProfile(steamId);
  if (profile.level < item.levelReq) return { success: false, error: `Necesitas nivel ${item.levelReq}` };
  if (profile.pilot_coins < item.price) return { success: false, error: "No tienes suficientes Pilot Coins" };

  const existing = await getDb().execute({
    sql: "SELECT id FROM shop_purchases WHERE steam_id = ? AND item_id = ?",
    args: [steamId, itemId],
  });
  if (existing.rows.length > 0) return { success: false, error: "Ya tienes este ítem" };

  await getDb().execute({ sql: "INSERT INTO shop_purchases (steam_id, item_id) VALUES (?, ?)", args: [steamId, itemId] });
  await getDb().execute({
    sql: "UPDATE player_profile SET pilot_coins = pilot_coins - ?, updated_at = datetime('now') WHERE steam_id = ?",
    args: [item.price, steamId],
  });
  await getDb().execute({
    sql: "INSERT INTO notifications (steam_id, type, title, message) VALUES (?, 'shop_purchase', ?, ?)",
    args: [steamId, "¡Compra exitosa!", `Adquiriste: ${item.name}`],
  });

  return { success: true };
}

export async function equipShopItem(steamId: string, itemId: string): Promise<{ success: boolean; error?: string }> {
  await ensureDb();
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { success: false, error: "Ítem no encontrado" };

  const existing = await getDb().execute({
    sql: "SELECT id FROM shop_purchases WHERE steam_id = ? AND item_id = ?",
    args: [steamId, itemId],
  });
  if (existing.rows.length === 0) return { success: false, error: "No tienes este ítem" };

  const fieldMap: Record<string, string> = {
    frame: "equipped_frame",
    background: "equipped_background",
    effect: "equipped_effect",
    emoji: "equipped_emoji",
    title: "current_title",
  };
  const field = fieldMap[item.category];
  if (!field) return { success: false, error: "Categoría no equipable" };

  const value = field === "current_title" ? item.name : itemId;
  await getDb().execute({
    sql: `UPDATE player_profile SET ${field} = ?, updated_at = datetime('now') WHERE steam_id = ?`,
    args: [value, steamId],
  });

  return { success: true };
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────
export async function getNotifications(steamId: string, limit: number = 20) {
  await ensureDb();
  const result = await getDb().execute({
    sql: "SELECT * FROM notifications WHERE steam_id = ? ORDER BY created_at DESC LIMIT ?",
    args: [steamId, limit],
  });
  return result.rows;
}

export async function markNotificationsRead(steamId: string) {
  await ensureDb();
  await getDb().execute({
    sql: "UPDATE notifications SET read = 1 WHERE steam_id = ? AND read = 0",
    args: [steamId],
  });
}

export async function getUnreadCount(steamId: string): Promise<number> {
  await ensureDb();
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) as count FROM notifications WHERE steam_id = ? AND read = 0",
    args: [steamId],
  });
  return (result.rows[0] as any)?.count || 0;
}

// ─── ACTION LOG & TRACKING ──────────────────────────────────────
export async function logAction(steamId: string, action: string, value: number = 1) {
  await ensureDb();
  await getDb().execute({
    sql: "INSERT INTO action_log (steam_id, action, value) VALUES (?, ?, ?)",
    args: [steamId, action, value],
  });

  const dailyMap: Record<string, string[]> = {
    match_played: ["deasy_play1", "dmed_play3"],
    match_won: ["dmed_win1", "dhard_win3"],
    kill: ["deasy_kill10", "dmed_kill25", "dhard_kill50"],
    headshot: ["deasy_hs3", "dmed_hs10", "dhard_hs20"],
    mvp: ["deasy_mvp1", "dmed_mvp3"],
    demo_analyzed: ["deasy_demo"],
    ace: ["dhard_ace"],
    clutch: ["dhard_clutch3"],
  };

  const weeklyMap: Record<string, string[]> = {
    kill: ["w_kills100"],
    match_won: ["w_wins10"],
    headshot: ["w_hs50"],
    mvp: ["w_mvp20"],
    demo_analyzed: ["w_demos5"],
    match_played: ["w_play20"],
  };

  for (const id of dailyMap[action] || []) {
    await updateChallengeProgress(steamId, id, value);
  }
  for (const id of weeklyMap[action] || []) {
    await updateWeeklyProgress(steamId, id, value);
  }
}

// ─── LEADERBOARD ────────────────────────────────────────────────
export type LeaderboardType = "xp" | "coins" | "wins" | "kills" | "headshots" | "mvps" | "kd" | "hs_pct" | "awp" | "elo" | "premier" | "level" | "hours";

export async function getLeaderboard(type: LeaderboardType, limit: number = 50, country?: string) {
  await ensureDb();
  const columnMap: Record<string, string> = {
    xp: "xp",
    coins: "pilot_coins",
    wins: "total_wins",
    kills: "total_kills",
    headshots: "total_headshots",
    mvps: "total_mvps",
    kd: "best_kd",
    hs_pct: "best_hs_pct",
    awp: "total_awp_kills",
    elo: "best_elo",
    premier: "best_premier",
    level: "level",
    hours: "total_hours",
  };
  const col = columnMap[type] || "xp";
  const countryFilter = country ? " WHERE country = ?" : "";
  const args = country ? [country, limit] : [limit];
  const result = await getDb().execute({
    sql: `SELECT steam_id, steam_name, avatar_url, profile_url, country, steam_level, cs2_hours, xp, level, pilot_coins, current_title, streak_days, total_wins, total_kills, total_headshots, total_mvps, total_hours, best_kd, best_hs_pct, best_elo, best_faceit_level, best_premier, equipped_frame, equipped_color, equipped_effect, equipped_emoji FROM player_profile${countryFilter} ORDER BY ${col} DESC LIMIT ?`,
    args,
  });
  return result.rows;
}

export async function getUserPosition(steamId: string, type: LeaderboardType): Promise<{ position: number; total: number; value: number }> {
  await ensureDb();
  const columnMap: Record<string, string> = {
    xp: "xp",
    coins: "pilot_coins",
    wins: "total_wins",
    kills: "total_kills",
    headshots: "total_headshots",
    mvps: "total_mvps",
    kd: "best_kd",
    hs_pct: "best_hs_pct",
    awp: "total_awp_kills",
    elo: "best_elo",
    premier: "best_premier",
    level: "level",
    hours: "total_hours",
  };
  const col = columnMap[type] || "xp";

  const countResult = await getDb().execute("SELECT COUNT(*) as total FROM player_profile");
  const total = (countResult.rows[0]?.total as number) || 0;

  const profileResult = await getDb().execute({ sql: `SELECT ${col} as val FROM player_profile WHERE steam_id = ?`, args: [steamId] });
  const value = (profileResult.rows[0]?.val as number) || 0;

  const posResult = await getDb().execute({
    sql: `SELECT COUNT(*) as pos FROM player_profile WHERE ${col} > ?`,
    args: [value],
  });
  const position = ((posResult.rows[0]?.pos as number) || 0) + 1;

  return { position, total, value };
}

export async function getTotalPlayerCount(): Promise<number> {
  await ensureDb();
  const result = await getDb().execute("SELECT COUNT(*) as total FROM player_profile");
  return (result.rows[0]?.total as number) || 0;
}

// ─── STREAK ─────────────────────────────────────────────────────
export async function updateStreak(steamId: string): Promise<{ streak: number; isNew: boolean }> {
  await ensureDb();
  const profile = await getOrCreateProfile(steamId);
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (profile.last_login_date === today) return { streak: profile.streak_days, isNew: false };

  let newStreak = profile.last_login_date === yesterday ? profile.streak_days + 1 : 1;
  const isNew = newStreak > profile.streak_days;

  await getDb().execute({
    sql: "UPDATE player_profile SET streak_days = ?, last_login_date = ?, updated_at = datetime('now') WHERE steam_id = ?",
    args: [newStreak, today, steamId],
  });

  return { streak: newStreak, isNew };
}

// ─── PROFILE SYNC (from FACEIT/Steam) ──────────────────────────
export async function syncProfileStats(steamId: string, stats: {
  wins?: number;
  kills?: number;
  headshots?: number;
  mvps?: number;
  hours?: number;
  kd?: number;
  hsPct?: number;
  elo?: number;
  faceitLevel?: number;
  premier?: number;
  clutches?: number;
  aces?: number;
  awpKills?: number;
  maps?: string[];
}) {
  await ensureDb();
  const sets: string[] = [];
  const args: any[] = [];

  if (stats.wins !== undefined) { sets.push("total_wins = MAX(total_wins, ?)"); args.push(stats.wins); }
  if (stats.kills !== undefined) { sets.push("total_kills = MAX(total_kills, ?)"); args.push(stats.kills); }
  if (stats.headshots !== undefined) { sets.push("total_headshots = MAX(total_headshots, ?)"); args.push(stats.headshots); }
  if (stats.mvps !== undefined) { sets.push("total_mvps = MAX(total_mvps, ?)"); args.push(stats.mvps); }
  if (stats.hours !== undefined) { sets.push("total_hours = MAX(total_hours, ?)"); args.push(stats.hours); }
  if (stats.kd !== undefined) { sets.push("best_kd = MAX(best_kd, ?)"); args.push(stats.kd); }
  if (stats.hsPct !== undefined) { sets.push("best_hs_pct = MAX(best_hs_pct, ?)"); args.push(stats.hsPct); }
  if (stats.elo !== undefined) { sets.push("best_elo = MAX(best_elo, ?)"); args.push(stats.elo); }
  if (stats.faceitLevel !== undefined) { sets.push("best_faceit_level = MAX(best_faceit_level, ?)"); args.push(stats.faceitLevel); }
  if (stats.premier !== undefined) { sets.push("best_premier = MAX(best_premier, ?)"); args.push(stats.premier); }
  if (stats.clutches !== undefined) { sets.push("total_clutches = MAX(total_clutches, ?)"); args.push(stats.clutches); }
  if (stats.aces !== undefined) { sets.push("total_aces = MAX(total_aces, ?)"); args.push(stats.aces); }
  if (stats.awpKills !== undefined) { sets.push("total_awp_kills = MAX(total_awp_kills, ?)"); args.push(stats.awpKills); }
  if (stats.maps !== undefined) {
    sets.push("maps_played = ?");
    args.push(JSON.stringify(stats.maps));
  }

  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    args.push(steamId);
    await getDb().execute({
      sql: `UPDATE player_profile SET ${sets.join(", ")} WHERE steam_id = ?`,
      args,
    });
  }

  const profile = await getOrCreateProfile(steamId);
  const mappedStats: PlayerStats = {
    wins: profile.total_wins,
    kills: profile.total_kills,
    headshots: profile.total_headshots,
    kd_x100: Math.round(profile.best_kd * 100),
    hs_pct: profile.best_hs_pct,
    hours: profile.total_hours,
    mvps: profile.total_mvps,
    clutches: profile.total_clutches,
    streak: profile.streak_days,
    aces: profile.total_aces,
    level: profile.level,
    maps: JSON.parse(profile.maps_played || "[]").length,
    awp_kills: profile.total_awp_kills,
    faceit_level: profile.best_faceit_level,
    elo: profile.best_elo,
    premier: profile.best_premier,
  };

  return checkAchievementsFromStats(steamId, mappedStats);
}

// ─── LOGIN ──────────────────────────────────────────────────────
export async function logLogin(steamId: string) {
  await ensureDb();
  await logAction(steamId, "login");
  await updateStreak(steamId);
}

// ─── DAILY TIPS (for Coach IA) ─────────────────────────────────
export async function getDailyTips(steamId: string): Promise<string[]> {
  await ensureDb();
  const profile = await getOrCreateProfile(steamId);
  const tips: string[] = [];

  const totalM = profile.total_kills;
  const totalW = profile.total_wins;
  if (totalM > 0) {
    const wr = (totalW / totalM) * 100;
    if (wr < 45) tips.push(`Tu win rate es ${wr.toFixed(0)}%. Intentá jugar más objetivos para subirlo.`);
  }

  if (profile.best_hs_pct > 0 && profile.best_hs_pct < 40) {
    tips.push(`Tu precisión bajó. Practicá en Aim Botz para mejorar tus headshots.`);
  }

  if (profile.streak_days > 0 && profile.streak_days % 7 === 0) {
    tips.push(`Llevas ${profile.streak_days} días de racha. ¡No pares!`);
  }

  const dailyResult = await getDb().execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as done FROM daily_challenges WHERE steam_id = ? AND challenge_date = ?",
    args: [steamId, getToday()],
  });
  const dailyRow = dailyResult.rows[0] as any;
  if (dailyRow?.total > 0 && dailyRow?.done < dailyRow?.total) {
    tips.push(`Te faltan ${(dailyRow.total - dailyRow.done)} desafíos diarios por completar.`);
  }

  if (tips.length === 0) tips.push("Seguí así. Tu rendimiento es constante. ¡Mejorá un poco más cada día!");

  return tips.slice(0, 3);
}
