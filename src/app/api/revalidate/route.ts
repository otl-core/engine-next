import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Resolve backend URL with the same fallback chain as cms-api.
 */
function getBackendUrl(): string {
  if (process.env.API_URL) return process.env.API_URL;
  if (process.env.NODE_ENV === "development") return "http://localhost:8080";
  if (process.env.STAGE === "staging") return "https://api-staging.otl.studio";
  return "https://api.otl.studio";
}

/**
 * On-demand cache revalidation endpoint.
 * Called by Studio after config changes (password protection, etc.)
 * to force the engine to fetch fresh data.
 *
 * Auth: Accepts any valid site access token. Verified by making a
 * lightweight call to the backend — if the backend accepts it, it's valid.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Also accept the engine's own SITE_ACCESS_TOKEN directly
  const ownToken = process.env.SITE_ACCESS_TOKEN;
  if (ownToken && token === ownToken) {
    revalidateTag("config", { expire: 0 });
    revalidateTag("content", { expire: 0 });
    return NextResponse.json({
      success: true,
      revalidated: ["config", "content"],
    });
  }

  // Verify the token by making a lightweight request to the backend
  const siteId = process.env.SITE_ID;
  if (!siteId) {
    return NextResponse.json(
      { success: false, error: "Server misconfigured" },
      { status: 500 },
    );
  }

  try {
    const backendUrl = getBackendUrl();
    const verifyResponse = await fetch(
      `${backendUrl}/api/v1/public/sites/${siteId}/configs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Token verification failed" },
      { status: 500 },
    );
  }

  // Token is valid — invalidate all ISR-cached data
  revalidateTag("config", { expire: 0 });
  revalidateTag("content", { expire: 0 });

  return NextResponse.json({
    success: true,
    revalidated: ["config", "content"],
  });
}
