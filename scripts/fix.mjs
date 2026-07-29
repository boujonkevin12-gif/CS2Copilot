import { createClient } from "@libsql/client";
const db = createClient({ url: "file:data.db" });
await db.execute("DELETE FROM daily_challenges WHERE challenge_id IN ('deasy_ace1')");
await db.execute("DELETE FROM weekly_missions WHERE mission_id IN ('w_clutch15')");
console.log("Cleaned old challenges from DB");
