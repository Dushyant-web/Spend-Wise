import { Skeleton } from "@/components/ui/Skeleton";

export default function ReportsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Skeleton className="h-7 w-24" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
