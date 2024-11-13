import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log the request for debugging
  console.log('Middleware hit:', request.nextUrl.pathname);
  
  // Allow both with and without trailing slash
  if (request.nextUrl.pathname === '/api/check-renewals' || 
      request.nextUrl.pathname === '/api/check-renewals/') {
    console.log('Allowing check-renewals access');
    return NextResponse.next();
  }

  // Protect other routes as needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}; 