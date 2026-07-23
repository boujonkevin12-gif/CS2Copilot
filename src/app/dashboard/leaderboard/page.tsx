"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { useGamification } from "@/lib/gamification-context";
import { useUser } from "@/lib/user-context";
import { getFrameClasses, getEffectClass, getEmoji } from "@/lib/cosmetics";
import {
  Trophy,
  Zap,
  Target,
  Crosshair,
  Shield,
  Swords,
  Crown,
  Star,
  TrendingUp,
  Clock,
  Medal,
  Globe,
  ChevronDown,
  Users,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface LeaderboardEntry {
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
  streak_days: number;
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
  equipped_frame: string | null;
  equipped_effect: string | null;
  equipped_emoji: string | null;
}

interface UserPosition {
  position: number;
  total: number;
  value: number;
}

const RANK_TABS = [
  { id: "xp", label: "XP Total", icon: Zap, color: "text-primary" },
  { id: "level", label: "Nivel", icon: Medal, color: "text-yellow-400" },
  { id: "hours", label: "Horas CS2", icon: Clock, color: "text-blue-400" },
  { id: "kills", label: "Kills", icon: Crosshair, color: "text-red-400" },
  { id: "wins", label: "Victorias", icon: Trophy, color: "text-green-400" },
  { id: "headshots", label: "Headshots", icon: Target, color: "text-orange-400" },
  { id: "coins", label: "Pilot Coins", icon: Zap, color: "text-accent" },
  { id: "kd", label: "K/D", icon: Swords, color: "text-purple-400" },
  { id: "hs_pct", label: "HS%", icon: Target, color: "text-cyan-400" },
  { id: "mvps", label: "MVPs", icon: Star, color: "text-yellow-400" },
  { id: "elo", label: "FACEIT ELO", icon: Crown, color: "text-amber-400" },
  { id: "premier", label: "Premier", icon: TrendingUp, color: "text-pink-400" },
];

const COUNTRIES: { code: string; label: string; flag: string }[] = [
  { code: "AR", label: "Argentina", flag: "🇦🇷" },
  { code: "BR", label: "Brasil", flag: "🇧🇷" },
  { code: "CL", label: "Chile", flag: "🇨🇱" },
  { code: "CO", label: "Colombia", flag: "🇨🇴" },
  { code: "MX", label: "México", flag: "🇲🇽" },
  { code: "ES", label: "España", flag: "🇪🇸" },
  { code: "US", label: "Estados Unidos", flag: "🇺🇸" },
  { code: "UY", label: "Uruguay", flag: "🇺🇾" },
  { code: "PE", label: "Perú", flag: "🇵🇪" },
  { code: "VE", label: "Venezuela", flag: "🇻🇪" },
];

const VIEW_TABS = [
  { id: "global", label: "Global", icon: Globe },
  { id: "country", label: "País", icon: Medal },
  { id: "friends", label: "Amigos", icon: Users },
];

function getValue(e: LeaderboardEntry, type: string): number {
  const map: Record<string, number> = {
    xp: e.xp,
    level: e.level,
    hours: e.total_hours,
    kills: e.total_kills,
    wins: e.total_wins,
    headshots: e.total_headshots,
    coins: e.pilot_coins,
    kd: e.best_kd * 100,
    hs_pct: e.best_hs_pct * 100,
    mvps: e.total_mvps,
    elo: e.best_elo,
    premier: e.best_premier,
  };
  return map[type] || 0;
}

function formatValue(type: string, val: number): string {
  if (type === "kd") return (val / 100).toFixed(2);
  if (type === "hs_pct") return (val / 100).toFixed(1) + "%";
  if (type === "hours") return val.toLocaleString() + "h";
  return val.toLocaleString();
}

function getRankLabel(type: string): string {
  const map: Record<string, string> = {
    xp: "XP", level: "Nivel", hours: "Horas", kills: "Kills",
    wins: "Victorias", headshots: "Headshots", coins: "Coins",
    kd: "K/D", hs_pct: "HS%", mvps: "MVPs", elo: "ELO", premier: "Premier",
  };
  return map[type] || type;
}

export default function LeaderboardPage() {
  const { profile } = useGamification();
  const { user } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("xp");
  const [activeView, setActiveView] = useState("global");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab, limit: "100" });
      if (activeView === "country" && selectedCountry) {
        params.set("country", selectedCountry);
      }
      const res = await fetch(`/api/gamification/leaderboard?${params}`);
      const data = await res.json();
      setEntries(data.leaderboard || []);
      setUserPosition(data.userPosition || null);
      setTotalPlayers(data.totalPlayers || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeView, selectedCountry]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const rankEmojis = ["", "", ""];
  const rankColors = ["from-yellow-400 to-amber-500", "from-gray-300 to-gray-400", "from-amber-600 to-amber-700"];

  const displayEntries = activeView === "friends"
    ? entries.filter((e) => {
        if (!user?.friends) return false;
        return user.friends.some((f: { steamId: string }) => f.steamId === e.steam_id);
      })
    : entries;

  const currentCountry = COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Rankings</h1>
              <p className="text-sm text-muted">
                {totalPlayers > 0
                  ? `${totalPlayers.toLocaleString()} pilotos registrados`
                  : "Competí con otros pilotos"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Tabs + Country Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 glass rounded-lg p-0.5">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveView(tab.id);
                if (tab.id === "country" && !selectedCountry) setSelectedCountry("AR");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                activeView === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === "country" && (
          <div className="relative">
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-foreground hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              {currentCountry ? `${currentCountry.flag} ${currentCountry.label}` : "Seleccionar país"}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-1 glass-strong rounded-xl border border-white/[0.08] shadow-xl z-50 py-1 min-w-[180px]">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c.code);
                      setShowCountryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[11px] hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-2 ${
                      selectedCountry === c.code ? "text-primary bg-primary/10" : ""
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ranking Category Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {RANK_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-medium cursor-pointer ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white/[0.04] text-muted hover:bg-white/[0.08]"
            }`}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Position Bar */}
      {userPosition && userPosition.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl px-4 py-3 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-xs font-bold text-white">TÚ</span>
              </div>
              <div>
                <div className="text-xs text-muted">Tu posición</div>
                <div className="text-lg font-bold">
                  <span className="text-primary">#{userPosition.position.toLocaleString()}</span>
                  <span className="text-muted text-sm font-normal"> de {userPosition.total.toLocaleString()} jugadores</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">{getRankLabel(activeTab)}</div>
              <div className="text-lg font-bold font-mono text-primary">
                {formatValue(activeTab, userPosition.value)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Cargando rankings...</p>
          </div>
        </div>
      ) : displayEntries.length === 0 ? (
        <GlassCard padding="lg" className="text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted mb-1">
            {activeView === "friends"
              ? "Ningún amigo registrado aún"
              : activeView === "country"
                ? "No hay jugadores de este país"
                : "No hay rankings disponibles"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {activeView === "friends"
              ? "Tus amigos de Steam aparecerán aquí cuando se registren en CS2Pilot"
              : "Los jugadores aparecen aquí al iniciar sesión con Steam"}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {displayEntries.map((entry, i) => {
            const rank = i + 1;
            const val = getValue(entry, activeTab);
            const isMe = entry.steam_id === user?.steamId;
            return (
              <motion.div
                key={entry.steam_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className={`glass-strong rounded-xl px-4 py-3 flex items-center gap-4 transition-all hover:bg-white/[0.04] ${
                  rank <= 3 ? "border border-primary/20" : ""
                } ${isMe ? "ring-1 ring-primary/40 bg-primary/5" : ""}`}
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {rank <= 3 ? (
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${rankColors[rank - 1]} flex items-center justify-center`}>
                      <span className="text-sm font-bold text-white">{rank}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-muted">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    alt={entry.steam_name}
                    className={`h-10 w-10 rounded-full shrink-0 ${getFrameClasses(entry.equipped_frame)}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-primary shrink-0 ${getFrameClasses(entry.equipped_frame)}`}>
                    {entry.steam_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={entry.profile_url || `https://steamcommunity.com/profiles/${entry.steam_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold truncate hover:text-primary transition-colors"
                    >
                      <span className={getEffectClass(entry.equipped_effect)}>{entry.steam_name || "Jugador"}</span>
                      {getEmoji(entry.equipped_emoji) && <span className="ml-1">{getEmoji(entry.equipped_emoji)}</span>}
                    </a>
                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                      Nv. {entry.level}
                    </span>
                    {entry.steam_level > 0 && (
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full shrink-0 hidden sm:inline">
                        Steam {entry.steam_level}
                      </span>
                    )}
                    {entry.streak_days > 1 && (
                      <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                        🔥 {entry.streak_days}
                      </span>
                    )}
                    {entry.country && (
                      <span className="text-[10px] shrink-0 hidden sm:inline">
                        {COUNTRIES.find((c) => c.code === entry.country)?.flag || entry.country}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-muted">{entry.total_hours.toLocaleString()}h jugadas</span>
                    {entry.best_elo > 0 && (
                      <span className="text-[10px] text-muted">ELO {entry.best_elo}</span>
                    )}
                  </div>
                </div>

                {/* Value */}
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold font-mono ${RANK_TABS.find((t) => t.id === activeTab)?.color || ""}`}>
                    {formatValue(activeTab, val)}
                  </div>
                  <div className="text-[10px] text-muted">{getRankLabel(activeTab)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
