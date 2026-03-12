import { getAPIClient } from "@otl-core/cms-api";
import { cookies } from "next/headers";
import PasswordPrompt from "./password-prompt";

interface SitePasswordGateProps {
  passwordProtectionEnabled: boolean;
  children: React.ReactNode;
}

/**
 * Server component that checks site-level password protection.
 * Receives protection status from the layout which already fetched configs.
 */
export async function SitePasswordGate({
  passwordProtectionEnabled,
  children,
}: SitePasswordGateProps) {
  if (!passwordProtectionEnabled) {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const connector = getAPIClient();
  const siteId = connector.getSiteId();

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

  return <>{children}</>;
}
