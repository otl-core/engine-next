/**
 * A/B/n Variant Resolver Proxy
 *
 * Assigns each visitor a persistent "bucket" value (a random float [0, 1))
 * stored in a cookie. This bucket deterministically maps to a variant for any
 * given weight distribution, ensuring sticky sessions without per-test cookies.
 *
 * The bucket value is passed to server components via the `x-abn-bucket` request header.
 *
 * Uses the Next.js 16 proxy.ts convention.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ABN_COOKIE_NAME = "__abn_bucket";
const ABN_HEADER_NAME = "x-abn-bucket";
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export function proxy(request: NextRequest) {
  const existingBucket = request.cookies.get(ABN_COOKIE_NAME)?.value;
  const bucket =
    existingBucket && isValidBucket(existingBucket)
      ? existingBucket
      : Math.random().toFixed(10);

  // Clone request headers and add values so server components can read them
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(ABN_HEADER_NAME, bucket);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set or refresh the cookie if it was missing or invalid
  if (!existingBucket || !isValidBucket(existingBucket)) {
    response.cookies.set(ABN_COOKIE_NAME, bucket, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return response;
}

function isValidBucket(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num < 1;
}

/**
 * Only run proxy on page routes, not on static assets or API routes.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, browserconfig.xml (well-known files)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|browserconfig\\.xml|feed\\.xml|api).*)",
  ],
};
