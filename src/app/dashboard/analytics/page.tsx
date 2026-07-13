"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  TrendingUp,
  Crosshair,
  Target,
  Flame,
  Zap,
  Clock,
} from "lucide-react";

const mapStats = [
  { map: "Dust II", matches: 142, winRate: 64, avgRating: 1.21, kda: "22.4/16.1/4.2" },
  { map: "Mirage", matches: 118, winRate: 58, avgRating: 1.12, kda: "20.8/17.3/3.8" },
  { map: "Inferno", matches: 97, winRate: 72, avgRating: 1.34, kda: "24.1/14.8/5.1" },
  { map: "Anubis", matches: 83, winRate: 61, avgRating: 1.18, kda: "21.5/15.9/3.5" },
  { map: "Nuke", matches: 74, winRate: 55, avgRating: 1.05, kda: "19.2/17.8/4.0" },
  { map: "Overpass", matches: 68, winRate: 69, avgRating: 1.28, kda: "23.0/15.2/4.5" },
  { map: "Ancient", matches: 56, winRate: 62, avgRating: 1.19, kda: "21.8/16.4/3.9" },
  { map: "Vertigo", matches: 44, winRate: 48, avgRating: 0.97, kda: "18.5/19.1/3.2" },
];

const aimStats = [
  { label: "Precisión General", value: 34.2, icon: Target, color: "var(--color-primary)" },
  { label: "Tasa de Headshots", value: 47.2, icon: Crosshair, color: "var(--color-success)" },
  { label: "Precisión con Pistola", value: 42.8, icon: Crosshair, color: "var(--color-accent)" },
  { label: "Precisión con AWP", value: 68.5, icon: Target, color: "#a855f7" },
];

const recentTrend = [
  { month: "Feb", rating: 1.08 },
  { month: "Mar", rating: 1.12 },
  { month: "Abr", rating: 1.15 },
  { month: "May", rating: 1.22 },
  { month: "Jun", rating: 1.28 },
  { month: "Jul", rating: 1.32 },
];

const maxRating = 1.5;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Análisis</h1>
        <p className="text-sm text-muted mt-1">
          Profundiza en tus métricas de rendimiento e identifica áreas de mejora.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Partidas", value: "682", icon: Flame, color: "text-accent", bg: "bg-accent/10" },
          { label: "Rating Promedio", value: "1.24", icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Tiempo de Respuesta Promedio", value: "187ms", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
          { label: "Horas Jugadas", value: "1,247h", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, index) => (
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
            <div className="flex items-end gap-3 h-48">
              {recentTrend.map((data, i) => {
                const height = (data.rating / maxRating) * 100;
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-medium text-primary">{data.rating.toFixed(2)}</div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                      className="w-full rounded-lg bg-gradient-to-t from-primary/40 to-primary/80"
                    />
                    <span className="text-[11px] text-muted">{data.month}</span>
                  </div>
                );
              })}
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
                    <div className="text-xs text-muted mt-0.5">
                      {stat.value >= 40 ? "Por encima del promedio" : "Espacio de mejora"}
                    </div>
                  </div>
                </div>
              ))}
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
                {mapStats.map((map, index) => (
                  <tr
                    key={map.map}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 text-sm font-medium">{map.map}</td>
                    <td className="py-3 text-sm text-center text-muted">{map.matches}</td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${map.winRate >= 60 ? "bg-success" : map.winRate >= 50 ? "bg-primary" : "bg-danger"}`}
                            style={{ width: `${map.winRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{map.winRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant={map.avgRating >= 1.2 ? "success" : map.avgRating >= 1.0 ? "accent" : "danger"}
                        size="sm"
                      >
                        {map.avgRating.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-3 text-center text-sm text-muted font-mono">{map.kda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
