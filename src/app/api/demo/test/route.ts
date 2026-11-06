import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Ruta de diagnóstico: oculta en producción.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const cs2parser = await import("cs2parser");
    return NextResponse.json({
      ok: true,
      hasDemoReader: Boolean(cs2parser.DemoReader),
      hasEntityMode: Boolean(cs2parser.EntityMode),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "unknown",
    }, { status: 500 });
  }
}
