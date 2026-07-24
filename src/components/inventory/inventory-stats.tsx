"use client";

import { motion } from "framer-motion";
import { RARITY_COLORS } from "@/types/inventory";

interface Props {
  rarityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

const RARITY_ORDER = ["consumer", "industrial", "mil_spec", "restricted", "classifed", "covert", "rare", "unusual", "common"];

export function InventoryStats({ rarityDistribution, categoryDistribution }: Props) {
  const sortedRarities = Object.entries(rarityDistribution)
    .sort(([a], [b]) => {
      const ia = RARITY_ORDER.indexOf(a.toLowerCase());
      const ib = RARITY_ORDER.indexOf(b.toLowerCase());
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  const total = Object.values(rarityDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="panel rounded-xl p-4"
      >
        <h4 className="text-xs font-semibold text-zinc-300 mb-3">Distribución por rareza</h4>
        <div className="space-y-2">
          {sortedRarities.map(([name, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const color = RARITY_COLORS[name.toLowerCase()] || RARITY_COLORS.common;
            return (
              <div key={name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 truncate">{name}</span>
                  <span className="text-zinc-500 font-mono">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-xl p-4"
      >
        <h4 className="text-xs font-semibold text-zinc-300 mb-3">Distribución por categoría</h4>
        <div className="space-y-2">
          {Object.entries(categoryDistribution).sort(([, a], [, b]) => b - a).map(([name, count], i) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const colors = ["#8b5cf6", "#6366f1", "#a855f7", "#3b82f6", "#06b6d4", "#22c55e", "#eab308", "#f97316", "#ef4444", "#ec4899"];
            const color = colors[i % colors.length];
            return (
              <div key={name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 truncate">{name}</span>
                  <span className="text-zinc-500 font-mono">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.05, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
