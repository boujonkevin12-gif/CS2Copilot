import { InventoryItem, InventorySummary } from "@/types/inventory";
import { getDb } from "@/lib/db";
import { InventoryProvider } from "@/lib/services/inventory-provider.interface";
import { steamInventoryProvider } from "@/lib/services/providers/steam-inventory-provider";
import { renderInventoryProvider } from "@/lib/services/providers/render-inventory-provider";

const CACHE_TTL_MS = 30 * 60 * 1000;
const RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000;

const INVENTORY_API_URL = process.env.INVENTORY_API_URL;
let activeProvider: InventoryProvider = INVENTORY_API_URL ? renderInventoryProvider : steamInventoryProvider;

if (INVENTORY_API_URL) {
  console.log("[INVENTORY] usando Render backend:", INVENTORY_API_URL);
}

export function setInventoryProvider(provider: InventoryProvider) {
  activeProvider = provider;
}

async function checkRateLimitCooldown(steamId: string): Promise<boolean> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT rate_limit_until FROM inventory_fetch_state WHERE steam_id = ? AND rate_limit_until IS NOT NULL",
      args: [steamId],
    });
    if (result.rows.length === 0) return false;
    const until = result.rows[0].rate_limit_until as string;
    return until ? new Date(until).getTime() > Date.now() : false;
  } catch {
    return false;
  }
}

async function setRateLimitCooldown(steamId: string): Promise<void> {
  try {
    const db = getDb();
    const until = new Date(Date.now() + RATE_LIMIT_COOLDOWN_MS).toISOString();
    await db.execute({
      sql: "INSERT OR REPLACE INTO inventory_fetch_state (steam_id, rate_limit_until, fetching_since) VALUES (?, ?, NULL)",
      args: [steamId, until],
    });
  } catch {
    // silent
  }
}

interface CacheRow {
  items: string;
  knife_count: number;
  glove_count: number;
  rarity_distribution: string;
  category_distribution: string;
  total_items: number;
  cached_at: string;
  expires_at: string;
}

function mapRowToSummary(row: CacheRow): InventorySummary {
  return {
    totalItems: row.total_items,
    knifeCount: row.knife_count,
    gloveCount: row.glove_count,
    rarityDistribution: JSON.parse(row.rarity_distribution),
    categoryDistribution: JSON.parse(row.category_distribution),
  };
}

async function getCachedInventory(steamId: string): Promise<{ items: InventoryItem[]; summary: InventorySummary; cachedAt: string } | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM inventory_cache WHERE steam_id = ? AND datetime(expires_at) > datetime('now')",
      args: [steamId],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as unknown as CacheRow;
    const items = JSON.parse(row.items) as InventoryItem[];
    return { items, summary: mapRowToSummary(row), cachedAt: row.cached_at };
  } catch {
    return null;
  }
}

async function getStaleInventory(steamId: string): Promise<{ items: InventoryItem[]; summary: InventorySummary; cachedAt: string } | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM inventory_cache WHERE steam_id = ?",
      args: [steamId],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as unknown as CacheRow;
    const items = JSON.parse(row.items) as InventoryItem[];
    return { items, summary: mapRowToSummary(row), cachedAt: row.cached_at };
  } catch {
    return null;
  }
}

async function setCachedInventory(steamId: string, items: InventoryItem[], summary: InventorySummary): Promise<void> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    await db.execute({
      sql: `INSERT OR REPLACE INTO inventory_cache
        (steam_id, items, knife_count, glove_count,
         rarity_distribution, category_distribution, total_items, cached_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [steamId, JSON.stringify(items), summary.knifeCount, summary.gloveCount,
        JSON.stringify(summary.rarityDistribution), JSON.stringify(summary.categoryDistribution),
        summary.totalItems, now, expires],
    });
  } catch {
    // silent
  }
}

function computeSummary(items: InventoryItem[]): InventorySummary {
  let knifeCount = 0;
  let gloveCount = 0;
  const rarityDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};

  for (const item of items) {
    if (item.category === "knife") knifeCount++;
    if (item.category === "gloves") gloveCount++;
    const r = item.rarityName || item.rarity;
    rarityDistribution[r] = (rarityDistribution[r] || 0) + item.quantity;
    categoryDistribution[item.categoryLabel] = (categoryDistribution[item.categoryLabel] || 0) + item.quantity;
  }

  return { totalItems: items.length, knifeCount, gloveCount, rarityDistribution, categoryDistribution };
}

export async function getInventory(steamId: string, forceRefresh: boolean = false): Promise<{
  items: InventoryItem[];
  summary: InventorySummary;
  cached: boolean;
  cachedAt: string | null;
}> {
  if (!forceRefresh) {
    const cached = await getCachedInventory(steamId);
    if (cached) {
      console.log("[INVENTORY] cache hit", { steamId, items: cached.items.length, cachedAt: cached.cachedAt });
      return { ...cached, cached: true, cachedAt: cached.cachedAt };
    }
    console.log("[INVENTORY] cache expired", { steamId });
  }

  const inCooldown = await checkRateLimitCooldown(steamId);
  if (inCooldown) {
    const stale = await getStaleInventory(steamId);
    if (stale) {
      console.log("[INVENTORY] cooldown activo, sirviendo stale cache", { steamId });
      return { ...stale, cached: true, cachedAt: stale.cachedAt };
    }
    console.log("[INVENTORY] cooldown activo, sin cache", { steamId });
    throw new Error("steam_rate_limit");
  }

  let items: InventoryItem[];
  try {
    items = await activeProvider.getItems(steamId);
    console.log("[INVENTORY] steam response status: 200", { steamId, itemsFound: items.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    console.log("[INVENTORY] error del provider", { steamId, provider: activeProvider.name, error: msg });
    if (msg === "steam_rate_limit") {
      await setRateLimitCooldown(steamId);
      throw err;
    }
    const stale = await getStaleInventory(steamId);
    if (stale) {
      console.log("[INVENTORY] sirviendo stale cache por error", { steamId, error: msg });
      return { ...stale, cached: true, cachedAt: stale.cachedAt };
    }
    throw err;
  }

  const summary = computeSummary(items);

  if (items.length > 0) {
    await setCachedInventory(steamId, items, summary);
    console.log("[INVENTORY] cache guardado", { steamId, items: items.length });
  }

  return { items, summary, cached: false, cachedAt: new Date().toISOString() };
}
