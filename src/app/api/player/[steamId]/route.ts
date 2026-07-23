import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSteamId } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  const { steamId } = await params;

  const result = await getDb().execute({
    sql: `SELECT steam_id, steam_name, avatar_url, profile_url, country, steam_level, cs2_hours,
          xp, level, pilot_coins, current_title, equipped_frame, equipped_background,
          equipped_effect, equipped_emoji, equipped_color, streak_days,
          total_wins, total_kills, total_headshots, total_mvps, total_hours,
          best_kd, best_hs_pct, best_elo, best_faceit_level, best_premier,
          total_clutches, total_aces, total_awp_kills, maps_played, total_login_days,
          created_at, updated_at
          FROM player_profile WHERE steam_id = ?`,
    args: [steamId],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
  }

  const profile = result.rows[0];

  // Get position
  const posResult = await getDb().execute({
    sql: "SELECT COUNT(*) as pos FROM player_profile WHERE xp > ?",
    args: [profile.xp || 0],
  });
  const position = ((posResult.rows[0]?.pos as number) || 0) + 1;

  const totalResult = await getDb().execute("SELECT COUNT(*) as total FROM player_profile");
  const totalPlayers = (totalResult.rows[0]?.total as number) || 0;

  // Get achievements
  const achResult = await getDb().execute({
    sql: "SELECT achievement_id, progress, unlocked, unlocked_at FROM achievements WHERE steam_id = ? AND unlocked = 1",
    args: [steamId],
  });

  // Get activity
  const actResult = await getDb().execute({
    sql: "SELECT action, value, created_at FROM action_log WHERE steam_id = ? ORDER BY created_at DESC LIMIT 20",
    args: [steamId],
  });

  // Get follower/following counts
  const followerCount = await getDb().execute({
    sql: "SELECT COUNT(*) as count FROM player_follows WHERE following_id = ?",
    args: [steamId],
  });
  const followingCount = await getDb().execute({
    sql: "SELECT COUNT(*) as count FROM player_follows WHERE follower_id = ?",
    args: [steamId],
  });

  // Check if current user follows this player
  let isFollowing = false;
  const currentUser = getSteamId(request);
  if (currentUser && currentUser !== steamId) {
    const followCheck = await getDb().execute({
      sql: "SELECT id FROM player_follows WHERE follower_id = ? AND following_id = ?",
      args: [currentUser, steamId],
    });
    isFollowing = followCheck.rows.length > 0;
  }

  return NextResponse.json({
    profile,
    position,
    totalPlayers,
    achievements: achResult.rows,
    activity: actResult.rows,
    followerCount: (followerCount.rows[0]?.count as number) || 0,
    followingCount: (followingCount.rows[0]?.count as number) || 0,
    isFollowing,
  });
}
