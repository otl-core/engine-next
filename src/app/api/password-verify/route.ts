import { getAPIClient } from "@otl-core/cms-api";
import { NextRequest, NextResponse } from "next/server";

interface PasswordVerifyRequest {
  entity_type: string;
  entity_id: string;
  locale?: string;
  password: string;
}

interface PasswordVerifyBackendResponse {
  data?: {
    valid?: boolean;
    token?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PasswordVerifyRequest;
    const { entity_type, entity_id, locale, password } = body;

    // Validate required fields (locale is optional for site entity type)
    if (!entity_type || !entity_id || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (entity_type !== "site" && !locale) {
      return NextResponse.json(
        {
          success: false,
          error: "Locale is required for page and entry entities",
        },
        { status: 400 },
      );
    }

    // Call backend verification endpoint
    const connector = getAPIClient();
    const siteId = connector.getSiteId();

    const backendURL = process.env.API_URL;
    const siteToken = process.env.SITE_ACCESS_TOKEN;

    if (!backendURL) {
      return NextResponse.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    const backendPayload = {
      entity_type,
      entity_id,
      locale,
      password,
    };

    const verifyResponse = await fetch(
      `${backendURL}/api/v1/public/sites/${siteId}/verify-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(siteToken ? { Authorization: `Bearer ${siteToken}` } : {}),
        },
        body: JSON.stringify(backendPayload),
      },
    );

    const verifyData =
      (await verifyResponse.json()) as PasswordVerifyBackendResponse;

    if (verifyResponse.ok && verifyData.data?.valid && verifyData.data?.token) {
      // Password is valid, set httpOnly cookie
      const response = NextResponse.json({
        success: true,
        valid: true,
      });

      // Set cookie with 24h expiry
      // For site-level protection, use a specific cookie name
      const cookieName =
        entity_type === "site" ? `__pp_site_${entity_id}` : `__pp_${entity_id}`;

      response.cookies.set({
        name: cookieName,
        value: verifyData.data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return response;
    } else {
      // Invalid password
      return NextResponse.json({
        success: true,
        valid: false,
      });
    }
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 },
    );
  }
}
