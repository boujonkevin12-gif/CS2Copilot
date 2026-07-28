import { getDb } from "@/lib/db";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS player_profile (
  steam_id TEXT PRIMARY KEY,
  steam_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT NULL,
  profile_url TEXT DEFAULT NULL,
  country TEXT DEFAULT NULL,
  steam_level INTEGER DEFAULT 0,
  cs2_hours INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  pilot_coins INTEGER DEFAULT 0,
  current_title TEXT DEFAULT 'Recluta',
  equipped_frame TEXT DEFAULT NULL,
  equipped_background TEXT DEFAULT NULL,
  equipped_effect TEXT DEFAULT NULL,
  equipped_emoji TEXT DEFAULT NULL,
  equipped_color TEXT DEFAULT NULL,
  streak_days INTEGER DEFAULT 0,
  last_login_date TEXT DEFAULT NULL,
  daily_login_day INTEGER DEFAULT 0,
  last_daily_claim TEXT DEFAULT NULL,
  total_login_days INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_headshots INTEGER DEFAULT 0,
  total_mvps INTEGER DEFAULT 0,
  total_hours INTEGER DEFAULT 0,
  best_kd REAL DEFAULT 0,
  best_hs_pct REAL DEFAULT 0,
  best_elo INTEGER DEFAULT 0,
  best_faceit_level INTEGER DEFAULT 0,
  best_premier INTEGER DEFAULT 0,
  total_clutches INTEGER DEFAULT 0,
  last_faceit_matches INTEGER DEFAULT 0,
  last_faceit_wins INTEGER DEFAULT 0,
  total_aces INTEGER DEFAULT 0,
  total_awp_kills INTEGER DEFAULT 0,
  maps_played TEXT DEFAULT '[]',
  stats_baseline TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  unlocked INTEGER DEFAULT 0,
  unlocked_at TEXT DEFAULT NULL,
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id),
  UNIQUE(steam_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  challenge_date TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  claimed INTEGER DEFAULT 0,
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id),
  UNIQUE(steam_id, challenge_id, challenge_date)
);

CREATE TABLE IF NOT EXISTS weekly_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  claimed INTEGER DEFAULT 0,
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id),
  UNIQUE(steam_id, mission_id, week_start)
);

CREATE TABLE IF NOT EXISTS shop_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id),
  UNIQUE(steam_id, item_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id)
);

CREATE TABLE IF NOT EXISTS action_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  action TEXT NOT NULL,
  value INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id)
);

CREATE TABLE IF NOT EXISTS season_pass (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  season_id TEXT NOT NULL,
  pass_level INTEGER DEFAULT 0,
  pass_xp INTEGER DEFAULT 0,
  claimed_rewards TEXT DEFAULT '[]',
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id),
  UNIQUE(steam_id, season_id)
);

CREATE TABLE IF NOT EXISTS chest_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  steam_id TEXT NOT NULL,
  chest_type TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  reward_amount INTEGER DEFAULT 0,
  opened_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id)
);

CREATE TABLE IF NOT EXISTS player_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (follower_id) REFERENCES player_profile(steam_id),
  FOREIGN KEY (following_id) REFERENCES player_profile(steam_id),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_player_follows_follower ON player_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_player_follows_following ON player_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_achievements_steam ON achievements(steam_id);
