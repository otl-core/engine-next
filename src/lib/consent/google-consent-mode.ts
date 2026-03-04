/**
 * Google Consent Mode v2 Integration
 *
 * Provides functions to inject default consent signals before any Google
 * scripts load, and to fire consent updates when the user changes preferences.
 *
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */

import type { ConsentState } from "./consent-cookie";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Returns an inline script string that sets the default Google Consent Mode
 * state. This MUST be injected in `<head>` before any Google scripts load.
 */
export function injectGoogleConsentDefaults(
  mode: "opt_in" | "opt_out",
): string {
  const value = mode === "opt_out" ? "granted" : "denied";

  return [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    `gtag('consent','default',{`,
    `analytics_storage:'${value}',`,
    `ad_storage:'${value}',`,
    `ad_user_data:'${value}',`,
    `ad_personalization:'${value}',`,
    `functionality_storage:'${value}',`,
    `personalization_storage:'${value}',`,
    `security_storage:'granted'`,
    `});`,
  ].join("");
}

type GoogleConsentSignal = "granted" | "denied";

/**
 * Maps CMS consent categories to Google consent signals.
 *
 * - `necessary`   -> `security_storage` (always granted)
 * - `analytics`   -> `analytics_storage`
 * - `marketing`   -> `ad_storage`, `ad_user_data`, `ad_personalization`
 * - `preferences` -> `functionality_storage`, `personalization_storage`
 * - `social`      -> (no direct Google mapping, ignored)
 */
export function buildGoogleConsentUpdate(
  state: ConsentState,
): Record<string, GoogleConsentSignal> {
  const signal = (granted: boolean): GoogleConsentSignal =>
    granted ? "granted" : "denied";

  return {
    analytics_storage: signal(state.analytics),
    ad_storage: signal(state.marketing),
    ad_user_data: signal(state.marketing),
    ad_personalization: signal(state.marketing),
    functionality_storage: signal(state.preferences),
    personalization_storage: signal(state.preferences),
    security_storage: "granted",
  };
}

/**
 * Fires a `gtag('consent', 'update', ...)` call if `window.gtag` exists.
 * This should be called whenever the user updates their consent preferences.
 */
export function fireGoogleConsentUpdate(state: ConsentState): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", buildGoogleConsentUpdate(state));
  }
}
