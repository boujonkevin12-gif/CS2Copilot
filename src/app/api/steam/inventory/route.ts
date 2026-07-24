import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const CS2_APPID = 730;
const CS2_CONTEXT_ID = 2;
const CACHE_TTL_MS = 10 * 60 * 1000;

interface SteamItem {
  id: string;
  name: string;
  market_hash_name: string;
  type: string;
  quality: string;
  icon_url: string;
  tradable: boolean;
}

interface CacheEntry {
  data: { items: SteamItem[]; total: number; rarityBreakdown: Record<string, number> };
  expiry: number;
}

const cache = new Map<string, CacheEntry>();

function log(label: string, detail: Record<string, unknown>) {
  console.error(`[Inventory/${label}]`, JSON.stringify(detail));
}

function getCached(steamId: string): CacheEntry["data"] | null {
  const entry = cache.get(steamId);
  if (entry && Date.now() < entry.expiry) return entry.data;
  cache.delete(steamId);
  return null;
}

function setCache(steamId: string, data: CacheEntry["data"]) {
  cache.set(steamId, { data, expiry: Date.now() + CACHE_TTL_MS });
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

async function fetchSteamInventory(steamId: string): Promise<{ items: SteamItem[]; total: number }> {
  const params = new URLSearchParams({ count: "200", l: "english" });
  const url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}?${params.toString()}`;

  async function doFetch(): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      return await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Primer intento ──
  let res = await doFetch();

  const collectHeaders = (r: Response): Record<string, string> => {
    const h: Record<string, string> = {};
    r.headers.forEach((v, k) => { h[k] = v; });
    return h;
  };

  const retryAfter = res.headers.get("retry-after") || "none";

  // 429 de Steam → loguear todo y fallar sin reintentar
  if (res.status === 429) {
    const body = await res.text().catch(() => "");
    log("rate_limited", {
      steamId,
      url,
      status: res.status,
      retryAfter,
      headers: collectHeaders(res),
      bodySnippet: body.slice(0, 500),
    });
    throw new Error("demasiadas_solicitudes");
  }

  // 403 → perfil privado
  if (res.status === 403) {
    const body = await res.text().catch(() => "");
    log("forbidden", { steamId, status: res.status, headers: collectHeaders(res), bodySnippet: body.slice(0, 500) });
    throw new Error("inventario_privado");
  }

  // Error transitorio (timeout, 5xx) → un único reintento con backoff 2s
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    log("transient_error", {
      steamId, status: res.status, retryAfter, headers: collectHeaders(res), bodySnippet: body.slice(0, 500),
      action: "retrying in 2s",
    });
    await new Promise((r) => setTimeout(r, 2000));

    // ── Reintento ──
    res = await doFetch();

    if (res.status === 429) {
      const retryBody = await res.text().catch(() => "");
      log("rate_limited_after_retry", {
        steamId, status: res.status, retryAfter: res.headers.get("retry-after") || "none",
        headers: collectHeaders(res), bodySnippet: retryBody.slice(0, 500),
      });
      throw new Error("demasiadas_solicitudes");
    }

    if (res.status === 403) {
      const retryBody = await res.text().catch(() => "");
      log("forbidden_after_retry", { steamId, status: res.status, headers: collectHeaders(res), bodySnippet: retryBody.slice(0, 500) });
      throw new Error("inventario_privado");
    }

    if (!res.ok) {
      const retryBody = await res.text().catch(() => "");
      log("error_after_retry", {
        steamId, status: res.status, retryAfter: res.headers.get("retry-after") || "none",
        headers: collectHeaders(res), bodySnippet: retryBody.slice(0, 500),
      });
      throw new Error(`Steam respondió con ${res.status}`);
    }
  }

  const headersOk = collectHeaders(res);
  const text = await res.text();

  if (!text || text === "null") {
    log("empty_body", { steamId, headers: headersOk });
    return { items: [], total: 0 };
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    log("parse_error", { steamId, headers: headersOk, bodySnippet: text.slice(0, 500) });
    throw new Error("inventario_no_accesible");
  }

  if (data.success !== 1) {
    log("bad_success", { steamId, success: data.success, headers: headersOk, bodySnippet: text.slice(0, 500) });
    throw new Error("inventario_no_accesible");
  }

  return {
    items: parseInventory(data),
    total: data.total_inventory_count || 0,
  };
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let user;
  try { user = JSON.parse(cookie.value); } catch { return NextResponse.json({ error: "Invalid session" }, { status: 401 }); }

  const steamId = user.steamId;
  if (!steamId) return NextResponse.json({ error: "No Steam ID" }, { status: 400 });

  // ── Caché: evitar consultar Steam si ya tenemos datos frescos ──
  const cached = getCached(steamId);
  if (cached) {
    return NextResponse.json({ success: true, steamId, isPublic: true, ...cached, totalItems: cached.total, cached: true });
  }

  // ── Verificación de visibilidad (solo si tenemos API key) ──
  if (STEAM_API_KEY) {
    try {
      const visCtrl = new AbortController();
      const visTimer = setTimeout(() => visCtrl.abort(), 10000);
      try {
        const summaryRes = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`,
          { signal: visCtrl.signal }
        );
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          const player = summaryData?.response?.players?.[0];
          if (player && Number(player.communityvisibilitystate) !== 3) {
            return NextResponse.json({ error: "inventario_privado", message: "Tu perfil de Steam debe ser público.", steamId, isPublic: false }, { status: 403 });
          }
        }
      } finally { clearTimeout(visTimer); }
    } catch { /* continue */ }
  }

  // ── Fetch del inventario ──
  try {
    const result = await fetchSteamInventory(steamId);
    const rarityBreakdown: Record<string, number> = {};
    for (const item of result.items) { const r = item.quality || "Normal"; rarityBreakdown[r] = (rarityBreakdown[r] || 0) + 1; }
    const payload: CacheEntry["data"] = { items: result.items, total: result.total, rarityBreakdown };
    setCache(steamId, payload);
    return NextResponse.json({ success: true, steamId, isPublic: true, ...payload, totalItems: payload.total });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    if (msg === "inventario_privado") return NextResponse.json({ error: "inventario_privado", message: "Tu inventario debe ser público.", steamId, isPublic: false }, { status: 403 });
    if (msg === "inventario_no_accesible") return NextResponse.json({ error: "inventario_no_accesible", message: "No se pudo acceder al inventario.", steamId, isPublic: false }, { status: 403 });
    if (msg === "demasiadas_solicitudes") return NextResponse.json({ error: "demasiadas_solicitudes", message: "Steam está limitando las solicitudes. Esperá unos minutos y probá de nuevo.", steamId, isPublic: true }, { status: 429 });
    return NextResponse.json({ error: "fetch_error", message: msg, steamId, isPublic: true }, { status: 500 });
  }
}
