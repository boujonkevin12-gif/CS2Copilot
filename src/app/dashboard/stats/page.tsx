"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const mapWinrates = [
  { name: "Dust II", ct: 58, tt: 72, overall: 68, matches: 287 },
  { name: "Mirage", ct: 52, tt: 64, overall: 58, matches: 245 },
  { name: "Inferno", ct: 74, tt: 70, overall: 72, matches: 213 },
  { name: "Anubis", ct: 56, tt: 66, overall: 61, matches: 167 },
  { name: "Nuke", ct: 48, tt: 60, overall: 54, matches: 142 },
  { name: "Overpass", ct: 72, tt: 68, overall: 70, matches: 108 },
  { name: "Ancient", ct: 60, tt: 68, overall: 64, matches: 52 },
  { name: "Vertigo", ct: 42, tt: 54, overall: 48, matches: 33 },
];

const overallCT = 58.4;
const overallTT = 65.2;

const pistolRounds = {
  total: 248,
  wins: 142,
  losses: 106,
  winrate: 57.3,
  ctPistol: 62.1,
  ttPistol: 52.4,
  firstKills: 312,
  averageClutchRate: 34.2,
};

const clutchStats = [
  { situation: "1v1", wins: 87, losses: 63, winrate: 58.0 },
  { situation: "1v2", wins: 34, losses: 41, winrate: 45.3 },
  { situation: "1v3", wins: 12, losses: 28, winrate: 30.0 },
  { situation: "1v4", wins: 4, losses: 15, winrate: 21.1 },
  { situation: "1v5", wins: 1, losses: 8, winrate: 11.1 },
];

const openingStats = {
  entryKills: {
    total: 1847,
    perRound: 0.82,
    successRate: 54.2,
    kda: 1.12,
  },
  openingDeaths: {
    total: 1203,
    perRound: 0.54,
    tradedRate: 68.4,
    survivalRate: 31.6,
  },
};

const accuracyData = {
  overall: 34.2,
  headshot: 52.3,
  bodyshot: 31.8,
  legshot: 15.9,
  byWeapon: [
    { name: "AK-47", accuracy: 28.4, headshot: 61 },
    { name: "M4A1-S", accuracy: 31.2, headshot: 48 },
    { name: "AWP", accuracy: 42.1, headshot: 72 },
    { name: "Deagle", accuracy: 35.7, headshot: 68 },
    { name: "USP-S", accuracy: 38.9, headshot: 54 },
    { name: "Glock", accuracy: 26.3, headshot: 32 },
    { name: "M4A4", accuracy: 29.8, headshot: 45 },
    { name: "Galil", accuracy: 27.1, headshot: 42 },
  ],
};

const sprayData = {
  accuracy: 18.7,
  burstAccuracy: 32.4,
  tapAccuracy: 41.2,
  patterns: [
    { range: "Cercano (0-10m)", accuracy: 28.4, spray: 22.1 },
    { range: "Medio (10-25m)", accuracy: 19.2, spray: 14.8 },
    { range: "Lejano (25m+)", accuracy: 12.1, spray: 8.3 },
  ],
  bestRange: "Cercano (0-10m)",
  improvement: "+2.4%",
};

