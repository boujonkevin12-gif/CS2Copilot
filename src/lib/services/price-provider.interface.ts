export interface PriceData {
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
}

export interface PriceProvider {
  readonly name: string;
  getPrice(marketHashName: string): Promise<PriceData | null>;
  getPrices(items: string[]): Promise<Map<string, PriceData | null>>;
}
