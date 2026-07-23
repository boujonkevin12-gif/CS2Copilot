"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import { getFrameClasses, getEffectClass, getEmoji } from "@/lib/cosmetics";
import { CosmeticBackground } from "@/components/cosmetic-background";
import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  Crosshair,
  Swords,
  Star,
  Clock,
  Shield,
  Flame,
  TrendingUp,
  Crown,
  Medal,
  Users,
  UserPlus,
  UserMinus,
  ExternalLink,
  ChevronRight,
  Zap,
  Award,
  MapPin,
  Globe,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Activity,
  Calendar,
} from "lucide-react";

const COUNTRIES: Record<string, { flag: string; name: string }> = {
  AR: { flag: "🇦🇷", name: "Argentina" },
  BR: { flag: "🇧🇷", name: "Brasil" },
  CL: { flag: "🇨🇱", name: "Chile" },
  CO: { flag: "🇨🇴", name: "Colombia" },
  MX: { flag: "🇲🇽", name: "México" },
  ES: { flag: "🇪🇸", name: "España" },
  US: { flag: "🇺🇸", name: "Estados Unidos" },
  UY: { flag: "🇺🇾", name: "Uruguay" },
  PE: { flag: "🇵🇪", name: "Perú" },
  VE: { flag: "🇻🇪", name: "Venezuela" },
  BD: { flag: "🇧🇩", name: "Bangladesh" },
};

const ACTION_LABELS: Record<string, string> = {
  kill: "kills registrados",
  headshot: "headshots",
  match_played: "partidas jugadas",
  match_won: "victorias",
  mvp: "MVPs ganados",
  demo_analyzed: "demos analizadas",
  ace: "aces",
  clutch: "clutches",
  login: "inicio de sesión",
};

const MAP_NAMES: Record<string, string> = {
  de_dust2: "Dust II",
  de_mirage: "Mirage",
  de_inferno: "Inferno",
  de_nuke: "Nuke",
  de_overpass: "Overpass",
  de_ancient: "Ancient",
  de_anubis: "Anubis",
  de_train: "Train",
  de_vertigo: "Vertigo",
  cs_office: "Office",
  cs_italy: "Italy",
  de_aztec: "Aztec",
};

