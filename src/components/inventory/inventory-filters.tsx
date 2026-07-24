"use client";

import { Search, Grid3X3, List, RefreshCw, ChevronDown, X } from "lucide-react";
import { ItemRarity, EXTERIOR_ORDER, RARITY_ORDER, RARITY_COLORS } from "@/types/inventory";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface FilterState {
  search: string;
  rarity: string[];
  exterior: string[];
  category: string[];
  stattrak: boolean | null;
  souvenir: boolean | null;
  sortBy: "name" | "rarity" | "recent";
  sortDir: "asc" | "desc";
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  onRefresh: () => void;
  refreshing: boolean;
  totalFiltered: number;
  rarityOptions: string[];
  exteriorOptions: string[];
  categoryOptions: string[];
}

const RARITIES: { key: ItemRarity; label: string }[] = [
  { key: "consumer", label: "Consumer" },
  { key: "industrial", label: "Industrial" },
  { key: "mil_spec", label: "Mil-Spec" },
  { key: "restricted", label: "Restricted" },
  { key: "classifed", label: "Classified" },
  { key: "covert", label: "Covert" },
  { key: "rare", label: "Rare" },
];

const EXTERIORS = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];

const SORT_OPTIONS = [
  { value: "name", label: "Nombre" },
  { value: "rarity", label: "Rareza" },
  { value: "recent", label: "Recientes" },
];

export type { FilterState };

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  rarity: [],
  exterior: [],
  category: [],
  stattrak: null,
  souvenir: null,
  sortBy: "recent",
  sortDir: "desc",
};

export function InventoryFilters({ filters, onChange, view, onViewChange, onRefresh, refreshing, totalFiltered, rarityOptions, exteriorOptions, categoryOptions }: Props) {
  const [showMore, setShowMore] = useState(false);
  const hasActiveFilters = filters.rarity.length > 0 || filters.exterior.length > 0 || filters.category.length > 0 || filters.stattrak !== null || filters.souvenir !== null || filters.search;

  const clearFilters = () => {
    onChange({ ...DEFAULT_FILTERS, sortBy: filters.sortBy, sortDir: filters.sortDir });
  };

  const toggleRarity = (r: string) => {
    const next = filters.rarity.includes(r) ? filters.rarity.filter((x) => x !== r) : [...filters.rarity, r];
    onChange({ ...filters, rarity: next });
  };

  const toggleExterior = (e: string) => {
    const next = filters.exterior.includes(e) ? filters.exterior.filter((x) => x !== e) : [...filters.exterior, e];
    onChange({ ...filters, exterior: next });
  };

  const toggleCategory = (c: string) => {
    const next = filters.category.includes(c) ? filters.category.filter((x) => x !== c) : [...filters.category, c];
    onChange({ ...filters, category: next });
  };

  return (
    <div className="panel rounded-xl overflow-hidden">
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Buscar skins..."
              className="w-full h-9 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5">
            <button onClick={() => onViewChange("grid")} className={`p-1.5 rounded-md transition-all cursor-pointer ${view === "grid" ? "bg-primary/20 text-primary" : "text-zinc-500 hover:text-zinc-200"}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => onViewChange("list")} className={`p-1.5 rounded-md transition-all cursor-pointer ${view === "list" ? "bg-primary/20 text-primary" : "text-zinc-500 hover:text-zinc-200"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="h-9 px-3 rounded-xl bg-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.1] transition-all disabled:opacity-50 flex items-center gap-2 text-sm cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Actualizando..." : "Actualizar"}</span>
          </button>
          <button
            onClick={() => setShowMore(!showMore)}
            className={`h-9 px-3 rounded-xl transition-all flex items-center gap-1 text-sm cursor-pointer ${showMore || hasActiveFilters ? "bg-primary/20 text-primary" : "bg-white/[0.06] text-zinc-400 hover:text-zinc-200"}`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-zinc-500">
            {totalFiltered} {totalFiltered === 1 ? "objeto" : "objetos"}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })}
              className="h-7 px-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => onChange({ ...filters, sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
              className="h-7 px-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {filters.sortDir === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06]"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Rareza</label>
                  <div className="space-y-1">
                    {RARITIES.filter((r) => rarityOptions.includes(r.key)).map((r) => (
                      <button
                        key={r.key}
                        onClick={() => toggleRarity(r.key)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          filters.rarity.includes(r.key)
                            ? "bg-white/[0.08] font-medium"
                            : "text-zinc-400 hover:bg-white/[0.04]"
                        }`}
                        style={filters.rarity.includes(r.key) ? { color: RARITY_COLORS[r.key], backgroundColor: `${RARITY_COLORS[r.key]}15` } : {}}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Exterior</label>
                  <div className="space-y-1">
                    {EXTERIORS.filter((e) => exteriorOptions.includes(e)).map((ext) => (
                      <button
                        key={ext}
                        onClick={() => toggleExterior(ext)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          filters.exterior.includes(ext)
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-zinc-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        {ext}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Categoría</label>
                  <div className="space-y-1">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                          filters.category.includes(cat)
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-zinc-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Estado</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => onChange({ ...filters, stattrak: filters.stattrak === true ? null : true })}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        filters.stattrak === true ? "bg-[#cf6a32]/15 text-[#cf6a32] font-medium" : "text-zinc-400 hover:bg-white/[0.04]"
                      }`}
                    >
                      StatTrak
                    </button>
                    <button
                      onClick={() => onChange({ ...filters, souvenir: filters.souvenir === true ? null : true })}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        filters.souvenir === true ? "bg-[#ffd700]/15 text-[#ffd700] font-medium" : "text-zinc-400 hover:bg-white/[0.04]"
                      }`}
                    >
                      Souvenir
                    </button>
                  </div>

                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-center pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/[0.06] text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.1] transition-all cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
