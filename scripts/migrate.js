const { getDb } = require('./src/lib/db');
(async () => {
  try {
    const db = await getDb();
    await db.execute("DELETE FROM daily_challenges WHERE challenge_id LIKE '%demo%'");
    await db.execute("DELETE FROM weekly_missions WHERE mission_id LIKE '%demo%'");
    console.log('Cleaned demo challenges from DB');
    process.exit(0);
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  }
})();
