"use client";

import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const playerProfile = {
  name: "Kevin",
  level: 10,
  elo: 1847,
  premierRating: 14832,
  winrate: 64.8,
  hsPercent: 52.3,
  adr: 89.4,
  kd: 1.67,
  totalMatches: 1247,
  hoursPlayed: 3420,
  avatar: "KV",
};

const rankData = {
  current: "Supremo",
  next: "Global Elite",
  progress: 78,
  eloMin: 1800,
  eloMax: 2000,
};

const recentMatches = [
  { map: "Dust II", result: "Victoria", score: "16-12", kills: 28, deaths: 14, assists: 5, rating: 1.45, hs: 62, time: "hace 2h", weapon: "AK-47" },
  { map: "Mirage", result: "Derrota", score: "11-16", kills: 19, deaths: 18, assists: 4, rating: 0.98, hs: 44, time: "hace 4h", weapon: "M4A1-S" },
  { map: "Inferno", result: "Victoria", score: "16-8", kills: 31, deaths: 10, assists: 7, rating: 1.72, hs: 58, time: "hace 6h", weapon: "AK-47" },
  { map: "Anubis", result: "Victoria", score: "16-14", kills: 24, deaths: 16, assists: 3, rating: 1.18, hs: 50, time: "hace 8h", weapon: "AWP" },
  { map: "Nuke", result: "Derrota", score: "9-16", kills: 15, deaths: 19, assists: 2, rating: 0.76, hs: 38, time: "hace 1d", weapon: "M4A4" },
  { map: "Overpass", result: "Victoria", score: "16-6", kills: 26, deaths: 9, assists: 4, rating: 1.65, hs: 65, time: "hace 1d", weapon: "AK-47" },
  { map: "Ancient", result: "Victoria", score: "16-11", kills: 22, deaths: 15, assists: 6, rating: 1.28, hs: 52, time: "hace 2d", weapon: "AK-47" },
];

const mapStats = [
  { name: "Dust II", matches: 287, winrate: 68, avgRating: 1.32, color: "#f97316" },
  { name: "Mirage", matches: 245, winrate: 58, avgRating: 1.15, color: "#3b82f6" },
  { name: "Inferno", matches: 213, winrate: 72, avgRating: 1.41, color: "#ef4444" },
  { name: "Anubis", matches: 167, winrate: 61, avgRating: 1.22, color: "#22c55e" },
  { name: "Nuke", matches: 142, winrate: 54, avgRating: 1.05, color: "#a855f7" },
  { name: "Overpass", matches: 108, winrate: 70, avgRating: 1.35, color: "#06b6d4" },
  { name: "Ancient", matches: 52, winrate: 64, avgRating: 1.24, color: "#84cc16" },
  { name: "Vertigo", matches: 33, winrate: 48, avgRating: 0.94, color: "#ec4899" },
];

const weaponStats = [
  { name: "AK-47", kills: 4823, headshots: 61, accuracy: 28.4 },
  { name: "M4A1-S", kills: 3241, headshots: 48, accuracy: 31.2 },
  { name: "AWP", kills: 1876, headshots: 72, accuracy: 42.1 },
  { name: "Desert Eagle", kills: 987, headshots: 68, accuracy: 35.7 },
  { name: "USP-S", kills: 856, headshots: 54, accuracy: 38.9 },
];

const ratingHistory = [
  { month: "Ene", rating: 1.12, elo: 1620 },
  { month: "Feb", rating: 1.18, elo: 1680 },
  { month: "Mar", rating: 1.24, elo: 1720 },
  { month: "Abr", rating: 1.31, elo: 1760 },
  { month: "May", rating: 1.38, elo: 1810 },
  { month: "Jun", rating: 1.45, elo: 1847 },
  { month: "Jul", rating: 1.52, elo: 1890 },
];

const weeklyPerformance = [
  { day: "Lun", kills: 89, deaths: 42, wins: 4, losses: 1 },
  { day: "Mar", kills: 72, deaths: 55, wins: 2, losses: 3 },
  { day: "Mié", kills: 105, deaths: 38, wins: 5, losses: 0 },
  { day: "Jue", kills: 58, deaths: 61, wins: 1, losses: 4 },
  { day: "Vie", kills: 94, deaths: 45, wins: 4, losses: 1 },
  { day: "Sáb", kills: 112, deaths: 35, wins: 6, losses: 1 },
  { day: "Dom", kills: 67, deaths: 52, wins: 2, losses: 2 },
];

const inventoryValue = {
  total: 12847.50,
  change: 342.20,
  items: 47,
  knives: 3,
  gloves: 2,
};

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

function MiniChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 10);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RatingChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxRating = 1.8;
  const minRating = 1.0;
  const chartHeight = 200;
  const chartWidth = 100;

  return (
    <div className="relative">
      <div className="flex items-end gap-2 h-[200px]">
        {ratingHistory.map((data, i) => {
          const height = ((data.rating - minRating) / (maxRating - minRating)) * 100;
          return (
            <div
              key={data.month}
              className="flex-1 flex flex-col items-center gap-2 relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === i && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 glass rounded-lg px-3 py-1.5 text-center z-10 whitespace-nowrap"
                >
                  <div className="text-xs font-bold text-primary">{data.rating.toFixed(2)}</div>
                  <div className="text-[10px] text-muted">ELO: {data.elo}</div>
                </motion.div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className="w-full rounded-lg relative overflow-hidden cursor-pointer"
                style={{
                  background: hoveredIndex === i
                    ? "linear-gradient(to top, rgba(59,130,246,0.4), rgba(59,130,246,0.8))"
                    : "linear-gradient(to top, rgba(59,130,246,0.2), rgba(59,130,246,0.5))",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.05]" />
              </motion.div>
              <span className="text-[11px] text-muted">{data.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyChart() {
  const maxTotal = Math.max(...weeklyPerformance.map(d => d.kills + d.deaths));

  return (
    <div className="flex items-end gap-2 h-40">
      {weeklyPerformance.map((data, i) => {
        const totalHeight = ((data.kills + data.deaths) / maxTotal) * 100;
        const killsHeight = (data.kills / (data.kills + data.deaths)) * totalHeight;
        return (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col gap-0.5" style={{ height: `${totalHeight}%` }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.kills / (data.kills + data.deaths)) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="w-full rounded-t-md bg-success/50"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.deaths / (data.kills + data.deaths)) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }}
                className="w-full rounded-b-md bg-danger/30"
              />
            </div>
            <span className="text-[11px] text-muted">{data.day}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardOverview() {
  const [chartPeriod, setChartPeriod] = useState<"semana" | "mes" | "trimestre">("mes");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard padding="lg" glow>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/20">
                {playerProfile.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Bienvenido, <span className="gradient-text">{playerProfile.name}</span>
              </h1>
              <p className="text-sm text-muted mt-1">
                Aquí está tu resumen de rendimiento. Has jugado {playerProfile.totalMatches.toLocaleString()} partidas en {playerProfile.hoursPlayed.toLocaleString()} horas.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Rango Actual</div>
                <Badge variant="accent" size="md">
                  <Crown className="h-3 w-3 mr-1" />
                  {rankData.current}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted mb-1">Siguiente Rango</div>
                <Badge variant="default" size="md">
                  <Star className="h-3 w-3 mr-1" />
                  {rankData.next}
                </Badge>
              </div>
            </div>
          </div>

          {/* Rank Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Progreso de Rango</span>
              <span className="text-xs text-primary font-mono">{playerProfile.elo} / {rankData.eloMax} ELO</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rankData.progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-500 to-primary"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {[
          { label: "Nivel", value: playerProfile.level, suffix: "", icon: Award, color: "text-primary", bg: "bg-primary/10", change: "+2", up: true },
          { label: "ELO", value: playerProfile.elo, suffix: "", icon: TrendingUp, color: "text-success", bg: "bg-success/10", change: "+47", up: true },
          { label: "Premier Rating", value: playerProfile.premierRating, suffix: "", icon: Crown, color: "text-accent", bg: "bg-accent/10", change: "+312", up: true },
          { label: "Win Rate", value: playerProfile.winrate, suffix: "%", icon: Trophy, color: "text-success", bg: "bg-success/10", change: "+1.2%", up: true },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-success" : "text-danger"}`}>
                  {stat.up ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold font-mono">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {[
          { label: "HS%", value: playerProfile.hsPercent, suffix: "%", icon: Crosshair, color: "text-primary", bg: "bg-primary/10", change: "+2.1%", up: true },
          { label: "ADR", value: playerProfile.adr, suffix: "", icon: Zap, color: "text-accent", bg: "bg-accent/10", change: "+3.4", up: true },
          { label: "K/D", value: playerProfile.kd, suffix: "", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10", change: "+0.08", up: true, decimals: 2 },
          { label: "Horas Jugadas", value: playerProfile.hoursPlayed, suffix: "h", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10", change: "+42h", up: true },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <GlassCard padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-success" : "text-danger"}`}>
                  {stat.up ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold font-mono">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} decimals={(stat as any).decimals || 0} />
              </div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rating Evolution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold">Evolución de Rating</h3>
              <div className="flex gap-1">
                {(["semana", "mes", "trimestre"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      chartPeriod === period
                        ? "bg-primary/20 text-primary"
                        : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <RatingChart />
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-xs text-muted">Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-muted">+270 ELO este mes</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Skills Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard padding="md" className="h-full">
            <h3 className="text-sm font-semibold mb-6">Habilidades</h3>
            <div className="space-y-5">
              {[
                { label: "Puntería", value: 82, color: "var(--color-primary)" },
                { label: "Juego Mental", value: 88, color: "var(--color-success)" },
                { label: "Utilidades", value: 65, color: "var(--color-accent)" },
                { label: "Movimiento", value: 74, color: "#a855f7" },
                { label: "Trabajo en Equipo", value: 91, color: "#06b6d4" },
                { label: "Comunicación", value: 85, color: "#84cc16" },
              ].map((skill) => (
                <div key={skill.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted">{skill.label}</span>
                    <span className="text-xs font-medium font-mono">{skill.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Weekly Performance + Best/Worst Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold">Rendimiento Semanal</h3>
              <Badge variant="accent" size="sm">Esta Semana</Badge>
            </div>
            <WeeklyChart />
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="text-xs text-muted">Victorias</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-danger/40" />
                <span className="text-xs text-muted">Derrotas</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Best Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard padding="md" glow>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Mapa Favorito</h3>
                <p className="text-xs text-muted">Mayor cantidad de victorias</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">{mapStats[2].name}</span>
                <Badge variant="success" size="sm">{mapStats[2].winrate}% WR</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted">Partidas</span>
                  <div className="font-semibold">{mapStats[2].matches}</div>
                </div>
                <div>
                  <span className="text-muted">Rating Avg</span>
                  <div className="font-semibold text-success">{mapStats[2].avgRating}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Worst Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Peor Mapa</h3>
                <p className="text-xs text-muted">Menor tasa de victoria</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold">{mapStats[7].name}</span>
                <Badge variant="danger" size="sm">{mapStats[7].winrate}% WR</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted">Partidas</span>
                  <div className="font-semibold">{mapStats[7].matches}</div>
                </div>
                <div>
                  <span className="text-muted">Rating Avg</span>
                  <div className="font-semibold text-danger">{mapStats[7].avgRating}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Weapon Stats + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best Weapon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Swords className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Mejor Arma</h3>
                  <p className="text-xs text-muted">Mayor cantidad de kills</p>
                </div>
              </div>
              <Badge variant="accent" size="sm">
                <Award className="h-3 w-3 mr-1" />
                Top 1
              </Badge>
            </div>
            <div className="space-y-3">
              {weaponStats.map((weapon, i) => (
                <div key={weapon.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-4 font-mono">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{weapon.name}</span>
                      <span className="text-xs text-muted font-mono">{weapon.kills.toLocaleString()} kills</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(weapon.kills / weaponStats[0].kills) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Inventory Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard padding="md" glow>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Valor del Inventario</h3>
                <p className="text-xs text-muted">Valor estimado en el mercado</p>
              </div>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold gradient-text font-mono">
                  ${inventoryValue.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success font-medium">+${inventoryValue.change.toFixed(2)} hoy</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
                <div className="text-center">
                  <div className="text-lg font-bold">{inventoryValue.items}</div>
                  <div className="text-[11px] text-muted">Objetos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{inventoryValue.knives}</div>
                  <div className="text-[11px] text-muted">Cuchillos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{inventoryValue.gloves}</div>
                  <div className="text-[11px] text-muted">Guantes</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Map Performance Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold">Rendimiento por Mapa</h3>
            <a
              href="/dashboard/analytics"
              className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
              Ver Análisis Completo
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mapStats.map((map, i) => (
              <motion.div
                key={map.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.05 }}
                className="glass rounded-xl p-3 hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{map.name}</span>
                  <span className="text-xs font-mono" style={{ color: map.color }}>
                    {map.winrate}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${map.winrate}%` }}
                    transition={{ duration: 0.8, delay: 1.1 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: map.color }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-muted">
                  <span>{map.matches} partidas</span>
                  <span>{map.avgRating} avg</span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Matches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold">Últimas Partidas</h3>
            <a
              href="/dashboard/matches"
              className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
              Ver Todas
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Mapa</th>
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Resultado</th>
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Marcador</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">K/D/A</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">HS%</th>
                  <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Rating</th>
                  <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((match, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.05 }}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-sm font-medium">{match.map}</td>
                    <td className="py-3">
                      <Badge variant={match.result === "Victoria" ? "success" : "danger"} size="sm">
                        {match.result}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted font-mono">{match.score}</td>
                    <td className="py-3 text-sm text-center text-muted font-mono">
                      {match.kills}/{match.deaths}/{match.assists}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-xs font-mono ${match.hs >= 55 ? "text-success" : match.hs >= 45 ? "text-foreground" : "text-muted"}`}>
                        {match.hs}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-sm font-semibold font-mono ${
                        match.rating >= 1.2 ? "text-success" : match.rating >= 1.0 ? "text-foreground" : "text-danger"
                      }`}>
                        {match.rating.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs text-muted">{match.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
