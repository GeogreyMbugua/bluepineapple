import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">403</h1>
        <p className="text-gray-600 mt-2">You do not have permission to access this page.</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to home
        </Link>
      </div>
    </div>
  );
}
