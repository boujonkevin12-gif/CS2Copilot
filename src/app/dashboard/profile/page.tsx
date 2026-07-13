"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
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
  CircleDot,
  Sparkles,
  TrendingUp,
  Calendar,
  Globe,
} from "lucide-react";

const playerData = {
  name: "SteamPlayer",
  steamId: "STEAM_0:1:48291637",
  avatar: null,
  steamLevel: 78,
  hoursPlayed: 4823,
  hoursLast2Weeks: 47,
  premierRating: 21847,
  premierRank: "Bala de Plata 3",
  faceitLevel: 10,
  faceitElo: 2487,
  cs2Rating: 18432,
  registrationDate: "Marzo 2020",
  lastSeen: "Hace 2 horas",
  onlineStatus: "En línea",
  country: "Argentina",
  wins: 1847,
  losses: 1203,
  draws: 84,
  winrate: 59.4,
  kd: 1.38,
  hs: 52.3,
  adr: 87.6,
};

const medals = [
  { id: 1, name: "Maestro de la Precisión", description: "50,000 headshots", icon: Crosshair, color: "#f59e0b", rarity: "legendario", unlocked: true },
  { id: 2, name: "Veterano de Guerra", description: "5,000 partidas jugadas", icon: Swords, color: "#a855f7", rarity: "épico", unlocked: true },
  { id: 3, name: "El clutch King", description: "500 clutches 1vX", icon: Crown, color: "#3b82f6", rarity: "épico", unlocked: true },
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
  { id: 3, name: "MVP del Mes", icon: Medal, color: "#f59e0b", description: "Elegido MVP en tu clan - Ene 2025" },
  { id: 4, name: "10,000 Horas", icon: Clock, color: "#a855f7", description: "累计 10,000 horas en CS franchise" },
  { id: 5, name: "Insignia Dorada", icon: BadgeCheck, color: "#fbbf24", description: "Cuenta verificada premium" },
  { id: 6, name: "Fundador", icon: Sparkles, color: "#06b6d4", description: "Miembro fundador de CS2Pilot" },
  { id: 7, name: "Líder de Equipo", icon: Globe, color: "#22c55e", description: "Lideraste 500+ partidas de equipo" },
  { id: 8, name: "Superviviente", icon: Heart, color: "#ef4444", description: "Sobreviviste 50 rondas seguidas" },
];

const achievements = [
  { id: 1, name: "Primera Victoria", description: "Gana tu primera partida competitiva", icon: Trophy, color: "#22c55e", unlocked: true, date: "Mar 2020", progress: 100 },
  { id: 2, name: "Racha de Fuego", description: "Gana 10 partidas consecutivas", icon: Flame, color: "#ef4444", unlocked: true, date: "Jun 2022", progress: 100 },
  { id: 3, name: "Maestro del Spray", description: "Consigue 5,000 kills con rifles de spray", icon: Crosshair, color: "#f59e0b", unlocked: true, date: "Ago 2023", progress: 100 },
  { id: 4, name: "Clutch Master", description: "Gana 100 clutches 1v3 o superiores", icon: Crown, color: "#a855f7", unlocked: true, date: "Dic 2023", progress: 100 },
  { id: 5, name: "Dedicación Absoluta", description: "Juega 5,000 horas en total", icon: Clock, color: "#3b82f6", unlocked: true, date: "Feb 2025", progress: 100 },
  { id: 6, name: "Headshot Machine", description: "Consigue 50,000 headshots", icon: Skull, color: "#f97316", unlocked: true, date: "Mar 2025", progress: 100 },
  { id: 7, name: "Élite Premier", description: "Alcanza 25,000 Premier Rating", icon: Star, color: "#eab308", unlocked: false, date: null, progress: 87 },
  { id: 8, name: "Supremo FACEIT", description: "Alcanza nivel 10 FACEIT con 3,000+ ELO", icon: Shield, color: "#06b6d4", unlocked: false, date: null, progress: 83 },
  { id: 9, name: "Leyenda Viviente", description: "Gana 2,000 partidas competitivas", icon: Award, color: "#ec4899", unlocked: false, date: null, progress: 92 },
  { id: 10, name: "Inmaculado", description: "Termina una partida con 100% HS rate (mín. 20 kills)", icon: Eye, color: "#22d3ee", unlocked: false, date: null, progress: 65 },
  { id: 11, name: "Ojo de Halcón", description: "Mantén 60%+ HS rate en 500 partidas", icon: Target, color: "#f59e0b", unlocked: false, date: null, progress: 78 },
  { id: 12, name: "Escudo de Plata", description: "Gana 500 rondas como CT sin morir", icon: Shield, color: "#94a3b8", unlocked: false, date: null, progress: 71 },
];

