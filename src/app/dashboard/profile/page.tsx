"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import { useGamification } from "@/lib/gamification-context";
import { getFrameClasses, getEffectClass, getEmoji } from "@/lib/cosmetics";
import { CosmeticBackground } from "@/components/cosmetic-background";
import { useRef } from "react";
import {
  User,
  Clock,
  Trophy,
  Shield,
  Star,
  Gamepad2,
  AlertTriangle,
  Calendar,
  Globe,
  ExternalLink,
  TrendingUp,
  Target,
  Crosshair,
  Swords,
  Flame,
} from "lucide-react";

function StatBox({ label, value, color = "text-foreground" }: { label: string; value: string | number; color?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      className="glass rounded-xl p-4 text-center"
    >
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, loading, recentGames, faceitStats, cs2Stats } = useUser();
  const { profile } = useGamification();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando perfil de Steam...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard padding="lg" className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No hay sesión activa</h2>
          <p className="text-sm text-muted mb-4">Conecta tu cuenta de Steam para ver tu perfil.</p>
          <a href="/login" className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/[0.06] transition-all">
            Conectar con Steam
          </a>
        </GlassCard>
      </div>
    );
  }

  const createdAtDate = user.createdAt ? new Date(user.createdAt * 1000).toLocaleDateString("es-AR", { month: "long", year: "numeric" }) : "Desconocido";
  const lastLogoffDate = user.lastLogoff ? new Date(user.lastLogoff * 1000).toLocaleString("es-AR") : "Desconocido";
  const ls = faceitStats?.lifetime;
  const lMatches = ls ? parseInt(String(ls.Matches || "0"), 10) : 0;
  const lWinRate = ls ? parseFloat(String(ls["Win Rate %"] || "0")) : 0;
  const lKD = ls ? parseFloat(String(ls["Average K/D Ratio"] || "0")) : 0;
  const lHS = ls ? parseFloat(String(ls["Average Headshots %"] || "0")) : 0;
  const lADR = ls ? parseFloat(String(ls["ADR"] || "0")) : 0;

  const steamStats = [
    { label: "Steam Level", value: user.steamLevel, color: "text-primary" },
    { label: "Horas CS2", value: user.cs2?.hoursPlayed?.toLocaleString() || "0", color: "text-accent" },
    { label: "Juegos", value: user.totalGames, color: "text-cyan-400" },
    { label: "Últimas 2 Sem", value: `${user.cs2?.hoursLast2Weeks || 0}h`, color: "text-success" },
  ];

  const cs2DetailedStats = cs2Stats ? [
    { label: "K/D", value: cs2Stats.totalKD, icon: Swords, color: "text-danger" },
    { label: "HS%", value: `${cs2Stats.totalHSPct}%`, icon: Crosshair, color: "text-accent" },
    { label: "Accuracy", value: `${cs2Stats.accuracy}%`, icon: Target, color: "text-primary" },
    { label: "Win Rate", value: `${cs2Stats.totalWinPct}%`, icon: TrendingUp, color: "text-success" },
    { label: "Kills Totales", value: cs2Stats.totalKills.toLocaleString(), icon: Flame, color: "text-orange-400" },
    { label: "MVPs", value: cs2Stats.totalMVPs.toLocaleString(), icon: Star, color: "text-yellow-400" },
  ] : [
    { label: "K/D", value: "—", icon: Swords, color: "text-danger" },
    { label: "HS%", value: "—", icon: Crosshair, color: "text-accent" },
    { label: "Accuracy", value: "—", icon: Target, color: "text-primary" },
    { label: "Win Rate", value: "—", icon: TrendingUp, color: "text-success" },
    { label: "Kills Totales", value: "—", icon: Flame, color: "text-orange-400" },
    { label: "MVPs", value: "—", icon: Star, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <CosmeticBackground bgId={profile?.equipped_background}>
        <GlassCard padding="lg" style={{ background: "transparent", border: "none" }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className={`h-28 w-28 rounded-2xl border-2 border-white/[0.1] shadow-lg shadow-primary/20 ${getFrameClasses(profile?.equipped_frame)}`} />
              ) : (
                <div className={`h-28 w-28 rounded-2xl bg-gradient-to-br from-primary via-cyan-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary/20 ${getFrameClasses(profile?.equipped_frame)}`}>
                  {user.name?.slice(0, 2).toUpperCase() || "SP"}
                </div>
              )}
              {user.visibility === 3 && (
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-success flex items-center justify-center border-2 border-[#09090b]">
                  <span className="text-[10px] font-bold text-white">✓</span>
                </div>
              )}
              <div className="absolute -top-2 -right-2 glass rounded-lg px-2 py-1 flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                <span className="text-[10px] font-bold">Lv.{user.steamLevel}</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className={getEffectClass(profile?.equipped_effect)}>{user.name}</span>
                  {getEmoji(profile?.equipped_emoji) && <span className="ml-1 text-xl">{getEmoji(profile?.equipped_emoji)}</span>}
                </h1>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Badge variant={user.visibility === 3 ? "success" : "default"} size="sm">{user.visibility === 3 ? "Público" : "Privado"}</Badge>
                  {user.country && <Badge variant="accent" size="sm">{user.country}</Badge>}
                  {user.bans?.vacBanned && <Badge variant="danger" size="sm">VAC Banned</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-muted mb-4">
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{user.steamId}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Steam desde {createdAtDate}</span>
                {user.profileUrl && (
                  <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:text-primary-hover transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />Ver perfil en Steam
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {steamStats.map((stat) => (
                  <div key={stat.label} className="glass rounded-xl px-4 py-3 text-center">
                    <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
        </CosmeticBackground>
      </motion.div>
      {user.faceitPlayerId && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">FACEIT — {user.faceitNickname}</h3>
                <p className="text-xs text-muted">
                  Nivel {user.faceitLevel ?? "—"} · ELO {user.faceitElo ?? "—"}
                </p>
              </div>
            </div>
            {ls ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBox label="Partidas" value={lMatches} color="text-primary" />
                <StatBox label="Win Rate" value={`${lWinRate.toFixed(1)}%`} color="text-success" />
                <StatBox label="K/D" value={lKD.toFixed(2)} color={lKD >= 1.0 ? "text-success" : "text-danger"} />
                <StatBox label="HS%" value={`${lHS.toFixed(0)}%`} color="text-accent" />
                <StatBox label="ADR" value={lADR.toFixed(0)} color="text-purple-400" />
                <StatBox label="KAST" value={`${ls["Average KAST"] || "—"}%`} color="text-cyan-400" />
              </div>
            ) : (
              <p className="text-sm text-muted">Cargando estadísticas de FACEIT...</p>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* CS2 Detailed Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Counter-Strike 2 — Stats de Steam</h3>
              <p className="text-xs text-muted">{user.cs2?.hoursPlayed?.toLocaleString() || 0} horas jugadas</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cs2DetailedStats.map((stat) => (
              <StatBox key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
            ))}
          </div>
          {!cs2Stats && (
            <p className="text-[11px] text-muted mt-3 text-center">Stats detalladas no disponibles — verifica que tu perfil de juego en Steam sea público</p>
          )}
        </GlassCard>
      </motion.div>

      {/* Steam Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Información de Steam</h3>
              <p className="text-xs text-muted">Datos obtenidos de tu perfil público</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Steam ID</div>
              <div className="text-sm font-mono font-medium truncate">{user.steamId}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Steam Level</div>
              <div className="text-sm font-mono font-medium">{user.steamLevel}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">XP</div>
              <div className="text-sm font-mono font-medium">{user.steamXp?.toLocaleString() || "N/A"}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Última conexión</div>
              <div className="text-sm font-medium truncate">{lastLogoffDate}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Visibilidad</div>
              <div className="text-sm font-medium">{user.visibility === 3 ? "Público" : user.visibility === 1 ? "Privado" : "Amigos"}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Juegos Totales</div>
              <div className="text-sm font-mono font-medium">{user.totalGames}</div>
            </div>
          </div>
          {user.bans && (user.bans.vacBanned || user.bans.numberOfGameBans > 0) && (
            <div className="mt-4 glass rounded-xl p-3 border border-danger/20">
              <div className="flex items-center gap-2 text-danger text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Restricciones de cuenta
              </div>
              <div className="mt-2 text-xs text-muted space-y-1">
                {user.bans.vacBanned && <div>VAC Baneado — {user.bans.numberOfVACBans} baneo(s) VAC</div>}
                {user.bans.numberOfGameBans > 0 && <div>{user.bans.numberOfGameBans} baneo(s) de juego</div>}
                {user.bans.communityBanned && <div>Baneado de la comunidad</div>}
                <div>Días desde último ban: {user.bans.daysSinceLastBan}</div>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Recent Games */}
      {recentGames.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Juegos Recientes</h3>
                <p className="text-xs text-muted">Últimos juegos con actividad</p>
              </div>
            </div>
            <div className="space-y-2">
              {recentGames.map((game) => (
                <div key={game.appid} className="glass rounded-xl p-3 flex items-center gap-3">
                  <img
                    src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.iconUrl}.jpg`}
                    alt={game.name}
                    className="h-10 w-10 rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{game.name}</div>
                    <div className="text-[11px] text-muted">
                      {Math.round(game.playtime / 60).toLocaleString()} horas totales
                      {game.playtime2Weeks > 0 && ` · ${Math.round(game.playtime2Weeks / 60)}h últimas 2 semanas`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium">{Math.round(game.playtime / 60).toLocaleString()}h</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
