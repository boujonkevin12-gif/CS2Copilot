import { NextRequest, NextResponse } from "next/server";
import { getInventory } from "@/lib/services/inventory.service";

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
    if (msg === "rate_limited") {
      return NextResponse.json({
        success: false,
        error: "rate_limited",
        message: "Steam está limitando las solicitudes. Esperá unos minutos y probá de nuevo.",
        isPublic: true,
      }, { status: 429 });
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
