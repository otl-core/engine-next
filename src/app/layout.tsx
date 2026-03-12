/**
 * Root Layout
 *
 * Owns the page shell: <html>, <head>, styles, Header, Footer.
 * Page components only render content inside <main>.
 */

import { AnalyticsProvider } from "@otl-core/analytics";
import { ConsentBanner } from "@/components/consent";
import { ConfigurationError } from "@/components/feedback/configuration-error";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { FaviconTags } from "@/components/favicon/favicon-tags";
import { Footer } from "@otl-core/next-footer";
import { Header } from "@otl-core/next-navigation";
import { blockRegistry } from "@/lib/registries/block-registry";
import { SitePasswordGate } from "@/components/password/site-password-gate";
import { AnalyticsEventManager, ScriptLoader } from "@/components/scripts";
import { Style } from "@/components/style/style";
import {
  ConsentProvider,
  injectGoogleConsentDefaults,
  parseConsentCookie,
} from "@/lib/consent";
import { resolveShellContext } from "@/lib/route-context";
import { cookies } from "next/headers";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const shell = await resolveShellContext();
  if (!shell) {
    return { title: { default: "Website", template: "%s" } };
  }

  return {
    title: {
      default: shell.site.siteName,
      template: `%s | ${shell.site.siteName}`,
    },
    description: shell.site.siteDescription,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shell = await resolveShellContext();

  const scriptsConfig = shell?.configs.scripts;
  const consentBannerConfig = scriptsConfig?.consent_banner;
  const googleConsentEnabled =
    consentBannerConfig?.google_consent_mode_enabled ?? false;
  const cookieName = consentBannerConfig?.cookie_name ?? "otl_consent";
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(cookieName)?.value;
  const initialConsent = consentCookie
    ? parseConsentCookie(consentCookie)
    : null;

  const contentType = shell?.contentType ?? "pages";

  return (
    <html lang={shell?.locale ?? "en"}>
      <head>
        <FaviconTags config={shell?.configs.favicon ?? null} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
        {googleConsentEnabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: injectGoogleConsentDefaults(
                consentBannerConfig?.consent_mode ?? "opt_in",
              ),
            }}
          />
        )}
        <JsonLdScript />
      </head>
      <body>
        <Style
          theme={shell?.configs.theme ?? null}
          colors={shell?.configs.colors ?? null}
          fonts={shell?.configs.fonts ?? null}
        />
        <AnalyticsProvider
          enabled={!!shell}
          globalFormTracking={
            scriptsConfig?.auto_events?.form_submissions ?? false
          }
        >
          <ConsentProvider
            config={consentBannerConfig}
            initialConsent={initialConsent}
          >
            {shell ? (
              <>
                <ScriptLoader
                  config={scriptsConfig}
                  pageContext={{
                    contentType,
                    locale: shell.locale ?? "en",
                  }}
                />
                <AnalyticsEventManager
                  config={scriptsConfig}
                  pageContext={{
                    contentType,
                    locale: shell.locale ?? "en",
                  }}
                />
                <SitePasswordGate
                  passwordProtectionEnabled={
                    shell.configs.website?.password_protection?.enabled === true
                  }
                >
                  <Header
                    navigation={shell.configs.header}
                    siteName={shell.site.siteName}
                    site={shell.configs.site}
                  />
                  <main>{children}</main>
                  <Footer
                    footer={shell.configs.footer}
                    site={shell.configs.site}
                    blockRegistry={blockRegistry}
                  />
                </SitePasswordGate>
                <ConsentBanner
                  config={consentBannerConfig}
                  locale={shell.locale ?? "en"}
                />
              </>
            ) : (
              <ConfigurationError />
            )}
          </ConsentProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
