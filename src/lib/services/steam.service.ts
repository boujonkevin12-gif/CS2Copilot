import { SteamPlayer, SteamGame, SteamFriend, SteamBans, CS2Data, CS2AggregateStats } from "./types";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

const CS2_APPID = 730;

class SteamService {
  private apiKey: string;

  constructor() {
    this.apiKey = STEAM_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[SteamService] STEAM_API_KEY is not set — Steam API calls will fail");
    }
  }

  private async fetch<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getPlayerSummary(steamId: string) {
    const data = await this.fetch<{ response: { players: Record<string, unknown>[] } }>(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${this.apiKey}&steamids=${steamId}`
    );
    return data?.response?.players?.[0] || null;
  }

  async getPlayerBans(steamId: string): Promise<SteamBans> {
    const data = await this.fetch<{ players: Record<string, unknown>[] }>(
      `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.apiKey}&steamids=${steamId}`
    );
    const bans = data?.players?.[0];
    if (!bans) {
      return {
        communityBanned: false,
        vacBanned: false,
        numberOfVACBans: 0,
        numberOfGameBans: 0,
        daysSinceLastBan: 0,
      };
    }
    return {
      communityBanned: Boolean(bans.CommunityBanned),
      vacBanned: Boolean(bans.VACBanned),
      numberOfVACBans: Number(bans.NumberOfVACBans) || 0,
      numberOfGameBans: Number(bans.NumberOfGameBans) || 0,
      daysSinceLastBan: Number(bans.DaysSinceLastBan) || 0,
    };
  }

  async getSteamLevel(steamId: string) {
    const data = await this.fetch<{ response: { player_level: number; player_xp: number; player_xp_needed: number } }>(
      `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${this.apiKey}&steamid=${steamId}`
    );
    return data?.response || { player_level: 0, player_xp: 0, player_xp_needed: 0 };
  }

  async getOwnedGames(steamId: string): Promise<SteamGame[]> {
    const data = await this.fetch<{ response: { games: Record<string, unknown>[] } }>(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`
    );
    const games = data?.response?.games || [];
    return games.map((g) => ({
      appid: Number(g.appid) || 0,
      name: String(g.name) || "Juego desconocido",
      playtime: Number(g.playtime_forever) || 0,
      playtime2Weeks: Number(g.playtime_2weeks) || 0,
      iconUrl: String(g.img_icon_url) || "",
    }));
  }

  async getRecentlyPlayedGames(steamId: string): Promise<SteamGame[]> {
    const data = await this.fetch<{ response: { games: Record<string, unknown>[] } }>(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${this.apiKey}&steamid=${steamId}&count=10`
    );
    const games = data?.response?.games || [];
    return games.map((g) => ({
      appid: Number(g.appid) || 0,
      name: String(g.name) || "Juego desconocido",
      playtime: Number(g.playtime_forever) || 0,
      playtime2Weeks: Number(g.playtime_2weeks) || 0,
      iconUrl: String(g.img_icon_url) || "",
    }));
  }

  async getFriendsList(steamId: string): Promise<SteamFriend[]> {
    const data = await this.fetch<{ friendslist: { friends: Record<string, unknown>[] } }>(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${this.apiKey}&steamid=${steamId}`
    );
    const friends = data?.friendslist?.friends || [];

    if (friends.length === 0) return [];

    const friendIds = friends.map((f) => String(f.steamid)).join(",");
    const summariesData = await this.fetch<{ response: { players: Record<string, unknown>[] } }>(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${this.apiKey}&steamids=${friendIds}`
    );
    const summaries = summariesData?.response?.players || [];
    const summaryMap = new Map(summaries.map((s) => [String(s.steamid), s]));

    return friends.map((f) => {
      const summary = summaryMap.get(String(f.steamid));
      return {
        steamId: String(f.steamid),
        name: summary ? String(summary.personaname) : "Desconocido",
        avatar: summary ? String(summary.avatarfull) : null,
        relationship: String(f.relationship) || "friend",
        friendSince: Number(f.friend_since) || 0,
      };
    });
  }

  async getUserStatsForGame(steamId: string, appId: number = CS2_APPID): Promise<CS2AggregateStats | null> {
    const data = await this.fetch<{ playerstats: { stats: { name: string; value: number }[] } }>(
      `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${this.apiKey}&steamid=${steamId}&appid=${appId}`
    );
    const rawStats = data?.playerstats?.stats;
    if (!rawStats || rawStats.length === 0) return null;

    const stats = new Map(rawStats.map((s) => [s.name, s.value]));

    const kills = stats.get("total_kills") || 0;
    const deaths = stats.get("total_deaths") || 0;
    const wins = stats.get("total_wins") || 0;
    const headshots = stats.get("total_headshot_kills") || 0;
    const roundsPlayed = stats.get("total_rounds_played") || 0;
    const roundsWon = stats.get("total_rounds_won") || 0;
    const shotsFired = stats.get("total_shots_fired") || 0;
    const shotsHit = stats.get("total_shots_hit") || 0;
    const matchesPlayed = stats.get("total_matches_played") || 0;
    const matchesWon = stats.get("total_matches_won") || wins;

    const rifleKills = (stats.get("total_kills_ak47") || 0)
      + (stats.get("total_kills_m4a1") || 0)
      + (stats.get("total_kills_m4a4") || 0)
      + (stats.get("total_kills_famas") || 0)
      + (stats.get("total_kills_galilar") || 0)
      + (stats.get("total_kills_aug") || 0)
      + (stats.get("total_kills_sg556") || 0);

    const sniperKills = (stats.get("total_kills_awp") || 0)
      + (stats.get("total_kills_ssg08") || 0)
      + (stats.get("total_kills_scar20") || 0)
      + (stats.get("total_kills_g3sg1") || 0);

    const smgKills = (stats.get("total_kills_mp9") || 0)
      + (stats.get("total_kills_mac10") || 0)
      + (stats.get("total_kills_mp7") || 0)
      + (stats.get("total_kills_ump45") || 0)
      + (stats.get("total_kills_p90") || 0)
      + (stats.get("total_kills_bizon") || 0)
      + (stats.get("total_kills_mp5sd") || 0);

    const shotgunKills = (stats.get("total_kills_nova") || 0)
      + (stats.get("total_kills_xm1014") || 0)
      + (stats.get("total_kills_mag7") || 0)
      + (stats.get("total_kills_sawedoff") || 0);

    const pistolKills = (stats.get("total_kills_glock") || 0)
      + (stats.get("total_kills_usp") || 0)
      + (stats.get("total_kills_p250") || 0)
      + (stats.get("total_kills_fiveseven") || 0)
      + (stats.get("total_kills_deagle") || 0)
      + (stats.get("total_kills_tec9") || 0)
      + (stats.get("total_kills_cz75") || 0)
      + (stats.get("total_kills_hkp2000") || 0)
      + (stats.get("total_kills_elite") || 0);

    const mgKills = (stats.get("total_kills_negev") || 0)
      + (stats.get("total_kills_m249") || 0);

    return {
      totalKills: kills,
      totalDeaths: deaths,
      totalAssists: stats.get("total_assists") || 0,
      totalWins: matchesPlayed > 0 ? matchesWon : wins,
      totalLosses: matchesPlayed > 0 ? Math.max(0, matchesPlayed - matchesWon) : 0,
      totalMVPs: stats.get("total_mvps") || 0,
      totalRoundsPlayed: roundsPlayed,
      totalRoundsWon: roundsWon,
      totalHeadshotKills: headshots,
      totalShotsFired: shotsFired,
      totalShotsHit: shotsHit,
      totalDominations: stats.get("total_dominations") || 0,
      totalRevenges: stats.get("total_revenges") || 0,
      totalKnifeKills: stats.get("total_kills_knife") || 0,
      totalGrenadeKills: stats.get("total_kills_hegrenade") || 0,
      totalFlashbangEnemies: stats.get("total_flashbang Enemies") || stats.get("total_enemies_flashed") || 0,
      totalSniperKills: sniperKills,
      totalRifleKills: rifleKills,
      totalSmgKills: smgKills,
      totalShotgunKills: shotgunKills,
      totalMachinegunKills: mgKills,
      totalPistolKills: pistolKills,
      totalHSPct: kills > 0 ? Math.round((headshots / kills) * 1000) / 10 : 0,
      totalKD: deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills,
      totalWinPct: matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 1000) / 10 : (roundsPlayed > 0 ? Math.round((roundsWon / roundsPlayed) * 1000) / 10 : 0),
      accuracy: shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 1000) / 10 : 0,
    };
  }

  async getFullProfile(steamId: string): Promise<SteamPlayer> {
    const results = await Promise.allSettled([
      this.getPlayerSummary(steamId),
      this.getPlayerBans(steamId),
      this.getSteamLevel(steamId),
      this.getOwnedGames(steamId),
      this.getRecentlyPlayedGames(steamId),
      this.getFriendsList(steamId),
    ]);

    const pick = <T>(r: PromiseSettledResult<T>, fallback: T): T =>
      r.status === "fulfilled" ? r.value : fallback;

    const summary = pick(results[0], null);
    const bans = pick(results[1], {
      communityBanned: false, vacBanned: false, numberOfVACBans: 0,
      numberOfGameBans: 0, daysSinceLastBan: 0,
    });
    const level = pick(results[2], { player_level: 0, player_xp: 0, player_xp_needed: 0 });
    const ownedGames = pick(results[3], []);
    const recentGames = pick(results[4], []);
    const friends = pick(results[5], []);

    const cs2Game = ownedGames.find((g) => g.appid === CS2_APPID);

    const cs2: CS2Data | null = cs2Game
      ? {
          playtimeTotal: cs2Game.playtime,
          playtime2Weeks: cs2Game.playtime2Weeks,
          hoursPlayed: Math.round(cs2Game.playtime / 60),
          hoursLast2Weeks: Math.round(cs2Game.playtime2Weeks / 60),
        }
      : null;

    return {
      steamId,
      name: summary ? String(summary.personaname) : "Jugador",
      avatar: summary ? String(summary.avatarfull) : null,
      avatarMedium: summary ? String(summary.avatarmedium) : null,
      avatarSmall: summary ? String(summary.avatar) : null,
      profileUrl: summary ? String(summary.profileurl) : null,
      country: summary ? String(summary.loccountrycode) || null : null,
      visibility: summary ? Number(summary.communityvisibilitystate) : 0,
      lastLogoff: summary ? Number(summary.lastlogoff) : 0,
      createdAt: summary ? Number(summary.timecreated) : 0,
      steamLevel: level.player_level,
      steamXp: level.player_xp,
      steamXpNeeded: level.player_xp_needed,
      bans,
      cs2,
      totalGames: ownedGames.length,
      recentGames,
      friends,
    };
  }
}

let steamServiceInstance: SteamService | null = null;

export function getSteamService(): SteamService {
  if (!steamServiceInstance) {
    steamServiceInstance = new SteamService();
  }
  return steamServiceInstance;
}
