import { NextResponse, type NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/api/auth", "/admin/login"];

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
    const dest = isAdmin(pathname) ? "/admin/login" : "/sign-in";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const isWaveAdmin = (session.user.email ?? "").endsWith("@waveconsulting.biz");

  // If authed but has no active org, send to onboarding — unless they're an admin
  if (!session.session.activeOrganizationId && pathname !== "/onboarding" && !isWaveAdmin) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Wave admins with no org should land on /admin, not tenant routes
  if (isWaveAdmin && !session.session.activeOrganizationId && !isAdmin(pathname)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Internal admin panel — restrict to our company domain
  if (isAdmin(pathname) && !isWaveAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
