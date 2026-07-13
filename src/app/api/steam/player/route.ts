import { NextRequest, NextResponse } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return NextResponse.json({ error: "steamId required" }, { status: 400 });
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API key not configured" }, { status: 500 });
  }

  try {
    const [summaryRes, bansRes, recentGamesRes] = await Promise.all([
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`),
      fetch(`https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamId}`),
      fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&count=5`),
    ]);

    const summary = await summaryRes.json();
    const bans = await bansRes.json();
    const recent = await recentGamesRes.json();

    const player = summary.response?.players?.[0] || null;
    const playerBans = bans.players?.[0] || null;
    const playedGames = recent.response?.games || [];

    const cs2 = playedGames.find((g: { appid: number }) => g.appid === 730);

    return NextResponse.json({
      player: player ? {
        steamId: player.steamid,
        name: player.personaname,
        avatar: player.avatarfull,
        avatarMedium: player.avatarmedium,
        avatarSmall: player.avatar,
        profileUrl: player.profileurl,
        country: player.loccountrycode,
        communityVisibilityState: player.communityvisibilitystate,
        lastLogoff: player.lastlogoff,
        createdAt: player.timecreated,
      } : null,
      bans: playerBans ? {
        communityBanned: playerBans.CommunityBanned,
        vacBanned: playerBans.VACBanned,
        numberOfVACBans: playerBans.NumberOfVACBans,
        numberOfGameBans: playerBans.NumberOfGameBans,
      } : null,
      cs2: cs2 ? {
        playtimeTotal: cs2.playtime_forever,
        playtime2Weeks: cs2.playtime_2weeks || 0,
      } : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch Steam data" }, { status: 500 });
  }
}
