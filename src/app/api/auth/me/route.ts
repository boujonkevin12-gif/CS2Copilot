import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");

  if (!cookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const userData = JSON.parse(decodeURIComponent(cookie.value));
    return NextResponse.json({ user: userData });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
