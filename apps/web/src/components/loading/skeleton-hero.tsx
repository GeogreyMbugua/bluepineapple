interface SkeletonHeroProps {
  readonly className?: string;
}

export function SkeletonHero({ className }: SkeletonHeroProps) {
  return (
    <div className={`animate-pulse ${className ?? ''}`}>
      <div className="h-12 w-1/2 rounded bg-gray-200" />
      <div className="mt-4 h-6 w-3/4 rounded bg-gray-100" />
      <div className="mt-2 h-6 w-1/2 rounded bg-gray-100" />
    </div>
  );
}