import { describe, expect, it } from "vitest";
import {
  parseConsentCookie,
  serializeConsentCookie,
  getDefaultConsentState,
  ALL_CONSENT_CATEGORIES,
} from "@/lib/consent/consent-cookie";

describe("consent-cookie", () => {
  describe("ALL_CONSENT_CATEGORIES", () => {
    it("should contain all five categories", () => {
      expect(ALL_CONSENT_CATEGORIES).toEqual([
        "necessary",
        "analytics",
        "marketing",
        "preferences",
        "social",
      ]);
    });
  });

  describe("getDefaultConsentState", () => {
    it("opt_in: only necessary is true", () => {
      const state = getDefaultConsentState("opt_in");
      expect(state.necessary).toBe(true);
      expect(state.analytics).toBe(false);
      expect(state.marketing).toBe(false);
      expect(state.preferences).toBe(false);
      expect(state.social).toBe(false);
    });

    it("opt_out: all categories are true", () => {
      const state = getDefaultConsentState("opt_out");
      expect(state.necessary).toBe(true);
      expect(state.analytics).toBe(true);
      expect(state.marketing).toBe(true);
      expect(state.preferences).toBe(true);
      expect(state.social).toBe(true);
    });
  });

  describe("parseConsentCookie", () => {
    it("parses JSON cookie correctly", () => {
      const json = JSON.stringify({
        state: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: false,
          social: true,
        },
        consented_at: 1700000000000,
      });
      const data = parseConsentCookie(json);
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(true);
      expect(data.state.marketing).toBe(false);
      expect(data.state.preferences).toBe(false);
      expect(data.state.social).toBe(true);
      expect(data.consented_at).toBe(1700000000000);
    });

    it("returns defaults when cookie is undefined", () => {
      const data = parseConsentCookie(undefined);
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(false);
      expect(data.state.marketing).toBe(false);
      expect(data.state.preferences).toBe(false);
      expect(data.state.social).toBe(false);
      expect(data.consented_at).toBe(0);
    });

    it("returns defaults when cookie is empty string", () => {
      const data = parseConsentCookie("");
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(false);
    });

    it("returns defaults for malformed JSON", () => {
      const data = parseConsentCookie("{not valid json");
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(false);
    });

    it("returns defaults for non-object JSON (array)", () => {
      const data = parseConsentCookie("[1, 2, 3]");
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(false);
    });

    it("returns defaults for null JSON", () => {
      const data = parseConsentCookie("null");
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(false);
    });

    it("forces necessary to true even if cookie says false", () => {
      const json = JSON.stringify({
        state: {
          necessary: false,
          analytics: true,
        },
        consented_at: 1700000000000,
      });
      const data = parseConsentCookie(json);
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(true);
    });

    it("ignores extra fields in the state object", () => {
      const json = JSON.stringify({
        state: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: false,
          social: false,
          unknown_field: true,
        },
        consented_at: 1700000000000,
      });
      const data = parseConsentCookie(json);
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(true);
      expect("unknown_field" in data.state).toBe(false);
    });

    it("handles partial state data", () => {
      const json = JSON.stringify({
        state: { analytics: true },
        consented_at: 1700000000000,
      });
      const data = parseConsentCookie(json);
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(true);
      expect(data.state.marketing).toBe(false);
    });

    it("returns defaults for flat object without state wrapper", () => {
      const json = JSON.stringify({
        necessary: true,
        analytics: true,
      });
      const data = parseConsentCookie(json);
      expect(data.state.necessary).toBe(true);
      expect(data.state.analytics).toBe(false);
      expect(data.consented_at).toBe(0);
    });
  });

  describe("serializeConsentCookie", () => {
    it("produces valid JSON in new format", () => {
      const state = getDefaultConsentState("opt_in");
      const serialized = serializeConsentCookie(state);
      const parsed = JSON.parse(serialized);
      expect(parsed.state.necessary).toBe(true);
      expect(parsed.state.analytics).toBe(false);
      expect(typeof parsed.consented_at).toBe("number");
      expect(parsed.consented_at).toBeGreaterThan(0);
    });

    it("round-trips correctly", () => {
      const original = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
        social: false,
      } as const;
      const serialized = serializeConsentCookie(original);
      const restored = parseConsentCookie(serialized);
      expect(restored.state).toEqual(original);
      expect(restored.consented_at).toBeGreaterThan(0);
    });
  });
});
