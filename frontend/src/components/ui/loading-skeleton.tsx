interface LoadingSkeletonProps {
  variant?: "card" | "table" | "text" | "map";
  count?: number;
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200 ${className ?? ""}`} />
  );
}

export function LoadingSkeleton({ variant = "text", count = 1 }: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count || 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <SkeletonBar className="mb-2 h-3 w-20" />
            <SkeletonBar className="mb-2 h-8 w-16" />
            <SkeletonBar className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {Array.from({ length: count || 5 }).map((_, i) => (
          <SkeletonBar key={i} className="mb-2 h-4 w-full last:mb-0" />
        ))}
      </div>
    );
  }

  if (variant === "map") {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-slate-100">
        <div className="text-center">
          <SkeletonBar className="mx-auto mb-2 h-32 w-48" />
          <SkeletonBar className="mx-auto h-4 w-32" />
        </div>
      </div>
    );
  }

  // text variant
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBar key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
