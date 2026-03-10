"use client";

import { blockRegistry } from "@/lib/registries/block-registry";
import { useAnalytics } from "@otl-core/analytics";
import { BlockRenderer } from "@otl-core/block-registry";
import type {
  FormAnalyticsCallback,
  FormAnalyticsSettings,
  FormBlockData,
  FormDocument,
  StandardEventName,
} from "@otl-core/cms-types";
import { FormProvider, useForm } from "@otl-core/forms";
import { useCallback, useMemo } from "react";

interface FormBlockProps {
  config: {
    formId: string;
    variantId?: string;
  };
  data?: FormBlockData;
  siteId?: string;
}

export function FormBlock({ config, data, siteId }: FormBlockProps) {
  // If no data provided, show error (this means backend didn't resolve the block properly)
  if (!data) return null;

  const { definition, document } = data;

  // Validate we have the necessary data
  if (!definition || !document) {
    return (
      <div className="p-4 border-2 border-destructive/50 bg-destructive/10 rounded-lg">
        <p className="text-sm text-destructive font-semibold">
          Form Data Invalid
        </p>
        <p className="text-xs text-destructive/80 mt-1">
          Form definition or document is missing.
        </p>
      </div>
    );
  }

  // Check if form is active
  if (definition.status !== "active") {
    return (
      <div className="p-4 border border-border bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          This form is currently inactive.
        </p>
      </div>
    );
  }

  // Render the form using FormProvider and current page blocks
  return (
    <FormBlockInner
      definition={definition}
      document={document}
      siteId={siteId || definition.site_id}
      formVariantId={config?.variantId}
    />
  );
}

/**
 * Inner component that has access to AnalyticsContext via useAnalytics.
 * Separated so hooks are always called.
 */
function FormBlockInner({
  definition,
  document,
  siteId,
  formVariantId,
}: {
  definition: FormBlockData["definition"];
  document: FormDocument;
  siteId: string;
  formVariantId?: string;
}) {
  const { trackEvent, abnVariant, globalFormTracking } = useAnalytics();

  // Merge global auto_events.form_submissions toggle with per-form settings.
  // When globalFormTracking is true, form_start/submit/error are forced on.
  const effectiveAnalyticsSettings = useMemo<FormAnalyticsSettings>(() => {
    const formAnalytics = definition.settings?.analytics;
    return {
      track_form_start:
        globalFormTracking || (formAnalytics?.track_form_start ?? false),
      track_form_submit:
        globalFormTracking || (formAnalytics?.track_form_submit ?? false),
      track_form_error:
        globalFormTracking || (formAnalytics?.track_form_error ?? false),
      track_page_navigation: formAnalytics?.track_page_navigation ?? false,
      submit_event_name: formAnalytics?.submit_event_name,
      target_providers: formAnalytics?.target_providers,
    };
  }, [globalFormTracking, definition.settings?.analytics]);

  const handleAnalyticsEvent: FormAnalyticsCallback = useCallback(
    (event, data) => {
      const eventName =
        event === "form_submit" && data.custom_event_name
          ? data.custom_event_name
          : event;

      trackEvent(eventName as StandardEventName, {
        form_id: data.form_id,
        form_name: data.form_name,
        ...(data.page_id ? { page_id: data.page_id } : {}),
        ...(data.page_index !== undefined
          ? { page_index: data.page_index }
          : {}),
        ...(data.total_pages ? { total_pages: data.total_pages } : {}),
        ...(data.error_count ? { error_count: data.error_count } : {}),
        ...(data.error_fields
          ? { error_fields: data.error_fields.join(",") }
          : {}),
        ...(data.target_providers && data.target_providers !== "all"
          ? { _target_providers: data.target_providers }
          : {}),
        // Pass A/B environment variant so form submission can reference it
        ...(abnVariant ? { environment_variant_id: abnVariant.variantId } : {}),
      });
    },
    [trackEvent, abnVariant],
  );

  // Read locale from the html lang attribute set in the root layout
  const documentLocale =
    typeof window !== "undefined"
      ? window.document.documentElement.lang || "en"
      : "en";

  return (
    <div className="form-block-container">
      <FormProvider
        formId={definition.id}
        document={document}
        settings={definition.settings || {}}
        analyticsSettings={effectiveAnalyticsSettings}
        onAnalyticsEvent={handleAnalyticsEvent}
        formName={definition.title}
        environmentVariantId={abnVariant?.variantId}
        formVariantId={formVariantId}
        locale={documentLocale}
      >
        <FormRenderer document={document} siteId={siteId} />
      </FormProvider>
    </div>
  );
}

/**
 * FormRenderer - Renders the form pages and blocks
 * This is extracted to work within FormProvider context
 */
function FormRenderer({
  document,
  siteId,
}: {
  document: FormDocument;
  siteId: string;
}) {
  const { settings, currentPage } = useForm();

  // Filter pages for progress indicator (exclude pages with exclude_from_progress)
  const progressPages = document.pages.filter(
    (page) => !page.exclude_from_progress,
  );
  const currentProgressIndex = progressPages.findIndex(
    (page) => page.id === currentPage?.id,
  );

  if (!currentPage) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No form pages configured.
      </div>
    );
  }

  const progressIndicator = settings.progress_indicator || "none";

  return (
    <div className="form-block-content space-y-4">
      {progressPages.length > 1 && progressIndicator !== "none" && (
        <div className="mb-8 flex justify-center">
          {progressIndicator === "bar" && (
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentProgressIndex + 1) / progressPages.length) * 100}%`,
                }}
              />
            </div>
          )}
          {progressIndicator === "dots" && (
            <div
              className="flex items-center justify-center"
              style={{ gap: "1rem" }}
            >
              {progressPages.map((page, index: number) => {
                let dotColor = "bg-muted";
                if (index === currentProgressIndex) {
                  dotColor = "bg-primary";
                } else if (index < currentProgressIndex) {
                  dotColor = "bg-primary/50";
                }
                return (
                  <div
                    key={page.id}
                    className={`w-3 h-3 rounded-full transition-colors ${dotColor}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {currentPage.blocks?.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            blockRegistry={blockRegistry}
            siteId={siteId}
          />
        ))}
      </form>
    </div>
  );
}
