"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Package, ExternalLink, LogIn } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { InventoryItem, InventorySummary as SummaryType, InventoryResponse, EXTERIOR_ORDER, RARITY_ORDER } from "@/types/inventory";
import { InventoryGrid } from "@/components/inventory/inventory-grid";
import { InventoryFilters, FilterState, DEFAULT_FILTERS } from "@/components/inventory/inventory-filters";
import { InventorySummary } from "@/components/inventory/inventory-summary";
import { InventoryStats } from "@/components/inventory/inventory-stats";
import { InventoryLoading } from "@/components/inventory/inventory-loading";
import { InventoryError } from "@/components/inventory/inventory-error";

export default function InventoryPage() {
  const { user, loading } = useUser();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | undefined>();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchInventory = useCallback(async (refresh = false) => {
    if (!user?.steamId) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (refresh) setRefreshing(true);
    else setPageLoading(true);
    setError(null);

    try {
      const url = refresh ? "/api/steam/inventory?refresh=true" : "/api/steam/inventory";
      const res = await fetch(url);
      const data: InventoryResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Error al obtener inventario");
        setErrorType(data.error);
        return;
      }

      setItems(data.items || []);
      setSummary(data.summary || null);
      setCachedAt(data.cachedAt || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setPageLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const steamLink = user?.steamId
    ? `https://steamcommunity.com/profiles/${user.steamId}/inventory/#730`
    : "";

  const rarityOptions = useMemo(() => {
    if (!summary) return [];
    return [...new Set(items.map((i) => i.rarity))];
  }, [items, summary]);

  const exteriorOptions = useMemo(() => {
    return [...new Set(items.map((i) => i.exterior).filter(Boolean))] as string[];
  }, [items]);

  const categoryOptions = useMemo(() => {
    return [...new Set(items.map((i) => i.categoryLabel))];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.marketHashName.toLowerCase().includes(q) ||
        i.weapon.toLowerCase().includes(q)
      );
    }

    if (filters.rarity.length > 0) {
      result = result.filter((i) => filters.rarity.includes(i.rarity));
    }

    if (filters.exterior.length > 0) {
      result = result.filter((i) => filters.exterior.includes(i.exterior));
    }

    if (filters.category.length > 0) {
      result = result.filter((i) => filters.category.includes(i.categoryLabel));
    }

    if (filters.stattrak !== null) {
      result = result.filter((i) => i.stattrak === filters.stattrak);
    }

    if (filters.souvenir !== null) {
      result = result.filter((i) => i.souvenir === filters.souvenir);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "rarity":
          cmp = (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0);
          if (cmp === 0) cmp = (EXTERIOR_ORDER[a.exterior] ?? 0) - (EXTERIOR_ORDER[b.exterior] ?? 0);
          break;
        default:
          cmp = 0;
      }
      return filters.sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [items, filters]);

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-zinc-200 mb-2">Conecta tu Steam</h2>
          <p className="text-sm text-zinc-400 mb-6 max-w-sm">
            Conectá tu perfil de Steam para ver tu inventario de CS2.
          </p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors">
            <LogIn className="h-4 w-4" />
            Conectar con Steam
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-200 flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              Inventario
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {summary ? `${summary.totalItems} objetos` : "Cargando..."}
              {cachedAt && !pageLoading && (
                <span className="text-zinc-600 ml-1.5">· En caché</span>
              )}
            </p>
          </div>
          {steamLink && (
            <a
              href={steamLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              Ver en Steam
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </motion.div>

      {pageLoading && <InventoryLoading />}

      {!pageLoading && error && (
        <InventoryError
          error={error}
          errorType={errorType}
          steamId={user?.steamId}
          onRetry={() => fetchInventory(true)}
        />
      )}

      {!pageLoading && !error && summary && (
        <>
          <InventorySummary summary={summary} />
          <InventoryStats
            rarityDistribution={summary.rarityDistribution}
            categoryDistribution={summary.categoryDistribution}
          />
          <InventoryFilters
            filters={filters}
            onChange={setFilters}
            view={view}
            onViewChange={setView}
            onRefresh={() => fetchInventory(true)}
            refreshing={refreshing}
            totalFiltered={filteredItems.length}
            rarityOptions={rarityOptions}
            exteriorOptions={exteriorOptions}
            categoryOptions={categoryOptions}
          />
          <InventoryGrid items={filteredItems} />
        </>
      )}
    </div>
  );
}
