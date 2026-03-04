"use client";

/**
 * Analytics Event Manager
 *
 * Ties the data layer, provider adapters, and auto-triggers together.
 * Renders nothing (returns null) -- purely side-effect driven.
 */

import { useEffect, useRef } from "react";
import type {
  AutoEventSettings,
  ConsentCategory,
  ScriptConfig,
  ScriptContext,
} from "@otl-core/cms-types";
import { PROVIDER_EVENT_MAPPINGS } from "@otl-core/script-utils";
import { useConsent } from "@/lib/consent";
import {
  dataLayer,
  createProviderAdapter,
  setupAutoTriggers,
  setupEventRules,
} from "@/lib/analytics";

const DEFAULT_AUTO_EVENTS: AutoEventSettings = {
  page_views: true,
  outbound_links: false,
  file_downloads: false,
  file_extensions: ["pdf", "zip", "docx", "xlsx", "pptx", "csv"],
  scroll_depth: false,
  scroll_thresholds: [25, 50, 75, 100],
  form_submissions: false,
  time_on_page: false,
  time_thresholds: [30, 60, 180],
};

interface AnalyticsEventManagerProps {
  config: ScriptConfig | undefined;
  pageContext: {
    contentType: ScriptContext;
    locale: string;
  };
}

export function AnalyticsEventManager({
  config,
  pageContext,
}: AnalyticsEventManagerProps) {
  const { consentState } = useConsent();
  const unsubscribesRef = useRef<Array<() => void>>([]);
  const autoCleanupRef = useRef<(() => void) | null>(null);
  const ruleCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!config) return;

    // Cleanup previous subscriptions
    for (const unsub of unsubscribesRef.current) {
      unsub();
    }
    unsubscribesRef.current = [];

    // Create adapters for each enabled provider script that has event mappings
    const scripts = config.scripts ?? [];
    for (const script of scripts) {
      if (!script.enabled) continue;

      // Only provider scripts have event mappings
      if (script.type !== "provider" || !script.provider) continue;

      // Check if this provider has any event mappings
      if (!PROVIDER_EVENT_MAPPINGS[script.provider]) continue;

      // Check context filter
      if (
        !script.contexts.includes("all") &&
        !script.contexts.includes(pageContext.contentType)
      ) {
        continue;
      }

      // Check locale filter
      if (
        script.locale_filter &&
        script.locale_filter.length > 0 &&
        !script.locale_filter.includes(pageContext.locale)
      ) {
        continue;
      }

      // Create the adapter with current consent state
      const adapter = createProviderAdapter(
        script,
        consentState as Record<ConsentCategory, boolean>,
      );

      // Subscribe to the data layer
      const unsub = dataLayer.subscribe(adapter);
      unsubscribesRef.current.push(unsub);
    }

    return () => {
      for (const unsub of unsubscribesRef.current) {
        unsub();
      }
      unsubscribesRef.current = [];
    };
  }, [config, consentState, pageContext.contentType, pageContext.locale]);

  // Set up auto-triggers
  useEffect(() => {
    if (!config) return;

    // Cleanup previous auto-triggers
    if (autoCleanupRef.current) {
      autoCleanupRef.current();
      autoCleanupRef.current = null;
    }

    const autoEvents: AutoEventSettings =
      config.auto_events ?? DEFAULT_AUTO_EVENTS;
    autoCleanupRef.current = setupAutoTriggers(autoEvents, dataLayer);

    return () => {
      if (autoCleanupRef.current) {
        autoCleanupRef.current();
        autoCleanupRef.current = null;
      }
    };
  }, [config]);

  // Set up advanced event rules
  useEffect(() => {
    if (!config) return;

    // Cleanup previous rules
    if (ruleCleanupRef.current) {
      ruleCleanupRef.current();
      ruleCleanupRef.current = null;
    }

    const rules = config.advanced_event_rules ?? [];
    if (rules.length === 0) return;

    ruleCleanupRef.current = setupEventRules(rules, dataLayer, {
      contentType: pageContext.contentType,
      locale: pageContext.locale,
    });

    return () => {
      if (ruleCleanupRef.current) {
        ruleCleanupRef.current();
        ruleCleanupRef.current = null;
      }
    };
  }, [config, pageContext.contentType, pageContext.locale]);

  // This component renders nothing
  return null;
}
