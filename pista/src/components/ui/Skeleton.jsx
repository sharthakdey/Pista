export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function CardSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`card p-5 ${className}`} aria-hidden>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-8 w-1/2" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`mt-3 h-3 ${i % 2 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
