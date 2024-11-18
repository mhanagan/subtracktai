import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log the request for debugging
  console.log('Middleware hit:', request.nextUrl.pathname);
  
  // Allow both with and without trailing slash for cron job
  if (request.nextUrl.pathname === '/api/check-renewals' || 
      request.nextUrl.pathname === '/api/check-renewals/') {
    const cronSecret = request.nextUrl.searchParams.get('cronSecret');
    console.log('Cron request received:', {
      path: request.nextUrl.pathname,
      hasCronSecret: !!cronSecret
    });
    return NextResponse.next();
  }

  // Protect other routes as needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/check-renewals/:path*',
    '/dashboard/:path*',
  ],
}; 