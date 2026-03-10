"use client";

/**
 * Consent React Context
 *
 * Client-side context that manages the user's cookie consent state.
 * Reads/writes the consent cookie and optionally fires Google Consent
 * Mode updates when preferences change.
 *
 * Exposes `window.__otlConsent` with `.reset()`, `.accept()`, `.reject()`,
 * `.state()` for programmatic control and debugging.
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
  serializeConsentCookie,
} from "./consent-cookie";
import { fireGoogleConsentUpdate } from "./google-consent-mode";

export interface ConsentContextValue {
  consentState: ConsentState;
  hasConsented: boolean;
  updateConsent(category: ConsentCategory, granted: boolean): void;
  acceptAll(): void;
  rejectAll(): void;
  savePreferences(state: ConsentState): void;
  resetConsent(): void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

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
  initialConsent: ConsentCookieData | null;
  children: React.ReactNode;
}

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
  interface Window {
    __otlConsent?: {
      reset(): void;
      accept(): void;
      reject(): void;
      state(): void;
    };
  }
}

export function ConsentProvider({
  config,
  initialConsent,
  children,
}: ConsentProviderProps) {
  const cookieName = config?.cookie_name ?? "otl_consent";
  const consentMode = config?.consent_mode ?? "opt_in";
  const lifetimeSeconds = (config?.cookie_lifetime_days ?? 365) * 86400;
  const googleConsentEnabled = config?.google_consent_mode_enabled ?? false;
  const respectDnt = config?.respect_dnt ?? false;
  const respectGpc = config?.respect_gpc ?? false;
  const reConsentDays = config?.re_consent_days ?? 0;

  const initialExpired =
    initialConsent &&
    reConsentDays > 0 &&
    initialConsent.consented_at > 0 &&
    Date.now() > initialConsent.consented_at + reConsentDays * 86400000;

  const [consentState, setConsentState] = useState<ConsentState>(() =>
    initialConsent && !initialExpired
      ? initialConsent.state
      : getDefaultConsentState(consentMode),
  );
  const [hasConsented, setHasConsented] = useState(
    !!initialConsent && !initialExpired,
  );

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (initialExpired) {
      deleteCookie(cookieName);
    }

    if (hasConsented) return;

    if (respectDnt && navigator.doNotTrack === "1") {
      const dntState = getDefaultConsentState("opt_in");
      setCookie(cookieName, serializeConsentCookie(dntState), lifetimeSeconds);
      if (googleConsentEnabled) fireGoogleConsentUpdate(dntState);
      setConsentState(dntState);
      setHasConsented(true);
      return;
    }

    if (respectGpc && navigator.globalPrivacyControl === true) {
      const gpcState = getDefaultConsentState("opt_in");
      setCookie(cookieName, serializeConsentCookie(gpcState), lifetimeSeconds);
      if (googleConsentEnabled) fireGoogleConsentUpdate(gpcState);
      setConsentState(gpcState);
      setHasConsented(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time mount init
  }, []);

  const persistConsent = useCallback(
    (state: ConsentState) => {
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
      if (category === "necessary") return;
      persistConsent({ ...consentState, [category]: granted });
    },
    [consentState, persistConsent],
  );

  const acceptAll = useCallback(() => {
    persistConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      social: true,
    });
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__otlConsent = {
      reset: resetConsent,
      accept: acceptAll,
      reject: rejectAll,
      state: () => consentState,
    };
    return () => {
      delete window.__otlConsent;
    };
  }, [
    resetConsent,
    acceptAll,
    rejectAll,
    hasConsented,
    consentState,
    cookieName,
  ]);

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

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a <ConsentProvider>");
  }
  return ctx;
}
