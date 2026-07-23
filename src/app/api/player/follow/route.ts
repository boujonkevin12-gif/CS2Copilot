import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSteamId } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { targetId, action } = await request.json();
  if (!targetId) return NextResponse.json({ error: "Falta targetId" }, { status: 400 });
  if (targetId === steamId) return NextResponse.json({ error: "No puedes seguirte a ti mismo" }, { status: 400 });

  if (action === "unfollow") {
    await getDb().execute({
      sql: "DELETE FROM player_follows WHERE follower_id = ? AND following_id = ?",
      args: [steamId, targetId],
    });
    const count = await getDb().execute({
      sql: "SELECT COUNT(*) as count FROM player_follows WHERE following_id = ?",
      args: [targetId],
    });
    return NextResponse.json({ following: false, followerCount: (count.rows[0]?.count as number) || 0 });
  }

  // Follow
  try {
    await getDb().execute({
      sql: "INSERT INTO player_follows (follower_id, following_id) VALUES (?, ?)",
      args: [steamId, targetId],
    });
  } catch {
    // Already following (UNIQUE constraint)
  }

  const count = await getDb().execute({
    sql: "SELECT COUNT(*) as count FROM player_follows WHERE following_id = ?",
    args: [targetId],
  });
  return NextResponse.json({ following: true, followerCount: (count.rows[0]?.count as number) || 0 });
}
