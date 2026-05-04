import { NextResponse, type NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/api/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isAdmin(pathname: string) {
  return pathname.startsWith("/admin");
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If authed but has no active org, send to onboarding
  if (!session.session.activeOrganizationId && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Internal admin panel — restrict to our company domain
  if (isAdmin(pathname)) {
    const email = session.user.email ?? "";
    if (!email.endsWith("@waveconsulting.biz")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