const heatmapData = [
  { x: 25, y: 35, intensity: 0.9 },
  { x: 30, y: 30, intensity: 0.7 },
  { x: 35, y: 40, intensity: 0.8 },
  { x: 20, y: 45, intensity: 0.6 },
  { x: 40, y: 25, intensity: 0.5 },
  { x: 50, y: 35, intensity: 0.85 },
  { x: 55, y: 30, intensity: 0.65 },
  { x: 60, y: 40, intensity: 0.75 },
  { x: 45, y: 45, intensity: 0.55 },
  { x: 65, y: 35, intensity: 0.9 },
  { x: 70, y: 30, intensity: 0.7 },
  { x: 75, y: 40, intensity: 0.8 },
  { x: 50, y: 50, intensity: 0.4 },
  { x: 30, y: 55, intensity: 0.6 },
  { x: 70, y: 55, intensity: 0.65 },
  { x: 40, y: 60, intensity: 0.45 },
  { x: 60, y: 60, intensity: 0.5 },
  { x: 35, y: 65, intensity: 0.35 },
  { x: 55, y: 65, intensity: 0.4 },
  { x: 45, y: 70, intensity: 0.3 },
  { x: 50, y: 20, intensity: 0.7 },
  { x: 25, y: 25, intensity: 0.5 },
  { x: 75, y: 25, intensity: 0.55 },
  { x: 80, y: 45, intensity: 0.4 },
  { x: 20, y: 60, intensity: 0.35 },
  { x: 30, y: 75, intensity: 0.25 },
  { x: 70, y: 70, intensity: 0.3 },
  { x: 85, y: 50, intensity: 0.2 },
  { x: 15, y: 40, intensity: 0.45 },
  { x: 60, y: 20, intensity: 0.6 },
  { x: 40, y: 30, intensity: 0.75 },
  { x: 55, y: 45, intensity: 0.65 },
  { x: 35, y: 50, intensity: 0.55 },
  { x: 65, y: 50, intensity: 0.5 },
  { x: 45, y: 35, intensity: 0.8 },
  { x: 30, y: 40, intensity: 0.7 },
  { x: 70, y: 45, intensity: 0.6 },
  { x: 50, y: 55, intensity: 0.35 },
  { x: 40, y: 15, intensity: 0.5 },
  { x: 60, y: 15, intensity: 0.45 },
  { x: 50, y: 75, intensity: 0.2 },
];

function Heatmap() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="aspect-[16/10] glass rounded-xl overflow-hidden relative">
        {/* Map grid background */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02]" />

        {/* Map outline - simplified Dust II */}
        <svg viewBox="0 0 100 62.5" className="absolute inset-0 w-full h-full">
          {/* Map boundaries */}
          <rect x="5" y="5" width="90" height="52.5" rx="2" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />

          {/* Map zones */}
          <rect x="8" y="8" width="25" height="20" rx="1" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          <text x="20.5" y="19" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.5" fontFamily="monospace">A Site</text>

          <rect x="67" y="8" width="25" height="20" rx="1" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          <text x="79.5" y="19" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.5" fontFamily="monospace">B Site</text>

          <rect x="38" y="8" width="22" height="14" rx="1" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          <text x="49" y="16.5" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.5" fontFamily="monospace">Mid</text>

          <rect x="8" y="34" width="30" height="20" rx="1" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          <text x="23" y="45" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.5" fontFamily="monospace">CT Spawn</text>

          <rect x="62" y="34" width="30" height="20" rx="1" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          <text x="77" y="45" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.5" fontFamily="monospace">T Spawn</text>

          <rect x="35" y="30" width="30" height="10" rx="1" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          <text x="50" y="37" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="2.5" fontFamily="monospace">Long / Short</text>

          {/* Heatmap dots */}
          {heatmapData.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r={3 + point.intensity * 4}
                fill={`rgba(59, 130, 246, ${point.intensity * 0.5})`}
                className="transition-all duration-300"
                style={{
                  filter: `blur(${2 + (1 - point.intensity) * 3}px)`,
                }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={1 + point.intensity * 1.5}
                fill={`rgba(59, 130, 246, ${point.intensity * 0.8})`}
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 glass rounded-lg px-3 py-2">
          <div className="text-[10px] text-muted mb-1.5">Densidad de Kills</div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-8 rounded-sm" style={{ background: "linear-gradient(to right, rgba(59,130,246,0.2), rgba(59,130,246,0.9))" }} />
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span>Baja</span>
              <span className="mx-1">→</span>
              <span>Alta</span>
            </div>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-3 left-3 glass rounded-lg px-3 py-2">
          <div className="text-[10px] text-muted mb-1">Total Kills en Mapa</div>
          <div className="text-lg font-bold text-primary">4,823</div>
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
          <div className="text-2xl font-bold font-mono">{value}%</div>
          {sublabel && <div className="text-[10px] text-muted">{sublabel}</div>}
        </div>
      </div>
      <div className="text-xs text-muted mt-2 font-medium">{label}</div>
    </div>
  );
}

