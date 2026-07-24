"use client";

import { motion } from "framer-motion";
import { AlertCircle, Shield, ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  error: string;
  errorType?: string;
  steamId?: string;
  onRetry: () => void;
}

export function InventoryError({ error, errorType, steamId, onRetry }: Props) {
  const steamInventoryUrl = steamId
    ? `https://steamcommunity.com/profiles/${steamId}/inventory/#730`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel rounded-xl p-8 text-center"
    >
      <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-zinc-200 mb-2">No se pudo cargar el inventario</h3>
      <p className="text-sm text-zinc-400 mb-5 max-w-md mx-auto">{error}</p>

      <div className="panel rounded-xl p-5 max-w-lg mx-auto mb-6 text-left">
        <div className="flex items-center gap-2 text-sm text-red-400 mb-3">
          <Shield className="h-4 w-4 shrink-0" />
          <span className="font-medium">¿Cómo solucionarlo?</span>
        </div>
        <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside">
          <li>Ve a tu <a href="https://steamcommunity.com/edit/profile" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">perfil de Steam → Editar perfil</a></li>
          <li>Hacé clic en la pestaña <strong className="text-zinc-200">Privacidad</strong></li>
          <li>Buscá la sección <strong className="text-zinc-200">Detalles del juego</strong> y cambiala a <strong className="text-zinc-200">Público</strong></li>
          <li>Buscá la sección <strong className="text-zinc-200">Inventario</strong> y cambiala a <strong className="text-zinc-200">Público</strong></li>
          <li>Esperá <strong className="text-zinc-200">2-3 minutos</strong> y hacé clic en Reintentar</li>
        </ol>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {steamInventoryUrl && (
          <a
            href={steamInventoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Abrir inventario en Steam
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] text-zinc-200 text-sm font-medium hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </button>
      </div>
    </motion.div>
  );
}
