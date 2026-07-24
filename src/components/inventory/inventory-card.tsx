"use client";

import { motion } from "framer-motion";
import { Package, ExternalLink, AlertCircle } from "lucide-react";
import { InventoryItem } from "@/types/inventory";
import { useState } from "react";
import { InventoryItemDetail } from "./inventory-item-detail";

interface Props {
  item: InventoryItem;
  index: number;
}

export function InventoryCard({ item, index }: Props) {
  const [imgError, setImgError] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const glowColor = item.rarityColor || "#b0c3d9";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.6), type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => setShowDetail(true)}
        className="group relative cursor-pointer rounded-xl border border-[rgba(169,149,255,0.12)] bg-gradient-to-br from-[rgba(20,20,37,0.94)] to-[rgba(10,11,22,0.9)] shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_12px_35px_rgba(0,0,0,.13)] overflow-hidden transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_0_30px_rgba(139,92,246,0.15)]"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at 50% 0%, ${glowColor}08, transparent 60%)`,
          }}
        />

        <div className="relative p-3">
          <div className="aspect-[4/3] rounded-lg bg-white/[0.03] mb-2.5 flex items-center justify-center overflow-hidden">
            {item.imageUrl && !imgError ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : item.iconUrl && !imgError ? (
              <img
                src={item.iconUrl}
                alt={item.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <Package className="h-10 w-10 text-white/[0.08]" />
            )}

            {item.stattrak && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#cf6a32]/20 border border-[#cf6a32]/30">
                <span className="text-[9px] font-bold text-[#cf6a32] tracking-wide">ST</span>
              </div>
            )}
            {item.souvenir && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#ffd700]/20 border border-[#ffd700]/30">
                <span className="text-[9px] font-bold text-[#ffd700] tracking-wide">SV</span>
              </div>
            )}

            {item.quantity > 1 && (
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-medium text-white">
                x{item.quantity}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-200 truncate leading-tight">
              {item.name}
            </div>
            {item.weapon && item.category === "skin" && (
              <div className="text-[10px] text-zinc-500 truncate">{item.weapon}</div>
            )}
            <div className="flex items-center gap-1.5">
              {item.exterior && (
                <span className="text-[10px] text-zinc-500">{item.exterior}</span>
              )}
              <span className="text-[10px] font-medium" style={{ color: item.rarityColor }}>
                {item.rarityName}
              </span>
            </div>

          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity" style={{ color: glowColor }} />
      </motion.div>

      {showDetail && (
        <InventoryItemDetail item={item} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
