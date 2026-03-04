import { describe, expect, it } from "vitest";
import {
  injectGoogleConsentDefaults,
  buildGoogleConsentUpdate,
} from "@/lib/consent/google-consent-mode";

describe("google-consent-mode", () => {
  describe("injectGoogleConsentDefaults", () => {
    it("opt_in: all non-security signals are denied", () => {
      const script = injectGoogleConsentDefaults("opt_in");
      expect(script).toContain("analytics_storage:'denied'");
      expect(script).toContain("ad_storage:'denied'");
      expect(script).toContain("ad_user_data:'denied'");
      expect(script).toContain("ad_personalization:'denied'");
      expect(script).toContain("functionality_storage:'denied'");
      expect(script).toContain("personalization_storage:'denied'");
      expect(script).toContain("security_storage:'granted'");
    });

    it("opt_out: all signals are granted", () => {
      const script = injectGoogleConsentDefaults("opt_out");
      expect(script).toContain("analytics_storage:'granted'");
      expect(script).toContain("ad_storage:'granted'");
      expect(script).toContain("ad_user_data:'granted'");
      expect(script).toContain("ad_personalization:'granted'");
      expect(script).toContain("functionality_storage:'granted'");
      expect(script).toContain("personalization_storage:'granted'");
      expect(script).toContain("security_storage:'granted'");
    });

    it("initializes dataLayer and gtag function", () => {
      const script = injectGoogleConsentDefaults("opt_in");
      expect(script).toContain("window.dataLayer=window.dataLayer||[];");
      expect(script).toContain("function gtag(){dataLayer.push(arguments);}");
    });

    it("calls gtag with consent default", () => {
      const script = injectGoogleConsentDefaults("opt_in");
      expect(script).toContain("gtag('consent','default',{");
    });
  });

  describe("buildGoogleConsentUpdate", () => {
    it("maps all-granted correctly", () => {
      const update = buildGoogleConsentUpdate({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
        social: true,
      });
      expect(update.analytics_storage).toBe("granted");
      expect(update.ad_storage).toBe("granted");
      expect(update.ad_user_data).toBe("granted");
      expect(update.ad_personalization).toBe("granted");
      expect(update.functionality_storage).toBe("granted");
      expect(update.personalization_storage).toBe("granted");
      expect(update.security_storage).toBe("granted");
    });

    it("maps all-denied correctly (only necessary true)", () => {
      const update = buildGoogleConsentUpdate({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
        social: false,
      });
      expect(update.analytics_storage).toBe("denied");
      expect(update.ad_storage).toBe("denied");
      expect(update.ad_user_data).toBe("denied");
      expect(update.ad_personalization).toBe("denied");
      expect(update.functionality_storage).toBe("denied");
      expect(update.personalization_storage).toBe("denied");
      expect(update.security_storage).toBe("granted");
    });

    it("maps partial consent correctly", () => {
      const update = buildGoogleConsentUpdate({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
        social: false,
      });
      expect(update.analytics_storage).toBe("granted");
      expect(update.ad_storage).toBe("denied");
      expect(update.ad_user_data).toBe("denied");
      expect(update.ad_personalization).toBe("denied");
      expect(update.functionality_storage).toBe("granted");
      expect(update.personalization_storage).toBe("granted");
      expect(update.security_storage).toBe("granted");
    });

    it("security_storage is always granted", () => {
      const update = buildGoogleConsentUpdate({
        necessary: false,
        analytics: false,
        marketing: false,
        preferences: false,
        social: false,
      });
      expect(update.security_storage).toBe("granted");
    });
  });
});
