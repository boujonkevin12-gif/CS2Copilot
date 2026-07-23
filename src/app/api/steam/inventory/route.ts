import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let user;
  try {
    user = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const steamId = user.steamId;
  if (!steamId) {
    return NextResponse.json({ error: "No Steam ID in session" }, { status: 400 });
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "STEAM_API_KEY not configured" }, { status: 500 });
  }

  let currentVisibility = user.visibility;
  try {
    const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
    const summaryRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(10000) });
    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      const player = summaryData?.response?.players?.[0];
      if (player) {
        currentVisibility = Number(player.communityvisibilitystate) || 0;
      }
    }
  } catch {
    // Use cookie visibility as fallback
  }

  if (currentVisibility !== 3) {
    return NextResponse.json({
      error: "inventario_privado",
      message: "Tu perfil de Steam debe ser público para consultar el inventario. Ve a Steam → Editar perfil → Privacidad → Cambia la visibilidad del inventario a Público.",
      steamId,
      isPublic: false,
    }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    steamId,
    isPublic: true,
  });
}
