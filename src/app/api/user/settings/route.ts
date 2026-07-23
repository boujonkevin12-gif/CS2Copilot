import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function getUser(req: NextRequest) {
  const cookie = req.cookies.get("cs2pilot_user");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const db = getDb();
  const steamId = user.steamId;

  let prefs: any = {
    bio: "",
    language: "es",
    overlay: { enabled: false, position: "top-right", opacity: 0.8, scale: 1, showKd: true, showWinRate: true, showRating: false, showHs: true, showUtility: false, showAdr: false },
    notifications: { emailAnalysis: true, emailRank: true, emailNews: false, pushAnalysisComplete: true, pushFriendsOnline: true, pushUpdates: false, inAppMessages: true, inAppAchievements: true, inAppRewards: true },
    appearance: { theme: "dark", primaryColor: "#8b5cf6", uiScale: 100, animations: true, blur: true, density: "comfortable" },
    privacy: { publicProfile: true, showStats: true, showHours: true, showInRankings: true },
  };

  try {
    const row = await db.execute("SELECT * FROM user_preferences WHERE steam_id = ?", [steamId]);
    if (row.rows.length > 0) {
      const r = row.rows[0] as any;
      prefs.bio = r.bio || "";
      prefs.language = r.language || "es";
      try { prefs.overlay = JSON.parse(r.overlay || "{}"); } catch {}
      try { prefs.notifications = JSON.parse(r.notifications || "{}"); } catch {}
      try { prefs.appearance = JSON.parse(r.appearance || "{}"); } catch {}
      try { prefs.privacy = JSON.parse(r.privacy || "{}"); } catch {}
    }
  } catch {}

  const accountsResult = await db.execute("SELECT provider, provider_id, username, connected_at FROM connected_accounts WHERE steam_id = ?", [steamId]);
  const accounts: any[] = accountsResult.rows.map((r: any) => ({
    provider: r.provider,
    providerId: r.provider_id,
    username: r.username,
    connectedAt: r.connected_at,
  }));

  return NextResponse.json({ preferences: prefs, accounts });
}

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const db = getDb();
  const steamId = user.steamId;

  const allowedCategories = ["bio", "language", "overlay", "notifications", "appearance", "privacy"];
  const updates: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(body)) {
    if (!allowedCategories.includes(key)) continue;
    if (typeof val === "object" && val !== null) {
      updates.push(`${key} = ?`);
      values.push(JSON.stringify(val));
    } else if (typeof val === "string") {
      updates.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(steamId);

  const existing = await db.execute("SELECT steam_id FROM user_preferences WHERE steam_id = ?", [steamId]);
  if (existing.rows.length === 0) {
    const defaults: any = {
      bio: "", language: "es",
      overlay: '{"enabled":false,"position":"top-right","opacity":0.8,"scale":1,"showKd":true,"showWinRate":true,"showRating":false,"showHs":true,"showUtility":false,"showAdr":false}',
      notifications: '{"emailAnalysis":true,"emailRank":true,"emailNews":false,"pushAnalysisComplete":true,"pushFriendsOnline":true,"pushUpdates":false,"inAppMessages":true,"inAppAchievements":true,"inAppRewards":true}',
      appearance: '{"theme":"dark","primaryColor":"#8b5cf6","uiScale":100,"animations":true,"blur":true,"density":"comfortable"}',
      privacy: '{"publicProfile":true,"showStats":true,"showHours":true,"showInRankings":true}',
    };
    const merged = { ...defaults, ...body };
    await db.execute(
      "INSERT INTO user_preferences (steam_id, bio, language, overlay, notifications, appearance, privacy, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      [steamId, merged.bio || "", merged.language || "es", JSON.stringify(merged.overlay || {}), JSON.stringify(merged.notifications || {}), JSON.stringify(merged.appearance || {}), JSON.stringify(merged.privacy || {})]
    );
  } else {
    await db.execute(`UPDATE user_preferences SET ${updates.join(", ")} WHERE steam_id = ?`, values);
  }

  return NextResponse.json({ success: true });
}
