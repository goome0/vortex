import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/download', '/news', '/terms', '/privacy'];

// Admin routes that require admin privileges
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('vortex_token')?.value;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/news/')
  );

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected route
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, we'll let the client-side handle the admin check
  // since we can't verify the token claims in middleware without a proper JWT library
  // The admin layout component will handle the actual authorization

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
