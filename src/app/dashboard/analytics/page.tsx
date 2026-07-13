"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useUser } from "@/lib/user-context";
import {
  TrendingUp,
  Crosshair,
  Target,
  Flame,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";

const MAP_NAMES = ["Dust II", "Mirage", "Inferno", "Anubis", "Nuke", "Overpass", "Ancient", "Vertigo"];

export default function AnalyticsPage() {
  const { user, loading } = useUser();

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

  const summaryStats = [
    { label: "Total de Partidas", value: "—", icon: Flame, color: "text-accent", bg: "bg-accent/10" },
    { label: "Rating Promedio", value: "—", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Tiempo de Respuesta Promedio", value: "—", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Horas Jugadas", value: user.cs2?.hoursPlayed ? `${Math.round(user.cs2.hoursPlayed).toLocaleString()}h` : "—", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const aimStats = [
    { label: "Precisión General", value: 0, icon: Target, color: "var(--color-primary)" },
    { label: "Tasa de Headshots", value: 0, icon: Crosshair, color: "var(--color-success)" },
    { label: "Precisión con Pistola", value: 0, icon: Crosshair, color: "var(--color-accent)" },
    { label: "Precisión con AWP", value: 0, icon: Target, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Análisis</h1>
        <p className="text-sm text-muted mt-1">
          Profundiza en tus métricas de rendimiento e identifica áreas de mejora.
        </p>
      </div>

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
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard padding="md" className="h-full">
            <h3 className="text-sm font-semibold mb-6">Tendencia de Rating</h3>
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-muted">No disponible</p>
                <p className="text-xs text-muted-foreground mt-1">Requiere integración con Leetify</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard padding="md" className="h-full">
            <h3 className="text-sm font-semibold mb-6">Estadísticas de Puntería</h3>
            <div className="space-y-6">
              {aimStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4">
                  <ProgressRing value={stat.value} size={52} strokeWidth={4} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{stat.label}</div>
                    <div className="text-xs text-muted mt-0.5">No disponible</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
              <span className="text-[10px] text-accent">Próximamente con Leetify</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard padding="md" hover={false}>
          <h3 className="text-sm font-semibold mb-6">Rendimiento por Mapa</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Mapa</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Partidas</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Tasa de Victoria</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Rating Promedio</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">K/D/A</th>
                </tr>
              </thead>
              <tbody>
                {MAP_NAMES.map((mapName) => (
                  <tr
                    key={mapName}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 text-sm font-medium">{mapName}</td>
                    <td className="py-3 text-sm text-center text-muted">—</td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden" />
                        <span className="text-xs font-medium text-muted">—</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant="accent" size="sm">—</Badge>
                    </td>
                    <td className="py-3 text-center text-sm text-muted font-mono">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
            <span className="text-[10px] text-accent">Requiere CSStats</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
