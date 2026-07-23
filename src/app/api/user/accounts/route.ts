import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function getUser(req: NextRequest) {
  const cookie = req.cookies.get("cs2pilot_user");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

const DISPLAY_NAMES: Record<string, string> = {
  steam: "Steam",
  faceit: "FACEIT",
  google: "Google",
  discord: "Discord",
};

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { provider, action } = body;
  const steamId = user.steamId;

  if (!provider || !["connect", "disconnect"].includes(action)) {
    return NextResponse.json({ error: "Provider y action requeridos" }, { status: 400 });
  }

  const db = getDb();

  if (action === "disconnect") {
    if (provider === "steam") {
      return NextResponse.json({ error: "No puedes desconectar Steam" }, { status: 400 });
    }
    await db.execute("DELETE FROM connected_accounts WHERE steam_id = ? AND provider = ?", [steamId, provider]);
    return NextResponse.json({ success: true, connected: false });
  }

  if (action === "connect") {
    if (provider === "steam") {
      const exists = await db.execute("SELECT provider FROM connected_accounts WHERE steam_id = ? AND provider = 'steam'", [steamId]);
      if (exists.rows.length === 0) {
        await db.execute("INSERT INTO connected_accounts (steam_id, provider, provider_id, username) VALUES (?, 'steam', ?, ?)", [steamId, user.steamId, user.name]);
      }
      return NextResponse.json({ success: true, connected: true });
    }

    if (provider === "google" || provider === "discord") {
      const exists = await db.execute("SELECT provider FROM connected_accounts WHERE steam_id = ? AND provider = ?", [steamId, provider]);
      if (exists.rows.length === 0) {
        await db.execute("INSERT INTO connected_accounts (steam_id, provider, provider_id, username) VALUES (?, ?, ?, ?)", [steamId, provider, `${steamId}_${provider}`, `${DISPLAY_NAMES[provider]} User`]);
      }
      return NextResponse.json({ success: true, connected: true, placeholder: true });
    }

    return NextResponse.json({ error: "Provider no soportado" }, { status: 400 });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
