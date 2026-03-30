"use client";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className = "" }: ShimmerProps) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      aria-hidden
    />
  );
}

/** Skeleton para dashboard - header + cards */
export function DashboardShimmer() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex items-center gap-4">
        <Shimmer className="h-14 w-14 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Shimmer className="h-6 w-48" />
          <Shimmer className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-6">
        <Shimmer className="h-32 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Skeleton para tabela de ranking */
export function RankingTableShimmer() {
  return (
    <div className="overflow-hidden rounded-lg border border-blue-200">
      <div className="border-b border-blue-200 bg-blue-50/50 px-4 py-3">
        <div className="flex gap-4">
          <Shimmer className="h-4 w-8" />
          <Shimmer className="h-4 w-24" />
          <Shimmer className="hidden h-4 w-20 sm:block" />
          <Shimmer className="ml-auto h-4 w-24" />
        </div>
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-blue-50 px-4 py-3 last:border-0"
        >
          <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
          <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
          <Shimmer className="h-4 flex-1 max-w-[140px]" />
          <Shimmer className="hidden h-4 w-28 sm:block" />
          <Shimmer className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton para cards genéricos */
export function CardsShimmer({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

/** Skeleton para lista/tabela simples */
export function TableShimmer({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-blue-200">
      <div className="border-b border-blue-100 bg-blue-50/50 px-4 py-2">
        <div className="flex gap-4">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 w-20" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-blue-50 px-4 py-2.5 last:border-0">
          <Shimmer className="h-4 w-12" />
          <Shimmer className="h-4 flex-1 max-w-[180px]" />
          <Shimmer className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
