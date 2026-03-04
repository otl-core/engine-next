import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createProviderAdapter,
  executeProviderCall,
} from "@/lib/analytics/provider-adapters";
import type { DataLayerEntry } from "@/lib/analytics/data-layer";
import type {
  ConsentCategory,
  ManagedScript,
  ProviderManagedScript,
} from "@otl-core/cms-types";

function createProviderScript(
  overrides: Partial<ProviderManagedScript> = {},
): ProviderManagedScript {
  return {
    id: "script-1",
    type: "provider",
    provider: "google_analytics_4",
    provider_config: { measurement_id: "G-XXXXXX" },
    enabled: true,
    label: "GA4",
    consent_category: "analytics",
    loading_strategy: "afterInteractive",
    placement: "head",
    contexts: ["all"],
    priority: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function createConsentState(
  overrides: Partial<Record<ConsentCategory, boolean>> = {},
): Record<ConsentCategory, boolean> {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    social: false,
    ...overrides,
  };
}

function createEntry(
  event: DataLayerEntry["event"],
  extra?: Record<string, unknown>,
): DataLayerEntry {
  return {
    event,
    timestamp: Date.now(),
    ...extra,
  };
}

describe("provider-adapters", () => {
  beforeEach(() => {
    // Reset window globals
    window.gtag = undefined;
    window.fbq = undefined;
    window.posthog = undefined;
    window.mixpanel = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createProviderAdapter", () => {
    it("should call window.gtag for GA4 page_view events", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const script = createProviderScript();
      const consent = createConsentState({ analytics: true });
      const adapter = createProviderAdapter(script, consent);

      const entry = createEntry("page_view", {
        page_title: "Test Page",
        page_location: "https://example.com/test",
        page_path: "/test",
      });

      adapter(entry);

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith(
        "event",
        "page_view",
        expect.objectContaining({
          page_title: "Test Page",
          page_location: "https://example.com/test",
          page_path: "/test",
        }),
      );
    });

    it("should skip events when consent is not granted", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const script = createProviderScript({ consent_category: "analytics" });
      const consent = createConsentState({ analytics: false });
      const adapter = createProviderAdapter(script, consent);

      adapter(createEntry("page_view"));

      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("should always allow necessary consent category", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const script = createProviderScript({ consent_category: "necessary" });
      const consent = createConsentState({ analytics: false });
      const adapter = createProviderAdapter(script, consent);

      adapter(createEntry("page_view"));

      expect(gtagMock).toHaveBeenCalled();
    });

    it("should skip events with no mapping for the provider", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const script = createProviderScript();
      const consent = createConsentState({ analytics: true });
      const adapter = createProviderAdapter(script, consent);

      // "element_visible" is not in the GA4 mappings
      adapter(createEntry("element_visible"));

      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("should translate params correctly", () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      const script = createProviderScript();
      const consent = createConsentState({ analytics: true });
      const adapter = createProviderAdapter(script, consent);

      adapter(
        createEntry("scroll_depth", {
          percent: 75,
          page_path: "/test",
        }),
      );

      expect(gtagMock).toHaveBeenCalledWith(
        "event",
        "scroll",
        expect.objectContaining({
          percent_scrolled: 75,
          page_path: "/test",
        }),
      );
    });

    it("should return a no-op for custom scripts", () => {
      const script: ManagedScript = {
        id: "custom-1",
        type: "custom",
        custom_type: "script_tag",
        custom_config: { src: "https://example.com/script.js" },
        enabled: true,
        label: "Custom",
        consent_category: "analytics",
        loading_strategy: "afterInteractive",
        placement: "head",
        contexts: ["all"],
        priority: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const consent = createConsentState({ analytics: true });
      const adapter = createProviderAdapter(script, consent);

      // Should not throw
      adapter(createEntry("page_view"));
    });
  });

  describe("executeProviderCall", () => {
    it("should gracefully handle missing window.gtag", () => {
      window.gtag = undefined;

      expect(() => {
        executeProviderCall(
          "google_analytics_4",
          {
            call_pattern: "gtag('event', '{event}', {params})",
            provider_event_name: "page_view",
            param_map: {},
          },
          {},
        );
      }).not.toThrow();
    });

    it("should call fbq for Meta Pixel", () => {
      const fbqMock = vi.fn();
      window.fbq = fbqMock;

      executeProviderCall(
        "meta_pixel",
        {
          call_pattern: "fbq('track', '{event}', {params})",
          provider_event_name: "Purchase",
          param_map: {},
        },
        { value: 100, currency: "EUR" },
      );

      expect(fbqMock).toHaveBeenCalledWith("track", "Purchase", {
        value: 100,
        currency: "EUR",
      });
    });

    it("should use trackCustom for Meta custom events", () => {
      const fbqMock = vi.fn();
      window.fbq = fbqMock;

      executeProviderCall(
        "meta_pixel",
        {
          call_pattern: "fbq('trackCustom', '{event}', {params})",
          provider_event_name: "MyCustomEvent",
          param_map: {},
        },
        { foo: "bar" },
      );

      expect(fbqMock).toHaveBeenCalledWith("trackCustom", "MyCustomEvent", {
        foo: "bar",
      });
    });

    it("should call posthog.capture for PostHog", () => {
      const captureMock = vi.fn();
      window.posthog = { capture: captureMock };

      executeProviderCall(
        "posthog",
        {
          call_pattern: "posthog.capture('{event}', {params})",
          provider_event_name: "$pageview",
          param_map: {},
        },
        { $title: "Test Page" },
      );

      expect(captureMock).toHaveBeenCalledWith("$pageview", {
        $title: "Test Page",
      });
    });
  });
});