const recentActivity = [
  { type: "logro", text: "Desbloqueaste 'Headshot Machine'", time: "Hace 3 días", icon: Skull },
  { type: "medalla", text: "Obtuviste 'Leyenda de Premier'", time: "Hace 1 semana", icon: Star },
  { type: "racha", text: "Racha de 15 victorias consecutivas", time: "Hace 2 semanas", icon: Flame },
  { type: "récord", text: "Nuevo récord: 47 kills en una partida", time: "Hace 3 semanas", icon: Trophy },
  { type: "insignia", text: "Obtuviste 'Fundador' de CS2Pilot", time: "Hace 1 mes", icon: Sparkles },
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
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${achievement.color}15` }}
      >
        <achievement.icon className="h-6 w-6" style={{ color: achievement.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold truncate">{achievement.name}</span>
          {achievement.unlocked && <BadgeCheck className="h-4 w-4 text-success shrink-0" />}
        </div>
        <p className="text-xs text-muted truncate">{achievement.description}</p>
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isInView ? `${achievement.progress}%` : 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.05 }}
              className="h-full rounded-full"
              style={{
                backgroundColor: achievement.unlocked ? achievement.color : `${achievement.color}80`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{achievement.progress}%</span>
            {achievement.date && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {achievement.date}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const totalMedals = medals.length;
  const totalBadges = badges.length;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard padding="lg">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-primary via-cyan-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary/20">
                SP
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-success flex items-center justify-center border-2 border-[#09090b]">
                <span className="text-[10px] font-bold text-white">✓</span>
              </div>
              <div className="absolute -top-2 -right-2 glass rounded-lg px-2 py-1 flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                <span className="text-[10px] font-bold">Lv.{playerData.steamLevel}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3">
                <h1 className="text-2xl font-bold tracking-tight">{playerData.name}</h1>
                <div className="flex gap-2">
                  <Badge variant="success" size="sm">{playerData.onlineStatus}</Badge>
                  <Badge variant="accent" size="sm">{playerData.country}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-muted mb-4">
                <span className="flex items-center gap-1.5"><Gamepad2 className="h-3.5 w-3.5" />{playerData.steamId}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Miembro desde {playerData.registrationDate}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Última conexión: {playerData.lastSeen}</span>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-primary">{playerData.premierRating.toLocaleString()}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Premier</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-accent">{playerData.faceitLevel}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">FACEIT</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono">{playerData.cs2Rating.toLocaleString()}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">CS2 Rating</div>
                </div>
                <div className="glass rounded-xl px-4 py-3 text-center">
                  <div className="text-lg font-bold font-mono text-success">{playerData.winrate}%</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Win Rate</div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* General Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatBox label="Horas Jugadas" value={playerData.hoursPlayed.toLocaleString()} sub={`${playerData.hoursLast2Weeks}h últimas 2 semanas`} color="text-primary" />
          <StatBox label="Premier Rating" value={playerData.premierRating.toLocaleString()} sub={playerData.premierRank} color="text-accent" />
          <StatBox label="FACEIT ELO" value={playerData.faceitElo.toLocaleString()} sub={`Nivel ${playerData.faceitLevel}`} color="text-cyan-400" />
          <StatBox label="Steam Level" value={playerData.steamLevel} sub="Nivel de cuenta" color="text-yellow-500" />
          <StatBox label="K/D Ratio" value={playerData.kd} sub="Promedio general" color="text-success" />
          <StatBox label="HS Rate" value={`${playerData.hs}%`} sub="Headshot rate" color="text-purple-400" />
        </div>
      </motion.div>

      {/* Win/Loss + ADR */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Resumen de Partidas</h3>
              <p className="text-xs text-muted">{(playerData.wins + playerData.losses + playerData.draws).toLocaleString()} partidas jugadas</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted">Victorias</span>
                <span className="text-xs font-mono text-success">{playerData.wins.toLocaleString()}</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(playerData.wins / (playerData.wins + playerData.losses + playerData.draws)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-success"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted">Derrotas</span>
                <span className="text-xs font-mono text-danger">{playerData.losses.toLocaleString()}</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(playerData.losses / (playerData.wins + playerData.losses + playerData.draws)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-danger"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted">Empates</span>
                <span className="text-xs font-mono">{playerData.draws}</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(playerData.draws / (playerData.wins + playerData.losses + playerData.draws)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-muted-foreground"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-success">{playerData.winrate}%</div>
              <div className="text-[11px] text-muted">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{playerData.kd}</div>
              <div className="text-[11px] text-muted">K/D Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{playerData.hs}%</div>
              <div className="text-[11px] text-muted">Headshot Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{playerData.adr}</div>
              <div className="text-[11px] text-muted">ADR</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

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
                <p className="text-xs text-muted">{totalMedals} medallas obtenidas</p>
              </div>
            </div>
            <Badge variant="accent" size="sm">{totalMedals}/9</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {medals.map((medal, i) => (
              <motion.div
                key={medal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-all group"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${medal.color}15` }}
                >
                  <medal.icon className="h-6 w-6" style={{ color: medal.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{medal.name}</div>
                  <div className="text-[11px] text-muted truncate">{medal.description}</div>
                  <Badge
                    variant={medal.rarity === "legendario" ? "accent" : medal.rarity === "épico" ? "warning" : medal.rarity === "raro" ? "success" : "default"}
                    size="sm"
                  >
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
        {/* Badges */}
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
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${badge.color}15` }}
                  >
                    <badge.icon className="h-7 w-7" style={{ color: badge.color }} />
                  </div>
                  <div className="text-xs font-semibold">{badge.name}</div>
                  <div className="text-[10px] text-muted mt-0.5 leading-tight">{badge.description}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Actividad Reciente</h3>
                <p className="text-xs text-muted">Últimos logros desbloqueados</p>
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
                <p className="text-xs text-muted">{unlockedAchievements}/{totalAchievements} desbloqueados</p>
              </div>
            </div>
            <Badge variant="accent" size="sm">{Math.round((unlockedAchievements / totalAchievements) * 100)}%</Badge>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedAchievements / totalAchievements) * 100}%` }}
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
