"use client";

/**
 * Script Loader Component
 *
 * Renders managed scripts based on consent state, page context, and locale.
 * Uses Next.js `<Script>` for proper loading strategy support.
 */

import Script from "next/script";
import type {
  CustomManagedScript,
  ManagedScript,
  ProviderManagedScript,
  ScriptConfig,
  ScriptContext,
  ScriptLoadingStrategy,
} from "@otl-core/cms-types";
import { renderProviderScript } from "@otl-core/script-utils";
import type { ScriptRenderOutput } from "@otl-core/script-utils";
import { useConsent } from "@/lib/consent";

interface ScriptLoaderProps {
  config: ScriptConfig | undefined;
  pageContext: {
    contentType: ScriptContext;
    locale: string;
  };
}

/**
 * Map our loading strategy values to Next.js Script `strategy` prop values.
 * The `"worker"` strategy maps to `"worker"` (Partytown off-main-thread).
 */
function toNextStrategy(
  strategy: ScriptLoadingStrategy,
): "beforeInteractive" | "afterInteractive" | "lazyOnload" | "worker" {
  return strategy;
}

export function ScriptLoader({ config, pageContext }: ScriptLoaderProps) {
  const { consentState } = useConsent();

  if (!config || !config.scripts || config.scripts.length === 0) {
    return null;
  }

  // Filter scripts by enabled, context, and locale
  const filtered = config.scripts.filter((script) => {
    if (!script.enabled) return false;

    // Context filter: must include the current content type or "all"
    if (
      !script.contexts.includes("all") &&
      !script.contexts.includes(pageContext.contentType)
    ) {
      return false;
    }

    // Locale filter: if specified, must include the current locale
    if (
      script.locale_filter &&
      script.locale_filter.length > 0 &&
      !script.locale_filter.includes(pageContext.locale)
    ) {
      return false;
    }

    return true;
  });

  // Sort by priority (ascending -- lower = first)
  const sorted = [...filtered].sort((a, b) => a.priority - b.priority);

  // Filter by consent
  const consented = sorted.filter((script) => {
    if (script.consent_category === "necessary") return true;
    return consentState[script.consent_category] === true;
  });

  return (
    <>
      {consented.map((script) => (
        <ScriptEntry key={script.id} script={script} />
      ))}
    </>
  );
}

function ScriptEntry({ script }: { script: ManagedScript }) {
  if (script.type === "provider") {
    return <ProviderScriptEntry script={script} />;
  }
  return <CustomScriptEntry script={script} />;
}

function ProviderScriptEntry({ script }: { script: ProviderManagedScript }) {
  let output: ScriptRenderOutput;
  try {
    output = renderProviderScript(script.provider, script.provider_config);
  } catch {
    return null;
  }

  const strategy = toNextStrategy(script.loading_strategy);
  const extraAttrs = script.attributes ?? {};

  return (
    <>
      {output.src && (
        <Script
          id={`${script.id}-src`}
          src={output.src}
          strategy={strategy}
          {...extraAttrs}
        />
      )}

      {output.inline && (
        <Script
          id={`${script.id}-inline`}
          strategy={strategy}
          dangerouslySetInnerHTML={{ __html: output.inline }}
        />
      )}

      {output.noscript && (
        <noscript dangerouslySetInnerHTML={{ __html: output.noscript }} />
      )}

      {output.secondary?.inline && (
        <Script
          id={`${script.id}-secondary`}
          strategy={strategy}
          dangerouslySetInnerHTML={{ __html: output.secondary.inline }}
        />
      )}
      {output.secondary?.noscript && (
        <noscript
          dangerouslySetInnerHTML={{ __html: output.secondary.noscript }}
        />
      )}
    </>
  );
}

function CustomScriptEntry({ script }: { script: CustomManagedScript }) {
  const strategy = toNextStrategy(script.loading_strategy);
  const extraAttrs = script.attributes ?? {};
  const cfg = script.custom_config;

  if (script.custom_type === "script_tag" && cfg.src) {
    const scriptProps: Record<string, string | boolean> = { ...extraAttrs };
    if (cfg.async) scriptProps["async"] = true;
    if (cfg.defer) scriptProps["defer"] = true;
    if (cfg.crossorigin) scriptProps["crossOrigin"] = cfg.crossorigin;
    if (cfg.referrerpolicy) scriptProps["referrerPolicy"] = cfg.referrerpolicy;
    if (cfg.integrity) scriptProps["integrity"] = cfg.integrity;

    return (
      <Script
        id={script.id}
        src={cfg.src}
        strategy={strategy}
        {...scriptProps}
      />
    );
  }

  if (script.custom_type === "inline_js" && cfg.code) {
    return (
      <Script
        id={script.id}
        strategy={strategy}
        dangerouslySetInnerHTML={{ __html: cfg.code }}
        {...extraAttrs}
      />
    );
  }

  return null;
}
