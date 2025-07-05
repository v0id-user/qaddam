import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
const intlMiddleware = createMiddleware(routing);
 
export default convexAuthNextjsMiddleware(
    async (request, { convexAuth }) => {
        return intlMiddleware(request);
    }
);
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};