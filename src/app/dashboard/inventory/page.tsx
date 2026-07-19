"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  Shield,
  ExternalLink,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

interface InventoryItem {
  id: string;
  name: string;
  market_hash_name: string;
  type: string;
  quality: string;
  icon_url: string;
  tradable: boolean;
}

const QUALITY_COLORS: Record<string, string> = {
  "Contrabanda": "#e4ae39",
  "Extraordinario": "#d32ce6",
  "Excepcional": "#8847ff",
  "Militar": "#4b69ff",
  "Industrial": "#5e98d9",
  "Comercial": "#b0c3d9",
  "Normal": "#b0c3d9",
  "Unique": "#ffd700",
};

export default function InventoryPage() {
  const { user, loading } = useUser();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [rarityBreakdown, setRarityBreakdown] = useState<Record<string, number>>({});

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    setInventoryLoading(true);
    setInventoryError("");
    try {
      const res = await fetch("/api/steam/inventory");
      const data = await res.json();
      if (data.error) {
        setInventoryError(data.message || "Error al obtener inventario");
      } else if (data.success) {
        setInventory(data.items || []);
        setTotalItems(data.totalItems || 0);
        setRarityBreakdown(data.rarityBreakdown || {});
      }
    } catch {
      setInventoryError("Error de conexión al obtener inventario");
    } finally {
      setInventoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()) || item.market_hash_name.toLowerCase().includes(search.toLowerCase());
    const matchesQuality = !selectedQuality || item.quality === selectedQuality;
    return matchesSearch && matchesQuality;
  });

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Conecta tu Steam</h2>
          <p className="text-sm text-muted mb-6 max-w-sm">
            Conecta tu perfil de Steam para ver tu inventario de CS2.
          </p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors">
            Conectar con Steam
          </a>
        </motion.div>
      </div>
    );
  }

  const qualities = Object.keys(rarityBreakdown).sort();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          Inventario
        </h1>
        <p className="text-sm text-muted mt-1">
          Tu inventario de CS2 de Steam {totalItems > 0 && `· ${totalItems} objetos`}
        </p>
      </motion.div>

      {inventory.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard padding="md">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted">Total Objetos</div>
                  <div className="text-xl font-bold font-mono">{inventory.length}</div>
                </div>
              </div>
              {totalItems > inventory.length && (
                <span className="text-xs text-muted">Mostrando {inventory.length} de {totalItems}</span>
              )}
            </GlassCard>
          </motion.div>

          {qualities.slice(0, 3).map((quality, i) => (
            <motion.div key={quality} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
              <GlassCard padding="md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${QUALITY_COLORS[quality] || "#b0c3d9"}15` }}>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: QUALITY_COLORS[quality] || "#b0c3d9" }} />
                  </div>
                  <div>
                    <div className="text-xs text-muted truncate">{quality}</div>
                    <div className="text-xl font-bold font-mono">{rarityBreakdown[quality] || 0}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <GlassCard padding="sm" hover={false}>
        <div className="flex items-center gap-3 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar skins..."
              className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 glass rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${view === "grid" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${view === "list" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {qualities.length > 0 && (
          <div className="px-4 pb-3 pt-1 border-t border-white/[0.06]">
            <div className="flex flex-wrap gap-2">
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuality(selectedQuality === q ? null : q)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                    selectedQuality === q
                      ? "border-current"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                  style={{
                    color: selectedQuality === q ? (QUALITY_COLORS[q] || "#b0c3d9") : undefined,
                    backgroundColor: selectedQuality === q ? `${QUALITY_COLORS[q] || "#b0c3d9"}15` : undefined,
                  }}
                >
                  {q} ({rarityBreakdown[q] || 0})
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {filteredItems.length} objetos
        </span>
      </div>

      {inventoryLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Cargando inventario de Steam...</p>
          </div>
        </div>
      ) : inventoryError ? (
        <GlassCard padding="lg" className="text-center">
          <AlertCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se pudo cargar el inventario</h3>
          <p className="text-sm text-muted mb-4">{inventoryError}</p>
          {user?.visibility !== 3 && (
            <div className="glass rounded-xl p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-sm text-accent mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Perfil privado</span>
              </div>
              <p className="text-xs text-muted">
                Tu perfil de Steam debe ser <strong>público</strong> para poder consultar el inventario.
                Ve a tu perfil de Steam → Editar perfil → Privacidad y cambia la visibilidad del inventario a Público.
              </p>
            </div>
          )}
          <button
            onClick={fetchInventory}
            className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Reintentar
          </button>
        </GlassCard>
      ) : inventory.length === 0 ? (
        <GlassCard padding="lg" className="text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted mb-1">Inventario vacío o no disponible</p>
          <p className="text-xs text-muted-foreground/70">No se encontraron objetos en tu inventario de CS2</p>
        </GlassCard>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <AnimatePresence>
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id + i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="glass rounded-xl p-3 hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div className="aspect-square rounded-lg bg-white/[0.04] mb-2 flex items-center justify-center overflow-hidden">
                  {item.icon_url ? (
                    <img
                      src={`https://community.akamai.steamstatic.com/economy/image/${item.icon_url}`}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).alt = "Sin imagen"; }}
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="text-xs font-medium truncate">{item.name}</div>
                {item.quality && (
                  <div className="text-[10px] mt-0.5" style={{ color: QUALITY_COLORS[item.quality] || "#b0c3d9" }}>
                    {item.quality}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <GlassCard padding="sm" hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Objeto</th>
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Tipo</th>
                  <th className="text-left text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Rareza</th>
                  <th className="text-center text-[11px] text-muted-foreground font-medium pb-3 uppercase tracking-wider">Intercambiable</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, i) => (
                  <tr key={item.id + i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-3">
                        {item.icon_url ? (
                          <img
                            src={`https://community.akamai.steamstatic.com/economy/image/${item.icon_url}`}
                            alt={item.name}
                            className="h-8 w-8 rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/30" />
                        )}
                        <span className="text-sm font-medium truncate max-w-[200px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-muted">{item.type || "—"}</td>
                    <td className="py-2.5">
                      <span className="text-xs font-medium" style={{ color: QUALITY_COLORS[item.quality] || "#b0c3d9" }}>
                        {item.quality || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      {item.tradable ? (
                        <span className="text-xs text-success">Sí</span>
                      ) : (
                        <span className="text-xs text-muted">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
