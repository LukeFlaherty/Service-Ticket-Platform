import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Block unauthenticated access to protected routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Internal admin panel requires our company email domain
  // Additional checks can be added here (e.g. specific user IDs, metadata flags)
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string | undefined;
    if (!email?.endsWith("@waveconsulting.biz")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
