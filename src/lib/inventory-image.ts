const CDNS = [
  "https://community.akamai.steamstatic.com/economy/image/",
  "https://steamcommunity-a.akamaihd.net/economy/image/",
  "https://cdn.steamcommunity.com/economy/image/",
];

export function getInventoryImageUrl(iconUrl: string, size?: "small" | "medium" | "large"): string {
  if (!iconUrl) return "";
  const suffix = size === "large" ? "_large" : size === "medium" ? "_medium" : "";
  return `${CDNS[0]}${iconUrl}${suffix}`;
}

export function getInventoryImageSrcSet(iconUrl: string): string {
  if (!iconUrl) return "";
  return CDNS.map((cdn) => `${cdn}${iconUrl} 1x`).join(", ");
}

export function getFallbackImageUrl(iconUrl: string, fallbackIndex: number = 0): string {
  if (!iconUrl) return "";
  const idx = Math.min(fallbackIndex, CDNS.length - 1);
  return `${CDNS[idx]}${iconUrl}`;
}

export const INVENTORY_PLACEHOLDER = "/icons/package.svg";

export function getMarketLink(marketHashName: string): string {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`;
}
