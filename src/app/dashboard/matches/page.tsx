"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Calendar } from "lucide-react";
import { useUser } from "@/lib/user-context";
import Link from "next/link";

export default function MatchesPage() {
  const { user } = useUser();

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
            <div className="text-2xl font-bold text-muted">&mdash;</div>
            <div className="text-xs text-muted">Victorias</div>
          </div>
        </GlassCard>
        <GlassCard padding="sm" hover={false}>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted">&mdash;</div>
            <div className="text-xs text-muted">Derrotas</div>
          </div>
        </GlassCard>
        <GlassCard padding="sm" hover={false}>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted">&mdash;</div>
            <div className="text-xs text-muted">Tasa de Victoria</div>
          </div>
        </GlassCard>
      </div>

      <div className="text-center text-xs text-muted -mt-2 mb-1">
        No disponible &mdash; requiere integración con CSStats o Leetify
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
              {!user ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <p className="text-sm text-muted">
                        Conecta tu cuenta de Steam para ver tu historial de partidas.
                      </p>
                      <Link href="/dashboard/settings">
                        <Button variant="primary" size="sm">
                          Conectar Steam
                        </Button>
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-sm text-muted">
                        No hay partidas disponibles
                      </p>
                      <p className="text-xs text-muted">
                        Próximamente con integración de CSStats
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
