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
    const profile = await steamService.getFullProfile(steamId);
    const cookieData = encodeURIComponent(JSON.stringify(profile));
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
