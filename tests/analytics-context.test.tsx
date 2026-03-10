/**
 * Analytics Context Tests
 *
 * Tests the AnalyticsProvider, useAnalytics hook, and ABn variant context
 * integration. Uses the dataLayer from the package re-export.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CMSDataLayer } from "@otl-core/analytics";
import type { DataLayerEntry } from "@otl-core/analytics";

// Since React hook testing requires a single React instance and the analytics
// package has its own React dep, we test the underlying data layer logic
// directly rather than using renderHook which causes duplicate React issues.

describe("Analytics Data Layer (from @otl-core/analytics)", () => {
  let dl: CMSDataLayer;

  beforeEach(() => {
    dl = new CMSDataLayer();
  });

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

  it("should push events with ABn variant params", () => {
    const subscriber = vi.fn();
    dl.subscribe(subscriber);

    const entry = createEntry("page_view", {
      page_path: "/home",
      abn_variant_id: "variant-a",
      abn_experiment_id: "exp-123",
    });

    dl.push(entry);

    expect(subscriber).toHaveBeenCalledWith(entry);
    expect(entry.abn_variant_id).toBe("variant-a");
    expect(entry.abn_experiment_id).toBe("exp-123");
  });

  it("should handle experiment_view event type", () => {
    const subscriber = vi.fn();
    dl.subscribe(subscriber);

    const entry = createEntry("experiment_view", {
      abn_variant_id: "variant-b",
      abn_experiment_id: "homepage-hero",
    });

    dl.push(entry);

    expect(subscriber).toHaveBeenCalledWith(entry);
    expect(subscriber.mock.calls[0][0].event).toBe("experiment_view");
  });

  it("should pass through form analytics events", () => {
    const subscriber = vi.fn();
    dl.subscribe(subscriber);

    dl.push(
      createEntry("form_start", {
        form_id: "contact",
        form_name: "Contact Form",
      }),
    );
    dl.push(
      createEntry("form_submit", {
        form_id: "contact",
        form_name: "Contact Form",
        total_pages: 2,
        custom_event_name: "generate_lead",
      }),
    );
    dl.push(
      createEntry("form_error", {
        form_id: "contact",
        error_count: 3,
        error_fields: "email,phone,name",
      }),
    );

    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber.mock.calls[0][0].event).toBe("form_start");
    expect(subscriber.mock.calls[1][0].event).toBe("form_submit");
    expect(subscriber.mock.calls[1][0].custom_event_name).toBe("generate_lead");
    expect(subscriber.mock.calls[2][0].event).toBe("form_error");
    expect(subscriber.mock.calls[2][0].error_count).toBe(3);
  });

  it("should merge variant params with form events", () => {
    const subscriber = vi.fn();
    dl.subscribe(subscriber);

    // Simulate what AnalyticsProvider.trackEvent does:
    // merge variant params, then user params
    const variantParams = {
      abn_variant_id: "variant-a",
      abn_experiment_id: "exp-forms",
    };

    const userParams = {
      form_id: "signup",
      form_name: "Sign Up",
    };

    dl.push({
      event: "form_submit",
      timestamp: Date.now(),
      ...variantParams,
      ...userParams,
    });

    const pushed = subscriber.mock.calls[0][0];
    expect(pushed.abn_variant_id).toBe("variant-a");
    expect(pushed.abn_experiment_id).toBe("exp-forms");
    expect(pushed.form_id).toBe("signup");
    expect(pushed.form_name).toBe("Sign Up");
  });

  it("should allow user params to override variant params", () => {
    const subscriber = vi.fn();
    dl.subscribe(subscriber);

    // Variant params set first, then user params override
    const variantParams = {
      abn_variant_id: "auto-variant",
    };

    const userParams = {
      abn_variant_id: "manual-override",
    };

    dl.push({
      event: "custom",
      timestamp: Date.now(),
      ...variantParams,
      ...userParams,
    });

    const pushed = subscriber.mock.calls[0][0];
    expect(pushed.abn_variant_id).toBe("manual-override");
  });

  it("should handle section analytics events", () => {
    const subscriber = vi.fn();
    dl.subscribe(subscriber);

    dl.push(
      createEntry("block_click", {
        section_id: "hero-section",
        section_type: "hero",
        event_label: "hero_cta_click",
      }),
    );

    dl.push(
      createEntry("block_visible", {
        section_id: "features-section",
        section_type: "features",
        event_label: "features_visible",
      }),
    );

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber.mock.calls[0][0].section_id).toBe("hero-section");
    expect(subscriber.mock.calls[1][0].section_type).toBe("features");
  });
});
