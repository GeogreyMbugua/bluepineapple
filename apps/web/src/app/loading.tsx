export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand-500" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
