import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function BudgetLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Skeleton className="h-7 w-28" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
