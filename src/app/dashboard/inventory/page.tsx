"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Grid3X3,
  List,
  Zap,
  DollarSign,
  BarChart3,
  SlidersHorizontal,
  X,
  LogIn,
  LinkIcon,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

type Rarity = "Covert" | "Classified" | "Restricted" | "Mil-Spec" | "Industrial" | "Consumer";

const rarityColors: Record<Rarity, { color: string; bg: string; border: string }> = {
  Covert: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  Classified: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)" },
  Restricted: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" },
  "Mil-Spec": { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)" },
  Industrial: { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" },
  Consumer: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
};

const rarities: Rarity[] = ["Covert", "Classified", "Restricted", "Mil-Spec", "Industrial", "Consumer"];
const wearTypes = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
const weaponTypes = ["AK-47", "AWP", "M4A4", "M4A1-S", "Desert Eagle", "Glock-18", "USP-S"];

function EmptyPriceChart() {
  return (
    <div className="relative">
      <div className="flex items-end gap-2 h-48">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2 relative"
          >
            <div className="w-full rounded-lg h-2 bg-white/[0.04]" />
            <span className="text-[11px] text-muted/40">—</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center glass rounded-xl px-6 py-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted">No disponible</p>
          <p className="text-xs text-muted-foreground/70">Requiere integración con Steam Market</p>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { user, loading } = useUser();
  const [search, setSearch] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [selectedWear, setSelectedWear] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "float" | "name">("price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [stattrakOnly, setStattrakOnly] = useState(false);

  const activeFilters = [selectedRarity, selectedWear, selectedWeapon, stattrakOnly ? "StatTrak" : null].filter(Boolean).length;

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Conecta tu Steam</h2>
          <p className="text-sm text-muted mb-6 max-w-sm">
            Conecta tu perfil de Steam para ver tu inventario de CS2, precios en tiempo real y estadísticas de tu colección.
          </p>
          <a
            href="/api/auth/steam"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            Conectar con Steam
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          Inventario
        </h1>
        <p className="text-sm text-muted mt-1">
          Conecta tu perfil de Steam para ver tu inventario
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted">Valor Total</div>
                <div className="text-xl font-bold font-mono">—</div>
              </div>
            </div>
            <span className="text-xs text-muted">No disponible</span>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted">Ganancias</div>
                <div className="text-xl font-bold font-mono">—</div>
              </div>
            </div>
            <span className="text-xs text-muted">No disponible</span>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-danger" />
              </div>
              <div>
                <div className="text-xs text-muted">Pérdidas</div>
                <div className="text-xl font-bold font-mono">—</div>
              </div>
            </div>
            <span className="text-xs text-muted">No disponible</span>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted">Total Objetos</div>
                <div className="text-xl font-bold font-mono">—</div>
              </div>
            </div>
            <span className="text-xs text-muted">No disponible</span>
          </GlassCard>
        </motion.div>
      </div>

      {/* Price History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard padding="md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Historial del Precio</h3>
                <p className="text-xs text-muted">Evolución del valor total del inventario</p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              —
            </Badge>
          </div>
          <EmptyPriceChart />
        </GlassCard>
      </motion.div>

      {/* Filters + Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <GlassCard padding="sm" hover={false}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 p-2">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar skins..."
                className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                showFilters ? "bg-primary/20 text-primary" : "glass text-muted hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {activeFilters > 0 && (
                <span className="ml-1 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split("-");
                setSortBy(by as any);
                setSortDir(dir as any);
              }}
              className="h-9 px-3 rounded-xl glass text-xs text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="price-desc">Mayor precio</option>
              <option value="price-asc">Menor precio</option>
              <option value="float-asc">Mejor float</option>
              <option value="float-desc">Peor float</option>
              <option value="name-asc">A-Z</option>
            </select>

            {/* View toggle */}
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

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] space-y-4">
                  {/* Rarity */}
                  <div>
                    <div className="text-[11px] text-muted font-medium mb-2">Rareza</div>
                    <div className="flex flex-wrap gap-2">
                      {rarities.map((r) => (
                        <button
                          key={r}
                          onClick={() => setSelectedRarity(selectedRarity === r ? null : r)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                            selectedRarity === r
                              ? "border-current"
                              : "border-white/[0.06] hover:border-white/[0.12]"
                          }`}
                          style={{
                            color: selectedRarity === r ? rarityColors[r].color : undefined,
                            backgroundColor: selectedRarity === r ? rarityColors[r].bg : undefined,
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wear */}
                  <div>
                    <div className="text-[11px] text-muted font-medium mb-2">Desgaste</div>
                    <div className="flex flex-wrap gap-2">
                      {wearTypes.map((w) => (
                        <button
                          key={w}
                          onClick={() => setSelectedWear(selectedWear === w ? null : w)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                            selectedWear === w
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "border-white/[0.06] text-muted hover:border-white/[0.12]"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weapon */}
                  <div>
                    <div className="text-[11px] text-muted font-medium mb-2">Arma</div>
                    <div className="flex flex-wrap gap-2">
                      {weaponTypes.map((w) => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeapon(selectedWeapon === w ? null : w)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                            selectedWeapon === w
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "border-white/[0.06] text-muted hover:border-white/[0.12]"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* StatTrak + Clear */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setStattrakOnly(!stattrakOnly)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        stattrakOnly
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "border-white/[0.06] text-muted hover:border-white/[0.12]"
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      Solo StatTrak™
                    </button>
                    {activeFilters > 0 && (
                      <button
                        onClick={() => {
                          setSelectedRarity(null);
                          setSelectedWear(null);
                          setSelectedWeapon(null);
                          setStattrakOnly(false);
                        }}
                        className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          0 objetos
        </span>
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="h-16 w-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted mb-1">No hay skins disponibles</p>
        <p className="text-xs text-muted-foreground/70 mb-3">Próximamente con integración de Steam Inventory</p>
        <p className="text-[11px] text-muted-foreground/50">Requiere integración con Steam Inventory API y Steam Market</p>
      </motion.div>
    </div>
  );
}
