import { CMSDataLayer } from "@otl-core/analytics";
import { setupEventRules } from "@/lib/analytics/rule-engine";
import type { EventRule, ScriptContext } from "@otl-core/cms-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createRule(overrides: Partial<EventRule> = {}): EventRule {
  return {
    id: "rule-1",
    enabled: true,
    label: "Test Rule",
    trigger: {
      type: "page_load",
      config: { type: "page_load" },
    },
    event_name: "page_view",
    extra_params: {},
    target_providers: "all",
    contexts: ["all"],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function createContext(
  overrides: Partial<{ contentType: ScriptContext; locale: string }> = {},
) {
  return {
    contentType: "pages" as ScriptContext,
    locale: "en",
    ...overrides,
  };
}

beforeEach(() => {
  document.body.innerHTML = "";
  Object.defineProperty(window, "location", {
    value: {
      pathname: "/test-page",
      hostname: "example.com",
      href: "https://example.com/test-page",
      origin: "https://example.com",
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("setupEventRules", () => {
  describe("page_load trigger", () => {
    it("fires immediately for enabled rules matching context", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        event_name: "page_view",
        trigger: { type: "page_load", config: { type: "page_load" } },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(1);
      expect(dl.entries[0].event).toBe("page_view");
      expect(dl.entries[0].rule_id).toBe("rule-1");
      expect(dl.entries[0].rule_label).toBe("Test Rule");
    });

    it("skips disabled rules", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({ enabled: false });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(0);
    });

    it("skips rules that do not match context", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        contexts: ["collections"],
      });

      setupEventRules([rule], dl, createContext({ contentType: "pages" }));

      expect(dl.entries).toHaveLength(0);
    });

    it("includes rules with 'all' context", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        contexts: ["all"],
      });

      setupEventRules(
        [rule],
        dl,
        createContext({ contentType: "collections" }),
      );

      expect(dl.entries).toHaveLength(1);
    });

    it("skips rules that do not match locale filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        locale_filter: ["de", "fr"],
      });

      setupEventRules([rule], dl, createContext({ locale: "en" }));

      expect(dl.entries).toHaveLength(0);
    });

    it("allows rules matching locale filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        locale_filter: ["de", "en"],
      });

      setupEventRules([rule], dl, createContext({ locale: "en" }));

      expect(dl.entries).toHaveLength(1);
    });

    it("allows rules with empty locale filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        locale_filter: [],
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(1);
    });
  });

  describe("page_filter", () => {
    it("respects exact page filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        trigger: {
          type: "page_load",
          config: { type: "page_load" },
          page_filter: { match_type: "exact", value: "/test-page" },
        },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(1);
    });

    it("blocks exact page filter that does not match", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        trigger: {
          type: "page_load",
          config: { type: "page_load" },
          page_filter: { match_type: "exact", value: "/other-page" },
        },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(0);
    });

    it("respects contains page filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        trigger: {
          type: "page_load",
          config: { type: "page_load" },
          page_filter: { match_type: "contains", value: "test" },
        },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(1);
    });

    it("respects starts_with page filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        trigger: {
          type: "page_load",
          config: { type: "page_load" },
          page_filter: { match_type: "starts_with", value: "/test" },
        },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(1);
    });

    it("respects regex page filter", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        trigger: {
          type: "page_load",
          config: { type: "page_load" },
          page_filter: { match_type: "regex", value: "/test-.*" },
        },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(1);
    });

    it("handles invalid regex gracefully", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        trigger: {
          type: "page_load",
          config: { type: "page_load" },
          page_filter: { match_type: "regex", value: "[invalid" },
        },
      });

      // Should not throw
      setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(0);
    });
  });

  describe("custom event names", () => {
    it("uses custom_event_name when event_name is 'custom'", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        event_name: "custom",
        custom_event_name: "my_special_event",
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries[0].event).toBe("my_special_event");
    });

    it("uses standard event_name when not 'custom'", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        event_name: "generate_lead",
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries[0].event).toBe("generate_lead");
    });
  });

  describe("extra_params and target_providers", () => {
    it("includes extra_params in fired events", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        extra_params: { campaign: "spring_sale", source: "homepage" },
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries[0].campaign).toBe("spring_sale");
      expect(dl.entries[0].source).toBe("homepage");
    });

    it("includes _target_providers when not 'all'", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        target_providers: ["ga4-script-1", "meta-script-2"],
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries[0]._target_providers).toEqual([
        "ga4-script-1",
        "meta-script-2",
      ]);
    });

    it("omits _target_providers when 'all'", () => {
      const dl = new CMSDataLayer();
      const rule = createRule({
        target_providers: "all",
      });

      setupEventRules([rule], dl, createContext());

      expect(dl.entries[0]._target_providers).toBeUndefined();
    });
  });

  describe("click trigger", () => {
    it("fires on click matching selector", () => {
      const dl = new CMSDataLayer();
      const btn = document.createElement("button");
      btn.className = "cta-btn";
      document.body.appendChild(btn);

      const rule = createRule({
        event_name: "block_click",
        trigger: {
          type: "click",
          config: { type: "click", css_selector: ".cta-btn" },
        },
      });

      setupEventRules([rule], dl, createContext());

      btn.click();

      expect(dl.entries).toHaveLength(1);
      expect(dl.entries[0].event).toBe("block_click");
      expect(dl.entries[0].clicked_element).toBe(".cta-btn");
    });

    it("does not fire on non-matching click", () => {
      const dl = new CMSDataLayer();
      const div = document.createElement("div");
      document.body.appendChild(div);

      const rule = createRule({
        trigger: {
          type: "click",
          config: { type: "click", css_selector: ".cta-btn" },
        },
      });

      setupEventRules([rule], dl, createContext());

      div.click();

      expect(dl.entries).toHaveLength(0);
    });

    it("fires only once per rule", () => {
      const dl = new CMSDataLayer();
      const btn = document.createElement("button");
      btn.className = "cta-btn";
      document.body.appendChild(btn);

      const rule = createRule({
        trigger: {
          type: "click",
          config: { type: "click", css_selector: ".cta-btn" },
        },
      });

      setupEventRules([rule], dl, createContext());

      btn.click();
      btn.click();
      btn.click();

      expect(dl.entries).toHaveLength(1);
    });
  });

  describe("time_on_page trigger", () => {
    it("fires after specified seconds", () => {
      vi.useFakeTimers();
      const dl = new CMSDataLayer();

      const rule = createRule({
        event_name: "content_view",
        trigger: {
          type: "time_on_page",
          config: { type: "time_on_page", seconds: 5 },
        },
      });

      const cleanup = setupEventRules([rule], dl, createContext());

      expect(dl.entries).toHaveLength(0);

      vi.advanceTimersByTime(5000);

      expect(dl.entries).toHaveLength(1);
      expect(dl.entries[0].event).toBe("content_view");
      expect(dl.entries[0].seconds).toBe(5);

      cleanup();
      vi.useRealTimers();
    });

    it("does not fire if cleaned up before timeout", () => {
      vi.useFakeTimers();
      const dl = new CMSDataLayer();

      const rule = createRule({
        trigger: {
          type: "time_on_page",
          config: { type: "time_on_page", seconds: 10 },
        },
      });

      const cleanup = setupEventRules([rule], dl, createContext());

      vi.advanceTimersByTime(5000);
      cleanup();
      vi.advanceTimersByTime(10000);

      expect(dl.entries).toHaveLength(0);

      vi.useRealTimers();
    });
  });

  describe("form_submission trigger", () => {
    it("fires when form_submit event appears in data layer", () => {
      const dl = new CMSDataLayer();

      const rule = createRule({
        event_name: "generate_lead",
        trigger: {
          type: "form_submission",
          config: { type: "form_submission" },
        },
      });

      setupEventRules([rule], dl, createContext());

      // Simulate form submission event
      dl.push({
        event: "form_submit",
        timestamp: Date.now(),
        form_id: "contact-form",
        form_name: "Contact",
      });

      // Should have the original form_submit + the rule's generate_lead
      expect(dl.entries).toHaveLength(2);
      expect(dl.entries[1].event).toBe("generate_lead");
      expect(dl.entries[1].form_id).toBe("contact-form");
    });

    it("filters by form_id when specified", () => {
      const dl = new CMSDataLayer();

      const rule = createRule({
        event_name: "generate_lead",
        trigger: {
          type: "form_submission",
          config: { type: "form_submission", form_id: "newsletter-form" },
        },
      });

      setupEventRules([rule], dl, createContext());

      // Different form
      dl.push({
        event: "form_submit",
        timestamp: Date.now(),
        form_id: "contact-form",
      });

      expect(dl.entries).toHaveLength(1); // Only the original push

      // Matching form
      dl.push({
        event: "form_submit",
        timestamp: Date.now(),
        form_id: "newsletter-form",
      });

      expect(dl.entries).toHaveLength(3); // Original + matching + rule event
      expect(dl.entries[2].event).toBe("generate_lead");
    });
  });

  describe("data_layer_push trigger", () => {
    it("fires when data layer entry has matching key", () => {
      const dl = new CMSDataLayer();

      const rule = createRule({
        event_name: "custom",
        custom_event_name: "user_logged_in",
        trigger: {
          type: "data_layer_push",
          config: { type: "data_layer_push", key: "user_status" },
        },
      });

      setupEventRules([rule], dl, createContext());

      dl.push({
        event: "page_view",
        timestamp: Date.now(),
        user_status: "logged_in",
      });

      expect(dl.entries).toHaveLength(2);
      expect(dl.entries[1].event).toBe("user_logged_in");
    });

    it("filters by value when specified", () => {
      const dl = new CMSDataLayer();

      const rule = createRule({
        event_name: "custom",
        custom_event_name: "premium_user",
        trigger: {
          type: "data_layer_push",
          config: {
            type: "data_layer_push",
            key: "user_tier",
            value: "premium",
          },
        },
      });

      setupEventRules([rule], dl, createContext());

      // Non-matching value
      dl.push({
        event: "page_view",
        timestamp: Date.now(),
        user_tier: "free",
      });

      expect(dl.entries).toHaveLength(1); // Only the original push

      // Matching value
      dl.push({
        event: "page_view",
        timestamp: Date.now(),
        user_tier: "premium",
      });

      expect(dl.entries).toHaveLength(3); // Two originals + rule event
      expect(dl.entries[2].event).toBe("premium_user");
    });
  });

  describe("cleanup", () => {
    it("returns a cleanup function that removes listeners", () => {
      const dl = new CMSDataLayer();
      const btn = document.createElement("button");
      btn.className = "cta-btn";
      document.body.appendChild(btn);

      const rule = createRule({
        trigger: {
          type: "click",
          config: { type: "click", css_selector: ".cta-btn" },
        },
      });

      const cleanup = setupEventRules([rule], dl, createContext());

      cleanup();

      btn.click();

      expect(dl.entries).toHaveLength(0);
    });
  });

  describe("multiple rules", () => {
    it("processes multiple rules independently", () => {
      const dl = new CMSDataLayer();

      const rules = [
        createRule({
          id: "rule-1",
          event_name: "page_view",
          label: "Track Page Load",
        }),
        createRule({
          id: "rule-2",
          event_name: "custom",
          custom_event_name: "homepage_view",
          label: "Track Homepage",
          trigger: {
            type: "page_load",
            config: { type: "page_load" },
            page_filter: { match_type: "exact", value: "/test-page" },
          },
        }),
      ];

      setupEventRules(rules, dl, createContext());

      expect(dl.entries).toHaveLength(2);
      expect(dl.entries[0].rule_id).toBe("rule-1");
      expect(dl.entries[1].rule_id).toBe("rule-2");
    });
  });
});
