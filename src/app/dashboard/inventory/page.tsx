"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ArrowUpDown,
  Eye,
  ExternalLink,
  Star,
  Zap,
  DollarSign,
  BarChart3,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Rarity = "Covert" | "Classified" | "Restricted" | "Mil-Spec" | "Industrial" | "Consumer";

interface Skin {
  id: string;
  name: string;
  weapon: string;
  rarity: Rarity;
  skin: string;
  wear: string;
  float: number;
  pattern: number;
  price: number;
  priceChange: number;
  StatTrak: boolean;
  image: string;
  color: string;
  borderGradient: string;
}

const rarityColors: Record<Rarity, { color: string; bg: string; border: string }> = {
  Covert: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  Classified: { color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)" },
  Restricted: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" },
  "Mil-Spec": { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)" },
  Industrial: { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" },
  Consumer: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
};

const skins: Skin[] = [
  { id: "1", name: "AK-47", weapon: "AK-47", rarity: "Covert", skin: "Fire Serpent", wear: "Field-Tested", float: 0.2147, pattern: 219, price: 1450.00, priceChange: 45.20, StatTrak: false, image: "", color: "#ef4444", borderGradient: "from-red-500 to-orange-500" },
  { id: "2", name: "AWP", weapon: "AWP", rarity: "Covert", skin: "Dragon Lore", wear: "Minimal Wear", float: 0.0892, pattern: 420, price: 4820.00, priceChange: -120.50, StatTrak: true, image: "", color: "#ef4444", borderGradient: "from-red-500 to-amber-500" },
  { id: "3", name: "M4A4", weapon: "M4A4", rarity: "Covert", skin: "Howl", wear: "Field-Tested", float: 0.3512, pattern: 661, price: 3200.00, priceChange: 89.00, StatTrak: false, image: "", color: "#ef4444", borderGradient: "from-red-600 to-orange-600" },
  { id: "4", name: "Knife", weapon: "Karambit", rarity: "Covert", skin: "Fade", wear: "Factory New", float: 0.0082, pattern: 999, price: 3850.00, priceChange: 150.00, StatTrak: false, image: "", color: "#ef4444", borderGradient: "from-purple-500 to-pink-500" },
  { id: "5", name: "Gloves", weapon: "Sport Gloves", rarity: "Covert", skin: "Pandora's Box", wear: "Field-Tested", float: 0.1823, pattern: 555, price: 2980.00, priceChange: -45.30, StatTrak: false, image: "", color: "#ef4444", borderGradient: "from-blue-500 to-purple-500" },
  { id: "6", name: "USP-S", weapon: "USP-S", rarity: "Classified", skin: "Kill Confirmed", wear: "Minimal Wear", float: 0.1234, pattern: 0, price: 285.00, priceChange: 12.50, StatTrak: true, image: "", color: "#a855f7", borderGradient: "from-purple-500 to-pink-500" },
  { id: "7", name: "AK-47", weapon: "AK-47", rarity: "Classified", skin: "Vulcan", wear: "Factory New", float: 0.0341, pattern: 0, price: 320.00, priceChange: 8.20, StatTrak: false, image: "", color: "#a855f7", borderGradient: "from-blue-500 to-cyan-500" },
  { id: "8", name: "M4A1-S", weapon: "M4A1-S", rarity: "Classified", skin: "Hyper Beast", wear: "Field-Tested", float: 0.2890, pattern: 0, price: 145.00, priceChange: -3.40, StatTrak: false, image: "", color: "#a855f7", borderGradient: "from-pink-500 to-purple-500" },
  { id: "9", name: "Desert Eagle", weapon: "Desert Eagle", rarity: "Classified", skin: "Blaze", wear: "Factory New", float: 0.0120, pattern: 363, price: 580.00, priceChange: 25.00, StatTrak: false, image: "", color: "#a855f7", borderGradient: "from-orange-500 to-red-500" },
  { id: "10", name: "Glock-18", weapon: "Glock-18", rarity: "Restricted", skin: "Fade", wear: "Factory New", float: 0.0210, pattern: 850, price: 1250.00, priceChange: 35.00, StatTrak: true, image: "", color: "#3b82f6", borderGradient: "from-cyan-500 to-blue-500" },
  { id: "11", name: "P250", weapon: "P250", rarity: "Restricted", skin: "See Yaa", wear: "Minimal Wear", float: 0.0780, pattern: 0, price: 85.00, priceChange: 2.10, StatTrak: false, image: "", color: "#3b82f6", borderGradient: "from-blue-400 to-cyan-400" },
  { id: "12", name: "Five-SeveN", weapon: "Five-SeveN", rarity: "Restricted", skin: "Monkey Business", wear: "Field-Tested", float: 0.3120, pattern: 0, price: 12.50, priceChange: -0.30, StatTrak: false, image: "", color: "#3b82f6", borderGradient: "from-blue-400 to-indigo-400" },
  { id: "13", name: "UMP-45", weapon: "UMP-45", rarity: "Mil-Spec", skin: "Primal Saber", wear: "Field-Tested", float: 0.2450, pattern: 0, price: 18.20, priceChange: 0.80, StatTrak: true, image: "", color: "#06b6d4", borderGradient: "from-cyan-400 to-teal-400" },
  { id: "14", name: "MAC-10", weapon: "MAC-10", rarity: "Mil-Spec", skin: "Neon Rider", wear: "Minimal Wear", float: 0.1540, pattern: 0, price: 22.80, priceChange: -1.20, StatTrak: false, image: "", color: "#06b6d4", borderGradient: "from-pink-400 to-cyan-400" },
  { id: "15", name: "SG 553", weapon: "SG 553", rarity: "Mil-Spec", skin: "Integrale", wear: "Factory New", float: 0.0450, pattern: 0, price: 8.50, priceChange: 0.20, StatTrak: false, image: "", color: "#06b6d4", borderGradient: "from-cyan-300 to-blue-400" },
  { id: "16", name: "P90", weapon: "P90", rarity: "Industrial", skin: "Shallow Grave", wear: "Field-Tested", float: 0.3200, pattern: 0, price: 3.20, priceChange: -0.10, StatTrak: false, image: "", color: "#64748b", borderGradient: "from-slate-400 to-slate-500" },
  { id: "17", name: "Nova", weapon: "Nova", rarity: "Industrial", skin: "Walnut", wear: "Field-Tested", float: 0.4100, pattern: 0, price: 0.15, priceChange: 0, StatTrak: false, image: "", color: "#64748b", borderGradient: "from-slate-400 to-gray-500" },
  { id: "18", name: "MAG-7", weapon: "MAG-7", rarity: "Consumer", skin: "Storm", wear: "Battle-Scarred", float: 0.6500, pattern: 0, price: 0.05, priceChange: 0, StatTrak: false, image: "", color: "#94a3b8", borderGradient: "from-gray-400 to-gray-500" },
  { id: "19", name: "Negev", weapon: "Negev", rarity: "Consumer", skin: "Army Sheen", wear: "Field-Tested", float: 0.3800, pattern: 0, price: 0.08, priceChange: 0, StatTrak: false, image: "", color: "#94a3b8", borderGradient: "from-gray-400 to-gray-500" },
  { id: "20", name: "PP-Bizon", weapon: "PP-Bizon", rarity: "Consumer", skin: "Sand Dashed", wear: "Field-Tested", float: 0.4200, pattern: 0, price: 0.03, priceChange: 0, StatTrak: false, image: "", color: "#94a3b8", borderGradient: "from-gray-400 to-gray-500" },
  { id: "21", name: "M4A4", weapon: "M4A4", rarity: "Classified", skin: "Asiimov", wear: "Field-Tested", float: 0.3600, pattern: 0, price: 95.00, priceChange: 4.50, StatTrak: true, image: "", color: "#a855f7", borderGradient: "from-orange-400 to-white" },
  { id: "22", name: "AK-47", weapon: "AK-47", rarity: "Classified", skin: "Neon Rider", wear: "Minimal Wear", float: 0.1340, pattern: 0, price: 180.00, priceChange: 7.80, StatTrak: false, image: "", color: "#a855f7", borderGradient: "from-pink-500 to-cyan-500" },
  { id: "23", name: "AWP", weapon: "AWP", rarity: "Restricted", skin: "Graphite", wear: "Factory New", float: 0.0290, pattern: 0, price: 420.00, priceChange: -15.00, StatTrak: false, image: "", color: "#3b82f6", borderGradient: "from-gray-600 to-gray-800" },
  { id: "24", name: "Knife", weapon: "Butterfly Knife", rarity: "Covert", skin: "Doppler", wear: "Factory New", float: 0.0060, pattern: 670, price: 2800.00, priceChange: 95.00, StatTrak: false, image: "", color: "#ef4444", borderGradient: "from-red-500 to-blue-500" },
];

const priceHistory = [
  { month: "Ene", value: 10200 },
  { month: "Feb", value: 10800 },
  { month: "Mar", value: 11400 },
  { month: "Abr", value: 12100 },
  { month: "May", value: 11800 },
  { month: "Jun", value: 12400 },
  { month: "Jul", value: 12847 },
];

const inventoryStats = {
  totalValue: 12847.50,
  totalChange: 342.20,
  totalChangePercent: 2.74,
  totalItems: 24,
  totalGain: 2847.30,
  totalLoss: -523.80,
  avgFloat: 0.189,
};

const rarities: Rarity[] = ["Covert", "Classified", "Restricted", "Mil-Spec", "Industrial", "Consumer"];
const wearTypes = ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"];
const weaponTypes = [...new Set(skins.map((s) => s.weapon))];

function PriceChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const max = Math.max(...priceHistory.map((d) => d.value));
  const min = Math.min(...priceHistory.map((d) => d.value));
  const range = max - min;

  return (
    <div className="relative">
      <div className="flex items-end gap-2 h-48">
        {priceHistory.map((data, i) => {
          const height = ((data.value - min) / range) * 80 + 20;
          return (
            <div
              key={data.month}
              className="flex-1 flex flex-col items-center gap-2 relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === i && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-14 glass rounded-lg px-3 py-2 text-center z-10 whitespace-nowrap"
                >
                  <div className="text-xs font-bold text-success">${data.value.toLocaleString()}</div>
                  <div className="text-[10px] text-muted">{data.month} 2026</div>
                </motion.div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="w-full rounded-lg relative overflow-hidden cursor-pointer bg-gradient-to-t from-success/20 to-success/50 hover:from-success/30 hover:to-success/60 transition-colors"
              />
              <span className="text-[11px] text-muted">{data.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkinCard({ skin, index }: { skin: Skin; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const rarityStyle = rarityColors[skin.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300"
        style={{
          border: `1px solid ${isHovered ? rarityStyle.border : "rgba(255,255,255,0.06)"}`,
          boxShadow: isHovered ? `0 8px 32px ${rarityStyle.color}20` : "none",
        }}
      >
        {/* Rarity top bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${rarityStyle.color}, ${rarityStyle.color}80)` }}
        />

        {/* Skin image area */}
        <div
          className="relative h-36 flex items-center justify-center"
          style={{ background: rarityStyle.bg }}
        >
          {/* Weapon silhouette */}
          <div className="text-4xl font-bold opacity-20 select-none" style={{ color: rarityStyle.color }}>
            {skin.weapon === "Knife" ? "🔪" : skin.weapon === "Gloves" ? "🧤" : "🔫"}
          </div>

          {/* StatTrak badge */}
          {skin.StatTrak && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/90 text-white">
              StatTrak™
            </div>
          )}

          {/* Float badge */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono glass">
            {skin.float.toFixed(4)}
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
          >
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Eye className="h-4 w-4 text-white" />
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <ExternalLink className="h-4 w-4 text-white" />
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-3 glass-strong">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: rarityStyle.color }}>
              {skin.rarity}
            </span>
            <span className="text-[10px] text-muted">{skin.wear}</span>
          </div>
          <h4 className="text-sm font-semibold truncate">{skin.name}</h4>
          <p className="text-[11px] text-muted truncate">{skin.skin}</p>

          {skin.pattern > 0 && (
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              Pattern: #{skin.pattern}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            <span className="text-sm font-bold font-mono">${skin.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
            <span
              className={`text-[11px] font-medium flex items-center gap-0.5 ${
                skin.priceChange >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {skin.priceChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {skin.priceChange >= 0 ? "+" : ""}{skin.priceChange.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [selectedWear, setSelectedWear] = useState<string | null>(null);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "float" | "name">("price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [stattrakOnly, setStattrakOnly] = useState(false);

  const filteredSkins = skins
    .filter((skin) => {
      if (search && !skin.name.toLowerCase().includes(search.toLowerCase()) && !skin.skin.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedRarity && skin.rarity !== selectedRarity) return false;
      if (selectedWear && skin.wear !== selectedWear) return false;
      if (selectedWeapon && skin.weapon !== selectedWeapon) return false;
      if (stattrakOnly && !skin.StatTrak) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "price") return (a.price - b.price) * dir;
      if (sortBy === "float") return (a.float - b.float) * dir;
      return a.name.localeCompare(b.name) * dir;
    });

  const activeFilters = [selectedRarity, selectedWear, selectedWeapon, stattrakOnly ? "StatTrak" : null].filter(Boolean).length;

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
          Valor total de tu colección: <span className="text-foreground font-semibold">${inventoryStats.totalValue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
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
                <div className="text-xl font-bold font-mono">${inventoryStats.totalValue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success">+{inventoryStats.totalChangePercent}% este mes</span>
            </div>
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
                <div className="text-xl font-bold font-mono text-success">+${inventoryStats.totalGain.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
            <span className="text-xs text-muted">Desde compra</span>
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
                <div className="text-xl font-bold font-mono text-danger">${inventoryStats.totalLoss.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
            <span className="text-xs text-muted">Desde compra</span>
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
                <div className="text-xl font-bold font-mono">{inventoryStats.totalItems}</div>
              </div>
            </div>
            <span className="text-xs text-muted">Float avg: {inventoryStats.avgFloat}</span>
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
              <TrendingUp className="h-3 w-3 mr-1" />
              +{inventoryStats.totalChangePercent}%
            </Badge>
          </div>
          <PriceChart />
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
          Mostrando {filteredSkins.length} de {skins.length} objetos
        </span>
      </div>

      {/* Skins Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AnimatePresence>
          {filteredSkins.map((skin, i) => (
            <SkinCard key={skin.id} skin={skin} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filteredSkins.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted">No se encontraron skins con estos filtros</p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedRarity(null);
              setSelectedWear(null);
              setSelectedWeapon(null);
              setStattrakOnly(false);
            }}
            className="text-xs text-primary hover:text-primary-hover mt-2 cursor-pointer"
          >
            Limpiar filtros
          </button>
        </motion.div>
      )}
    </div>
  );
}
