import { NextRequest, NextResponse } from "next/server";
import { getSteamService } from "@/lib/services";

function extractSteamId(claimedId: string): string | null {
  const match = claimedId?.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimedId = searchParams.get("openid.claimed_id");
  const mode = searchParams.get("openid.mode");

  if (mode !== "id_res" || !claimedId) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  const steamId = extractSteamId(claimedId);
  if (!steamId) {
    return NextResponse.redirect(new URL("/login?error=invalid_steam_id", request.url));
  }

  try {
    const steamService = getSteamService();
    const fullProfile = await steamService.getFullProfile(steamId);

    // Store ONLY essential data in cookie (must fit under 4KB)
    const minimalProfile = {
      steamId: fullProfile.steamId,
      name: fullProfile.name,
      avatar: fullProfile.avatar,
      avatarMedium: fullProfile.avatarMedium,
      avatarSmall: fullProfile.avatarSmall,
      profileUrl: fullProfile.profileUrl,
      country: fullProfile.country,
      visibility: fullProfile.visibility,
      lastLogoff: fullProfile.lastLogoff,
      createdAt: fullProfile.createdAt,
      steamLevel: fullProfile.steamLevel,
      steamXp: fullProfile.steamXp,
      steamXpNeeded: fullProfile.steamXpNeeded,
      bans: fullProfile.bans,
      cs2: fullProfile.cs2,
      totalGames: fullProfile.totalGames,
    };

    const cookieValue = JSON.stringify(minimalProfile);
    const isSecure = request.url.startsWith("https://");
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("cs2pilot_user", cookieValue, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[SteamCallback] getFullProfile failed:", err);

    // Fallback: save minimal profile with just the steamId so login still works
    const isSecure = request.url.startsWith("https://");
    const fallbackProfile = {
      steamId,
      name: "Jugador",
      avatar: null,
      avatarMedium: null,
      avatarSmall: null,
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
      country: null,
      visibility: 0,
      lastLogoff: 0,
      createdAt: 0,
      steamLevel: 0,
      steamXp: 0,
      steamXpNeeded: 0,
      bans: {
        communityBanned: false,
        vacBanned: false,
        numberOfVACBans: 0,
        numberOfGameBans: 0,
        daysSinceLastBan: 0,
      },
      cs2: null,
      totalGames: 0,
    };

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("cs2pilot_user", JSON.stringify(fallbackProfile), {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  }
}
