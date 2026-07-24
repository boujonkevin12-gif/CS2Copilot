"use client";

import { InventoryItem } from "@/types/inventory";
import { InventoryCard } from "./inventory-card";
import { InventoryEmpty } from "./inventory-empty";

interface Props {
  items: InventoryItem[];
}

export function InventoryGrid({ items }: Props) {
  if (items.length === 0) return <InventoryEmpty />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map((item, i) => (
        <InventoryCard key={`${item.id}-${item.marketHashName}-${i}`} item={item} index={i} />
      ))}
    </div>
  );
}
