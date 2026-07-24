"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";

export function InventoryEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel rounded-xl p-12 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
        <Package className="h-8 w-8 text-zinc-500" />
      </div>
      <h3 className="text-base font-semibold text-zinc-300 mb-1">No hay objetos</h3>
      <p className="text-sm text-zinc-500 max-w-sm mx-auto">
        No se encontraron objetos con los filtros actuales. Intentá cambiar los criterios de búsqueda.
      </p>
    </motion.div>
  );
}
