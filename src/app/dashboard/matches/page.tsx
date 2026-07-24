"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Calendar, Loader2, RefreshCw, Gamepad2, Link2 } from "lucide-react";
import { useUser } from "@/lib/user-context";
import Link from "next/link";
import { useState, useMemo } from "react";

const MAP_LABELS: Record<string, string> = {
  de_dust2: "Dust II",
  de_mirage: "Mirage",
  de_inferno: "Inferno",
  de_anubis: "Anubis",
  de_nuke: "Nuke",
  de_overpass: "Overpass",
  de_ancient: "Ancient",
  de_vertigo: "Vertigo",
};

function formatDate(ts: number) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" });
}

function formatTime(ts: number) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(started: number, finished: number) {
  if (!started || !finished) return "—";
  const mins = Math.round((finished - started) / 60);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

type MatchType = {
  matchId: string;
  map: string;
  mode: string;
  status: string;
  startedAt: number;
  finishedAt: number;
  teams: Record<string, { team_id: string; players: { player_id: string }[] }>;
  playerResult: string;
  playerStats: Record<string, string> | null;
};

function getMatchResult(match: { playerResult: string; results?: { winner: string; score: { faction1: number; faction2: number } }; teams: Record<string, { team_id: string; players: { player_id: string }[] }> }, faceitPlayerId: string): { result: string; color: string } {
  if (match.playerResult === "win") return { result: "Victoria", color: "text-emerald-400" };
  if (match.playerResult === "lose") return { result: "Derrota", color: "text-red-400" };
  return { result: "?", color: "text-zinc-400" };
}

function getPlayerStats(match: { playerStats: Record<string, string> | null }, faceitPlayerId: string) {
  if (!match.playerStats) return null;
  const ps = match.playerStats;
  return {
    kills: parseInt(ps.Kills || "0", 10),
    deaths: parseInt(ps.Deaths || "0", 10),
    assists: parseInt(ps.Assists || "0", 10),
    kd: parseFloat(ps["K/D Ratio"] || ps["K/D"] || "0"),
    hsPercent: parseFloat(ps["HS%"] || "0"),
  };
}

export default function MatchesPage() {
  const { user, faceitMatches, loadingFaceitMatches, syncFaceitMatches } = useUser();
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const faceitPlayerId = user?.faceitPlayerId;

  const filteredMatches = useMemo(() => {
    if (!search.trim()) return faceitMatches;
    const q = search.toLowerCase();
    return faceitMatches.filter((m) => {
      const mapName = MAP_LABELS[m.map] || m.map;
      return mapName.toLowerCase().includes(q) || m.map.toLowerCase().includes(q) || m.mode.toLowerCase().includes(q);
    });
  }, [faceitMatches, search]);

  const summary = useMemo(() => {
    if (!faceitPlayerId || !faceitMatches.length) return { wins: 0, losses: 0, winRate: 0 };
    let wins = 0;
    let losses = 0;
    for (const m of faceitMatches) {
      const r = getMatchResult(m, faceitPlayerId);
      if (r.result === "Victoria") wins++;
      else if (r.result === "Derrota") losses++;
    }
    const total = wins + losses;
    return { wins, losses, winRate: total > 0 ? Math.round((wins / total) * 100) : 0 };
  }, [faceitMatches, faceitPlayerId]);

  const handleSync = async () => {
    setSyncing(true);
    await syncFaceitMatches();
    setSyncing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="text-center max-w-md">
          <Gamepad2 className="h-12 w-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Conecta tu Steam</h2>
          <p className="text-sm text-zinc-400 mb-4">Inicia sesión con Steam para ver tu historial de partidas.</p>
          <a href="/login" className="inline-flex items-center gap-2 rounded-xl border border-[rgba(169,149,255,0.12)] bg-gradient-to-br from-[rgba(20,20,37,0.94)] to-[rgba(10,11,22,0.9)] shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_12px_35px_rgba(0,0,0,.13)] px-6 py-3 text-sm font-semibold hover:bg-white/[0.06] transition-all">
            Conectar Steam
          </a>
        </GlassCard>
      </div>
    );
  }

  if (!faceitPlayerId) {
    return (
      <div className="dashboard-shell mx-auto max-w-[1400px] space-y-6">
        <PageHeader
          icon={<Gamepad2 className="h-5 w-5 text-violet-400" />}
          title="Historial de Partidas"
          description="Explora y analiza todas tus partidas anteriores."
        />
        <GlassCard className="text-center max-w-md mx-auto">
          <Gamepad2 className="h-12 w-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Conecta FACEIT</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Vincula tu cuenta de FACEIT para ver tu historial de partidas, estadísticas por mapa y rendimiento detallado.
          </p>
          <Link href="/dashboard/settings">
            <Button variant="primary" size="sm" icon={<Link2 className="h-4 w-4" />}>
              Conectar FACEIT
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="dashboard-shell mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        icon={<Gamepad2 className="h-5 w-5 text-violet-400" />}
        title="Historial de Partidas"
        description={`FACEIT: ${user.faceitNickname} · Nivel ${user.faceitLevel ?? "—"} · ELO ${user.faceitElo ?? "—"}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
            <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />}>
              Exportar CSV
            </Button>
          </div>
        }
      />

      <GlassCard hover={false}>
        <div className="flex items-center gap-3 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por mapa, modo..."
              className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          </div>
          <Button variant="ghost" size="sm" icon={<Filter className="h-4 w-4" />}>
            Filtrar
          </Button>
          <Button variant="ghost" size="sm" icon={<Calendar className="h-4 w-4" />}>
            Rango de Fechas
          </Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-3 gap-4 mb-2">
        <div className="panel p-5 text-center">
          <div className="text-2xl font-bold text-emerald-400">{faceitMatches.length ? summary.wins : "—"}</div>
          <div className="text-xs text-zinc-400">Victorias</div>
        </div>
        <div className="panel p-5 text-center">
          <div className="text-2xl font-bold text-red-400">{faceitMatches.length ? summary.losses : "—"}</div>
          <div className="text-xs text-zinc-400">Derrotas</div>
        </div>
        <div className="panel p-5 text-center">
          <div className="text-2xl font-bold text-violet-400">{faceitMatches.length ? `${summary.winRate}%` : "—"}</div>
          <div className="text-xs text-zinc-400">Tasa de Victoria</div>
        </div>
      </div>

      <GlassCard hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">Mapa</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">Modo</th>
                <th className="text-left text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">Resultado</th>
                <th className="text-center text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">K/D/A</th>
                <th className="text-center text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">HS%</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">K/D</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">Duración</th>
                <th className="text-right text-[11px] text-zinc-500 font-medium pb-3 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loadingFaceitMatches || syncing ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 text-violet-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">Cargando partidas...</p>
                  </td>
                </tr>
              ) : filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-sm text-zinc-400">
                        {faceitMatches.length ? "No se encontraron partidas con esos filtros" : "No hay partidas disponibles"}
                      </p>
                      {!faceitMatches.length && (
                        <p className="text-xs text-zinc-400">
                          Haz clic en Sincronizar para obtener tus partidas recientes de FACEIT
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match, index) => {
                  const result = faceitPlayerId ? getMatchResult(match, faceitPlayerId) : { result: "?", color: "text-zinc-400" };
                  const pStats = faceitPlayerId ? getPlayerStats(match, faceitPlayerId) : null;
                  const mapName = MAP_LABELS[match.map] || match.map;

                  return (
                    <motion.tr
                      key={match.matchId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 text-sm font-medium">{mapName}</td>
                      <td className="py-3">
                        <Badge variant="default" size="sm">
                          {match.mode === "5v5" ? "5v5" : match.mode === "3v3" ? "3v3" : match.mode}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-semibold ${result.color}`}>
                          {result.result}
                        </span>
                      </td>
                      <td className="py-3 text-center text-sm font-mono">
                        {pStats ? (
                          <span>{pStats.kills}/{pStats.deaths}/{pStats.assists}</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-center text-sm font-mono">
                        {pStats ? (
                          <span className={pStats.hsPercent >= 50 ? "text-emerald-400" : ""}>{pStats.hsPercent.toFixed(0)}%</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-sm font-mono">
                        {pStats ? (
                          <span className={pStats.kd >= 1 ? "text-emerald-400" : "text-red-400"}>{pStats.kd.toFixed(2)}</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-xs text-zinc-400">
                        {formatDuration(match.startedAt, match.finishedAt)}
                      </td>
                      <td className="py-3 text-right text-xs text-zinc-400">
                        {formatDate(match.startedAt)}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
