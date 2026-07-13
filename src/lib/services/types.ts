export interface SteamPlayer {
  steamId: string;
  name: string;
  avatar: string | null;
  avatarMedium: string | null;
  avatarSmall: string | null;
  profileUrl: string | null;
  country: string | null;
  visibility: number;
  lastLogoff: number;
  createdAt: number;
  steamLevel: number;
  steamXp: number;
  steamXpNeeded: number;
  bans: SteamBans;
  cs2: CS2Data | null;
  totalGames: number;
  recentGames: SteamGame[];
  friends: SteamFriend[];
}

export interface SteamBans {
  communityBanned: boolean;
  vacBanned: boolean;
  numberOfVACBans: number;
  numberOfGameBans: number;
  daysSinceLastBan: number;
}

export interface CS2Data {
  playtimeTotal: number;
  playtime2Weeks: number;
  hoursPlayed: number;
  hoursLast2Weeks: number;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime: number;
  playtime2Weeks: number;
  iconUrl: string;
}

export interface SteamFriend {
  steamId: string;
  name: string;
  avatar: string | null;
  relationship: string;
  friendSince: number;
}

export interface ServiceProvider {
  name: string;
  isAvailable: boolean;
  isConnected: boolean;
}

export interface FaceitData extends ServiceProvider {
  level: number | null;
  elo: number | null;
  stats: Record<string, unknown> | null;
}

export interface LeetifyData extends ServiceProvider {
  rating: number | null;
  stats: Record<string, unknown> | null;
}

export interface CsstatsData extends ServiceProvider {
  stats: Record<string, unknown> | null;
}

export interface HltvData extends ServiceProvider {
  stats: Record<string, unknown> | null;
}

export interface ScopeggData extends ServiceProvider {
  stats: Record<string, unknown> | null;
}
