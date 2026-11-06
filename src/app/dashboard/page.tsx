"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Crosshair,
  Flame,
  Map,
  Medal,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  User2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { calculateMetrics, type MetricResult } from "@/lib/services/stats-calculator";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartContainer } from "@/components/ui/chart-container";
import { cn } from "@/lib/utils";

const curves: Record<string, number[]> = {
  green: [25, 41, 35, 58, 42, 48, 36, 55, 43, 62, 51, 59, 52, 68],
  blue: [31, 46, 42, 57, 36, 61, 44, 64, 39, 58, 49, 67, 47, 55],
  yellow: [50, 64, 52, 40, 51, 38, 45, 40, 58, 48, 44, 59, 64, 57],
  red: [59, 46, 53, 42, 48, 37, 45, 34, 41, 30, 38, 34, 45, 41],
  purple: [63, 55, 59, 46, 56, 44, 51, 39, 47, 40, 52, 59, 55, 68],
};

function Sparkline({ color, values = curves.purple }: { color: string; values?: number[] }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 200},${72 - value}`).join(" ");
  return (
    <svg viewBox="0 0 200 72" preserveAspectRatio="none" className="h-10 w-full overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,72 ${points} 200,72`} fill={`${color}12`} stroke="none" />
    </svg>
  );
}

function KpisRow({
  kd,
  hs,
  adr,
  winrate,
  faceitElo,
}: {
  kd: number | null;
  hs: number | null;
  adr: number | null;
  winrate: number | null;
  faceitElo: number | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard title="K/D Ratio" value={kd !== null ? kd.toFixed(2) : "—"} icon={<Crosshair className="h-4 w-4" />} />
      <MetricCard
        title="Win Rate"
        value={winrate !== null ? `${winrate.toFixed(0)}%` : "—"}
        icon={<Shield className="h-4 w-4" />}
      />
      <MetricCard
        title="Headshot %"
        value={hs !== null ? `${hs.toFixed(0)}%` : "—"}
        icon={<Target className="h-4 w-4" />}
      />
      <MetricCard
        title="FACEIT ELO"
        value={faceitElo !== null ? faceitElo.toString() : "—"}
        icon={<Trophy className="h-4 w-4" />}
        subtitle={faceitElo !== null ? "Conectado a FACEIT" : "Conectá FACEIT"}
      />
    </div>
  );
}

