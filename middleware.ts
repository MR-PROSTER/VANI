import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in/:path*',
  '/sign-up/:path*',
  '/sso-callback/:path*',
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  const path = req.nextUrl.pathname;

  // 🔒 Protect private routes
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // 🚫 Prevent signed-in users from seeing sign-in page
  if (userId && path.startsWith('/sign-in')) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)',
    '/(api|trpc)(.*)',
  ],
};
