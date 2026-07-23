"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useUser } from "@/lib/user-context";

interface GamificationProfile {
  steam_id: string;
  steam_name: string;
  avatar_url: string | null;
  profile_url: string | null;
  country: string | null;
  steam_level: number;
  cs2_hours: number;
  xp: number;
  level: number;
  pilot_coins: number;
  current_title: string;
  equipped_frame: string | null;
  equipped_background: string | null;
  equipped_effect: string | null;
  equipped_emoji: string | null;
  equipped_color: string | null;
  streak_days: number;
  last_login_date: string | null;
  daily_login_day: number;
  last_daily_claim: string | null;
  total_login_days: number;
  total_wins: number;
  total_kills: number;
  total_headshots: number;
  total_mvps: number;
  total_hours: number;
  best_kd: number;
  best_hs_pct: number;
  best_elo: number;
  best_faceit_level: number;
  best_premier: number;
  total_clutches: number;
  total_aces: number;
  total_awp_kills: number;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  target: number;
  stat: string;
  xp: number;
  coins: number;
  rarity: string;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Challenge {
  id: string;
  name: string;
  difficulty?: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  xp: number;
  coins: number;
  badge?: boolean;
}

interface DailyChestStatus {
  total: number;
  completed: number;
  allDone: boolean;
  claimed: boolean;
}

interface DailyLoginStatus {
  currentDay: number;
  claimedToday: boolean;
  rewards: Array<{ day: number; type: string; amount: number; label: string; icon: string }>;
  currentReward: { day: number; type: string; amount: number; label: string; icon: string };
  streak: number;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: number;
  created_at: string;
}

interface GamificationContextType {
  profile: GamificationProfile | null;
  achievements: Achievement[];
  dailyChallenges: Challenge[];
  weeklyMissions: Challenge[];
  dailyChest: DailyChestStatus | null;
  dailyLogin: DailyLoginStatus | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshChallenges: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshDailyLogin: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Challenge[]>([]);
  const [dailyChest, setDailyChest] = useState<DailyChestStatus | null>(null);
  const [dailyLogin, setDailyLogin] = useState<DailyLoginStatus | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/gamification/profile");
      if (res.ok) setProfile(await res.json());
    } catch {}
  }, [user]);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/gamification/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch {}
  }, [user]);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/gamification/challenges");
      if (res.ok) {
        const data = await res.json();
        setDailyChallenges(data.daily || []);
        setWeeklyMissions(data.weekly || []);
        setDailyChest(data.chest || null);
      }
    } catch {}
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/gamification/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, [user]);

  const fetchDailyLogin = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/gamification/daily-login");
      if (res.ok) setDailyLogin(await res.json());
    } catch {}
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchAchievements(),
      fetchChallenges(),
      fetchNotifications(),
      fetchDailyLogin(),
    ]);
    setLoading(false);
  }, [fetchProfile, fetchAchievements, fetchChallenges, fetchNotifications, fetchDailyLogin]);

  useEffect(() => {
    if (user) {
      fetch("/api/gamification/profile", { method: "POST" }).then(() => refresh());
    }
  }, [user]);

  return (
    <GamificationContext.Provider
      value={{
        profile,
        achievements,
        dailyChallenges,
        weeklyMissions,
        dailyChest,
        dailyLogin,
        notifications,
        unreadCount,
        loading,
        refresh,
        refreshProfile: fetchProfile,
        refreshChallenges: fetchChallenges,
        refreshNotifications: fetchNotifications,
        refreshDailyLogin: fetchDailyLogin,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}
