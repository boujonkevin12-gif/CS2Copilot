import { NextRequest } from "next/server";

export function getSteamId(request: NextRequest): string | null {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) return null;
  try {
    const data = JSON.parse(cookie.value);
    return data.steamId || null;
  } catch {
    return null;
  }
}
