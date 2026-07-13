"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  recentGames: SteamGame[];
  friends: SteamFriend[];
}

interface UserContextType {
  user: SteamUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}
