"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/user-context";
import { useRef, useState } from "react";
import {
  Target,
  Crosshair,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Map,
  Swords,
  Skull,
  Eye,
  CrosshairIcon,
  Flame,
  Award,
  ChevronDown,
  BarChart3,
  AlertTriangle,
  Gamepad2,
  Link2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const MAP_NAMES = ["Dust II", "Mirage", "Inferno", "Anubis", "Nuke", "Overpass", "Ancient", "Vertigo"];

const HEATMAP_MAPS = ["Dust II", "Mirage", "Inferno"];

function HeatmapPlaceholder() {
  return (
    <div className="relative">
      <div className="aspect-[16/10] glass rounded-xl overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02]" />
        <div className="relative text-center z-10">
          <Map className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted">No disponible</p>
          <p className="text-xs text-muted-foreground mt-1">Requiere integración con CSStats</p>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, size = 120, strokeWidth = 8, color, label, sublabel }: { value: number; size?: number; strokeWidth?: number; color: string; label: string; sublabel?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isInView ? offset : circumference}
            strokeLinecap="round"
            className="transition-all duration-[2s] ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-2xl font-bold font-mono">{value === 0 ? "—" : `${value}%`}</div>
          {sublabel && <div className="text-[10px] text-muted">{sublabel}</div>}
        </div>
      </div>
      <div className="text-xs text-muted mt-2 font-medium">{label}</div>
    </div>
  );
}

