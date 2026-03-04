import { NextResponse } from "next/server";

/**
 * Chrome DevTools protocol file
 * This is requested by Chrome DevTools for debugging configuration
 * We return an empty valid response to prevent 404 errors
 */
export async function GET() {
  return NextResponse.json(
    {
      // Empty configuration - we don't provide custom DevTools features yet.
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
    },
  );
}
