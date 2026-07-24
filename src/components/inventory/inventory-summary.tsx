"use client";

import { motion } from "framer-motion";
import { Package, DollarSign, Crosshair, Shield, Sparkles } from "lucide-react";
import { InventorySummary as SummaryType } from "@/types/inventory";

interface Props {
  summary: SummaryType;
}

export function InventorySummary({ summary }: Props) {
  const cards = [
    {
      icon: Package,
      label: "Total objetos",
      value: summary.totalItems,
      color: "text-primary",
      bg: "bg-primary/10",
      delay: 0,
    },
    {
      icon: DollarSign,
      label: "Valor total",
      value: summary.totalValue > 0 ? `$${summary.totalValue.toFixed(2)}` : "—",
      color: "text-green-400",
      bg: "bg-green-400/10",
      delay: 0.05,
    },
    {
      icon: Crosshair,
      label: "Cuchillos",
      value: summary.knifeCount,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      delay: 0.1,
    },
    {
      icon: Shield,
      label: "Guantes",
      value: summary.gloveCount,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      delay: 0.15,
    },
    {
      icon: Sparkles,
      label: "Más cara",
      value: summary.mostExpensive ? `$${summary.mostExpensive.price?.toFixed(2) || "—"}` : "—",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      delay: 0.2,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay, type: "spring", stiffness: 300, damping: 25 }}
          className="panel rounded-xl p-3.5"
        >
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-zinc-500 truncate">{card.label}</div>
              <div className="text-sm font-bold text-zinc-200 font-mono truncate">{card.value}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
