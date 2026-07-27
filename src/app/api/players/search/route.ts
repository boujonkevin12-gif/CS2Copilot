import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json([]);

  const result = await getDb().execute({
    sql: `SELECT steam_id, steam_name, avatar_url FROM player_profile
          WHERE steam_name LIKE ? OR steam_id LIKE ?
          LIMIT 10`,
    args: [`%${q}%`, `%${q}%`],
  });

  return NextResponse.json(result.rows);
}
