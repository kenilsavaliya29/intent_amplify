import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // If not logged in, block access to CRM pages
  if (!token && (pathname.startsWith("/accounts") || pathname.startsWith("/dashboard"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in, avoid showing login again
  if (token && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/accounts";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/accounts/:path*", "/dashboard", "/login"],
};


