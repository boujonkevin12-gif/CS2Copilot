"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Calendar } from "lucide-react";

const allMatches = [
  { map: "Dust II", result: "Victoria", score: "16-12", kills: 28, deaths: 14, assists: 5, rating: 1.45, date: "Jul 12, 2026", time: "23:14", duration: "42m", mode: "Competitivo" },
  { map: "Mirage", result: "Derrota", score: "11-16", kills: 19, deaths: 18, assists: 4, rating: 0.98, date: "Jul 12, 2026", time: "21:30", duration: "48m", mode: "Competitivo" },
  { map: "Inferno", result: "Victoria", score: "16-8", kills: 31, deaths: 10, assists: 7, rating: 1.72, date: "Jul 12, 2026", time: "19:45", duration: "35m", mode: "Competitivo" },
  { map: "Anubis", result: "Victoria", score: "16-14", kills: 24, deaths: 16, assists: 3, rating: 1.18, date: "Jul 12, 2026", time: "18:00", duration: "52m", mode: "Competitivo" },
  { map: "Nuke", result: "Derrota", score: "9-16", kills: 15, deaths: 19, assists: 2, rating: 0.76, date: "Jul 11, 2026", time: "22:10", duration: "38m", mode: "Competitivo" },
  { map: "Overpass", result: "Victoria", score: "16-6", kills: 26, deaths: 9, assists: 4, rating: 1.65, date: "Jul 11, 2026", time: "20:30", duration: "30m", mode: "Competitivo" },
  { map: "Ancient", result: "Victoria", score: "16-11", kills: 22, deaths: 15, assists: 6, rating: 1.28, date: "Jul 11, 2026", time: "18:45", duration: "44m", mode: "Competitivo" },
  { map: "Vertigo", result: "Derrota", score: "13-16", kills: 18, deaths: 17, assists: 3, rating: 0.95, date: "Jul 11, 2026", time: "17:00", duration: "50m", mode: "Competitivo" },
  { map: "Dust II", result: "Victoria", score: "16-10", kills: 25, deaths: 12, assists: 5, rating: 1.41, date: "Jul 10, 2026", time: "21:15", duration: "40m", mode: "Competitivo" },
  { map: "Mirage", result: "Victoria", score: "16-13", kills: 21, deaths: 16, assists: 4, rating: 1.15, date: "Jul 10, 2026", time: "19:30", duration: "46m", mode: "Competitivo" },
  { map: "Inferno", result: "Derrota", score: "12-16", kills: 17, deaths: 18, assists: 3, rating: 0.88, date: "Jul 10, 2026", time: "17:45", duration: "52m", mode: "Competitivo" },
  { map: "Nuke", result: "Victoria", score: "16-7", kills: 29, deaths: 11, assists: 6, rating: 1.68, date: "Jul 10, 2026", time: "16:00", duration: "32m", mode: "Competitivo" },
];

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial de Partidas</h1>
          <p className="text-sm text-muted mt-1">
            Explora y analiza todas tus partidas anteriores.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />}>
          Exportar CSV
        </Button>
      </div>

      <GlassCard padding="sm" hover={false}>
        <div className="flex items-center gap-3 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por mapa, fecha..."
              className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
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
        <GlassCard padding="sm" hover={false}>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">8</div>
            <div className="text-xs text-muted">Victorias</div>
          </div>
        </GlassCard>
        <GlassCard padding="sm" hover={false}>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger">4</div>
            <div className="text-xs text-muted">Derrotas</div>
          </div>
        </GlassCard>
        <GlassCard padding="sm" hover={false}>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">66.7%</div>
            <div className="text-xs text-muted">Tasa de Victoria</div>
          </div>
        </GlassCard>
      </div>

      <GlassCard padding="sm" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Mapa</th>
                <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Modo</th>
                <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Resultado</th>
                <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Marcador</th>
                <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">K/D/A</th>
                <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Rating</th>
                <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Duración</th>
                <th className="text-right text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {allMatches.map((match, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-3 text-sm font-medium">{match.map}</td>
                  <td className="py-3">
                    <Badge variant="default" size="sm">{match.mode}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant={match.result === "Victoria" ? "success" : "danger"} size="sm">
                      {match.result}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-muted font-mono">{match.score}</td>
                  <td className="py-3 text-sm text-center text-muted font-mono">{match.kills}/{match.deaths}/{match.assists}</td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-semibold ${
                      match.rating >= 1.2 ? "text-success" : match.rating >= 1.0 ? "text-foreground" : "text-danger"
                    }`}>
                      {match.rating.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs text-muted">{match.duration}</td>
                  <td className="py-3 text-right text-xs text-muted">{match.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
