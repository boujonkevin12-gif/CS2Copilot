import { SteamPlayer, SteamGame, SteamFriend, SteamBans, CS2Data } from "./types";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

const CS2_APPID = 730;

class SteamService {
  private apiKey: string;

  constructor() {
    if (!STEAM_API_KEY) {
      throw new Error("STEAM_API_KEY is not set in environment variables");
    }
    this.apiKey = STEAM_API_KEY;
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
      `https://api.steampowered.com/ISteamUser/GetSteamLevel/v1/?key=${this.apiKey}&steamid=${steamId}`
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

  async getFullProfile(steamId: string): Promise<SteamPlayer> {
    const [summary, bans, level, ownedGames, recentGames, friends] = await Promise.all([
      this.getPlayerSummary(steamId),
      this.getPlayerBans(steamId),
      this.getSteamLevel(steamId),
      this.getOwnedGames(steamId),
      this.getRecentlyPlayedGames(steamId),
      this.getFriendsList(steamId),
    ]);

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
