import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const middleware = async (req: NextRequest) => {
  // Get the session token from NextAuth
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Extract the pathname from the request URL
  const { pathname } = req.nextUrl;

  // Paths that do not require authentication
  const publicPaths = ["/login", "/signup"];

  // Allow access to public paths or if the user is authenticated
  // Allow access to public paths and static assets
  if (publicPaths.includes(pathname)) {
    // If the user is authenticated and trying to access login/signup, redirect them
    if (session) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to a protected route
    }
    return NextResponse.next();
  }

  //If the user is authenticated, allow access to the requested path
  if (session) {
    return NextResponse.next();
  }

  // Redirect to login page if the user is not authenticated
  return NextResponse.redirect(new URL("/login", req.url));
};

// Middleware configuration to apply to all paths except public ones
export const config = {
  matcher: ["/((?!_next|static|api).*)"],
};