function PerformanceChart({
  kd,
  hs,
  adr,
  winrate,
}: {
  kd: number | null;
  hs: number | null;
  adr: number | null;
  winrate: number | null;
}) {
  return (
    <ChartContainer title="Evolución de rendimiento (30 días)">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["K/D", kd !== null ? kd.toFixed(2) : "—", "#34d399"],
          ["HS%", hs !== null ? `${hs.toFixed(1)}%` : "—", "#60a5fa"],
          ["ADR", adr !== null ? adr.toFixed(1) : "—", "#fbbf24"],
          ["Winrate", winrate !== null ? `${winrate}%` : "—", "#a855f7"],
        ].map(([label, value, color]) => (
          <Card key={label} padded={false} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-muted">{label}</span>
              <span className="text-sm font-bold text-foreground">{value}</span>
            </div>
            <div className="h-6 w-full flex items-end gap-1">
              {[20, 45, 30, 60, 40, 55, 35, 70].map((v, i) => (
                <div
                  key={i}
                  className="h-full w-full rounded-sm bg-surface-elevated"
                  style={{
                    height: `${Math.max(20, (v / 70) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </ChartContainer>
  );
}

function RecentMatches({ matches }: { matches: any[] }) {
  const hasData = matches.length > 0;
  return (
    <Card>
      <SectionHeader title="Partidas recientes" description="Últimas partidas competitivas" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left pb-3 text-xs font-semibold text-muted">Mapa</th>
              <th className="text-left pb-3 text-xs font-semibold text-muted">Resultado</th>
              <th className="text-right pb-3 text-xs font-semibold text-muted">K/D</th>
              <th className="text-right pb-3 text-xs font-semibold text-muted">Puntaje</th>
              <th className="text-right pb-3 text-xs font-semibold text-muted">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {hasData
              ? matches.map((match) => (
                  <tr
                    key={match.matchId}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-default"
                  >
                    <td className="py-3 text-xs text-foreground">
                      {match.map
                        ?.replace("de_", "")
                        .replace(/^./, (c: string) => c.toUpperCase()) || "Desconocido"}
                    </td>
                    <td className="py-3 text-xs">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md font-medium",
                          match.playerResult === "win"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-danger/10 text-danger border border-danger/20",
                        )}
                      >
                        {match.playerResult === "win" ? "Victoria" : "Derrota"}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-right text-foreground">
                      {match.playerKills}/{match.playerDeaths}
                    </td>
                    <td className="py-3 text-xs text-right text-foreground">
                      {match.playerScore ?? "—"}
                    </td>
                    <td className="py-3 text-xs text-right text-muted">
                      {match.startedAt
                        ? new Date(match.startedAt).toLocaleDateString("es-ES")
                        : "—"}
                    </td>
                  </tr>
                ))
              : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      Conectá FACEIT para mostrar tus últimas partidas.
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CoachIaSection({ faceitStats }: { faceitStats: any }) {
  const hasData = !!faceitStats?.lifetime;
  return (
    <Card>
      <SectionHeader
        title="Coach IA"
        description="Análisis y recomendaciones personalizadas"
        actions={
          <Link
            href="/dashboard/coach"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-default"
          >
            <Sparkles className="h-3 w-3" /> Abrir Coach
          </Link>
        }
      />
      <div className="p-4">
        {hasData ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Análisis disponible</p>
              <p className="text-xs text-muted">
                Tu Coach IA tiene datos de FACEIT para ofrecerte recomendaciones personalizadas.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Conectá FACEIT para activar el Coach IA"
            description="El Coach IA analiza tus estadísticas de FACEIT para darte consejos personalizados."
            icon={<AlertCircle className="h-6 w-6 text-muted" />}
            action={
              <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-default">
                <User2 className="h-3 w-3" /> Conectar FACEIT
              </Link>
            }
          />
        )}
      </div>
    </Card>
  );
}

function XpProgress({ profile }: { profile: any }) {
  // Valores por defecto seguros: un usuario nuevo puede no tener registro de XP
  const level =
    typeof profile?.level === "number" &&
    Number.isFinite(profile.level) &&
    profile.level > 0
      ? profile.level
      : 1;
  const xp =
    typeof profile?.xp === "number" && Number.isFinite(profile.xp)
      ? profile.xp
      : 0;

  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const progressXP = Math.max(0, xp - currentLevelXP);
  const neededXP = Math.max(1, nextLevelXP - currentLevelXP);
  const pct = Math.min(100, Math.max(0, (progressXP / neededXP) * 100));

  return (
    <Card>
      <SectionHeader title="Progreso de XP" description="Experiencia y nivel actual" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted">Nivel {level}</span>
          <span className="text-xs font-bold text-foreground">{xp.toLocaleString()} XP</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-muted">
          <span>{progressXP.toLocaleString()} / {neededXP.toLocaleString()} XP</span>
          <span>Siguiente nivel: {level + 1}</span>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardOverview() {
  const { user, loading, cs2Stats, faceitStats, faceitMatches } = useUser();
  const name = user?.name?.split(" ")[0] || "Jugador";

  const metrics = useMemo(() => calculateMetrics(cs2Stats, faceitStats, faceitMatches), [
    cs2Stats,
    faceitStats,
    faceitMatches,
  ]);

  const recent = useMemo(() => faceitMatches.slice(0, 5), [faceitMatches]);

  const kd: number | null =
    cs2Stats?.totalKD ?? (Number(faceitStats?.lifetime?.["Average K/D Ratio"]) || null);
  const hs: number | null =
    cs2Stats?.totalHSPct ?? (Number(faceitStats?.lifetime?.["Average Headshots %"]) || null);
  const adr: number | null = Number(faceitStats?.lifetime?.ADR) || null;
  const winrate: number | null =
    cs2Stats?.totalWinPct ?? (Number(faceitStats?.lifetime?.["Win Rate %"]) || null);
  const faceitElo: number | null =
    Number(faceitStats?.lifetime?.["Faceit ELO"] ?? faceitStats?.lifetime?.faceit_elo) || null;

  const hasData = metrics.general.score !== null || kd !== null || winrate !== null;

  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12 ? "¡Buenos días" : hour >= 12 && hour < 20 ? "¡Buenas tardes" : "¡Buenas noches";

  if (loading) {
    return (
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[60vh]">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="100%" height="120" className="rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-shell mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        icon={<User2 className="h-6 w-6 text-primary" />}
        title={
          <span className="flex items-center gap-2">
            {greeting}, <span className="text-primary">{name}</span>!
          </span>
        }
        description="Aquí tienes tu resumen de rendimiento y actividad competitiva."
        actions={
          <div className="flex items-center gap-2">
            <Avatar src={user?.avatar ?? undefined} fallback={name.slice(0, 2).toUpperCase()} size="lg" />
          </div>
        }
      />

      <KpisRow kd={kd} hs={hs} adr={adr} winrate={winrate} faceitElo={faceitElo} />

      <PerformanceChart kd={kd} hs={hs} adr={adr} winrate={winrate} />

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentMatches matches={recent} />
        <CoachIaSection faceitStats={faceitStats} />
        {user && <XpProgress profile={user} />}
      </div>

      {hasData && (
        <Card>
          <SectionHeader title="Informe del Coach IA" description="Recomendaciones basadas en tu rendimiento" />
          <div className="p-4 space-y-3">
            {metrics.aim.score !== null && (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500">
                  <CheckCircle2 size={10} className="text-[6px] text-white" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    AIM: {Math.round(metrics.aim.score)}/100
                  </p>
                  <p className="text-xs text-muted">
                    {metrics.aim.details.slice(0, 2).join(" · ") || "Mantén tu práctica constante de puntería."}
                  </p>
                </div>
              </div>
            )}
            {metrics.positioning.score !== null && (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 place-items-center rounded-full bg-primary">
                  <Sparkles size={10} className="text-[6px] text-white" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Posicionamiento: {Math.round(metrics.positioning.score)}/100
                  </p>
                  <p className="text-xs text-muted">
                    {metrics.positioning.details.slice(0, 2).join(" · ") || "Trabaja en tu posicionamiento por mapa."}
                  </p>
                </div>
              </div>
            )}
            {!metrics.aim.score && !metrics.positioning.score && (
              <p className="text-sm text-muted text-center py-4">
                Conectá Steam y FACEIT para obtener un informe detallado.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
