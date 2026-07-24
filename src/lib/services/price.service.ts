import { PriceProvider, PriceData } from "./price-provider.interface";
import { getDb } from "@/lib/db";

const STEAMAPIS_KEY = process.env.STEAMAPIS_KEY;

// ─── CSGOBackpack provider (default, no API key, rate-limited) ───

export class CSGOBackpackPriceProvider implements PriceProvider {
  readonly name = "csgobackpack";

  async getPrice(marketHashName: string): Promise<PriceData | null> {
    const url = `https://csgobackpack.net/api/GetItemPrice/?item=${encodeURIComponent(marketHashName)}&time=7&currency=USD`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "CS2Pilot/1.0" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.success) return null;
      const price = data.average_price || data.median_price || data.lowest_price;
      if (price == null) return null;
      const num = parseFloat(String(price).replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return null;
      return {
        price: num,
        currency: "USD",
        source: this.name,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async getPrices(items: string[]): Promise<Map<string, PriceData | null>> {
    const results = new Map<string, PriceData | null>();
    for (let i = 0; i < items.length; i++) {
      const result = await this.getPrice(items[i]);
      results.set(items[i], result);
      if (i < items.length - 1) await sleep(2000);
    }
    return results;
  }
}

// ─── Steamapis provider (bulk, requires STEAMAPIS_KEY) ───

export class SteamapisPriceProvider implements PriceProvider {
  readonly name = "steamapis";

  async getPrice(_marketHashName: string): Promise<PriceData | null> {
    return null;
  }

  async getPrices(_items: string[]): Promise<Map<string, PriceData | null>> {
    if (!STEAMAPIS_KEY) return new Map();
    try {
      const url = `https://api.steamapis.com/market/items/730?api_key=${STEAMAPIS_KEY}&compact=1`;
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) return new Map();
      const data = await res.json();
      if (!data || !data.data) return new Map();
      const results = new Map<string, PriceData | null>();
      for (const item of data.data) {
        const name = item.item_name || item.market_hash_name;
        if (!name) continue;
        const price = item.latest_price || item.median_price || item.safe_price;
        if (price != null && !isNaN(Number(price))) {
          results.set(name, {
            price: Number(price),
            currency: "USD",
            source: this.name,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      return results;
    } catch {
      return new Map();
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getProvider(): PriceProvider {
  if (STEAMAPIS_KEY) return new SteamapisPriceProvider();
  return new CSGOBackpackPriceProvider();
}

// ─── Database reads (only these are called during inventory load) ───

export async function getCachedPricesBatch(
  marketHashNames: string[]
): Promise<Map<string, PriceData | null>> {
  const result = new Map<string, PriceData | null>();
  if (marketHashNames.length === 0) return result;
  try {
    const db = getDb();
    const placeholders = marketHashNames.map(() => "?").join(",");
    const rows = await db.execute({
      sql: `SELECT market_hash_name, price, currency, source, updated_at
            FROM price_cache
            WHERE market_hash_name IN (${placeholders})
              AND updated_at IS NOT NULL`,
      args: marketHashNames,
    });
    const found = new Set<string>();
    for (const row of rows.rows) {
      const name = String(row.market_hash_name);
      found.add(name);
      result.set(name, {
        price: Number(row.price),
        currency: String(row.currency || "USD"),
        source: String(row.source || "cache"),
        updatedAt: String(row.updated_at),
      });
    }
    for (const name of marketHashNames) {
      if (!found.has(name)) result.set(name, null);
    }
  } catch {
    for (const name of marketHashNames) result.set(name, null);
  }
  return result;
}

// ─── Queue: mark items as needing price lookup ───

export async function enqueuePriceLookups(marketHashNames: string[]): Promise<void> {
  if (marketHashNames.length === 0) return;
  try {
    const db = getDb();
    const now = new Date().toISOString();
    for (const name of marketHashNames) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO price_cache (market_hash_name, price, currency, source, updated_at, last_requested, pending)
              VALUES (?, 0, 'USD', '', NULL, NULL, 1)`,
        args: [name],
      });
      await db.execute({
        sql: `UPDATE price_cache SET pending = 1, last_requested = COALESCE(last_requested, ?)
              WHERE market_hash_name = ? AND (updated_at IS NULL OR pending = 1)`,
        args: [now, name],
      });
    }
  } catch {
    // silent
  }
}

// ─── Refresh prices (background, respects rate limits) ───

export interface RefreshResult {
  processed: number;
  succeeded: number;
  failed: number;
  provider: string;
}

export async function refreshPendingPrices(batchSize: number = 30): Promise<RefreshResult> {
  const result: RefreshResult = { processed: 0, succeeded: 0, failed: 0, provider: "none" };
  try {
    const db = getDb();
    const pending = await db.execute({
      sql: `SELECT market_hash_name FROM price_cache
            WHERE pending = 1
              AND (last_requested IS NULL OR datetime(last_requested, '+1 hour') < datetime('now'))
            LIMIT ?`,
      args: [batchSize],
    });
    if (pending.rows.length === 0) return result;
    const names = pending.rows.map((r) => String(r.market_hash_name));
    result.processed = names.length;
    const provider = getProvider();
    result.provider = provider.name;
    const prices = await provider.getPrices(names);
    const now = new Date().toISOString();
    for (const [name, priceData] of prices) {
      if (priceData) {
        await db.execute({
          sql: `UPDATE price_cache SET price = ?, currency = ?, source = ?, updated_at = ?, last_requested = ?, pending = 0
                WHERE market_hash_name = ?`,
          args: [priceData.price, priceData.currency, priceData.source, priceData.updatedAt, now, name],
        });
        result.succeeded++;
      } else {
        await db.execute({
          sql: `UPDATE price_cache SET last_requested = ?, pending = 0 WHERE market_hash_name = ?`,
          args: [now, name],
        });
        result.failed++;
      }
    }
  } catch {
    // silent
  }
  return result;
}

// ─── Force full refresh (for cron jobs, uses bulk provider if available) ───

export async function refreshAllPrices(): Promise<RefreshResult> {
  const provider = new SteamapisPriceProvider();
  if (provider.name !== "steamapis" || !STEAMAPIS_KEY) {
    return { processed: 0, succeeded: 0, failed: 0, provider: "steamapis_unavailable" };
  }
  const result: RefreshResult = { processed: 0, succeeded: 0, failed: 0, provider: "steamapis" };
  try {
    const prices = await provider.getPrices([]);
    if (prices.size === 0) return result;
    const db = getDb();
    const now = new Date().toISOString();
    let count = 0;
    for (const [name, priceData] of prices) {
      if (priceData) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO price_cache (market_hash_name, price, currency, source, updated_at, last_requested, pending)
                VALUES (?, ?, ?, ?, ?, ?, 0)`,
          args: [name, priceData.price, priceData.currency, priceData.source, priceData.updatedAt, now],
        });
        count++;
      }
    }
    result.processed = count;
    result.succeeded = count;
  } catch {
    // silent
  }
  return result;
}
