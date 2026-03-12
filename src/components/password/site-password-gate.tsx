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
 * Resolve backend URL with the same fallback chain as cms-api.
 */
function getBackendUrl(): string {
  if (process.env.API_URL) return process.env.API_URL;
  if (process.env.NODE_ENV === "development") return "http://localhost:8080";
  if (process.env.STAGE === "staging") return "https://api-staging.otl.studio";
  return "https://api.otl.studio";
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

  const backendURL = getBackendUrl();
  const siteToken = process.env.SITE_ACCESS_TOKEN;

  let isProtected = false;

  try {
    console.log(
      `[SitePasswordGate] Fetching config from ${backendURL}/api/v1/public/sites/${siteId}/configs`,
    );

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
      console.log(
        `[SitePasswordGate] Config fetched. password_protection.enabled=${isProtected}`,
      );
    } else {
      console.error(
        `[SitePasswordGate] Config fetch failed: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error(
      `[SitePasswordGate] Config fetch threw:`,
      error instanceof Error ? error.message : error,
    );
    // If we can't fetch config, don't block access
  }

  if (isProtected) {
    const cookie = cookieStore.get(`__pp_site_${siteId}`);
    const hasAccess = !!cookie?.value;
    console.log(
      `[SitePasswordGate] Site is protected. Cookie present: ${hasAccess}`,
    );

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
