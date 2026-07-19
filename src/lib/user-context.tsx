"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface SteamBans {
  communityBanned: boolean;
  vacBanned: boolean;
  numberOfVACBans: number;
  numberOfGameBans: number;
  daysSinceLastBan: number;
}

interface CS2Data {
  playtimeTotal: number;
  playtime2Weeks: number;
  hoursPlayed: number;
  hoursLast2Weeks: number;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime: number;
  playtime2Weeks: number;
  iconUrl: string;
}

interface SteamFriend {
  steamId: string;
  name: string;
  avatar: string | null;
  relationship: string;
  friendSince: number;
}

interface SteamUser {
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
  games?: SteamGame[];
  recentGames?: SteamGame[];
  friends?: SteamFriend[];
  faceitNickname?: string;
  faceitPlayerId?: string;
  faceitLevel?: number | null;
  faceitElo?: number | null;
}

interface CS2AggregateStats {
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalWins: number;
  totalLosses: number;
  totalMVPs: number;
  totalRoundsPlayed: number;
  totalRoundsWon: number;
  totalHeadshotKills: number;
  totalShotsFired: number;
  totalShotsHit: number;
  totalDominations: number;
  totalRevenges: number;
  totalKnifeKills: number;
  totalGrenadeKills: number;
  totalFlashbangEnemies: number;
  totalSniperKills: number;
  totalRifleKills: number;
  totalSmgKills: number;
  totalShotgunKills: number;
  totalMachinegunKills: number;
  totalPistolKills: number;
  totalHSPct: number;
  totalKD: number;
  totalWinPct: number;
  accuracy: number;
}

interface FaceitMatchData {
  matchId: string;
  map: string;
  mode: string;
  status: string;
  startedAt: number;
  finishedAt: number;
  teams: Record<string, {
    team_id: string;
    name: string;
    players: Array<{
      player_id: string;
      nickname: string;
      avatar: string;
    }>;
  }>;
  stats?: {
    rounds: Array<{
      roundId: string;
      map: string;
      team1: {
        teamId: string;
        name: string;
        score: number;
        result: string;
        players: Array<{
          playerId: string;
          nickname: string;
          kills: number;
          deaths: number;
          assists: number;
          kd: number;
          hsPercent: number;
          headshots: number;
          totalDamage: number;
        }>;
      };
      team2: {
        teamId: string;
        name: string;
        score: number;
        result: string;
        players: Array<{
          playerId: string;
          nickname: string;
          kills: number;
          deaths: number;
          assists: number;
          kd: number;
          hsPercent: number;
          headshots: number;
          totalDamage: number;
        }>;
      };
    }>;
  };
}

interface FaceitLifetimeStats {
  player_id: string;
  lifetime: {
    Matches: string;
    "Win Rate %": string;
    "Average K/D Ratio": string;
    "Average Headshots %": string;
    "Average K/R Ratio": string;
    Kills: string;
    Deaths: string;
    Assists: string;
    Headshots: string;
    "Ace Rounds": string;
    "Quadro Kills": string;
    "Triple Kills": string;
    "Double Kills": string;
    MVPs: string;
    "Average Damage per Round": string;
    "Clutches Won": string;
    "Total Damage Dealt": string;
    "Average KAST": string;
    Rating: string;
  };
  segments: Array<{
    type: string;
    label: string;
    map_name: string;
    mode: string;
    wins: string;
    matches: string;
    "Win Rate %": string;
    "Average K/D Ratio": string;
    "Average Headshots %": string;
    Kills: string;
    Deaths: string;
    Assists: string;
    Headshots: string;
  }>;
}

