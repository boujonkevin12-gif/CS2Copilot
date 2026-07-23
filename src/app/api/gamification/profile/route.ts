import { NextRequest, NextResponse } from "next/server";
import { getOrCreateProfile, syncSteamData, logLogin } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const profile = await getOrCreateProfile(steamId);
  return NextResponse.json(profile);
}

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Sync Steam data from cookie into DB
  try {
    const cookie = request.cookies.get("cs2pilot_user");
    if (cookie) {
      const userData = JSON.parse(cookie.value);
      await getOrCreateProfile(steamId);
      await syncSteamData(steamId, {
        name: userData.name,
        avatar: userData.avatar || undefined,
        profileUrl: userData.profileUrl || undefined,
        country: userData.country || undefined,
        steamLevel: userData.steamLevel || 0,
        cs2Hours: userData.cs2?.hoursPlayed ? Math.round(userData.cs2.hoursPlayed) : 0,
      });
    }
  } catch {
    // Cookie sync failed — profile still works
  }

  await logLogin(steamId);
  const profile = await getOrCreateProfile(steamId);
  return NextResponse.json(profile);
}
