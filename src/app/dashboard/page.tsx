"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import { useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Crosshair,
  Flame,
  Shield,
  Star,
  Crown,
  Swords,
  MapPin,
  Wallet,
  ChevronUp,
  ChevronDown,
  Zap,
  Award,
  Clock,
  AlertTriangle,
  Gamepad2,
  Link as LinkIcon,
} from "lucide-react";

function AnimatedNumber({ value, suffix = "", prefix = "", decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (isInView && display === 0) {
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
  }

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display)}{suffix}
    </span>
  );
}

function NotAvailable({ label }: { label: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl font-bold font-mono text-muted">—</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">No disponible</div>
    </div>
  );
}

export default function DashboardOverview() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando datos de Steam...</p>
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
          <p className="text-sm text-muted mb-4">Inicia sesión con Steam para ver tus estadísticas reales.</p>
          <a href="/login" className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/[0.06] transition-all">
            Conectar con Steam
          </a>
        </GlassCard>
      </div>
    );
  }

  const initials = user.name?.slice(0, 2).toUpperCase() || "??";
  const cs2Hours = user.cs2?.hoursPlayed ?? null;
  const cs2HoursRecent = user.cs2?.hoursLast2Weeks ?? null;
  const lastLogoffDate = user.lastLogoff ? new Date(user.lastLogoff * 1000).toLocaleString("es-AR") : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard padding="lg" glow>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-2xl border border-white/[0.1] shadow-lg shadow-primary/20" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/20">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Bienvenido, <span className="gradient-text">{user.name}</span>
              </h1>
              <p className="text-sm text-muted mt-1">
                {cs2Hours !== null
                  ? `Has jugado ${cs2Hours.toLocaleString()} horas de CS2.`
                  : "Conecta tu perfil de Steam para ver estadísticas de CS2."}
                {lastLogoffDate && ` Última conexión: ${lastLogoffDate}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Steam Level</div>
                <Badge variant="accent" size="md">
                  <Star className="h-3 w-3 mr-1" />
                  {user.steamLevel}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Juegos</div>
                <Badge variant="default" size="md">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  {user.totalGames}
                </Badge>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Stats Grid - Real Steam Data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono">{user.steamLevel}</div>
            <div className="text-xs text-muted mt-1">Steam Level</div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-success" />
              </div>
            </div>
            {cs2Hours !== null ? (
              <div className="text-2xl font-bold font-mono"><AnimatedNumber value={cs2Hours} suffix="h" /></div>
            ) : (
              <div className="text-2xl font-bold font-mono text-muted">—</div>
            )}
            <div className="text-xs text-muted mt-1">Horas CS2</div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono"><AnimatedNumber value={user.totalGames} /></div>
            <div className="text-xs text-muted mt-1">Juegos Totales</div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono">
              {user.bans?.vacBanned ? (
                <span className="text-danger">VAC</span>
              ) : (
                <span className="text-success">Limpio</span>
              )}
            </div>
            <div className="text-xs text-muted mt-1">Estado de Bans</div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <NotAvailable label="HS%" />
        <NotAvailable label="ADR" />
        <NotAvailable label="K/D" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            {cs2HoursRecent !== null ? (
              <div className="text-2xl font-bold font-mono">{cs2HoursRecent}h</div>
            ) : (
              <div className="text-2xl font-bold font-mono text-muted">—</div>
            )}
            <div className="text-xs text-muted mt-1">Últimas 2 Sem</div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Friends Section */}
      {user.friends && user.friends.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold">Amigos ({user.friends.length})</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {user.friends.slice(0, 12).map((friend) => (
                <div key={friend.steamId} className="glass rounded-xl p-3 flex flex-col items-center text-center hover:bg-white/[0.04] transition-all">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className="h-10 w-10 rounded-full mb-2" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold mb-2">
                      {friend.name?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                  )}
                  <div className="text-xs font-medium truncate w-full">{friend.name}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Not Available Sections - FACEIT, Premier, Winrate, etc. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Premier Rating</h3>
                <p className="text-xs text-muted">Requiere integración</p>
              </div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold font-mono text-muted mb-2">—</div>
              <p className="text-xs text-muted">No disponible aún</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-accent">
                <LinkIcon className="h-3 w-3" />
                <span>Próximamente con CSStats</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">FACEIT</h3>
                <p className="text-xs text-muted">Requiere integración</p>
              </div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold font-mono text-muted mb-2">—</div>
              <p className="text-xs text-muted">Conecta FACEIT para ver nivel y ELO</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-primary">
                <LinkIcon className="h-3 w-3" />
                <span>Conecta FACEIT</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Win Rate</h3>
                <p className="text-xs text-muted">Requiere datos de partidas</p>
              </div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold font-mono text-muted mb-2">—</div>
              <p className="text-xs text-muted">No disponible sin historial</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-success">
                <LinkIcon className="h-3 w-3" />
                <span>Próximamente con Leetify</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Steam Profile Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Tu Perfil de Steam</h3>
            {user.profileUrl && (
              <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
                Ver en Steam <LinkIcon className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Steam ID</div>
              <div className="text-sm font-mono font-medium truncate">{user.steamId}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">País</div>
              <div className="text-sm font-medium">{user.country || "No especificado"}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Visibilidad</div>
              <div className="text-sm font-medium">{user.visibility === 3 ? "Público" : user.visibility === 1 ? "Privado" : "Amigos"}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-[11px] text-muted mb-1">Última Conexión</div>
              <div className="text-sm font-medium truncate">{lastLogoffDate || "No disponible"}</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Games from Steam */}
      {user.recentGames && user.recentGames.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold">Juegos Recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Juego</th>
                    <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Horas Totales</th>
                    <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Últimas 2 Sem</th>
                  </tr>
                </thead>
                <tbody>
                  {user.recentGames.map((game, index) => (
                    <motion.tr
                      key={game.appid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          {game.iconUrl && (
                            <img
                              src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.iconUrl}.jpg`}
                              alt={game.name}
                              className="h-8 w-8 rounded-lg"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          )}
                          {game.name}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-right text-muted font-mono">
                        {Math.round(game.playtime / 60).toLocaleString()}h
                      </td>
                      <td className="py-3 text-sm text-right text-muted font-mono">
                        {game.playtime2Weeks > 0 ? `${Math.round(game.playtime2Weeks / 60)}h` : "—"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Pending Integrations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <GlassCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Integraciones Próximas</h3>
              <p className="text-xs text-muted">Servicios que se conectarán automáticamente</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { name: "FACEIT", status: "Pendiente", color: "text-muted" },
              { name: "Leetify", status: "Pendiente", color: "text-muted" },
              { name: "CSStats", status: "Pendiente", color: "text-muted" },
              { name: "HLTV", status: "Pendiente", color: "text-muted" },
              { name: "Scope.gg", status: "Pendiente", color: "text-muted" },
            ].map((service) => (
              <div key={service.name} className="glass rounded-xl p-3 text-center">
                <div className="text-sm font-medium mb-1">{service.name}</div>
                <div className={`text-[11px] ${service.color}`}>{service.status}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
