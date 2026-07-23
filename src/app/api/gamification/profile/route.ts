import { NextRequest, NextResponse } from "next/server";
import { getOrCreateProfile, syncSteamData, syncProfileStats, logLogin, logAction } from "@/lib/services/gamification.service";
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

  // Read previous stats for delta tracking
  const profile = await getOrCreateProfile(steamId);
  const prevKills = profile.total_kills || 0;
  const prevHeadshots = profile.total_headshots || 0;
  const prevWins = profile.total_wins || 0;
  const prevMVPs = profile.total_mvps || 0;

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
      const wins = cs2Stats.totalWins || 0;
      const mvps = cs2Stats.totalMVPs || 0;

      await syncProfileStats(steamId, {
        kills,
        headshots,
        mvps,
        kd,
        hsPct,
        awpKills: cs2Stats.totalSniperKills || 0,
        wins,
      });

      // Log deltas for challenges/XP
      const deltaKills = Math.max(0, kills - prevKills);
      const deltaHeadshots = Math.max(0, headshots - prevHeadshots);
      const deltaWins = Math.max(0, wins - prevWins);
      const deltaMVPs = Math.max(0, mvps - prevMVPs);

      if (deltaKills > 0) await logAction(steamId, "kill", deltaKills);
      if (deltaHeadshots > 0) await logAction(steamId, "headshot", deltaHeadshots);
      if (deltaWins > 0) await logAction(steamId, "match_won", deltaWins);
      if (deltaMVPs > 0) await logAction(steamId, "mvp", deltaMVPs);

      // If any new stats, log a match_played
      if (deltaKills > 0 || deltaHeadshots > 0 || deltaWins > 0) {
        await logAction(steamId, "match_played", 1);
      }
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
  const finalProfile = await getOrCreateProfile(steamId);
  return NextResponse.json(finalProfile);
}
