"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import { useRef, useState, useEffect, useMemo, ReactNode } from "react";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Crosshair,
  Shield,
  Star,
  Crown,
  Clock,
  AlertTriangle,
  Swords,
  Award,
  Flame,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Zap,
  Lock,
  Timer,
  Coins,
  ShoppingCart,
} from "lucide-react";
import { useGamification } from "@/lib/gamification-context";
import { getFrameClasses, getBackgroundStyle, getEffectClass, getEmoji } from "@/lib/cosmetics";
import Link from "next/link";

function AnimatedNumber({ value, suffix = "", prefix = "", decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || display !== 0) return;
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value, display]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display)}{suffix}
    </span>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, sub, delay }: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: ReactNode;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard padding="md">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs text-muted">{label}</div>
          <div className="h-9 w-9 rounded-full flex items-center justify-center ring-1 shrink-0" style={{ backgroundColor: `${iconColor}15`, boxShadow: `inset 0 0 0 1px ${iconColor}30` }}>
            <Icon className="h-4 w-4" style={{ color: iconColor }} />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {sub && <div className="text-[11px] mt-1" style={{ color: iconColor }}>{sub}</div>}
      </GlassCard>
    </motion.div>
  );
}

function NoData({ label }: { label: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl font-bold font-mono text-muted">—</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">No disponible</div>
    </div>
  );
}

const MAP_ICONS: Record<string, string> = {
  de_dust2: "Dust II",
  de_mirage: "Mirage",
  de_inferno: "Inferno",
  de_nuke: "Nuke",
  de_overpass: "Overpass",
  de_ancient: "Ancient",
  de_anubis: "Anubis",
  de_train: "Train",
  de_vertigo: "Vertigo",
  cs_italy: "Italy",
  cs_office: "Office",
  de_aztec: "Aztec",
};

function normalizeMapName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [key, val] of Object.entries(MAP_ICONS)) {
    if (lower === key || lower.includes(key)) return val;
  }
  if (lower.includes("dust")) return "Dust II";
  if (lower.includes("mirage")) return "Mirage";
  if (lower.includes("inferno")) return "Inferno";
  if (lower.includes("nuke")) return "Nuke";
  if (lower.includes("overpass")) return "Overpass";
  if (lower.includes("ancient")) return "Ancient";
  if (lower.includes("anubis")) return "Anubis";
  if (lower.includes("train")) return "Train";
  if (lower.includes("vertigo")) return "Vertigo";
  return raw || "Desconocido";
}

function MiniChart({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="mt-2">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points.join(" ")} opacity="0.6" />
    </svg>
  );
}