CREATE INDEX IF NOT EXISTS idx_achievements_steam_id ON achievements(steam_id, achievement_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_steam_date ON daily_challenges(steam_id, challenge_date);
CREATE INDEX IF NOT EXISTS idx_weekly_missions_steam_week ON weekly_missions(steam_id, week_start);
CREATE INDEX IF NOT EXISTS idx_notifications_steam ON notifications(steam_id, read);
CREATE INDEX IF NOT EXISTS idx_action_log_steam_action ON action_log(steam_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_steam ON shop_purchases(steam_id);
CREATE INDEX IF NOT EXISTS idx_season_pass_steam ON season_pass(steam_id, season_id);
CREATE INDEX IF NOT EXISTS idx_chest_history_steam ON chest_history(steam_id);
CREATE INDEX IF NOT EXISTS idx_player_profile_country ON player_profile(country);
CREATE INDEX IF NOT EXISTS idx_player_profile_xp ON player_profile(xp DESC);
CREATE INDEX IF NOT EXISTS idx_player_profile_level ON player_profile(level DESC);
CREATE INDEX IF NOT EXISTS idx_player_profile_hours ON player_profile(total_hours DESC);
ALTER TABLE player_profile ADD COLUMN last_faceit_matches INTEGER DEFAULT 0;
ALTER TABLE player_profile ADD COLUMN last_faceit_wins INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_player_profile_coins ON player_profile(pilot_coins DESC);

CREATE TABLE IF NOT EXISTS user_preferences (
  steam_id TEXT PRIMARY KEY,
  bio TEXT DEFAULT '',
  language TEXT DEFAULT 'es',
  overlay TEXT DEFAULT '{"enabled":false,"position":"top-right","opacity":0.8,"scale":1,"showKd":true,"showWinRate":true,"showRating":false,"showHs":true,"showUtility":false,"showAdr":false}',
  notifications TEXT DEFAULT '{"emailAnalysis":true,"emailRank":true,"emailNews":false,"pushAnalysisComplete":true,"pushFriendsOnline":true,"pushUpdates":false,"inAppMessages":true,"inAppAchievements":true,"inAppRewards":true}',
  appearance TEXT DEFAULT '{"theme":"dark","primaryColor":"#8b5cf6","uiScale":100,"animations":true,"blur":true,"density":"comfortable"}',
  privacy TEXT DEFAULT '{"publicProfile":true,"showStats":true,"showHours":true,"showInRankings":true}',
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id)
);

CREATE TABLE IF NOT EXISTS connected_accounts (
  steam_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_id TEXT DEFAULT NULL,
  username TEXT DEFAULT NULL,
  connected_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (steam_id, provider),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences ON user_preferences(steam_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts ON connected_accounts(steam_id);

CREATE TABLE IF NOT EXISTS inventory_cache (
  steam_id TEXT PRIMARY KEY,
  items TEXT NOT NULL,
  total_value REAL DEFAULT 0,
  knife_count INTEGER DEFAULT 0,
  glove_count INTEGER DEFAULT 0,
  most_expensive_item TEXT DEFAULT NULL,
  rarity_distribution TEXT DEFAULT '{}',
  category_distribution TEXT DEFAULT '{}',
  total_items INTEGER DEFAULT 0,
  cached_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id)
);

CREATE TABLE IF NOT EXISTS inventory_fetch_state (
  steam_id TEXT PRIMARY KEY,
  rate_limit_until TEXT,
  fetching_since TEXT
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  creator_steam_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  entry_fee INTEGER NOT NULL DEFAULT 0,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  duration_hours INTEGER NOT NULL DEFAULT 72,
  status TEXT NOT NULL DEFAULT 'pending',
  max_participants INTEGER DEFAULT 0,
  start_time TEXT,
  end_time TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (creator_steam_id) REFERENCES player_profile(steam_id)
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id TEXT NOT NULL,
  steam_id TEXT NOT NULL,
  joined_at TEXT DEFAULT (datetime('now')),
  placement INTEGER DEFAULT NULL,
  prize_earned INTEGER DEFAULT 0,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  FOREIGN KEY (steam_id) REFERENCES player_profile(steam_id),
  UNIQUE(tournament_id, steam_id)
);

CREATE TABLE IF NOT EXISTS tournament_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id TEXT NOT NULL,
  from_steam_id TEXT NOT NULL,
  to_steam_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  UNIQUE(tournament_id, to_steam_id)
);

CREATE INDEX IF NOT EXISTS idx_tournaments_creator ON tournaments(creator_steam_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_player ON tournament_participants(steam_id);
CREATE INDEX IF NOT EXISTS idx_tournament_invites_player ON tournament_invites(to_steam_id, status);

`;

export async function initializeDatabase() {
  try {
    const statements = SCHEMA.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sql of statements) {
      try {
        await getDb().execute(sql);
      } catch {
        // Ignore — table/index may already exist
      }
    }
  } catch {
    // DB connection issue — will retry on next call
  }
}
