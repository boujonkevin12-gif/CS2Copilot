import { NextResponse } from "next/server";
import { refreshPendingPrices, refreshAllPrices } from "@/lib/services/price.service";

export async function GET() {
  const isFullRefresh = process.env.STEAMAPIS_KEY ? true : false;

  let result;
  if (isFullRefresh) {
    result = await refreshAllPrices();
  } else {
    result = await refreshPendingPrices(30);
  }

  return NextResponse.json({
    success: true,
    ...result,
    mode: isFullRefresh ? "full" : "incremental",
  });
}

export async function POST() {
  const result = await refreshPendingPrices(60);

  return NextResponse.json({
    success: true,
    ...result,
    mode: "incremental",
  });
}