function GamificationWidgets() {
  const { profile, achievements, dailyChallenges, weeklyMissions, unreadCount, loading } = useGamification();

  if (loading || !profile) return null;

  const unlockedAchievements = achievements.filter((a) => a.unlocked).slice(0, 3);
  const activeChallenges = dailyChallenges.filter((c) => !c.completed && !c.claimed).slice(0, 3);

  const currentLevelXP = (profile.level - 1) * (profile.level - 1) * 100;
  const nextLevelXP = profile.level * profile.level * 100;
  const progressXP = profile.xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const pct = Math.min(100, (progressXP / neededXP) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
      <GlassCard padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tu Progreso</h3>
            <p className="text-xs text-muted">Nivel {profile.level} · {profile.current_title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-2 py-1 rounded-lg">
              <span>🪙</span>
              <span className="font-bold">{profile.pilot_coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-1 rounded-lg">
              <Flame className="h-3 w-3" />
              <span className="font-bold">{profile.streak_days} días</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted">Nivel {profile.level}</span>
            <span className="text-[10px] text-primary font-medium">{progressXP} / {neededXP} XP</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {unlockedAchievements.length > 0 && (
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-muted">Últimos Logros</span>
              </div>
              {unlockedAchievements.map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="text-xs truncate">{a.name}</span>
                </div>
              ))}
              <Link href="/dashboard/achievements" className="text-[10px] text-primary hover:underline mt-1 block">
                Ver todos →
              </Link>
            </div>
          )}

          {activeChallenges.length > 0 && (
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="h-3.5 w-3.5 text-accent" />
                <span className="text-[10px] font-semibold text-muted">Desafíos Activos</span>
              </div>
              {activeChallenges.map((c) => {
                const pctC = c.target > 0 ? (c.progress / c.target) * 100 : 0;
                return (
                  <div key={c.id} className="py-1">
                    <div className="text-xs truncate mb-0.5">{c.name}</div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pctC}%` }} />
                    </div>
                  </div>
                );
              })}
              <Link href="/dashboard/challenges" className="text-[10px] text-primary hover:underline mt-1 block">
                Ver todos →
              </Link>
            </div>
          )}

          {activeChallenges.length === 0 && unlockedAchievements.length === 0 && (
            <div className="glass rounded-xl p-3 sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-3.5 w-3.5 text-muted" />
                <span className="text-[10px] font-semibold text-muted">Explora la Gamificación</span>
              </div>
              <p className="text-xs text-muted">Juega partidas para ganar XP, desbloquear logros y completar desafíos.</p>
              <Link href="/dashboard/shop" className="text-[10px] text-primary hover:underline mt-1 block">
                Ir a la Tienda →
              </Link>
            </div>
          )}

          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-muted">Estadísticas</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Logros</span>
                <span className="font-bold">{achievements.filter((a) => a.unlocked).length} / {achievements.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Días jugados</span>
                <span className="font-bold">{profile.total_login_days}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Racha</span>
                <span className="font-bold text-primary">{profile.streak_days} días</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function DashboardOverview() {
  const { user, loading, friends, recentGames, cs2Stats, faceitStats, faceitMatches } = useUser();
  const { profile } = useGamification();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard padding="lg" className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Conecta tu Steam</h2>
          <p className="text-sm text-muted mb-4">Inicia sesion con Steam para ver tus estadisticas reales.</p>
          <a href="/login" className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/[0.06] transition-all">
            Conectar con Steam
          </a>
        </GlassCard>
      </div>
    );
  }

  const initials = user.name?.slice(0, 2).toUpperCase() || "??";
  const cs2Hours = user.cs2?.hoursPlayed ?? null;
  const lastLogoffDate = user.lastLogoff ? new Date(user.lastLogoff * 1000).toLocaleString("es-AR") : null;

  const winRate = faceitStats?.lifetime?.["Win Rate %"]
    ? `${faceitStats.lifetime["Win Rate %"]}`
    : cs2Stats
      ? `${cs2Stats.totalWinPct}`
      : null;

  const kd = cs2Stats?.totalKD ?? null;
  const hsPct = cs2Stats?.totalHSPct ?? null;
  const accuracy = cs2Stats?.accuracy ?? null;

  const mapSegments = useMemo(() => {
    if (!faceitStats?.segments) return [];
    return faceitStats.segments
      .filter((s) => s.type === "Map" && s.map_name)
      .sort((a, b) => (parseInt(b.matches) || 0) - (parseInt(a.matches) || 0))
      .slice(0, 8);
  }, [faceitStats]);

  const weaponData = useMemo(() => {
    if (!cs2Stats) return [];
    const total = cs2Stats.totalKills || 1;
    const weapons = [
      { name: "Rifles", kills: cs2Stats.totalRifleKills, color: "#3b82f6" },
      { name: "Snipers", kills: cs2Stats.totalSniperKills, color: "#f97316" },
      { name: "SMGs", kills: cs2Stats.totalSmgKills, color: "#22c55e" },
      { name: "Pistols", kills: cs2Stats.totalPistolKills, color: "#a855f7" },
      { name: "Shotguns", kills: cs2Stats.totalShotgunKills, color: "#ef4444" },
      { name: "MGs", kills: cs2Stats.totalMachinegunKills, color: "#eab308" },
      { name: "Knives", kills: cs2Stats.totalKnifeKills, color: "#06b6d4" },
      { name: "Grenades", kills: cs2Stats.totalGrenadeKills, color: "#f43f5e" },
    ].filter((w) => w.kills > 0)
      .sort((a, b) => b.kills - a.kills);
    return weapons.map((w) => ({ ...w, pct: Math.round((w.kills / total) * 100) }));
  }, [cs2Stats]);

  const matchHistory = useMemo(() => {
    if (!faceitMatches || faceitMatches.length === 0) return [];
    return faceitMatches
      .filter((m) => m.playerStats && m.startedAt)
      .map((m) => {
        const kills = parseInt(m.playerStats?.["Kills"] || "0");
        const deaths = parseInt(m.playerStats?.["Deaths"] || "1");
        const assists = parseInt(m.playerStats?.["Assists"] || "0");
        const kdRatio = deaths > 0 ? kills / deaths : kills;
        return {
          map: normalizeMapName(m.map),
          result: m.playerResult === "win" ? "W" : "L",
          kills,
          deaths,
          assists,
          kd: kdRatio,
          score: m.playerScore,
          date: m.startedAt ? new Date(m.startedAt * 1000) : null,
          hs: parseInt(m.playerStats?.["Headshots"] || "0"),
        };
      })
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }, [faceitMatches]);

  const kdChartData = useMemo(() => {
    return matchHistory.slice(0, 15).reverse().map((m) => m.kd);
  }, [matchHistory]);

  const recentActivity = useMemo(() => {
    const activity: Array<{ text: string; time: string; type: "match" | "friend" | "game" }> = [];
    matchHistory.slice(0, 5).forEach((m) => {
      activity.push({
        text: `${m.result === "W" ? "Victoria" : "Derrota"} en ${m.map} (${m.kills}/${m.deaths}/${m.assists})`,
        time: m.date ? timeAgo(m.date) : "Hace poco",
        type: "match",
      });
    });
    friends.slice(0, 3).forEach((f) => {
      activity.push({
        text: `${f.name} esta en tu lista de amigos`,
        time: f.friendSince ? timeAgo(new Date(f.friendSince * 1000)) : "",
        type: "friend",
      });
    });
    return activity.slice(0, 8);
  }, [matchHistory, friends]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard padding="lg" glow className="overflow-visible" style={getBackgroundStyle(profile?.equipped_background) ? { background: getBackgroundStyle(profile?.equipped_background)! } : undefined}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-primary/20 blur-2xl" />
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={`relative h-20 w-20 rounded-full border border-white/[0.1] shadow-lg shadow-primary/20 ${getFrameClasses(profile?.equipped_frame)}`} />
              ) : (
                <div className={`relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/20 ${getFrameClasses(profile?.equipped_frame)}`}>
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center border-2 border-background text-[10px] font-bold text-white">
                {user.steamLevel}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                ¡Bienvenido de nuevo, <span className={`gradient-text ${getEffectClass(profile?.equipped_effect)}`}>{user.name}</span>{getEmoji(profile?.equipped_emoji) && <span className="ml-1 text-xl">{getEmoji(profile?.equipped_emoji)}</span>}!
              </h1>
              <div className="flex items-center gap-1.5 mt-2 text-success text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Conectado via Steam
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                    <Star className="h-3 w-3" /> Steam Level
                  </div>
                  <div className="text-lg font-bold">{user.steamLevel}</div>
                </div>
                {user.faceitPlayerId && (
                  <div>
                    <div className="text-xs text-muted mb-1">FACEIT Level</div>
                    <div className="text-lg font-bold">{user.faceitLevel ?? "—"}</div>
                  </div>
                )}
                {user.faceitElo != null && (
                  <div>
                    <div className="text-xs text-muted mb-1">FACEIT Elo</div>
                    <div className="text-lg font-bold">{user.faceitElo.toLocaleString()}</div>
                  </div>
                )}
                {user.profileUrl && (
                  <div>
                    <div className="text-xs text-muted mb-1">Perfil Público</div>
                    <a
                      href={user.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Ver perfil <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {cs2Hours !== null
                  ? `Has jugado ${cs2Hours.toLocaleString()} horas de CS2.`
                  : "Conecta tu perfil de Steam para ver estadisticas de CS2."}
                {lastLogoffDate && ` Ultima conexion: ${lastLogoffDate}`}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Clock}
          iconColor="#22c55e"
          label="Horas CS2"
          value={cs2Hours !== null ? <><AnimatedNumber value={cs2Hours} suffix="h" /></> : "—"}
          sub={user.cs2?.hoursLast2Weeks ? `+${user.cs2.hoursLast2Weeks}h ultimas 2 sem` : undefined}
          delay={0.05}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="#3b82f6"
          label="Win Rate"
          value={winRate ? <>{winRate}%</> : "—"}
          sub={faceitStats?.lifetime ? "FACEIT" : cs2Stats ? "Steam CS2" : undefined}
          delay={0.1}
        />
        <StatCard
          icon={Crosshair}
          iconColor="#f97316"
          label="K/D"
          value={kd !== null ? <><AnimatedNumber value={kd} decimals={2} /></> : "—"}
          sub={cs2Stats ? `${cs2Stats.totalKills} kills / ${cs2Stats.totalDeaths} deaths` : undefined}
          delay={0.15}
        />
        <StatCard
          icon={Target}
          iconColor="#a855f7"
          label="Headshot %"
          value={hsPct !== null ? <><AnimatedNumber value={hsPct} decimals={1} />%</> : "—"}
          delay={0.2}
        />
        <StatCard
          icon={Shield}
          iconColor="#06b6d4"
          label="Accuracy"
          value={accuracy !== null ? <><AnimatedNumber value={accuracy} decimals={1} />%</> : "—"}
          delay={0.25}
        />
      </div>

      {/* FACEIT Level + Win Rate + ELO row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">FACEIT</h3>
                <p className="text-xs text-muted">{user.faceitNickname || "Sin conexion"}</p>
              </div>
            </div>
            {user.faceitPlayerId ? (
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-4xl font-bold font-mono text-primary mb-2">
                  Nv. {user.faceitLevel ?? "—"}
                </div>
                <p className="text-sm text-muted">
                  ELO: <span className="text-foreground font-medium">{user.faceitElo ?? "—"}</span>
                </p>
              </div>
            ) : (
              <div className="glass rounded-xl p-6 text-center">
                <div className="text-3xl font-bold font-mono text-muted mb-2">—</div>
                <p className="text-xs text-muted">Conecta FACEIT para ver nivel y ELO</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">K/D Evolution</h3>
                <p className="text-xs text-muted">Ultimas {kdChartData.length} partidas</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              {kdChartData.length >= 2 ? (
                <>
                  <div className="text-3xl font-bold font-mono text-success mb-1">
                    {kd !== null ? kd.toFixed(2) : "—"}
                  </div>
                  <p className="text-xs text-muted mb-2">K/D actual</p>
                  <div className="flex justify-center">
                    <MiniChart values={kdChartData} color="#22c55e" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold font-mono text-muted mb-2">—</div>
                  <p className="text-xs text-muted">Juega partidas en FACEIT para ver tu evolucion</p>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Resumen</h3>
                <p className="text-xs text-muted">Estadisticas generales</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold font-mono">{cs2Stats?.totalKills?.toLocaleString() ?? "—"}</div>
                  <div className="text-[10px] text-muted">Total Kills</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono">{cs2Stats?.totalDeaths?.toLocaleString() ?? "—"}</div>
                  <div className="text-[10px] text-muted">Total Deaths</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono">{cs2Stats?.totalMVPs?.toLocaleString() ?? "—"}</div>
                  <div className="text-[10px] text-muted">MVPs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold font-mono">{faceitStats?.lifetime?.Matches ?? "—"}</div>
                  <div className="text-[10px] text-muted">Partidas FACEIT</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Gamification Widgets */}
      <GamificationWidgets />

      {/* Mapa mas jugados + Armas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Mapa más jugados</h3>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ver todas</span>
            </div>
            {mapSegments.length > 0 ? (
              <div className="space-y-1">
                {mapSegments.slice(0, 5).map((seg, i) => (
                  <motion.div
                    key={seg.map_name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.03 }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{normalizeMapName(seg.map_name)}</div>
                      <div className="text-[11px] text-muted">{seg.matches} partidas</div>
                    </div>
                    <div className="text-sm font-semibold">
                      {seg["Win Rate %"]}% <span className="text-[11px] font-normal text-muted">WR</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg font-mono text-muted mb-2">—</div>
                <p className="text-xs text-muted">Sin datos de mapas</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Armas principales</h3>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ver todas</span>
            </div>
            {weaponData.length > 0 ? (
              <div className="space-y-1">
                {weaponData.slice(0, 5).map((w, i) => (
                  <motion.div
                    key={w.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.03 }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${w.color}15` }}>
                      <Swords className="h-4 w-4" style={{ color: w.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{w.name}</div>
                      <div className="text-[11px] text-muted">{w.kills.toLocaleString()} kills</div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: w.color }}>
                      {w.pct}%
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg font-mono text-muted mb-2">—</div>
                <p className="text-xs text-muted">Sin datos de armas</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Matches + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Últimas partidas</h3>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ver todas</span>
            </div>
            {matchHistory.length > 0 ? (
              <div className="space-y-1">
                {matchHistory.slice(0, 5).map((match, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.03 }}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      match.result === "W" ? "bg-success/15" : "bg-danger/15"
                    }`}>
                      <Trophy className={`h-4 w-4 ${match.result === "W" ? "text-success" : "text-danger"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${match.result === "W" ? "text-success" : "text-danger"}`}>
                        {match.result === "W" ? "Victoria" : "Derrota"}
                      </div>
                      <div className="text-[11px] text-muted truncate">{match.map}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-semibold">{match.score || "—"}</div>
                      <div className="text-[11px] text-muted font-mono">
                        {match.kills}/{match.deaths} · {match.kd.toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg font-mono text-muted mb-2">—</div>
                <p className="text-xs text-muted">No hay partidas FACEIT registradas</p>
                <p className="text-[10px] text-muted-foreground mt-1">Conecta FACEIT y sincroniza tus partidas para verlas aqui</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Actividad Reciente</h3>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Ver todas</span>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-white/[0.04] transition-all">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      a.type === "match" ? "bg-success/15" : "bg-primary/15"
                    }`}>
                      {a.type === "match" ? (
                        <Trophy className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 pt-1">
                      <div className="text-sm truncate">{a.text}</div>
                      <div className="text-[11px] text-muted">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-lg font-mono text-muted mb-2">—</div>
                <p className="text-xs text-muted">Sin actividad reciente</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {friends.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="lg:col-span-2">
            <GlassCard padding="md" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">Amigos ({friends.length})</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {friends.slice(0, 9).map((friend) => (
                  <div key={friend.steamId} className="glass rounded-xl p-2 flex items-center gap-2 hover:bg-white/[0.04] transition-all">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold">
                        {friend.name?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                    )}
                    <div className="text-xs font-medium truncate">{friend.name}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 30) return `${Math.floor(diffD / 30)} meses`;
  if (diffD > 0) return `Hace ${diffD}d`;
  if (diffH > 0) return `Hace ${diffH}h`;
  if (diffMin > 0) return `Hace ${diffMin}m`;
  return "Ahora";
}
