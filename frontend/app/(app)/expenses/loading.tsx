import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";

export default function ExpensesLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      {/* Filters */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-xl" />
        ))}
      </div>
      {/* Expense list */}
      <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
