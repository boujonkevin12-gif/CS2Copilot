"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import { useRef } from "react";
import {
  User,
  Clock,
  Trophy,
  Medal,
  Shield,
  Star,
  Gamepad2,
  Award,
  Target,
  Flame,
  Crown,
  Zap,
  Swords,
  Crosshair,
  Eye,
  Heart,
  Skull,
  BadgeCheck,
  Sparkles,
  TrendingUp,
  Calendar,
  Globe,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const medals = [
  { id: 1, name: "Maestro de la Precisión", description: "50,000 headshots", icon: Crosshair, color: "#f59e0b", rarity: "legendario", unlocked: true },
  { id: 2, name: "Veterano de Guerra", description: "5,000 partidas jugadas", icon: Swords, color: "#a855f7", rarity: "épico", unlocked: true },
  { id: 3, name: "El Clutch King", description: "500 clutches 1vX", icon: Crown, color: "#3b82f6", rarity: "épico", unlocked: true },
  { id: 4, name: "Inquebrantable", description: "Racha de 20 victorias", icon: Flame, color: "#ef4444", rarity: "raro", unlocked: true },
  { id: 5, name: "Francotirador", description: "10,000 kills con AWP", icon: Target, color: "#06b6d4", rarity: "legendario", unlocked: true },
  { id: 6, name: "Escudo Humano", description: "2,000 kills con pistol", icon: Shield, color: "#22c55e", rarity: "raro", unlocked: true },
  { id: 7, name: "Primera Sangre", description: "1,000 first kills", icon: Zap, color: "#f97316", rarity: "poco común", unlocked: true },
  { id: 8, name: "Ojo de Halcón", description: "70%+ HS rate en 100 partidas", icon: Eye, color: "#ec4899", rarity: "épico", unlocked: true },
  { id: 9, name: "Leyenda de Premier", description: "Alcanzar 20,000+ Premier", icon: Star, color: "#eab308", rarity: "legendario", unlocked: true },
];

const badges = [
  { id: 1, name: "Participante del Major", icon: Trophy, color: "#eab308", description: "Seguiste el CS2 Major 2025" },
  { id: 2, name: "Beta Tester CS2", icon: Gamepad2, color: "#3b82f6", description: "Jugaste la beta cerrada de CS2" },
  { id: 3, name: "MVP del Mes", icon: Medal, color: "#f59e0b", description: "Elegido MVP en tu clan" },
  { id: 4, name: "Veterano CS", icon: Clock, color: "#a855f7", description: "Miles de horas en CS franchise" },
  { id: 5, name: "Insignia Dorada", icon: BadgeCheck, color: "#fbbf24", description: "Cuenta verificada premium" },
  { id: 6, name: "Fundador", icon: Sparkles, color: "#06b6d4", description: "Miembro fundador de CS2Pilot" },
  { id: 7, name: "Líder de Equipo", icon: Globe, color: "#22c55e", description: "Lideraste 500+ partidas de equipo" },
  { id: 8, name: "Superviviente", icon: Heart, color: "#ef4444", description: "Sobreviviste 50 rondas seguidas" },
];

const achievements = [
  { id: 1, name: "Primera Victoria", description: "Gana tu primera partida competitiva", icon: Trophy, color: "#22c55e", unlocked: true, progress: 100 },
  { id: 2, name: "Racha de Fuego", description: "Gana 10 partidas consecutivas", icon: Flame, color: "#ef4444", unlocked: true, progress: 100 },
  { id: 3, name: "Maestro del Spray", description: "5,000 kills con rifles de spray", icon: Crosshair, color: "#f59e0b", unlocked: true, progress: 100 },
  { id: 4, name: "Clutch Master", description: "Gana 100 clutches 1v3+", icon: Crown, color: "#a855f7", unlocked: true, progress: 100 },
  { id: 5, name: "Dedicación Absoluta", description: "Juega 5,000 horas en total", icon: Clock, color: "#3b82f6", unlocked: false, progress: 0 },
  { id: 6, name: "Headshot Machine", description: "50,000 headshots", icon: Skull, color: "#f97316", unlocked: false, progress: 0 },
  { id: 7, name: "Élite Premier", description: "Alcanza 25,000 Premier Rating", icon: Star, color: "#eab308", unlocked: false, progress: 0 },
  { id: 8, name: "Supremo FACEIT", description: "Nivel 10 con 3,000+ ELO", icon: Shield, color: "#06b6d4", unlocked: false, progress: 0 },
];

const recentActivity = [
  { type: "logro", text: "Conectaste tu cuenta de Steam", time: "Ahora", icon: Sparkles },
  { type: "perfil", text: "Perfil sincronizado con Steam", time: "Ahora", icon: User },
  { type: "datos", text: "Datos de CS2 cargados", time: "Ahora", icon: Gamepad2 },
];

function StatBox({ label, value, sub, color = "text-foreground" }: { label: string; value: string | number; sub?: string; color?: string }) {
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
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function AchievementProgress({ achievement, index }: { achievement: typeof achievements[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.05 }}
      className={`glass rounded-xl p-4 flex items-center gap-4 ${!achievement.unlocked ? "opacity-70" : ""}`}
    >
      <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${achievement.color}15` }}>
        <achievement.icon className="h-6 w-6" style={{ color: achievement.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold truncate">{achievement.name}</span>
          {achievement.unlocked && <BadgeCheck className="h-4 w-4 text-success shrink-0" />}
        </div>
        <p className="text-xs text-muted truncate">{achievement.description}</p>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, loading, recentGames } = useUser();

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
  const totalMedals = medals.length;
  const totalBadges = badges.length;
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard padding="lg">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-28 w-28 rounded-2xl border-2 border-white/[0.1] shadow-lg shadow-primary/20" />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-primary via-cyan-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary/20">
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
                <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Badge variant="success" size="sm">{user.visibility === 3 ? "Público" : "Privado"}</Badge>
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
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-primary">{user.steamLevel}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Steam Level</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-accent">{user.cs2?.hoursPlayed?.toLocaleString() || "0"}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Horas CS2</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-cyan-400">{user.totalGames}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Juegos</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-success">{user.cs2?.hoursLast2Weeks || 0}h</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Últimas 2 Sem</div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* CS2 Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Counter-Strike 2</h3>
              <p className="text-xs text-muted">
                {user.cs2 ? `${user.cs2.hoursPlayed.toLocaleString()} horas jugadas` : "No se detectaron datos de CS2"}
              </p>
            </div>
          </div>
          {user.cs2 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-primary">{user.cs2.hoursPlayed.toLocaleString()}</div>
                <div className="text-xs text-muted mt-1">Horas Totales</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-accent">{user.cs2.hoursLast2Weeks}</div>
                <div className="text-xs text-muted mt-1">Horas (2 Sem)</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-success">{user.cs2.playtimeTotal?.toLocaleString()}</div>
                <div className="text-xs text-muted mt-1">Minutos Totales</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono text-cyan-400">CS2</div>
                <div className="text-xs text-muted mt-1">App ID 730</div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <Gamepad2 className="h-10 w-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No se encontraron datos de CS2 en tu perfil de Steam.</p>
            </div>
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

      {/* Medals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Medal className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Medallas</h3>
                <p className="text-xs text-muted">{totalMedals} medallas desbloqueadas</p>
              </div>
            </div>
            <Badge variant="accent" size="sm">{totalMedals}/9</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {medals.map((medal, i) => (
              <motion.div
                key={medal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-all group"
              >
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${medal.color}15` }}>
                  <medal.icon className="h-6 w-6" style={{ color: medal.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{medal.name}</div>
                  <div className="text-[11px] text-muted truncate">{medal.description}</div>
                  <Badge variant={medal.rarity === "legendario" ? "accent" : medal.rarity === "épico" ? "warning" : medal.rarity === "raro" ? "success" : "default"} size="sm">
                    {medal.rarity}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Badges + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-3">
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Insignias</h3>
                  <p className="text-xs text-muted">{totalBadges} insignias coleccionadas</p>
                </div>
              </div>
              <Badge variant="accent" size="sm">{totalBadges}/8</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="glass rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/[0.04] transition-all group"
                >
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${badge.color}15` }}>
                    <badge.icon className="h-7 w-7" style={{ color: badge.color }} />
                  </div>
                  <div className="text-xs font-semibold">{badge.name}</div>
                  <div className="text-[10px] text-muted mt-0.5 leading-tight">{badge.description}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Actividad Reciente</h3>
                <p className="text-xs text-muted">Última actividad en CS2Pilot</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{activity.text}</div>
                    <div className="text-[10px] text-muted-foreground">{activity.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Logros</h3>
                <p className="text-xs text-muted">{unlockedAchievements}/{achievements.length} desbloqueados</p>
              </div>
            </div>
            <Badge variant="accent" size="sm">{Math.round((unlockedAchievements / achievements.length) * 100)}%</Badge>
          </div>
          <div className="mb-5">
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedAchievements / achievements.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>
          <div className="space-y-3">
            {achievements.map((achievement, i) => (
              <AchievementProgress key={achievement.id} achievement={achievement} index={i} />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
