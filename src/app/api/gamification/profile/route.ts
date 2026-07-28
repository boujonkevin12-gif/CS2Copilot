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
      // Sync hours as total_hours for leaderboard
      const cs2Hours = userData.cs2?.hoursPlayed ? Math.round(userData.cs2.hoursPlayed) : 0;
      if (cs2Hours > 0) {
        await syncProfileStats(steamId, { hours: cs2Hours });
      }
    }
  } catch {
    // Cookie sync failed
  }

  // Read previous stats for delta tracking
  const profile = await getOrCreateProfile(steamId);
  const isFirstSync = !profile.stats_baseline;
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
      // On first sync, don't award XP for existing career stats — only future progress
      const deltaKills = Math.max(0, kills - (isFirstSync ? kills : prevKills));
      const deltaHeadshots = Math.max(0, headshots - (isFirstSync ? headshots : prevHeadshots));
      const deltaWins = Math.max(0, wins - (isFirstSync ? wins : prevWins));
      const deltaMVPs = Math.max(0, mvps - (isFirstSync ? mvps : prevMVPs));

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
        const lt = faceitStats.lifetime;
        const elo = faceitPlayer.games?.cs2?.faceit_elo;
        const faceitLevel = faceitPlayer.games?.cs2?.skill_level;

        // Extract numeric lifetime stats (FACEIT keys vary in casing)
        const kv = (key: string): number | undefined => {
          const v = lt[key] ?? lt[key.toLowerCase()] ?? lt[key.toUpperCase()] ?? lt[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()];
          return v !== undefined ? Number(v) : undefined;
        };

        const faceitAces = kv("ACEs");
        const faceitMVPs = kv("MVPs");
        const faceitClutches = kv("Clutches");
        const faceitKD = kv("Average K/D Ratio");
        const faceitHS = kv("Average Headshots %");

        await syncProfileStats(steamId, {
          elo: elo ? Number(elo) : undefined,
          faceitLevel: faceitLevel ? Number(faceitLevel) : undefined,
          aces: faceitAces,
          mvps: faceitMVPs,
          clutches: faceitClutches,
          kd: faceitKD !== undefined ? Number(faceitKD) : undefined,
          hsPct: faceitHS !== undefined ? Number(faceitHS) : undefined,
        });

        // Log actions for challenge/XP progress
        if (faceitAces) {
          const prevAces = profile.total_aces || 0;
          const deltaAces = Math.max(0, faceitAces - (isFirstSync ? faceitAces : prevAces));
          if (deltaAces > 0) await logAction(steamId, "ace", deltaAces);
        }
        if (faceitClutches) {
          const prevClutches = profile.total_clutches || 0;
          const deltaClutches = Math.max(0, faceitClutches - (isFirstSync ? faceitClutches : prevClutches));
          if (deltaClutches > 0) await logAction(steamId, "clutch", deltaClutches);
        }

        // Track match_played and match_won from FACEIT lifetime
        const faceitMatchesRaw = lt["Matches"] ? parseInt(String(lt["Matches"]), 10) : 0;
        const faceitWinsRaw = lt["Wins"] ? parseInt(String(lt["Wins"]), 10) : 0;
        const prevFaceitMatches = profile.last_faceit_matches || 0;
        const prevFaceitWins = profile.last_faceit_wins || 0;
        if (faceitMatchesRaw > 0) {
          const deltaMatches = Math.max(0, faceitMatchesRaw - (isFirstSync ? faceitMatchesRaw : prevFaceitMatches));
          if (deltaMatches > 0) await logAction(steamId, "match_played", deltaMatches);
        }
        if (faceitWinsRaw > 0) {
          const deltaWinsFaceit = Math.max(0, faceitWinsRaw - (isFirstSync ? faceitWinsRaw : prevFaceitWins));
          if (deltaWinsFaceit > 0) await logAction(steamId, "match_won", deltaWinsFaceit);
        }
        if (faceitMatchesRaw > 0 || faceitWinsRaw > 0) {
          await syncProfileStats(steamId, {
            faceitMatches: faceitMatchesRaw,
            faceitWins: faceitWinsRaw,
          });
        }
      }
    }
  } catch {
    // FACEIT sync failed
  }

  await logLogin(steamId);
  const finalProfile = await getOrCreateProfile(steamId);
  return NextResponse.json(finalProfile);
}
