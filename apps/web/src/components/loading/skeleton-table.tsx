interface SkeletonTableProps {
  readonly rows?: number;
  readonly columns?: number;
  readonly className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={`animate-pulse ${className ?? ''}`}>
      <div className="border-b py-2">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-gray-200" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="border-b py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, col) => (
              <div key={col} className="h-4 flex-1 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}