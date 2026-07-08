interface SkeletonCardProps {
  readonly className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={`animate-pulse rounded-lg border bg-gray-100 p-4 ${className ?? ''}`}>
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-4 w-1/4 rounded bg-gray-200" />
    </div>
  );
}