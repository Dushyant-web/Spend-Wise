import { Skeleton } from "@/components/ui/Skeleton";

export default function AICoachLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex-1 glass-card rounded-2xl border border-white/5 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
            <Skeleton className={`h-12 rounded-2xl ${i % 2 === 1 ? "w-2/3" : "w-3/4"}`} />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
