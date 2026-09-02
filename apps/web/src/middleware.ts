import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getRolesFromClerkClaims,
  hasAdminRole,
  hasPartnerRole,
} from '@/lib/auth/portals';

const isAdminRoute = createRouteMatcher(['/admin/:path*', '/api/admin/:path*']);
const isPartnerRoute = createRouteMatcher([
  '/partner/((?!login).*)',
  '/api/partner/:path*',
]);

function forbiddenResponse(request: Request, message: string): NextResponse {
  const { pathname } = new URL(request.url);

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message } },
      { status: 403 },
    );
  }

  return NextResponse.redirect(new URL('/unauthorized', request.url));
}

export default clerkMiddleware(async (auth, request) => {
  if (!isAdminRoute(request) && !isPartnerRoute(request)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    await auth.protect();
    return NextResponse.next();
  }

  const roles = getRolesFromClerkClaims(sessionClaims as Record<string, unknown>);

  // When Clerk metadata is not synced yet, defer role checks to layouts/API handlers.
  if (roles.length === 0) {
    return NextResponse.next();
  }

  if (isAdminRoute(request) && !hasAdminRole(roles)) {
    return forbiddenResponse(request, 'Admin access required');
  }

  if (isPartnerRoute(request) && !hasPartnerRole(roles)) {
    return forbiddenResponse(request, 'Partner access required');
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
