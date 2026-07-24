"use client";

export function InventoryLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="panel rounded-xl p-3.5 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/[0.06]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-16 rounded bg-white/[0.06]" />
                <div className="h-4 w-12 rounded bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel rounded-xl p-3 animate-pulse">
        <div className="h-9 w-full rounded-xl bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[rgba(169,149,255,0.12)] bg-gradient-to-br from-[rgba(20,20,37,0.94)] to-[rgba(10,11,22,0.9)] p-3 animate-pulse">
            <div className="aspect-[4/3] rounded-lg bg-white/[0.06] mb-2.5" />
            <div className="space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
              <div className="h-2 w-1/2 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
