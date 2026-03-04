import Link from "next/link";

/**
 * Full-page error displayed when the site is not yet configured.
 * Used by both the homepage and catch-all route.
 */
export function ConfigurationError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface text-surface-foreground">
      <div className="space-y-4 p-8 max-w-md">
        <h1 className="text-3xl font-bold">Configuration Error</h1>
        <p className="text-muted-foreground">
          <strong>This website has not been configured yet.</strong> Please set
          up your site in OTL Studio to get started.
        </p>
        <p>
          <Link
            style={{ textDecoration: "underline" }}
            href="https://otl.studio/"
          >
            Go to OTL Studio &raquo;
          </Link>
        </p>
      </div>
    </div>
  );
}
