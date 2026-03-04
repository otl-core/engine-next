/**
 * Consent Utilities - Barrel Export
 */

export {
  ALL_CONSENT_CATEGORIES,
  getDefaultConsentState,
  parseConsentCookie,
  serializeConsentCookie,
} from "./consent-cookie";
export type { ConsentState, ConsentCookieData } from "./consent-cookie";

export { ConsentProvider, useConsent } from "./consent-context";
export type { ConsentContextValue } from "./consent-context";

export {
  buildGoogleConsentUpdate,
  fireGoogleConsentUpdate,
  injectGoogleConsentDefaults,
} from "./google-consent-mode";
