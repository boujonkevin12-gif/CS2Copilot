import { NextRequest, NextResponse } from "next/server";
import { getOrCreateProfile, syncSteamData, syncProfileStats, logLogin } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";
import { getSteamService } from "@/lib/services";
import { getFaceitService } from "@/lib/services/faceit.service";

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
    // Cookie sync failed
  }

  // Sync CS2 stats from Steam API into DB
  try {
    const steamService = getSteamService();
    const cs2Stats = await steamService.getUserStatsForGame(steamId);
    if (cs2Stats) {
      const headshots = cs2Stats.totalHeadshotKills || 0;
      const kills = cs2Stats.totalKills || 0;
      const hsPct = kills > 0 ? Math.round((headshots / kills) * 1000) / 10 : 0;
      const deaths = cs2Stats.totalDeaths || 0;
      const kd = deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : 0;

      await syncProfileStats(steamId, {
        kills,
        headshots,
        mvps: cs2Stats.totalMVPs || 0,
        hours: Math.round((cs2Stats.totalKills || 0) > 0 ? 0 : 0),
        kd,
        hsPct,
        awpKills: cs2Stats.totalSniperKills || 0,
      });
    }
  } catch {
    // CS2 stats sync failed
  }

  // Sync FACEIT stats from FACEIT API into DB
  try {
    const faceit = getFaceitService();
    const faceitPlayer = await faceit.getPlayerBySteamId(steamId);
    if (faceitPlayer?.player_id) {
      const faceitStats = await faceit.getPlayerStats(faceitPlayer.player_id);
      if (faceitStats?.lifetime) {
        const lt = faceitStats.lifetime;
        const elo = faceitPlayer.games?.cs2?.faceit_elo;
        const faceitLevel = faceitPlayer.games?.cs2?.skill_level;

        await syncProfileStats(steamId, {
          elo: elo ? Number(elo) : undefined,
          faceitLevel: faceitLevel ? Number(faceitLevel) : undefined,
        });
      }
    }
  } catch {
    // FACEIT sync failed
  }

  await logLogin(steamId);
  const profile = await getOrCreateProfile(steamId);
  return NextResponse.json(profile);
}
