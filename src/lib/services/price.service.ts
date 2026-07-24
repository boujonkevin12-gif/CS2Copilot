import { PriceProvider, PriceData } from "./price-provider.interface";
import { getDb } from "@/lib/db";

const PRICE_CACHE_TTL = 6 * 60 * 60 * 1000;

export class SteamMarketPriceProvider implements PriceProvider {
  readonly name = "steam_market";

  async getPrice(marketHashName: string): Promise<PriceData | null> {
    const url = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(marketHashName)}`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.success || !data.lowest_price) return null;
      const price = parseFloat(data.lowest_price.replace(/[^0-9.,]/g, "").replace(",", "."));
      if (isNaN(price)) return null;
      return {
        price,
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
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((name) => this.getPrice(name))
      );
      batch.forEach((name, idx) => {
        const r = batchResults[idx];
        results.set(name, r.status === "fulfilled" ? r.value : null);
      });
      if (i + batchSize < items.length) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    return results;
  }
}

export async function getCachedPrice(marketHashName: string): Promise<PriceData | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT price, currency, source, updated_at FROM price_cache WHERE market_hash_name = ? AND datetime(updated_at, '+6 hours') > datetime('now')",
      args: [marketHashName],
    });
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        price: Number(row.price),
        currency: String(row.currency || "USD"),
        source: String(row.source || "cache"),
        updatedAt: String(row.updated_at),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCachedPrice(marketHashName: string, data: PriceData): Promise<void> {
  try {
    const db = getDb();
    await db.execute({
      sql: "INSERT OR REPLACE INTO price_cache (market_hash_name, price, currency, source, updated_at) VALUES (?, ?, ?, ?, ?)",
      args: [marketHashName, data.price, data.currency, data.source, data.updatedAt],
    });
  } catch {
    // silent
  }
}

export async function getPricesBulk(marketHashNames: string[], provider?: PriceProvider): Promise<Map<string, PriceData | null>> {
  const effective = provider || new SteamMarketPriceProvider();
  const result = new Map<string, PriceData | null>();
  const uncached: string[] = [];

  for (const name of marketHashNames) {
    const cached = await getCachedPrice(name);
    if (cached) {
      result.set(name, cached);
    } else {
      uncached.push(name);
    }
  }

  if (uncached.length > 0) {
    const fresh = await effective.getPrices(uncached);
    for (const [name, data] of fresh) {
      result.set(name, data);
      if (data) {
        await setCachedPrice(name, data);
      }
    }
  }

  return result;
}
