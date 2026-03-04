/**
 * Public Form Submission API Route
 * Public endpoint for form submissions from website visitors
 * Uses site token authentication to backend
 */

import { getAPIClient } from "@otl-core/cms-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.form_id || !body.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: form_id and data",
        },
        { status: 400 },
      );
    }

    // Get API client (has site token already configured)
    const apiClient = getAPIClient();

    // Submit form via backend
    const response = await apiClient.forms.submitForm(body.form_id, {
      type: body.type || "General",
      locale: body.locale || "en",
      data: body.data,
      form_variant_id: body.form_variant_id,
      environment_type: body.environment_type,
      environment_id: body.environment_id,
      environment_path: body.environment_path,
      environment_variant_id: body.environment_variant_id,
      metadata: body.metadata,
    });

    // The HttpClient returns error responses without throwing when they
    // contain a "success" field. Propagate the failure status properly.
    if (response && "success" in response && !response.success) {
      return NextResponse.json(response, { status: 422 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[FormSubmission] Error submitting form:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit form",
      },
      { status: 500 },
    );
  }
}
