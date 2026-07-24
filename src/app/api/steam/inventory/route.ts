import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const CS2_APPID = 730;
const CS2_CONTEXT_ID = 2;

interface SteamItem {
  id: string;
  name: string;
  market_hash_name: string;
  type: string;
  quality: string;
  icon_url: string;
  tradable: boolean;
}

function parseInventory(data: any): SteamItem[] {
  if (!data?.assets || !data?.descriptions) return [];
  const items: SteamItem[] = [];
  const descriptions = data.descriptions as Record<string, any>;
  const assets = data.assets as Record<string, any>;
  for (const [_appId, contexts] of Object.entries(assets)) {
    if (typeof contexts !== "object" || !contexts) continue;
    for (const [, assetsMap] of Object.entries(contexts)) {
      if (typeof assetsMap !== "object" || !assetsMap) continue;
      for (const [assetId, assetRaw] of Object.entries(assetsMap)) {
        const raw = assetRaw as Record<string, string>;
        const descKey = `${_appId}_${raw.classid || ""}`;
        const desc = descriptions[descKey];
        if (!desc) continue;
        const descs: any[] = Array.isArray(desc.descriptions) ? desc.descriptions : [];
        const qualityDesc = descs.find((d: any) => d.type === "ordinal");
        const tags: any[] = Array.isArray(desc.tags) ? desc.tags : [];
        const typeTag = tags.find((t: any) => t.category === "type");
        items.push({
          id: assetId,
          name: String(desc.name || ""),
          market_hash_name: String(desc.market_hash_name || desc.name || ""),
          type: typeTag ? String(typeTag.localized_tag_name) : "",
          quality: String(qualityDesc?.value || ""),
          icon_url: String(desc.icon_url || ""),
          tradable: desc.tradable === 1,
        });
      }
    }
  }
  return items;
}

async function fetchInventoryPage(steamId: string, startAssetId?: string): Promise<{
  items: SteamItem[]; total: number; more: boolean; lastAssetId: string | null;
}> {
  const params = new URLSearchParams({ count: "5000", l: "english" });
  if (startAssetId) params.set("start_assetid", startAssetId);
  const url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}?${params.toString()}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("inventario_privado");
    throw new Error(`Steam responded with ${res.status}`);
  }
  const text = await res.text();
  if (!text || text === "null") return { items: [], total: 0, more: false, lastAssetId: null };
  const data = JSON.parse(text);
  if (data.success !== 1) throw new Error("inventario_no_accesible");
  return {
    items: parseInventory(data),
    total: data.total_inventory_count || 0,
    more: data.more_items === 1,
    lastAssetId: data.last_assetid || null,
  };
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  let user;
  try { user = JSON.parse(cookie.value); } catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }
  const steamId = user.steamId;
  if (!steamId) return NextResponse.json({ error: "No Steam ID" }, { status: 400 });
  if (STEAM_API_KEY) {
    try {
      const summaryRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const player = summaryData?.response?.players?.[0];
        if (player && Number(player.communityvisibilitystate) !== 3) {
          return NextResponse.json({ error: "inventario_privado", message: "Tu perfil de Steam debe ser público.", steamId, isPublic: false }, { status: 403 });
        }
      }
    } catch { /* continue */ }
  }
  try {
    const allItems: SteamItem[] = [];
    let lastAssetId: string | undefined;
    let totalItems = 0;
    let page = 0;
    while (page < 20) {
      const result = await fetchInventoryPage(steamId, lastAssetId);
      if (page === 0) totalItems = result.total;
      allItems.push(...result.items);
      if (result.more && result.lastAssetId) { lastAssetId = result.lastAssetId; page++; } else break;
    }
    const rarityBreakdown: Record<string, number> = {};
    for (const item of allItems) { const r = item.quality || "Normal"; rarityBreakdown[r] = (rarityBreakdown[r] || 0) + 1; }
    return NextResponse.json({ success: true, steamId, isPublic: true, items: allItems, totalItems: totalItems || allItems.length, rarityBreakdown });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (msg === "inventario_privado") return NextResponse.json({ error: "inventario_privado", message: "Tu inventario debe ser público.", steamId, isPublic: false }, { status: 403 });
    if (msg === "inventario_no_accesible") return NextResponse.json({ error: "inventario_no_accesible", message: "No se pudo acceder al inventario.", steamId, isPublic: false }, { status: 403 });
    return NextResponse.json({ error: "fetch_error", message: msg, steamId, isPublic: true }, { status: 500 });
  }
}
