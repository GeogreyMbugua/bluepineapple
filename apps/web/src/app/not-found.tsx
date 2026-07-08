import { ROUTES } from '@/config/routes';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-4">
        <div className="text-6xl font-extrabold text-brand-500">404</div>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm text-pretty">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href={ROUTES.marketing.home}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-sm"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
