import { convexAuthNextjsMiddleware } from '@convex-dev/auth/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/axiom/server';
import { transformMiddlewareRequest } from '@axiomhq/nextjs';

const intlMiddleware = createMiddleware(routing);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  logger.info(...transformMiddlewareRequest(request));

  if (request.nextUrl.pathname.includes('dashboard')) {
    const token = await convexAuth.getToken();
    if (!token) {
      return NextResponse.redirect(new URL('/sign', request.url));
    }
  }

  await logger.flush();

  return intlMiddleware(request);
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
