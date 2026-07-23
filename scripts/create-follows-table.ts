import { createClient } from "@libsql/client";

async function main() {
  const db = createClient({
    url: "libsql://cs2pilot-boujonkevin12-gif.aws-us-west-2.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS player_follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (follower_id) REFERENCES player_profile(steam_id),
      FOREIGN KEY (following_id) REFERENCES player_profile(steam_id),
      UNIQUE(follower_id, following_id)
    );
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON player_follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON player_follows(following_id);
  `);

  console.log("player_follows table created successfully");
  const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='player_follows'");
  console.log("Verified:", result.rows);
}

main().catch(console.error);
