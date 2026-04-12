import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isLoggedIn = !!token;
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isLoggedIn && (isRootPage || isLoginPage)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isLoggedIn && (isRootPage || isDashboardPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
