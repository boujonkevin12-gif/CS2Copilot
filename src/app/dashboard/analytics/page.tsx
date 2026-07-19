"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import {
  TrendingUp,
  Crosshair,
  Target,
  Flame,
  Zap,
  Clock,
  AlertTriangle,
  Link2,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user, loading, faceitStats, faceitMatches } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando análisis...</p>
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
          <p className="text-sm text-muted mb-4">Inicia sesión con Steam para ver tu análisis detallado.</p>
          <a href="/login" className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/[0.06] transition-all">
            Conectar Steam
          </a>
        </GlassCard>
      </div>
    );
  }

  const ls = faceitStats?.lifetime;
  const mapStats = faceitStats?.segments?.filter((s) => s.type === "Map" && s.map_name) || [];

  const lMatches = ls ? parseInt(ls.Matches || "0", 10) : 0;
  const lWinRate = ls ? parseFloat(ls["Win Rate %"] || "0") : 0;
  const lKD = ls ? parseFloat(ls["Average K/D Ratio"] || "0") : 0;
  const lHS = ls ? parseFloat(ls["Average Headshots %"] || "0") : 0;
  const lKAST = ls ? parseFloat(ls["Average KAST"] || "0") : 0;
  const lADR = ls ? parseFloat(ls["Average Damage per Round"] || "0") : 0;
  const lRating = ls ? parseFloat(ls.Rating || "0") : 0;

  const summaryStats = [
    { label: "Total de Partidas", value: lMatches || null, icon: Flame, color: "text-accent", bg: "bg-accent/10" },
    { label: "Rating Promedio", value: lRating || null, suffix: "", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "ADR Promedio", value: lADR || null, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Horas Jugadas", value: user.cs2?.hoursPlayed ? Math.round(user.cs2.hoursPlayed) : null, suffix: "h", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const aimStats = [
    { label: "Headshot %", value: lHS || 0, icon: Crosshair, color: "var(--color-primary)" },
    { label: "K/D Ratio", value: lKD ? Math.min((lKD / 2) * 100, 100) : 0, sub: lKD ? lKD.toFixed(2) : "—", icon: Target, color: "var(--color-success)" },
    { label: "KAST %", value: lKAST || 0, sub: lKAST ? `${lKAST.toFixed(1)}%` : "—", icon: Target, color: "var(--color-accent)" },
    { label: "ADR", value: lADR ? Math.min((lADR / 120) * 100, 100) : 0, sub: lADR ? lADR.toFixed(0) : "—", icon: Flame, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Análisis</h1>
        <p className="text-sm text-muted mt-1">
          Profundiza en tus métricas de rendimiento e identifica áreas de mejora.
        </p>
      </div>

      {!user.faceitPlayerId ? (
        <GlassCard padding="lg" className="text-center max-w-md mx-auto">
          <Target className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Conecta FACEIT</h2>
          <p className="text-sm text-muted mb-4">
            Vincula tu cuenta de FACEIT para ver análisis detallados de rendimiento.
          </p>
          <Link href="/dashboard/settings">
            <Badge variant="accent" size="sm">
              <Link2 className="h-3 w-3 mr-1" /> Conectar FACEIT
            </Badge>
          </Link>
        </GlassCard>
      ) : !faceitStats ? (
        <GlassCard padding="lg" className="text-center max-w-md mx-auto">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando análisis de FACEIT...</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard padding="md">
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    {stat.value !== null ? `${stat.value}${stat.suffix || ""}` : "—"}
                  </div>
                  <div className="text-xs text-muted mt-1">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard padding="md" className="h-full">
                <h3 className="text-sm font-semibold mb-6">Estadísticas de Puntería</h3>
                <div className="space-y-6">
                  {aimStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                          <Icon className="h-5 w-5" style={{ color: stat.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium">{stat.label}</span>
                            <span className="text-sm font-mono font-medium">{stat.sub || `${stat.value.toFixed(0)}%`}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.value}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: stat.color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard padding="md" className="h-full">
                <h3 className="text-sm font-semibold mb-6">Resumen de Rendimiento</h3>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted">Win Rate</span>
                      <span className="text-sm font-mono font-bold text-success">{lWinRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lWinRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-success"
                      />
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted">K/D Ratio</span>
                      <span className="text-sm font-mono font-bold text-primary">{lKD.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((lKD / 2) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted">HS %</span>
                      <span className="text-sm font-mono font-bold text-accent">{lHS.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lHS}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-accent"
                      />
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted">ADR</span>
                      <span className="text-sm font-mono font-bold text-purple-400">{lADR.toFixed(0)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((lADR / 120) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {mapStats.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <GlassCard padding="md" hover={false}>
                <h3 className="text-sm font-semibold mb-4">Rendimiento por Mapa</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Mapa</th>
                        <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Partidas</th>
                        <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Win Rate</th>
                        <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">K/D</th>
                        <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">HS%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapStats.slice(0, 8).sort((a, b) => parseInt(b.matches || "0") - parseInt(a.matches || "0")).map((seg) => {
                        const wr = parseFloat(seg["Win Rate %"] || "0");
                        const kd = parseFloat(seg["Average K/D Ratio"] || "0");
                        const hs = parseFloat(seg["Average Headshots %"] || "0");
                        const name = seg.map_name.replace("de_", "");
                        const matches = parseInt(seg.matches || "0");
                        return (
                          <tr key={seg.map_name} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 text-sm font-medium capitalize">{name}</td>
                            <td className="py-3 text-sm text-center text-muted">{matches}</td>
                            <td className="py-3 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div className="h-full rounded-full bg-success" style={{ width: `${wr}%` }} />
                                </div>
                                <span className="text-xs font-medium">{wr.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <Badge variant={kd >= 1.0 ? "success" : "danger"} size="sm">{kd.toFixed(2)}</Badge>
                            </td>
                            <td className="py-3 text-center text-sm font-mono">{hs.toFixed(0)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
