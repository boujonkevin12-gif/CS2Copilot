import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

function extractSteamId(claimedId: string): string | null {
  const match = claimedId?.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimedId = searchParams.get("openid.claimed_id");
  const mode = searchParams.get("openid.mode");

  if (mode !== "id_res") {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  const steamId = extractSteamId(claimedId || "");

  if (!steamId) {
    return NextResponse.redirect(new URL("/login?error=invalid_steam_id", request.url));
  }

  try {
    let playerData = null;

    if (STEAM_API_KEY) {
      const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      playerData = data.response?.players?.[0] || null;
    }

    const userData = {
      steamId,
      name: playerData?.personaname || `SteamPlayer`,
      avatar: playerData?.avatarfull || null,
      profileUrl: playerData?.profileurl || null,
      country: playerData?.loccountrycode || null,
      online: playerData?.communityvisibilitystate === 3,
    };

    const cookieData = encodeURIComponent(JSON.stringify(userData));
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("cs2pilot_user", cookieData, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=steam_api_error", request.url));
  }
}
