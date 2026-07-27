import { createClient } from "@libsql/client";
import * as path from "path";

let _db: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (url) {
      _db = createClient({ url, authToken });
    } else {
      const dbPath = path.join(process.cwd(), "data.db");
      _db = createClient({ url: `file:${dbPath}` });
    }
  }
  return _db;
}

export function resetDb() {
  if (_db) {
    try { _db.close(); } catch {}
    _db = null;
  }
}
