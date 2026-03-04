/**
 * Consent Cookie Utility
 *
 * Shared utility (works on both client and server) for reading/writing
 * the consent cookie. Cookie format is a JSON object with `state` (category
 * booleans) and `consented_at` (timestamp in ms).
 */

import type { ConsentCategory } from "@otl-core/cms-types";

export const ALL_CONSENT_CATEGORIES: ConsentCategory[] = [
  "necessary",
  "analytics",
  "marketing",
  "preferences",
  "social",
];

export type ConsentState = Record<ConsentCategory, boolean>;

export interface ConsentCookieData {
  state: ConsentState;
  /** Unix timestamp in ms when consent was given. 0 = not yet consented. */
  consented_at: number;
}

/**
 * Returns the default consent state based on the consent mode.
 *
 * - `opt_in`: only `necessary` is true (GDPR-compliant default)
 * - `opt_out`: all categories are true
 */
export function getDefaultConsentState(
  mode: "opt_in" | "opt_out",
): ConsentState {
  if (mode === "opt_out") {
    return {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      social: true,
    };
  }

  return {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    social: false,
  };
}

/**
 * Parses the JSON cookie value into ConsentCookieData.
 *
 * Expected format: `{ state: {...}, consented_at: number }`
 *
 * Returns all-denied (except `necessary`) with `consented_at: 0`
 * if the cookie is missing, malformed, or cannot be parsed.
 */
export function parseConsentCookie(
  cookieValue: string | undefined,
): ConsentCookieData {
  const defaults = getDefaultConsentState("opt_in");

  if (!cookieValue) {
    return { state: defaults, consented_at: 0 };
  }

  try {
    const parsed: unknown = JSON.parse(cookieValue);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return { state: defaults, consented_at: 0 };
    }

    const record = parsed as Record<string, unknown>;

    if (
      typeof record.state !== "object" ||
      record.state === null ||
      Array.isArray(record.state)
    ) {
      return { state: defaults, consented_at: 0 };
    }

    const stateRecord = record.state as Record<string, unknown>;
    const state: ConsentState = { ...defaults };

    for (const category of ALL_CONSENT_CATEGORIES) {
      if (
        category in stateRecord &&
        typeof stateRecord[category] === "boolean"
      ) {
        state[category] =
          category === "necessary" ? true : (stateRecord[category] as boolean);
      }
    }

    return {
      state,
      consented_at:
        typeof record.consented_at === "number" ? record.consented_at : 0,
    };
  } catch {
    return { state: defaults, consented_at: 0 };
  }
}

/**
 * Serializes consent state to a JSON string for the cookie value.
 * Always writes in the new format with `state` and `consented_at`.
 */
export function serializeConsentCookie(state: ConsentState): string {
  const data: ConsentCookieData = {
    state,
    consented_at: Date.now(),
  };
  return JSON.stringify(data);
}
