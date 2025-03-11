import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only run on admin routes except the main admin auth page
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin") {
    // Check if admin is authenticated via cookies
    // const adminAuth = request.cookies.get("adminAuth")?.value

    // If not authenticated, redirect to admin login
    // if (adminAuth !== "true") {
    //   return NextResponse.redirect(new URL("/admin", request.url))
    // }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

