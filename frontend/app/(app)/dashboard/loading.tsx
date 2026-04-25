import { Skeleton, SkeletonCard, SkeletonRow } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Budget bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      </div>

      {/* Recent expenses */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-1">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
