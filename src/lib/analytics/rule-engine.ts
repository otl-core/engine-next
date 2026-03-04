/**
 * Advanced Event Rules Runtime
 *
 * Processes EventRule[] from ScriptConfig and sets up DOM listeners,
 * observers, and conditions to fire events when triggers match.
 *
 * Rules fire at most once per page load unless explicitly configured
 * to repeat (not currently supported -- reserved for future use).
 */

import type {
  EventRule,
  EventTrigger,
  EventPageFilter,
  ScriptContext,
  ClickTriggerConfig,
  ScrollDepthTriggerConfig,
  ElementVisibilityTriggerConfig,
  TimeOnPageTriggerConfig,
  FormSubmissionTriggerConfig,
  FileDownloadTriggerConfig,
  CustomJsTriggerConfig,
  DataLayerPushTriggerConfig,
} from "@otl-core/cms-types";
import type { CMSDataLayer, DataLayerEntry } from "@otl-core/analytics";

interface RuleEngineContext {
  contentType: ScriptContext;
  locale: string;
}

/**
 * Initialize all enabled event rules and return a cleanup function.
 */
export function setupEventRules(
  rules: EventRule[],
  dl: CMSDataLayer,
  context: RuleEngineContext,
): () => void {
  const cleanups: Array<() => void> = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    // Check context filter
    if (
      !rule.contexts.includes("all") &&
      !rule.contexts.includes(context.contentType)
    ) {
      continue;
    }

    // Check locale filter
    if (
      rule.locale_filter &&
      rule.locale_filter.length > 0 &&
      !rule.locale_filter.includes(context.locale)
    ) {
      continue;
    }

    const cleanup = setupRuleTrigger(rule, dl);
    if (cleanup) {
      cleanups.push(cleanup);
    }
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

function setupRuleTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
): (() => void) | null {
  const { trigger } = rule;

  switch (trigger.type) {
    case "page_load":
      return setupPageLoadTrigger(rule, dl);
    case "click":
      return setupClickTrigger(rule, dl, trigger);
    case "scroll_depth":
      return setupScrollDepthTrigger(rule, dl, trigger);
    case "element_visibility":
      return setupElementVisibilityTrigger(rule, dl, trigger);
    case "time_on_page":
      return setupTimeOnPageTrigger(rule, dl, trigger);
    case "form_submission":
      return setupFormSubmissionTrigger(rule, dl, trigger);
    case "outbound_link":
      return setupOutboundLinkTrigger(rule, dl);
    case "file_download":
      return setupFileDownloadTrigger(rule, dl, trigger);
    case "custom_js":
      return setupCustomJsTrigger(rule, dl, trigger);
    case "data_layer_push":
      return setupDataLayerPushTrigger(rule, dl, trigger);
    default:
      return null;
  }
}

function setupPageLoadTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
): (() => void) | null {
  if (!matchesPageFilter(rule.trigger.page_filter)) return null;
  fireRuleEvent(rule, dl);
  return null; // No cleanup needed
}

function setupClickTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as ClickTriggerConfig;
  const selector = config.css_selector;
  if (!selector) return null;

  let fired = false;

  const handler = (e: Event) => {
    if (fired) return;
    try {
      const target = (e.target as Element | null)?.closest(selector);
      if (target && matchesPageFilter(trigger.page_filter)) {
        fired = true;
        fireRuleEvent(rule, dl, { clicked_element: selector });
      }
    } catch {
      // Invalid CSS selector -- fail silently
    }
  };

  document.addEventListener("click", handler, { passive: true });
  return () => document.removeEventListener("click", handler);
}

function setupScrollDepthTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as ScrollDepthTriggerConfig;
  const thresholds = config.thresholds;
  if (!thresholds || thresholds.length === 0) return null;

  const firedThresholds = new Set<number>();
  let allFired = false;

  const handler = () => {
    if (allFired) return;

    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const percent = (window.scrollY / scrollHeight) * 100;

    for (const threshold of thresholds) {
      if (percent >= threshold && !firedThresholds.has(threshold)) {
        firedThresholds.add(threshold);
        if (matchesPageFilter(trigger.page_filter)) {
          fireRuleEvent(rule, dl, { scroll_percent: threshold });
        }
      }
    }

    if (firedThresholds.size === thresholds.length) {
      allFired = true;
    }
  };

  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

function setupElementVisibilityTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as ElementVisibilityTriggerConfig;
  const selector = config.css_selector;
  if (!selector) return null;

  const threshold = Math.min(Math.max(config.threshold ?? 50, 0), 100) / 100;

  let elements: NodeListOf<Element>;
  try {
    elements = document.querySelectorAll(selector);
  } catch {
    // Invalid CSS selector -- fail silently
    return null;
  }

  if (elements.length === 0) return null;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && matchesPageFilter(trigger.page_filter)) {
          fireRuleEvent(rule, dl, { element: selector });
          observer.disconnect(); // Fire once
          return;
        }
      }
    },
    { threshold },
  );

  elements.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

function setupTimeOnPageTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as TimeOnPageTriggerConfig;
  const seconds = config.seconds;
  if (!seconds || seconds <= 0) return null;

  const timer = setTimeout(() => {
    if (matchesPageFilter(trigger.page_filter)) {
      fireRuleEvent(rule, dl, { seconds });
    }
  }, seconds * 1000);

  return () => clearTimeout(timer);
}

function setupFormSubmissionTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as FormSubmissionTriggerConfig;
  const formId = config.form_id;
  let fired = false;

  const unsub = dl.subscribe((entry) => {
    if (fired) return;
    if (entry.event === "form_submit") {
      if (formId && entry.form_id !== formId) return;
      if (matchesPageFilter(trigger.page_filter)) {
        fired = true;
        fireRuleEvent(rule, dl, { form_id: entry.form_id });
      }
    }
  });

  return unsub;
}

function setupOutboundLinkTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
): (() => void) | null {
  let fired = false;

  const handler = (e: Event) => {
    if (fired) return;
    const target = (e.target as Element | null)?.closest("a[href]");
    if (!target) return;

    const anchor = target as HTMLAnchorElement;
    try {
      const url = new URL(anchor.href, window.location.origin);
      if (url.hostname !== window.location.hostname) {
        if (matchesPageFilter(rule.trigger.page_filter)) {
          fired = true;
          fireRuleEvent(rule, dl, {
            url: anchor.href,
            link_text: anchor.textContent?.trim() ?? "",
          });
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  };

  document.addEventListener("click", handler, { passive: true });
  return () => document.removeEventListener("click", handler);
}

function setupFileDownloadTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as FileDownloadTriggerConfig;
  const extensions = config.extensions;
  if (!extensions || extensions.length === 0) return null;

  const extSet = new Set(extensions.map((ext) => ext.toLowerCase()));
  let fired = false;

  const handler = (e: Event) => {
    if (fired) return;
    const target = (e.target as Element | null)?.closest("a[href]");
    if (!target) return;

    const anchor = target as HTMLAnchorElement;
    try {
      const url = new URL(anchor.href, window.location.origin);
      const pathname = url.pathname;
      const dotIdx = pathname.lastIndexOf(".");
      if (dotIdx === -1) return;

      const ext = pathname.slice(dotIdx + 1).toLowerCase();
      if (extSet.has(ext)) {
        if (matchesPageFilter(trigger.page_filter)) {
          fired = true;
          const fileName = pathname.split("/").pop() ?? "";
          fireRuleEvent(rule, dl, {
            file_url: anchor.href,
            file_name: fileName,
            file_extension: ext,
          });
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  };

  document.addEventListener("click", handler, { passive: true });
  return () => document.removeEventListener("click", handler);
}

function setupCustomJsTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as CustomJsTriggerConfig;
  const condition = config.condition;
  if (!condition) return null;

  let fired = false;

  const evaluate = (): boolean => {
    try {
      // Use new Function instead of eval for slightly better sandboxing
      const fn = new Function(`return (${condition})`);
      return fn() === true;
    } catch {
      return false;
    }
  };

  // Check on page load
  if (evaluate() && matchesPageFilter(trigger.page_filter)) {
    fireRuleEvent(rule, dl);
    return null;
  }

  // Also check on clicks (user interactions may change state)
  const handler = () => {
    if (fired) return;
    // Debounce: check after a short delay to let state settle
    setTimeout(() => {
      if (fired) return;
      if (evaluate() && matchesPageFilter(trigger.page_filter)) {
        fired = true;
        fireRuleEvent(rule, dl);
        document.removeEventListener("click", handler);
      }
    }, 100);
  };

  document.addEventListener("click", handler, { passive: true });
  return () => document.removeEventListener("click", handler);
}

function setupDataLayerPushTrigger(
  rule: EventRule,
  dl: CMSDataLayer,
  trigger: EventTrigger,
): (() => void) | null {
  const config = trigger.config as DataLayerPushTriggerConfig;
  const key = config.key;
  if (!key) return null;

  let fired = false;

  const unsub = dl.subscribe((entry) => {
    if (fired) return;
    const entryValue = entry[key];
    if (entryValue !== undefined) {
      if (config.value === undefined || String(entryValue) === config.value) {
        if (matchesPageFilter(trigger.page_filter)) {
          fired = true;
          fireRuleEvent(rule, dl);
        }
      }
    }
  });

  return unsub;
}

function matchesPageFilter(filter: EventPageFilter | undefined): boolean {
  if (!filter) return true;
  const path = window.location.pathname;

  switch (filter.match_type) {
    case "exact":
      return path === filter.value;
    case "contains":
      return path.includes(filter.value);
    case "starts_with":
      return path.startsWith(filter.value);
    case "regex":
      try {
        return new RegExp(filter.value).test(path);
      } catch {
        return false;
      }
    default:
      return true;
  }
}

function fireRuleEvent(
  rule: EventRule,
  dl: CMSDataLayer,
  extraParams?: Record<string, unknown>,
): void {
  const eventName =
    rule.event_name === "custom" && rule.custom_event_name
      ? rule.custom_event_name
      : rule.event_name;

  // NOTE: We cast to `string` because custom_event_name is a user-defined
  // string that cannot conform to the StandardEventName union. The data
  // layer's push method accepts `[key: string]: unknown` so this is safe
  // at runtime. This is the one accepted exception to the "no as any" rule.
  dl.push({
    event: eventName as DataLayerEntry["event"],
    timestamp: Date.now(),
    rule_id: rule.id,
    rule_label: rule.label,
    ...rule.extra_params,
    ...extraParams,
    ...(rule.target_providers !== "all"
      ? { _target_providers: rule.target_providers }
      : {}),
  });
}
