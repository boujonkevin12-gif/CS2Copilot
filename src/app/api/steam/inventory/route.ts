import { NextRequest, NextResponse } from "next/server";
import { getInventory } from "@/lib/services/inventory.service";

const STEAMID64_REGEX = /^\d{17}$/;

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("cs2pilot_user");
    if (!cookie) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    let user;
    try { user = JSON.parse(cookie.value); } catch {
      return NextResponse.json({ success: false, error: "Sesión inválida" }, { status: 401 });
    }

    const steamId = user.steamId;

    if (!steamId) {
      return NextResponse.json({ success: false, error: "No hay Steam ID vinculado" }, { status: 400 });
    }

    if (!STEAMID64_REGEX.test(steamId)) {
      return NextResponse.json({
        success: false,
        error: "invalid_steam_id",
        message: "El SteamID vinculado no es válido",
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const result = await getInventory(steamId, forceRefresh);

    return NextResponse.json({
      success: true,
      steamId,
      items: result.items,
      summary: result.summary,
      cached: result.cached,
      cachedAt: result.cachedAt,
      isPublic: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";

    if (msg === "steam_rate_limit") {
      return NextResponse.json({
        success: false,
        error: "steam_rate_limit",
        message: "Steam está limitando solicitudes",
        isPublic: true,
      }, { status: 429 });
    }
    if (msg === "inventory_unavailable") {
      return NextResponse.json({
        success: false,
        error: "inventory_unavailable",
        message: "El inventario de CS2 no está disponible. Puede estar privado o el SteamID ser incorrecto.",
        isPublic: true,
      }, { status: 404 });
    }
    if (msg === "private") {
      return NextResponse.json({
        success: false,
        error: "private",
        message: "Tu inventario de Steam debe ser público para usar esta función.",
        isPublic: false,
      }, { status: 403 });
    }
    return NextResponse.json({
      success: false,
      error: "fetch_error",
      message: "No se pudo obtener el inventario. Verificá que tu perfil sea público.",
      isPublic: true,
    }, { status: 500 });
  }
}