function BarStat({ label, value, max = 100, color, suffix = "%" }: { label: string; value: number; max?: number; color: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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

export default function StatsPage() {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          Estadísticas Detalladas
        </h1>
        <p className="text-sm text-muted mt-1">
          Análisis profundo de tu rendimiento con datos de las últimas 1,247 partidas.
        </p>
      </motion.div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Heatmap de Kills</h3>
                <p className="text-xs text-muted">Distribución de eliminaciones por zona - Dust II</p>
              </div>
            </div>
            <div className="flex gap-1">
              {["Dust II", "Mirage", "Inferno"].map((map) => (
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
          <Heatmap />
        </GlassCard>
      </motion.div>

      {/* CT vs TT Winrate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
                value={overallCT}
                size={140}
                strokeWidth={10}
                color="var(--color-primary)"
                label="Promedio General"
                sublabel="248 partidas"
              />
            </div>
            <div className="mt-4 space-y-2">
              {mapWinrates.slice(0, 4).map((map) => (
                <div key={map.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{map.name}</span>
                  <span className={`font-mono ${map.ct >= 60 ? "text-success" : map.ct >= 50 ? "text-foreground" : "text-danger"}`}>
                    {map.ct}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
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
                value={overallTT}
                size={140}
                strokeWidth={10}
                color="var(--color-accent)"
                label="Promedio General"
                sublabel="248 partidas"
              />
            </div>
            <div className="mt-4 space-y-2">
              {mapWinrates.slice(0, 4).map((map) => (
                <div key={map.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{map.name}</span>
                  <span className={`font-mono ${map.tt >= 60 ? "text-success" : map.tt >= 50 ? "text-foreground" : "text-danger"}`}>
                    {map.tt}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Winrate por Mapa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard padding="md" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Win Rate por Mapa</h3>
                <p className="text-xs text-muted">Overall en todos los mapas</p>
              </div>
            </div>
            <div className="space-y-3">
              {mapWinrates.map((map, i) => (
                <div key={map.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted w-16 shrink-0 truncate">{map.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${map.overall}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                      className={`h-full rounded-full ${
                        map.overall >= 65 ? "bg-success" : map.overall >= 55 ? "bg-primary" : "bg-danger"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-mono w-10 text-right">{map.overall}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Pistol Rounds + Clutches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pistol Rounds */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Swords className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Rondas Pistol</h3>
                <p className="text-xs text-muted">Rondas 1 y 12 de cada mapa</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-success font-mono">{pistolRounds.winrate}%</div>
                <div className="text-xs text-muted mt-1">Win Rate Pistol</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold font-mono">{pistolRounds.wins}<span className="text-muted text-lg">/{pistolRounds.total}</span></div>
                <div className="text-xs text-muted mt-1">Victorias</div>
              </div>
            </div>

            <div className="space-y-4">
              <BarStat label="Pistol CT" value={pistolRounds.ctPistol} color="var(--color-primary)" />
              <BarStat label="Pistol TT" value={pistolRounds.ttPistol} color="var(--color-accent)" />
              <BarStat label="First Kill Rate" value={62.1} color="var(--color-success)" />
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs text-success">+3.2% vs mes anterior</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Clutches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard padding="md">
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
              {clutchStats.map((clutch, i) => {
                const total = clutch.wins + clutch.losses;
                const winsPercent = (clutch.wins / total) * 100;
                const lossesPercent = (clutch.losses / total) * 100;

                return (
                  <div key={clutch.situation}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono w-8">{clutch.situation}</span>
                        <span className="text-[11px] text-muted">
                          {clutch.wins}W / {clutch.losses}L
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-medium ${
                        clutch.winrate >= 50 ? "text-success" : clutch.winrate >= 30 ? "text-foreground" : "text-danger"
                      }`}>
                        {clutch.winrate}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${winsPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        className="h-full bg-success/60 rounded-l-full"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lossesPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        className="h-full bg-danger/30 rounded-r-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">138</div>
                <div className="text-[11px] text-muted">Total Clutches</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-success">44.2%</div>
                <div className="text-[11px] text-muted">Win Rate Total</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Entry Kills + Opening Deaths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Entry Kills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GlassCard padding="md" glow>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Entry Kills</h3>
                <p className="text-xs text-muted">Primeras eliminaciones por ronda</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-success font-mono">{openingStats.entryKills.total.toLocaleString()}</div>
                <div className="text-xs text-muted mt-1">Total Entry Kills</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold font-mono">{openingStats.entryKills.perRound}</div>
                <div className="text-xs text-muted mt-1">Por Ronda</div>
              </div>
            </div>

            <div className="space-y-4">
              <BarStat label="Success Rate" value={openingStats.entryKills.successRate} color="var(--color-success)" />
              <BarStat label="Entry K/D" value={openingStats.entryKills.kda} max={2} suffix="" color="var(--color-primary)" />
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs text-success">+5.8% success rate vs mes anterior</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Opening Deaths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center">
                <Skull className="h-5 w-5 text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Opening Deaths</h3>
                <p className="text-xs text-muted">Muertes tempranas por ronda</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-danger font-mono">{openingStats.openingDeaths.total.toLocaleString()}</div>
                <div className="text-xs text-muted mt-1">Total Opening Deaths</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-3xl font-bold font-mono">{openingStats.openingDeaths.perRound}</div>
                <div className="text-xs text-muted mt-1">Por Ronda</div>
              </div>
            </div>

            <div className="space-y-4">
              <BarStat label="Traded Rate" value={openingStats.openingDeaths.tradedRate} color="var(--color-accent)" />
              <BarStat label="Survival Rate" value={openingStats.openingDeaths.survivalRate} color="var(--color-primary)" />
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-xs text-success">-2.1% opening deaths vs mes anterior</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Accuracy + Spray */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
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
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-success font-mono">{accuracyData.headshot}%</div>
                <div className="text-[11px] text-muted mt-1">Headshot</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary font-mono">{accuracyData.bodyshot}%</div>
                <div className="text-[11px] text-muted mt-1">Bodyshot</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-danger font-mono">{accuracyData.legshot}%</div>
                <div className="text-[11px] text-muted mt-1">Legshot</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted font-medium mb-2">Por Arma</div>
              {accuracyData.byWeapon.map((weapon, i) => (
                <div key={weapon.name} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted w-16 shrink-0">{weapon.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(weapon.accuracy / 50) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      className="h-full rounded-full bg-primary/60"
                    />
                  </div>
                  <span className="text-[11px] font-mono w-12 text-right">{weapon.accuracy}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Spray */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
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
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono">{sprayData.tapAccuracy}%</div>
                <div className="text-[11px] text-muted mt-1">Tap</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono">{sprayData.burstAccuracy}%</div>
                <div className="text-[11px] text-muted mt-1">Burst</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold font-mono">{sprayData.accuracy}%</div>
                <div className="text-[11px] text-muted mt-1">Spray</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted font-medium mb-2">Por Distancia</div>
              {sprayData.patterns.map((pattern, i) => (
                <div key={pattern.range} className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{pattern.range}</span>
                    <Badge variant={pattern.accuracy >= 25 ? "success" : pattern.accuracy >= 15 ? "accent" : "danger"} size="sm">
                      {pattern.accuracy}%
                    </Badge>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(pattern.accuracy / 35) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-400/60 to-orange-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Mejor rango</span>
                <span className="text-xs font-medium text-success">{sprayData.bestRange}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted">Mejora mensual</span>
                <span className="text-xs font-medium text-success">{sprayData.improvement}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
