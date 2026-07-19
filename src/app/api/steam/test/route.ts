import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "STEAM_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=76561198000000000`
    );
    const data = await res.json();
    return NextResponse.json({
      ok: true,
      status: res.status,
      hasPlayers: Boolean(data?.response?.players?.length),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
