import { Skeleton } from "@/components/ui/Skeleton";

export default function AchievementsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-7 w-36" />
      {/* XP bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 space-y-2 flex flex-col items-center">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
