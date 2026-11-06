import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Búsqueda pública sobre la DB → límite por IP para evitar abuso de LIKE.
  if (!rateLimit(`players/search:ip:${getClientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const q = (request.nextUrl.searchParams.get("q") || "").slice(0, 50).trim();
  if (!q) return NextResponse.json([]);

  const result = await getDb().execute({
    sql: `SELECT steam_id, steam_name, avatar_url FROM player_profile
          WHERE steam_name LIKE ? OR steam_id LIKE ?
          LIMIT 10`,
    args: [`%${q}%`, `%${q}%`],
  });

  return NextResponse.json(result.rows);
}