interface UserContextType {
  user: SteamUser | null;
  loading: boolean;
  games: SteamGame[];
  recentGames: SteamGame[];
  friends: SteamFriend[];
  cs2Stats: CS2AggregateStats | null;
  loadingGames: boolean;
  loadingFriends: boolean;
  faceitMatches: FaceitMatchData[];
  faceitStats: FaceitLifetimeStats | null;
  loadingFaceitMatches: boolean;
  refresh: () => Promise<void>;
  connectFaceit: (nickname: string) => Promise<{ success: boolean; error?: string }>;
  autoLinkFaceit: () => Promise<{ success: boolean; error?: string; faceit?: { nickname: string; level: number | null; elo: number | null } }>;
  disconnectFaceit: () => Promise<void>;
  syncFaceitMatches: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  games: [],
  recentGames: [],
  friends: [],
  cs2Stats: null,
  loadingGames: false,
  loadingFriends: false,
  faceitMatches: [],
  faceitStats: null,
  loadingFaceitMatches: false,
  refresh: async () => {},
  connectFaceit: async () => ({ success: false }),
  autoLinkFaceit: async () => ({ success: false }),
  disconnectFaceit: async () => {},
  syncFaceitMatches: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<SteamGame[]>([]);
  const [recentGames, setRecentGames] = useState<SteamGame[]>([]);
  const [friends, setFriends] = useState<SteamFriend[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [cs2Stats, setCs2Stats] = useState<CS2AggregateStats | null>(null);
  const [faceitMatches, setFaceitMatches] = useState<FaceitMatchData[]>([]);
  const [faceitStats, setFaceitStats] = useState<FaceitLifetimeStats | null>(null);
  const [loadingFaceitMatches, setLoadingFaceitMatches] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGames = useCallback(async () => {
    setLoadingGames(true);
    try {
      const res = await fetch("/api/steam/games");
      const data = await res.json();
      setGames(data.games || []);
    } catch {
      setGames([]);
    } finally {
      setLoadingGames(false);
    }
  }, []);

  const fetchRecentGames = useCallback(async () => {
    try {
      const res = await fetch("/api/steam/recent");
      const data = await res.json();
      setRecentGames(data.games || []);
    } catch {
      setRecentGames([]);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch("/api/steam/friends");
      const data = await res.json();
      setFriends(data.friends || []);
    } catch {
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  const fetchCs2Stats = useCallback(async () => {
    try {
      const res = await fetch("/api/steam/cs2stats");
      const data = await res.json();
      setCs2Stats(data.stats || null);
    } catch {
      setCs2Stats(null);
    }
  }, []);

  const fetchFaceitStats = useCallback(async () => {
    try {
      const res = await fetch("/api/faceit/sync");
      const data = await res.json();
      if (data.connected && data.stats) {
        setFaceitStats(data.stats);
      }
    } catch {
      setFaceitStats(null);
    }
  }, []);

  const fetchFaceitMatches = useCallback(async (overridePlayerId?: string) => {
    setLoadingFaceitMatches(true);
    try {
      const playerId = overridePlayerId || user?.faceitPlayerId;
      if (!playerId) {
        setFaceitMatches([]);
        return;
      }
      const res = await fetch("/api/faceit/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      setFaceitMatches(data.matches || []);
    } catch {
      setFaceitMatches([]);
    } finally {
      setLoadingFaceitMatches(false);
    }
  }, [user?.faceitPlayerId]);

  const connectFaceit = useCallback(async (nickname: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/faceit/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect-by-nickname", nickname }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => prev ? {
          ...prev,
          faceitNickname: data.faceit.nickname,
          faceitPlayerId: data.faceit.playerId,
          faceitLevel: data.faceit.level,
          faceitElo: data.faceit.elo,
        } : null);
        return { success: true };
      }
      return { success: false, error: data.error || "Error desconocido" };
    } catch {
      return { success: false, error: "Error de conexion" };
    }
  }, []);

  const autoLinkFaceit = useCallback(async (): Promise<{ success: boolean; error?: string; faceit?: { nickname: string; level: number | null; elo: number | null } }> => {
    try {
      const res = await fetch("/api/faceit/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "autolink" }),
      });
      const data = await res.json();
      if (data.success && data.linked) {
        setUser((prev) => prev ? {
          ...prev,
          faceitNickname: data.faceit.nickname,
          faceitPlayerId: data.faceit.playerId,
          faceitLevel: data.faceit.level,
          faceitElo: data.faceit.elo,
        } : null);
        return { success: true, faceit: data.faceit };
      }
      return { success: false, error: data.error || "No se encontro cuenta de FACEIT" };
    } catch {
      return { success: false, error: "Error de conexion" };
    }
  }, []);

  const disconnectFaceit = useCallback(async () => {
    try {
      await fetch("/api/faceit/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      setUser((prev) => prev ? {
        ...prev,
        faceitNickname: undefined,
        faceitPlayerId: undefined,
        faceitLevel: undefined,
        faceitElo: undefined,
      } : null);
      setFaceitMatches([]);
      setFaceitStats(null);
    } catch {
      // ignore
    }
  }, []);

  const syncFaceitMatches = useCallback(async () => {
    const playerId = user?.faceitPlayerId;
    if (!playerId) return;
    await fetchFaceitMatches(playerId);
    await fetchFaceitStats();
  }, [user?.faceitPlayerId, fetchFaceitMatches, fetchFaceitStats]);

  useEffect(() => {
    fetchUser().then((u) => {
      if (u) {
        fetchGames();
        fetchRecentGames();
        fetchFriends();
        fetchCs2Stats();
        if (u.faceitPlayerId) {
          fetchFaceitMatches(u.faceitPlayerId);
          fetchFaceitStats();
        }
      }
    });
  }, [fetchUser, fetchGames, fetchRecentGames, fetchFriends, fetchCs2Stats, fetchFaceitMatches, fetchFaceitStats]);

  return (
    <UserContext.Provider value={{
      user, loading, games, recentGames, friends, cs2Stats,
      loadingGames, loadingFriends,
      faceitMatches, faceitStats, loadingFaceitMatches,
      refresh: fetchUser,
      connectFaceit, autoLinkFaceit, disconnectFaceit, syncFaceitMatches,
    }}>
      {children}
    </UserContext.Provider>
  );
}
