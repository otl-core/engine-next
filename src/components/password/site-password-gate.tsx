import { getAPIClient } from "@otl-core/cms-api";
import { cookies } from "next/headers";
import PasswordPrompt from "./password-prompt";

interface SiteConfigsResponse {
  data?: {
    website?: {
      password_protection?: {
        enabled?: boolean;
      };
    };
  };
}

/**
 * Server component that checks site-level password protection.
 * Always calls cookies() to ensure the layout is dynamic (not statically cached).
 * Fetches the website config directly (bypassing ISR cache) to get current protection status.
 */
export async function SitePasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always read cookies to force this into a dynamic render
  const cookieStore = await cookies();

  const connector = getAPIClient();
  const siteId = connector.getSiteId();

  // Fetch website config with no-store to always get fresh password protection status
  const backendURL = process.env.API_URL;
  const siteToken = process.env.SITE_ACCESS_TOKEN;

  let isProtected = false;

  try {
    const response = await fetch(
      `${backendURL}/api/v1/public/sites/${siteId}/configs`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(siteToken ? { Authorization: `Bearer ${siteToken}` } : {}),
        },
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = (await response.json()) as SiteConfigsResponse;
      isProtected = data?.data?.website?.password_protection?.enabled === true;
    }
  } catch {
    // If we can't fetch config, don't block access
  }

  if (isProtected) {
    const cookie = cookieStore.get(`__pp_site_${siteId}`);
    const hasAccess = !!cookie?.value;

    if (!hasAccess) {
      return (
        <PasswordPrompt
          title="This website is password protected"
          message="Please enter the password to access this website."
          entityId={siteId}
          entityType="site"
          locale="en"
        />
      );
    }
  }

  return <>{children}</>;
}