interface PlayerData {
  profile: {
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
    total_login_days: number;
    maps_played: string;
    created_at: string;
    updated_at: string;
  };
  position: number;
  totalPlayers: number;
  achievements: { achievement_id: string; progress: number; unlocked: number; unlocked_at: string | null }[];
  activity: { action: string; value: number; created_at: string }[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <Icon className={`h-4 w-4 ${color} mx-auto mb-1.5`} />
      <div className="text-lg font-bold font-mono">{value}</div>
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
      {sub && <div className="text-[10px] text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function MiniXPChart({ xp }: { xp: number }) {
  const levels = [];
  let remaining = xp;
  for (let i = 1; i <= Math.min(10, Math.floor(Math.sqrt(xp / 100)) + 1); i++) {
    const needed = i * i * 100;
    const prev = (i - 1) * (i - 1) * 100;
    const progress = Math.min(1, Math.max(0, (remaining - prev) / (needed - prev)));
    levels.push({ level: i, progress });
    remaining -= (needed - prev);
  }
  if (levels.length === 0) return null;
  const maxBar = 20;
  return (
    <div className="flex items-end gap-[2px] h-12">
      {levels.slice(-12).map((l) => (
        <div key={l.level} className="flex flex-col items-center gap-0.5">
          <div className="w-3 rounded-sm bg-white/[0.04] overflow-hidden" style={{ height: `${maxBar}px` }}>
            <div
              className="w-full rounded-sm bg-gradient-to-t from-primary to-accent transition-all"
              style={{ height: `${l.progress * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlayerProfilePage({ params }: { params: Promise<{ steamId: string }> }) {
  const { steamId } = use(params);
  const { user } = useUser();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showCompare, setShowCompare] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/player/${steamId}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setFollowing(d.isFollowing);
        setFollowerCount(d.followerCount);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [steamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFollow = async () => {
    try {
      const res = await fetch("/api/player/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: steamId, action: following ? "unfollow" : "follow" }),
      });
      const d = await res.json();
      setFollowing(d.following);
      setFollowerCount(d.followerCount);
    } catch {
      // Error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard padding="lg" className="text-center max-w-md">
          <p className="text-lg font-semibold mb-2">Jugador no encontrado</p>
          <p className="text-sm text-muted mb-4">Este jugador no tiene un perfil en CS2Pilot.</p>
          <Link href="/dashboard/leaderboard" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver al ranking
          </Link>
        </GlassCard>
      </div>
    );
  }

  const p = data.profile;
  const country = p.country ? COUNTRIES[p.country] : null;
  const unlockedAch = data.achievements.filter((a) => a.unlocked);
  const maps = (() => { try { return JSON.parse(p.maps_played || "[]"); } catch { return []; } })();
  const hsPct = p.total_kills > 0 ? Math.round((p.total_headshots / p.total_kills) * 1000) / 10 : 0;
  const kd = p.best_kd;
  const isMe = user?.steamId === steamId;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <CosmeticBackground bgId={p.equipped_background}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.steam_name}
                    className={`h-28 w-28 rounded-2xl border-2 border-white/[0.15] shadow-lg ${getFrameClasses(p.equipped_frame)}`}
                  />
                ) : (
                  <div className={`h-28 w-28 rounded-2xl bg-gradient-to-br from-primary via-cyan-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white ${getFrameClasses(p.equipped_frame)}`}>
                    {p.steam_name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-background text-xs font-bold text-white">
                  {p.level}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3">
                  <h1 className="text-2xl font-bold tracking-tight">
                    <span className={getEffectClass(p.equipped_effect)}>{p.steam_name || "Jugador"}</span>
                    {getEmoji(p.equipped_emoji) && <span className="ml-1 text-xl">{getEmoji(p.equipped_emoji)}</span>}
                  </h1>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {p.current_title && p.current_title !== "Recluta" && (
                      <Badge variant="accent" size="sm">{p.current_title}</Badge>
                    )}
                    {country && <Badge variant="default" size="sm">{country.flag} {country.name}</Badge>}
                    {p.streak_days > 1 && (
                      <Badge variant="default" size="sm">🔥 {p.streak_days} días</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Steam {p.steam_level}</span>
                  <span className="flex items-center gap-1.5"><Medal className="h-3.5 w-3.5" /> Nivel {p.level}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {p.total_login_days || 0} días activo</span>
                  {p.profile_url && (
                    <a href={p.profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> Steam
                    </a>
                  )}
                </div>

                {/* Position */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="glass rounded-xl px-4 py-2">
                    <div className="text-xs text-muted">Posición Global</div>
                    <div className="text-xl font-bold text-primary">#{data.position.toLocaleString()} <span className="text-xs text-muted font-normal">de {data.totalPlayers.toLocaleString()}</span></div>
                  </div>
                  <div className="glass rounded-xl px-4 py-2">
                    <div className="text-xs text-muted">Pilotos Siguiendo</div>
                    <div className="text-xl font-bold">{followerCount}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {!isMe && user && (
                    <button
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        following
                          ? "bg-white/[0.08] text-foreground border border-white/[0.1]"
                          : "bg-primary text-white shadow-lg shadow-primary/20"
                      }`}
                    >
                      {following ? <><UserMinus className="h-4 w-4" /> Siguiendo</> : <><UserPlus className="h-4 w-4" /> Seguir</>}
                    </button>
                  )}
                  {user && !isMe && (
                    <button
                      onClick={() => setShowCompare(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-all cursor-pointer"
                    >
                      <Swords className="h-4 w-4" /> Comparar conmigo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CosmeticBackground>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard icon={Clock} label="Horas CS2" value={p.cs2_hours?.toLocaleString() || p.total_hours?.toLocaleString() || "—"} color="text-blue-400" />
          <StatCard icon={Trophy} label="Victorias" value={p.total_wins?.toLocaleString() || "0"} color="text-green-400" />
          <StatCard icon={Swords} label="K/D" value={kd.toFixed(2)} color="text-purple-400" />
          <StatCard icon={Target} label="HS%" value={`${hsPct}%`} color="text-orange-400" />
          <StatCard icon={Crosshair} label="Kills" value={p.total_kills?.toLocaleString() || "0"} color="text-red-400" />
          <StatCard icon={Star} label="MVPs" value={p.total_mvps?.toLocaleString() || "0"} color="text-yellow-400" />
        </div>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass rounded-xl p-4 text-center">
            <Crown className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono">{p.best_elo || "—"}</div>
            <div className="text-[10px] text-muted">FACEIT ELO</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 text-pink-400 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono">{p.best_premier || "—"}</div>
            <div className="text-[10px] text-muted">Premier</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Shield className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono">{p.total_clutches || 0}</div>
            <div className="text-[10px] text-muted">Clutches</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Flame className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <div className="text-sm font-bold font-mono">{p.total_awp_kills?.toLocaleString() || "0"}</div>
            <div className="text-[10px] text-muted">AWP Kills</div>
          </div>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Progreso XP</h3>
            <span className="text-xs text-muted ml-auto">{p.xp?.toLocaleString() || 0} XP total</span>
          </div>
          <div className="flex items-center gap-4">
            <MiniXPChart xp={p.xp || 0} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted">Nivel {p.level}</span>
                <span className="text-xs text-primary font-medium">{p.pilot_coins?.toLocaleString() || 0} coins</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${Math.min(100, ((p.xp || 0) % ((p.level || 1) * (p.level || 1) * 100)) / ((p.level || 1) * (p.level || 1) * 100) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Achievements */}
      {unlockedAch.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-semibold">Logros</h3>
              <Badge variant="default" size="sm">{unlockedAch.length} desbloqueados</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {unlockedAch.slice(0, 8).map((a) => (
                <div key={a.achievement_id} className="glass rounded-xl p-3 text-center">
                  <div className="text-lg mb-1">🏆</div>
                  <div className="text-[11px] font-medium truncate">{a.achievement_id.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Maps */}
      {maps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold">Mapas Jugados</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {maps.slice(0, 10).map((m: string) => (
                <span key={m} className="glass rounded-lg px-3 py-1.5 text-xs font-medium">
                  {MAP_NAMES[m] || m}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Activity */}
      {data.activity.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-success" />
              <h3 className="text-sm font-semibold">Actividad Reciente</h3>
            </div>
            <div className="space-y-2">
              {data.activity.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-foreground">
                    {a.value > 1 ? `+${a.value} ` : ""}{ACTION_LABELS[a.action] || a.action}
                  </span>
                  <span className="text-muted ml-auto shrink-0">
                    {timeAgo(a.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Compare Modal */}
      {showCompare && user && (
        <CompareModal
          target={p}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

function CompareModal({ target, onClose }: { target: PlayerData["profile"]; onClose: () => void }) {
  const { user } = useUser();
  if (!user) return null;

  const items = [
    { label: "K/D", me: 0, them: target.best_kd },
    { label: "HS%", me: 0, them: target.best_hs_pct },
    { label: "Kills", me: 0, them: target.total_kills || 0 },
    { label: "Wins", me: 0, them: target.total_wins || 0 },
    { label: "MVPs", me: 0, them: target.total_mvps || 0 },
    { label: "FACEIT ELO", me: user.faceitElo || 0, them: target.best_elo || 0 },
    { label: "Horas CS2", me: user.cs2?.hoursPlayed || 0, them: target.cs2_hours || 0 },
    { label: "Nivel", me: user.steamLevel || 0, them: target.steam_level || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-6 w-full max-w-lg border border-white/[0.1]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Swords className="h-5 w-5 text-primary" /> Comparar</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl cursor-pointer">&times;</button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
          <div className="text-muted font-medium">Stat</div>
          <div className="text-primary font-medium">Tú</div>
          <div className="text-accent font-medium">{target.steam_name}</div>
          {items.map((item) => (
            <>
              <div key={item.label + "-label"} className="text-muted py-1.5">{item.label}</div>
              <div key={item.label + "-me"} className={`py-1.5 font-mono font-bold ${item.me >= item.them ? "text-success" : "text-danger"}`}>
                {typeof item.me === "number" ? (item.me % 1 === 0 ? item.me.toLocaleString() : item.me.toFixed(2)) : "—"}
              </div>
              <div key={item.label + "-them"} className={`py-1.5 font-mono font-bold ${item.them >= item.me ? "text-success" : "text-danger"}`}>
                {typeof item.them === "number" ? (item.them % 1 === 0 ? item.them.toLocaleString() : item.them.toFixed(2)) : "—"}
              </div>
            </>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return `Hace ${Math.floor(diff / 86400)}d`;
}
