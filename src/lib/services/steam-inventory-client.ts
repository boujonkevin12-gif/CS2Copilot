const CS2_APPID = 730;
const CS2_CONTEXT_ID = 2;

export interface SteamInventoryItem {
  id: string;
  name: string;
  market_hash_name: string;
  type: string;
  quality: string;
  icon_url: string;
  tradable: boolean;
}

interface SteamInventoryResponse {
  total_inventory_count: number;
  success: number;
  assets?: Record<string, unknown>;
  descriptions?: Record<string, unknown>;
  more_items?: number;
  last_assetid?: string;
}

const PROXY_URLS = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

function parseInventoryItems(data: SteamInventoryResponse): SteamInventoryItem[] {
  const items: SteamInventoryItem[] = [];
  if (!data.assets || !data.descriptions) return items;

  const descriptionsObj = data.descriptions as Record<string, Record<string, unknown>>;
  const assetsObj = data.assets as Record<string, Record<string, Record<string, Record<string, string>>>>;

  for (const [appId, contexts] of Object.entries(assetsObj)) {
    if (typeof contexts !== "object" || contexts === null) continue;
    for (const [, assetsMap] of Object.entries(contexts)) {
      if (typeof assetsMap !== "object" || assetsMap === null) continue;
      for (const [assetId, assetRaw] of Object.entries(assetsMap)) {
        const descKey = `${appId}_${assetRaw.classid || ""}`;
        const descRaw = descriptionsObj[descKey];
        if (!descRaw) continue;

        const name = String(descRaw.name || "");
        const marketHashName = String(descRaw.market_hash_name || name);
        const descs = Array.isArray(descRaw.descriptions) ? descRaw.descriptions : [];
        const qualityDesc = descs.find((d: unknown) => {
          const obj = d as Record<string, unknown>;
          return obj.type === "ordinal";
        }) as Record<string, unknown> | undefined;
        const quality = String(qualityDesc?.value || "");
        const iconUrl = String(descRaw.icon_url || "");
        const tradable = descRaw.tradable === 1;

        const tags = (Array.isArray(descRaw.tags) ? descRaw.tags : []) as Array<{ category: string; localized_tag_name: string }>;
        const typeTag = tags.find((t) => t.category === "type");
        const type = typeTag ? typeTag.localized_tag_name : "";

        items.push({
          id: assetId,
          name,
          market_hash_name: marketHashName,
          type,
          quality,
          icon_url: iconUrl,
          tradable,
        });
      }
    }
  }
  return items;
}

async function fetchWithProxy(steamId: string, startAssetId?: string): Promise<SteamInventoryResponse> {
  const params = new URLSearchParams({ count: "5000", l: "english" });
  if (startAssetId) params.set("start_assetid", startAssetId);

  const targetUrl = `https://steamcommunity.com/inventory/${steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}?${params.toString()}`;

  // Try direct first (works if user has Steam open in another tab and CORS is supported)
  try {
    const directRes = await fetch(targetUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (directRes.ok) {
      const text = await directRes.text();
      if (text && text !== "null") {
        return JSON.parse(text);
      }
    }
  } catch {
    // Direct failed, try proxies
  }

  // Try each proxy
  for (const proxyFn of PROXY_URLS) {
    try {
      const proxyUrl = proxyFn(targetUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) });
      if (res.ok) {
        const text = await res.text();
        if (text && text !== "null") {
          const parsed = JSON.parse(text);
          if (parsed.success === 1) return parsed;
        }
      }
    } catch {
      continue;
    }
  }

  throw new Error("No se pudo conectar con Steam. Verificá que tu perfil y tu inventario sean públicos.");
}

export async function fetchInventoryClientSide(
  steamId: string,
  onProgress?: (page: number, total: number) => void
): Promise<{ items: SteamInventoryItem[]; totalItems: number; rarityBreakdown: Record<string, number> }> {
  const allItems: SteamInventoryItem[] = [];
  let lastAssetId: string | undefined;
  let totalInventoryCount = 0;
  let page = 0;
  const MAX_PAGES = 20;

  while (page < MAX_PAGES) {
    onProgress?.(page + 1, totalInventoryCount);
    const data = await fetchWithProxy(steamId, lastAssetId);

    if (!data.success) {
      throw new Error("El inventario no es accesible desde Steam.");
    }

    totalInventoryCount = data.total_inventory_count || 0;
    const items = parseInventoryItems(data);
    allItems.push(...items);

    if (data.more_items && data.last_assetid) {
      lastAssetId = data.last_assetid;
      page++;
    } else {
      break;
    }
  }

  const rarityBreakdown: Record<string, number> = {};
  for (const item of allItems) {
    const r = item.quality || "Normal";
    rarityBreakdown[r] = (rarityBreakdown[r] || 0) + 1;
  }

  return {
    items: allItems,
    totalItems: totalInventoryCount || allItems.length,
    rarityBreakdown,
  };
}
