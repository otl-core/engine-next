"use client";

/**
 * Consent React Context
 *
 * Client-side context that manages the user's cookie consent state.
 * Reads/writes the consent cookie and optionally fires Google Consent
 * Mode updates when preferences change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ConsentCategory, ConsentBannerConfig } from "@otl-core/cms-types";
import type { ConsentState, ConsentCookieData } from "./consent-cookie";
import {
  getDefaultConsentState,
  parseConsentCookie,
  serializeConsentCookie,
} from "./consent-cookie";
import { fireGoogleConsentUpdate } from "./google-consent-mode";

export interface ConsentContextValue {
  /** Current consent per category. */
  consentState: ConsentState;
  /** Whether the user has made any consent decision (cookie exists). */
  hasConsented: boolean;
  /** Update consent for a single category. */
  updateConsent(category: ConsentCategory, granted: boolean): void;
  /** Accept all consent categories. */
  acceptAll(): void;
  /** Reject all non-necessary categories. */
  rejectAll(): void;
  /** Save a complete consent state. */
  savePreferences(state: ConsentState): void;
  /** Reset consent (re-show banner). Used by the reopen trigger. */
  resetConsent(): void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(
      "(?:^|;\\s*)" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)",
    ),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAgeSeconds};SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
}

interface ConsentProviderProps {
  config: ConsentBannerConfig | undefined;
  children: React.ReactNode;
}

// Extend Navigator with GPC (not in standard TypeScript lib types)
declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

export function ConsentProvider({ config, children }: ConsentProviderProps) {
  const cookieName = config?.cookie_name ?? "otl_consent";
  const consentMode = config?.consent_mode ?? "opt_in";
  const lifetimeSeconds = (config?.cookie_lifetime_days ?? 365) * 86400;
  const googleConsentEnabled = config?.google_consent_mode_enabled ?? false;
  const respectDnt = config?.respect_dnt ?? false;
  const respectGpc = config?.respect_gpc ?? false;
  const reConsentDays = config?.re_consent_days ?? 0;

  // Resolve initial consent from cookie / privacy signals (runs once on client)
  const initRef = useRef(false);
  const [consentState, setConsentState] = useState<ConsentState>(() =>
    getDefaultConsentState(consentMode),
  );
  const [hasConsented, setHasConsented] = useState(false);

  if (!initRef.current && typeof document !== "undefined") {
    initRef.current = true;
    const existingValue = getCookieValue(cookieName);

    if (existingValue) {
      const cookieData: ConsentCookieData = parseConsentCookie(existingValue);

      // Check re-consent: if re_consent_days is configured and the cookie
      // was written in the new format (consented_at > 0), check expiry.
      let expired = false;
      if (reConsentDays > 0 && cookieData.consented_at > 0) {
        const expiryMs = cookieData.consented_at + reConsentDays * 86400000;
        if (Date.now() > expiryMs) {
          deleteCookie(cookieName);
          expired = true;
        }
      }

      if (!expired) {
        setConsentState(cookieData.state);
        setHasConsented(true);
      }
    }
  }

  // Handle privacy signals (DNT/GPC) that require writing cookies -- runs as effect
  // because setCookie is a side-effect on an external system.
  useEffect(() => {
    // Only act if user has not already consented (cookie was present)
    if (hasConsented) return;

    const existingValue = getCookieValue(cookieName);
    if (existingValue) return;

    // Check Do Not Track
    if (
      respectDnt &&
      typeof navigator !== "undefined" &&
      navigator.doNotTrack === "1"
    ) {
      const dntState = getDefaultConsentState("opt_in");
      setCookie(cookieName, serializeConsentCookie(dntState), lifetimeSeconds);
      if (googleConsentEnabled) fireGoogleConsentUpdate(dntState);
      setConsentState(dntState);
      setHasConsented(true);
      return;
    }

    // Check Global Privacy Control
    if (
      respectGpc &&
      typeof navigator !== "undefined" &&
      navigator.globalPrivacyControl === true
    ) {
      const gpcState = getDefaultConsentState("opt_in");
      setCookie(cookieName, serializeConsentCookie(gpcState), lifetimeSeconds);
      if (googleConsentEnabled) fireGoogleConsentUpdate(gpcState);
      setConsentState(gpcState);
      setHasConsented(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time mount check
  }, []);

  // Persist consent and optionally fire Google Consent update
  const persistConsent = useCallback(
    (state: ConsentState) => {
      // Ensure `necessary` is always true
      const normalized: ConsentState = { ...state, necessary: true };
      setConsentState(normalized);
      setHasConsented(true);
      setCookie(
        cookieName,
        serializeConsentCookie(normalized),
        lifetimeSeconds,
      );
      if (googleConsentEnabled) {
        fireGoogleConsentUpdate(normalized);
      }
    },
    [cookieName, lifetimeSeconds, googleConsentEnabled],
  );

  const updateConsent = useCallback(
    (category: ConsentCategory, granted: boolean) => {
      if (category === "necessary") return; // Cannot toggle off necessary
      persistConsent({ ...consentState, [category]: granted });
    },
    [consentState, persistConsent],
  );

  const acceptAll = useCallback(() => {
    const allGranted: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      social: true,
    };
    persistConsent(allGranted);
  }, [persistConsent]);

  const rejectAll = useCallback(() => {
    persistConsent(getDefaultConsentState("opt_in"));
  }, [persistConsent]);

  const savePreferences = useCallback(
    (state: ConsentState) => {
      persistConsent(state);
    },
    [persistConsent],
  );

  const resetConsent = useCallback(() => {
    deleteCookie(cookieName);
    setConsentState(getDefaultConsentState(consentMode));
    setHasConsented(false);
  }, [cookieName, consentMode]);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consentState,
      hasConsented,
      updateConsent,
      acceptAll,
      rejectAll,
      savePreferences,
      resetConsent,
    }),
    [
      consentState,
      hasConsented,
      updateConsent,
      acceptAll,
      rejectAll,
      savePreferences,
      resetConsent,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/**
 * Access the consent context. Must be used within a `<ConsentProvider>`.
 */
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a <ConsentProvider>");
  }
  return ctx;
}
