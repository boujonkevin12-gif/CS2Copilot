import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  // Ruta de debug: no debe estar expuesta en producción.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = getSession(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const steamId = user.steamId;

  console.log("[STEAM_INVENTORY_DEBUG] steamId recibido:", steamId);
  console.log("[STEAM_INVENTORY_DEBUG] longitud steamId:", steamId?.length);

  if (!steamId) {
    return NextResponse.json({ success: false, error: "No hay Steam ID vinculado" }, { status: 400 });
  }

  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;

  console.log("[STEAM_INVENTORY_DEBUG] URL:", url);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });

    clearTimeout(timer);

    console.log("[STEAM_INVENTORY_DEBUG] status HTTP:", res.status);
    console.log("[STEAM_INVENTORY_DEBUG] statusText:", res.statusText);

    const text = await res.text();

    if (text === "null") {
      console.log("[STEAM_INVENTORY_DEBUG] respuesta Steam: null");
      return NextResponse.json({
        success: false,
        error: "null_response",
        message: "Steam devolvió null. El inventario puede ser privado o el SteamID incorrecto.",
        steamId,
        status: res.status,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log("[STEAM_INVENTORY_DEBUG] respuesta Steam (no JSON):", text.slice(0, 1000));
      return NextResponse.json({
        success: false,
        error: "invalid_json",
        message: "Steam devolvió contenido no JSON",
        raw: text.slice(0, 1000),
      });
    }

    console.log("[STEAM_INVENTORY_DEBUG] respuesta Steam success:", data.success);
    console.log("[STEAM_INVENTORY_DEBUG] cantidad items:", data.total_inventory_count);
    console.log("[STEAM_INVENTORY_DEBUG] más páginas:", data.more_items);

    return NextResponse.json({
      success: data.success === 1,
      steamId,
      total_inventory_count: data.total_inventory_count,
      more_items: data.more_items,
      itemCount: data.assets ? Object.keys(data.assets).length : 0,
      rawSuccess: data.success,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("[STEAM_INVENTORY_DEBUG] error en fetch:", msg);
    return NextResponse.json({
      success: false,
      error: "fetch_failed",
      message: msg,
    }, { status: 500 });
  }
}
