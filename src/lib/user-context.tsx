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
  // These are fetched lazily, not from cookie
  games?: SteamGame[];
  recentGames?: SteamGame[];
  friends?: SteamFriend[];
}

interface UserContextType {
  user: SteamUser | null;
  loading: boolean;
  games: SteamGame[];
  recentGames: SteamGame[];
  friends: SteamFriend[];
  loadingGames: boolean;
  loadingFriends: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  games: [],
  recentGames: [],
  friends: [],
  loadingGames: false,
  loadingFriends: false,
  refresh: async () => {},
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

  useEffect(() => {
    fetchUser().then((u) => {
      if (u) {
        fetchGames();
        fetchRecentGames();
        fetchFriends();
      }
    });
  }, [fetchUser, fetchGames, fetchRecentGames, fetchFriends]);

  return (
    <UserContext.Provider value={{ user, loading, games, recentGames, friends, loadingGames, loadingFriends, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}
