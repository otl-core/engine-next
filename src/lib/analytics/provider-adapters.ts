/**
 * Provider Adapter Factory
 *
 * Creates subscriber functions for specific provider scripts. Each adapter
 * translates CMS data-layer events into provider-specific API calls, checking
 * consent state and event mapping availability.
 */

import type {
  ConsentCategory,
  ManagedScript,
  ScriptProviderType,
} from "@otl-core/cms-types";
import {
  PROVIDER_EVENT_MAPPINGS,
  type ProviderEventMapping,
} from "@otl-core/script-utils";
import type { DataLayerEntry } from "@otl-core/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    lintrk?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void };
    posthog?: { capture: (...args: unknown[]) => void };
    mixpanel?: { track: (...args: unknown[]) => void };
    plausible?: (...args: unknown[]) => void;
    pintrk?: (...args: unknown[]) => void;
    twq?: (...args: unknown[]) => void;
    snaptr?: (...args: unknown[]) => void;
    uetq?: Array<unknown>;
    amplitude?: { track: (...args: unknown[]) => void };
    analytics?: {
      track: (...args: unknown[]) => void;
      page: (...args: unknown[]) => void;
    };
  }
}

/**
 * Translate CMS params to provider-specific params using the mapping's
 * param_map. Keys in the entry that are not in the param_map are preserved
 * as-is (this allows custom/extra params to flow through).
 */
function translateParams(
  entry: DataLayerEntry,
  paramMap: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Map known CMS keys to provider keys
  for (const [cmsKey, providerKey] of Object.entries(paramMap)) {
    if (cmsKey in entry && entry[cmsKey] !== undefined) {
      result[providerKey] = entry[cmsKey];
    }
  }

  // Also pass through any extra params that are not standard metadata
  const metaKeys = new Set(["event", "timestamp", "_target_providers"]);
  const mappedCmsKeys = new Set(Object.keys(paramMap));

  for (const [key, value] of Object.entries(entry)) {
    if (!metaKeys.has(key) && !mappedCmsKeys.has(key) && value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Execute the provider-specific JavaScript call. Checks that the global
 * function exists before calling. Gracefully handles missing globals
 * (script not yet loaded).
 */
export function executeProviderCall(
  provider: ScriptProviderType,
  mapping: ProviderEventMapping,
  params: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const eventName = mapping.provider_event_name;

  switch (provider) {
    case "google_analytics_4":
    case "google_tag_manager":
    case "google_ads": {
      if (window.gtag) {
        window.gtag("event", eventName, params);
      }
      break;
    }
    case "meta_pixel": {
      if (window.fbq) {
        // Use trackCustom for custom events, track for standard events
        const method = mapping.call_pattern.includes("trackCustom")
          ? "trackCustom"
          : "track";
        window.fbq(method, eventName, params);
      }
      break;
    }
    case "linkedin_insight": {
      if (window.lintrk) {
        window.lintrk("track", {
          ...params,
          conversion_id: params.conversion_id,
        });
      }
      break;
    }
    case "tiktok_pixel": {
      if (window.ttq) {
        window.ttq.track(eventName, params);
      }
      break;
    }
    case "posthog": {
      if (window.posthog) {
        window.posthog.capture(eventName, params);
      }
      break;
    }
    case "mixpanel": {
      if (window.mixpanel) {
        window.mixpanel.track(eventName, params);
      }
      break;
    }
    case "plausible": {
      if (window.plausible) {
        window.plausible(eventName, { props: params });
      }
      break;
    }
    case "segment": {
      if (window.analytics) {
        if (eventName === "page") {
          window.analytics.page(params);
        } else {
          window.analytics.track(eventName, params);
        }
      }
      break;
    }
    case "pinterest_tag": {
      if (window.pintrk) {
        window.pintrk("track", eventName, params);
      }
      break;
    }
    case "twitter_pixel": {
      if (window.twq) {
        window.twq("event", eventName, params);
      }
      break;
    }
    case "snapchat_pixel": {
      if (window.snaptr) {
        window.snaptr("track", eventName, params);
      }
      break;
    }
    case "bing_uet": {
      if (window.uetq) {
        window.uetq.push("event", eventName, params);
      }
      break;
    }
    case "amplitude": {
      if (window.amplitude) {
        window.amplitude.track(eventName, params);
      }
      break;
    }
    default:
      // Provider does not have event tracking API (e.g., Hotjar, session recorders)
      break;
  }
}

/**
 * Create a data-layer subscriber function for a specific provider script.
 *
 * When an event is pushed to the data layer:
 * 1. Check consent for the script's category
 * 2. Look up the event mapping for this provider
 * 3. Translate CMS params to provider params
 * 4. Execute the provider call
 */
export function createProviderAdapter(
  script: ManagedScript,
  consentState: Record<ConsentCategory, boolean>,
): (entry: DataLayerEntry) => void {
  // Only provider-type scripts have event mappings
  if (script.type !== "provider" || !script.provider) {
    return () => {
      /* no-op for custom scripts */
    };
  }

  const provider = script.provider;
  const providerMappings = PROVIDER_EVENT_MAPPINGS[provider];

  return (entry: DataLayerEntry) => {
    // Check consent
    if (
      script.consent_category !== "necessary" &&
      !consentState[script.consent_category]
    ) {
      return;
    }

    // Check target_providers filter (from block analytics)
    const targetProviders = entry._target_providers;
    if (targetProviders && targetProviders !== "all") {
      if (
        Array.isArray(targetProviders) &&
        !targetProviders.includes(script.id)
      ) {
        return;
      }
    }

    // Look up event mapping
    if (!providerMappings) return;
    const mapping = providerMappings[entry.event];
    if (!mapping) return;

    // Handle custom event names
    let effectiveMapping = mapping;
    if (
      entry.event === "custom" &&
      typeof entry.custom_event_name === "string"
    ) {
      effectiveMapping = {
        ...mapping,
        provider_event_name: entry.custom_event_name,
      };
    }

    // Handle block_click / block_visible (use event_label as event name for GA4-like providers)
    if (
      (entry.event === "block_click" || entry.event === "block_visible") &&
      typeof entry.event_label === "string"
    ) {
      effectiveMapping = {
        ...mapping,
        provider_event_name: entry.event_label,
      };
    }

    // Translate params
    const translatedParams = translateParams(entry, effectiveMapping.param_map);

    // Add outbound flag for GA4 outbound clicks
    if (entry.event === "outbound_click" && provider === "google_analytics_4") {
      translatedParams.outbound = true;
    }

    // Execute the call
    executeProviderCall(provider, effectiveMapping, translatedParams);
  };
}