function BarStat({ label, value, max = 100, color, suffix = "%" }: { label: string; value: number | null; max?: number; color: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (value === null) {
    return (
      <div ref={ref} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{label}</span>
          <span className="text-xs font-mono font-medium text-muted">—</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden" />
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-mono font-medium">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${(value / max) * 100}%` : 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function NotAvailable({ label, note }: { label: string; note?: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl font-bold font-mono text-muted">—</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">No disponible</div>
      {note && <div className="text-[10px] text-accent mt-1">{note}</div>}
    </div>
  );
}

export default function StatsPage() {
  const { user, loading, faceitStats } = useUser();
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Cargando estadísticas...</p>
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
          <p className="text-sm text-muted mb-4">Inicia sesión con Steam para ver tus estadísticas detalladas.</p>
          <a href="/login" className="inline-flex items-center gap-2 glass rounded-xl px-6 py-3 text-sm font-semibold hover:bg-white/[0.06] transition-all">
            Conectar Steam
          </a>
        </GlassCard>
      </div>
    );
  }

  const lifetime = faceitStats?.lifetime;
  const mapStats = faceitStats?.segments?.filter((s) => s.type === "Map" && s.map_name) || [];

  const lMatches = lifetime ? parseInt(lifetime.Matches || "0", 10) : 0;
  const lWinRate = lifetime ? parseFloat(lifetime["Win Rate %"] || "0") : 0;
  const lKD = lifetime ? parseFloat(lifetime["Average K/D Ratio"] || "0") : 0;
  const lHS = lifetime ? parseFloat(lifetime["Average Headshots %"] || "0") : 0;
  const lKills = lifetime ? parseInt(lifetime.Kills || "0", 10) : 0;
  const lDeaths = lifetime ? parseInt(lifetime.Deaths || "0", 10) : 0;
  const lAssists = lifetime ? parseInt(lifetime.Assists || "0", 10) : 0;
  const lKAST = lifetime ? parseFloat(lifetime["Average KAST"] || "0") : 0;
  const lADR = lifetime ? parseFloat(lifetime["Average Damage per Round"] || "0") : 0;
  const lClutches = lifetime ? parseInt(lifetime["Clutches Won"] || "0", 10) : 0;
  const lRating = lifetime ? parseFloat(lifetime.Rating || "0") : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          Estadísticas Detalladas
        </h1>
        <p className="text-sm text-muted mt-1">
          {user.faceitNickname
            ? <>Análisis de tu rendimiento en <span className="text-foreground font-medium">{user.faceitNickname}</span></>
            : "Análisis profundo de tu rendimiento."}
        </p>
      </motion.div>

      {!user.faceitPlayerId ? (
        <GlassCard padding="lg" className="text-center max-w-md mx-auto">
          <Gamepad2 className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Conecta FACEIT</h2>
          <p className="text-sm text-muted mb-4">
            Vincula tu cuenta de FACEIT para ver estadísticas detalladas por mapa, K/D, win rate y más.
          </p>
            <Link href="/dashboard/settings" className="cursor-pointer">
              <Badge variant="accent" size="sm">
                <Link2 className="h-3 w-3 mr-1" /> Conectar FACEIT
              </Badge>
            </Link>
        </GlassCard>
      ) : !faceitStats ? (
        <GlassCard padding="lg" className="text-center max-w-md mx-auto">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Cargando estadísticas de FACEIT...</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Partidas", value: lMatches || null, suffix: "", color: "var(--color-primary)" },
              { label: "Win Rate", value: lWinRate || null, suffix: "%", color: "var(--color-success)" },
              { label: "K/D Ratio", value: lKD || null, suffix: "", color: "var(--color-accent)" },
              { label: "Headshot %", value: lHS || null, suffix: "%", color: "var(--color-danger)" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard padding="sm" hover={false}>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono" style={{ color: stat.value ? stat.color : undefined }}>
                      {stat.value !== null ? `${stat.value}${stat.suffix}` : "—"}
                    </div>
                    <div className="text-xs text-muted mt-1">{stat.label}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Kills", value: lKills },
              { label: "Deaths", value: lDeaths },
              { label: "Assists", value: lAssists },
              { label: "KAST", value: lKAST, suffix: "%" },
              { label: "ADR", value: lADR },
              { label: "Clutches", value: lClutches },
              { label: "Rating", value: lRating },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.03 }}>
                <GlassCard padding="sm" hover={false}>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono">
                      {stat.value ? (typeof stat.suffix !== "undefined" ? `${stat.value}${stat.suffix}` : stat.value.toLocaleString()) : "—"}
                    </div>
                    <div className="text-xs text-muted mt-1">{stat.label}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Heatmap de Kills</h3>
                <p className="text-xs text-muted">Distribución de eliminaciones por zona</p>
              </div>
            </div>
            <div className="flex gap-1">
              {HEATMAP_MAPS.map((map) => (
                <button
                  key={map}
                  onClick={() => setSelectedMap(map)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedMap === map || (!selectedMap && map === "Dust II")
                      ? "bg-primary/20 text-primary"
                      : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                  }`}
                >
                  {map}
                </button>
              ))}
            </div>
          </div>
          <HeatmapPlaceholder />
        </GlassCard>
      </motion.div>

      {faceitStats && mapStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Win Rate por Mapa</h3>
                <p className="text-xs text-muted">Datos de FACEIT</p>
              </div>
            </div>
            <div className="space-y-3">
              {mapStats.slice(0, 8).sort((a, b) => parseInt(b.matches || "0") - parseInt(a.matches || "0")).map((seg) => {
                const wr = parseFloat(seg["Win Rate %"] || "0");
                const name = seg.map_name.replace("de_", "");
                return (
                  <div key={seg.map_name} className="flex items-center gap-3">
                    <span className="text-[11px] text-muted w-16 shrink-0 truncate capitalize">{name}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${wr}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-success"
                      />
                    </div>
                    <span className="text-xs font-mono w-10 text-right">{wr.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crosshair className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Accuracy</h3>
                <p className="text-xs text-muted">Precisión por tipo de disparo</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <NotAvailable label="Headshot" />
              <NotAvailable label="Bodyshot" />
              <NotAvailable label="Legshot" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted font-medium mb-2">Por Arma</div>
              <div className="text-center py-4">
                <p className="text-xs text-muted">No disponible</p>
                <p className="text-[10px] text-accent mt-1">Próximamente con CSStats/Leetify</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Spray Control</h3>
                <p className="text-xs text-muted">Análisis de patrones de spray</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <NotAvailable label="Tap" />
              <NotAvailable label="Burst" />
              <NotAvailable label="Spray" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted font-medium mb-2">Por Distancia</div>
              <div className="text-center py-4">
                <p className="text-xs text-muted">No disponible</p>
                <p className="text-[10px] text-accent mt-1">Próximamente con CSStats/Leetify</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Win Rate CT</h3>
                <p className="text-xs text-muted">Lado Counter-Terrorist</p>
              </div>
            </div>
            <div className="flex justify-center">
              <CircularProgress
                value={0}
                size={140}
                strokeWidth={10}
                color="var(--color-primary)"
                label="Promedio General"
                sublabel="No disponible"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-center">
              <span className="text-[10px] text-accent">Próximamente con CSStats/Leetify</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Win Rate TT</h3>
                <p className="text-xs text-muted">Lado Terrorist</p>
              </div>
            </div>
            <div className="flex justify-center">
              <CircularProgress
                value={0}
                size={140}
                strokeWidth={10}
                color="var(--color-accent)"
                label="Promedio General"
                sublabel="No disponible"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-center">
              <span className="text-[10px] text-accent">Próximamente con CSStats/Leetify</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Clutches</h3>
                <p className="text-xs text-muted">Situaciones 1vsX</p>
              </div>
            </div>
            <div className="space-y-4">
              {["1v1", "1v2", "1v3", "1v4", "1v5"].map((situation) => (
                <div key={situation}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono w-8">{situation}</span>
                      <span className="text-[11px] text-muted">— / —</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-muted">—</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden" />
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <span className="text-[10px] text-accent">Próximamente con CSStats/Leetify</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
