import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const CS2_APPID = 730;
const CS2_CONTEXT_ID = 2;

interface SteamInventoryItem {
  id: string;
  name: string;
  market_hash_name: string;
  type: string;
  quality: string;
  icon_url: string;
  tradable: boolean;
  actions?: Array<{ link: string; name: string }>;
  market_actions?: Array<{ link: string; name: string }>;
  descriptions?: Array<{ type: string; value: string }>;
}

interface InventoryResponse {
  total_inventory_count: number;
  success: number;
  assets?: Record<string, Record<string, string>>[];
  descriptions?: Record<string, Record<string, unknown>>;
  more_items?: number;
}

export async function GET(request: NextRequest) {
  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "STEAM_API_KEY not configured" }, { status: 500 });
  }

  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let user;
  try {
    user = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  if (user.visibility !== 3) {
    return NextResponse.json({
      error: "inventario_privado",
      message: "Tu perfil de Steam debe ser público para consultar el inventario.",
    }, { status: 403 });
  }

  try {
    const url = `https://steamcommunity.com/inventory/${user.steamId}/${CS2_APPID}/${CS2_CONTEXT_ID}?count=500&l=spanish`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      return NextResponse.json({
        error: "inventory_fetch_failed",
        message: "No se pudo obtener el inventario. Verifica que tu perfil sea público.",
      }, { status: res.status });
    }

    const data: InventoryResponse = await res.json();

    if (!data.success) {
      return NextResponse.json({
        error: "inventory_empty_or_private",
        message: "El inventario está vacío o no es accesible.",
      }, { status: 404 });
    }

    const items: SteamInventoryItem[] = [];

    if (data.assets && data.descriptions) {
      for (const [appId, assets] of Object.entries(data.assets)) {
        for (const [classId, asset] of Object.entries(assets)) {
          const descRaw = data.descriptions[`${appId}_${classId}`];
          if (!descRaw) continue;
          const desc = descRaw as Record<string, unknown>;

          const name = String(desc.name || "");
          const marketHashName = String(desc.market_hash_name || name);
          const descs = Array.isArray(desc.descriptions) ? desc.descriptions : [];
          const qualityDesc = descs.find((d: unknown) => {
            const obj = d as Record<string, unknown>;
            return obj.type === "ordinal";
          }) as Record<string, unknown> | undefined;
          const quality = String(qualityDesc?.value || "");
          const iconUrl = String(desc.icon_url || "");
          const tradable = desc.tradable === 1;

          const tags = (Array.isArray(desc.tags) ? desc.tags : []) as Array<{ category: string; localized_tag_name: string }>;
          const typeTag = tags.find((t) => t.category === "type");
          const type = typeTag ? typeTag.localized_tag_name : "";

          items.push({
            id: asset.classid || classId,
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

    const rarityCount: Record<string, number> = {};
    for (const item of items) {
      const r = item.quality || "Normal";
      rarityCount[r] = (rarityCount[r] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      totalItems: data.total_inventory_count || items.length,
      items,
      rarityBreakdown: rarityCount,
    });
  } catch (error) {
    console.error("[Inventory] Error:", error);
    return NextResponse.json({
      error: "inventory_error",
      message: "Error al obtener el inventario de Steam.",
    }, { status: 500 });
  }
}
