"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Package, Shield, Star, Layers, Tag } from "lucide-react";
import { InventoryItem } from "@/types/inventory";
import { GlassCard } from "@/components/ui/glass-card";

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

export function InventoryItemDetail({ item, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard padding="lg" glow>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4 text-zinc-400" />
            </button>

            <div className="flex gap-5">
              <div className="shrink-0">
                <div
                  className="w-28 h-28 rounded-xl bg-white/[0.03] flex items-center justify-center overflow-hidden"
                  style={{ boxShadow: `0 0 20px ${item.rarityColor}20` }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : item.iconUrl ? (
                    <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package className="h-10 w-10 text-white/[0.08]" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${item.rarityColor}20`, color: item.rarityColor }}>
                    {item.rarityName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                    {item.categoryLabel}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-200 leading-tight mb-1">{item.name}</h3>
                {item.weapon && item.category === "skin" && (
                  <p className="text-sm text-zinc-400">{item.weapon}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {item.exterior && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Layers className="h-3 w-3" />
                      {item.exterior}
                    </div>
                  )}
                  {item.stattrak && (
                    <div className="flex items-center gap-1 text-[11px] text-[#cf6a32]">
                      <Star className="h-3 w-3" />
                      StatTrak
                    </div>
                  )}
                  {item.souvenir && (
                    <div className="flex items-center gap-1 text-[11px] text-[#ffd700]">
                      <Shield className="h-3 w-3" />
                      Souvenir
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1">
                <Tag className="h-3 w-3" />
                Cantidad
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                {item.quantity}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {item.inspectLink && (
                <a
                  href={item.inspectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Inspeccionar en el juego
                </a>
              )}
              <a
                href={item.marketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/[0.06] text-zinc-200 text-sm font-medium hover:bg-white/[0.1] transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Ver en el Market de Steam
              </a>
            </div>

            {item.stickers && item.stickers.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-2">
                  <Star className="h-3 w-3" />
                  Stickers aplicados
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.stickers.map((s, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-white/[0.04] text-[10px] text-zinc-400 border border-white/[0.06]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
