"use client";

/**
 * Consent Banner Component
 *
 * Renders a GDPR-compliant cookie consent banner with support for
 * bar, box, modal, and sheet layouts. Includes a preferences panel for
 * granular category control.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ConsentBannerConfig,
  ConsentBannerTexts,
  ConsentCategory,
} from "@otl-core/cms-types";
import { ALL_CONSENT_CATEGORIES, useConsent } from "@/lib/consent";
import type { ConsentState } from "@/lib/consent";

interface ConsentBannerProps {
  config: ConsentBannerConfig | undefined;
  locale: string;
}

export function ConsentBanner({ config, locale }: ConsentBannerProps) {
  const { consentState, hasConsented, acceptAll, rejectAll, savePreferences } =
    useConsent();

  const [showPreferences, setShowPreferences] = useState(false);
  // Local-only dismiss — no cookie written, banner reappears on next page load
  const [dismissed, setDismissed] = useState(false);
  const [preferencesState, setPreferencesState] =
    useState<ConsentState>(consentState);

  // Keep preferences in sync when consent state changes externally
  const syncPreferences = useCallback(() => {
    setPreferencesState(consentState);
  }, [consentState]);

  // Resolve localized texts
  const texts = useMemo((): ConsentBannerTexts | null => {
    if (!config?.texts) return null;
    // Try exact locale match first
    if (config.texts[locale]) return config.texts[locale];
    // Fall back to first available locale
    const keys = Object.keys(config.texts);
    if (keys.length > 0) return config.texts[keys[0]];
    return null;
  }, [config?.texts, locale]);

  // Auto-dismiss: accept all after timeout
  useEffect(() => {
    if (!config?.auto_dismiss_seconds || config.auto_dismiss_seconds <= 0)
      return;
    if (hasConsented) return;
    const timer = setTimeout(() => {
      acceptAll();
    }, config.auto_dismiss_seconds * 1000);
    return () => clearTimeout(timer);
  }, [config?.auto_dismiss_seconds, acceptAll, hasConsented]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
  }, [acceptAll]);

  const handleRejectAll = useCallback(() => {
    rejectAll();
  }, [rejectAll]);

  const handleOpenPreferences = useCallback(() => {
    syncPreferences();
    setShowPreferences(true);
  }, [syncPreferences]);

  const handleSavePreferences = useCallback(() => {
    savePreferences(preferencesState);
    setShowPreferences(false);
  }, [savePreferences, preferencesState]);

  const handleToggleCategory = useCallback(
    (category: ConsentCategory, granted: boolean) => {
      if (category === "necessary") return;
      setPreferencesState((prev) => ({ ...prev, [category]: granted }));
    },
    [setPreferencesState],
  );

  const legalLinks = useMemo(() => {
    if (!config || !texts) return [];
    return buildLegalLinks(config, texts);
  }, [config, texts]);

  const layout = config?.layout || "bar";
  const position = config?.position || "bottom";

  const containerClasses = useMemo(
    () =>
      [getContainerClasses(layout, position), config?.custom_css_class || ""]
        .join(" ")
        .trim(),
    [layout, position, config?.custom_css_class],
  );

  if (!config || !config.enabled || hasConsented || dismissed || !texts)
    return null;

  const bannerContent = (
    <>
      {config.show_close_button && (
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
          }}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded-sm"
          aria-label={texts.close_button_label || "Close"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {showPreferences ? (
        <PreferencesPanel
          texts={texts}
          state={preferencesState}
          onToggle={handleToggleCategory}
          onSave={handleSavePreferences}
          onBack={() => setShowPreferences(false)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            {config.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element -- dynamic CMS logo URL, next/image requires per-domain config
              <img
                src={config.logo_url}
                alt=""
                className="h-8 w-auto mb-2"
                aria-hidden="true"
              />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {texts.title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{texts.description}</p>
            {legalLinks.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {legalLinks.map((link, i) => (
                  <span key={link.url}>
                    {i > 0 && <span className="mx-1">|</span>}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-700"
                    >
                      {link.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            >
              {texts.accept_all_label}
            </button>

            {config.show_reject_all && (
              <button
                type="button"
                onClick={handleRejectAll}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                {texts.reject_all_label}
              </button>
            )}

            {config.show_preferences && (
              <button
                type="button"
                onClick={handleOpenPreferences}
                className="text-sm font-medium text-gray-600 underline transition-colors hover:text-gray-900 focus:outline-none"
              >
                {texts.preferences_label}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  const showBackdrop = config.layout === "modal" || config.block_interaction;

  const dialog = (
    <div
      role="dialog"
      aria-modal={config.layout === "modal" ? "true" : undefined}
      aria-label={texts.title}
      className={containerClasses}
    >
      {layout === "bar" || layout === "sheet" ? (
        <div className="container mx-auto">{bannerContent}</div>
      ) : (
        bannerContent
      )}
    </div>
  );

  if (showBackdrop) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        {dialog}
      </div>
    );
  }

  return dialog;
}

interface PreferencesPanelProps {
  texts: ConsentBannerTexts;
  state: ConsentState;
  onToggle(category: ConsentCategory, granted: boolean): void;
  onSave(): void;
  onBack(): void;
}

function PreferencesPanel({
  texts,
  state,
  onToggle,
  onSave,
  onBack,
}: PreferencesPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Back to consent banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{texts.title}</h2>
      </div>

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {ALL_CONSENT_CATEGORIES.map((category) => {
          const labels = texts.category_labels?.[category];
          const isNecessary = category === "necessary";

          return (
            <div
              key={category}
              className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {labels?.title ?? category}
                </p>
                {labels?.description && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {labels.description}
                  </p>
                )}
              </div>
              <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isNecessary ? true : state[category]}
                  disabled={isNecessary}
                  onChange={(e) => onToggle(category, e.target.checked)}
                  aria-label={`${labels?.title ?? category} consent`}
                />
                <div
                  className={[
                    "h-5 w-9 rounded-full transition-colors",
                    "after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform",
                    "peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-4",
                    isNecessary
                      ? "bg-gray-400 opacity-60"
                      : "bg-gray-300 peer-focus:ring-2 peer-focus:ring-[var(--primary)] peer-focus:ring-offset-2",
                  ].join(" ")}
                />
              </label>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
      >
        {texts.save_preferences_label}
      </button>
    </div>
  );
}

interface LegalLink {
  url: string;
  label: string;
}

function buildLegalLinks(
  config: ConsentBannerConfig,
  texts: ConsentBannerTexts,
): LegalLink[] {
  const links: LegalLink[] = [];

  if (config.privacy_policy_url) {
    links.push({
      url: config.privacy_policy_url,
      label: texts.privacy_policy_label || "Privacy Policy",
    });
  }

  if (config.cookie_policy_url) {
    links.push({
      url: config.cookie_policy_url,
      label: texts.cookie_policy_label || "Cookie Policy",
    });
  }

  if (config.imprint_url) {
    links.push({
      url: config.imprint_url,
      label: texts.imprint_label || "Imprint",
    });
  }

  return links;
}

function getContainerClasses(
  layout: ConsentBannerConfig["layout"],
  position: ConsentBannerConfig["position"],
): string {
  const base = "fixed z-60 bg-white shadow-lg";

  switch (layout) {
    // Bar: full-width top or bottom, content constrained via inner .container
    case "bar":
      if (position === "top") {
        return `${base} inset-x-0 top-0 py-6 border-b border-gray-200`;
      }
      return `${base} inset-x-0 bottom-0 py-6 border-t border-gray-200`;

    // Box: near-full-width on mobile (with margin), max-w-md positioned on desktop
    case "box":
      return `${base} p-6 rounded-lg border border-gray-200 max-md:left-4 max-md:right-4 ${getMobileBoxPosition(position)} md:max-w-md ${getBoxPositionClasses(position)}`;

    // Modal: always centered
    case "modal":
      return `${base} p-6 left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200`;

    // Sheet: always bottom
    case "sheet":
      return `${base} py-6 inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-lg border-t border-gray-200`;

    default:
      return `${base} inset-x-0 bottom-0 py-6 border-t border-gray-200`;
  }
}

function getMobileBoxPosition(
  position: ConsentBannerConfig["position"],
): string {
  switch (position) {
    case "top":
    case "top_left":
    case "top_right":
      return "max-md:top-4";
    case "center":
      return "max-md:top-1/2 max-md:-translate-y-1/2";
    case "bottom":
    case "bottom_left":
    case "bottom_right":
    default:
      return "max-md:bottom-4";
  }
}

function getBoxPositionClasses(
  position: ConsentBannerConfig["position"],
): string {
  switch (position) {
    case "bottom_left":
      return "md:bottom-4 md:left-4";
    case "top_right":
      return "md:top-4 md:right-4";
    case "top_left":
      return "md:top-4 md:left-4";
    case "top":
      return "md:top-4 md:left-1/2 md:-translate-x-1/2";
    case "bottom":
      return "md:bottom-4 md:left-1/2 md:-translate-x-1/2";
    case "center":
      return "md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2";
    case "bottom_right":
    default:
      return "md:bottom-4 md:right-4";
  }
}
