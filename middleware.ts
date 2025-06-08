import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/',
  '/documents',
  '/images', 
  '/media',
  '/others',
  '/dashboard',
  '/dashboard/files' // Added this line
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!.*\\\\..*|_next).*)', // Changed this line
    '/', // Changed this line
    '/(api|trpc)(.*)' // Changed this line
  ],
};
