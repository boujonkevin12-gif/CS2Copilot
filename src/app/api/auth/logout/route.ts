import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const isSecure = request.url.startsWith("https://");
  const response = NextResponse.json({ success: true });
  response.cookies.set("cs2pilot_user", "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
