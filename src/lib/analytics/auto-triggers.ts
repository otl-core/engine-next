/**
 * Auto-Event Trigger Manager
 *
 * Sets up automatic event detection on the client side based on
 * AutoEventSettings. Returns a cleanup function that tears down all
 * event listeners, observers, and timeouts.
 */

import type { AutoEventSettings } from "@otl-core/cms-types";
import type { CMSDataLayer } from "@otl-core/analytics";

/**
 * Initialise all enabled auto-triggers and return a cleanup function.
 */
export function setupAutoTriggers(
  settings: AutoEventSettings,
  dl: CMSDataLayer,
): () => void {
  const cleanups: Array<() => void> = [];

  if (settings.page_views) {
    cleanups.push(setupPageViewTracking(dl));
  }
  if (settings.outbound_links) {
    cleanups.push(setupOutboundLinkTracking(dl));
  }
  if (settings.file_downloads) {
    cleanups.push(setupFileDownloadTracking(dl, settings.file_extensions));
  }
  if (settings.scroll_depth) {
    cleanups.push(setupScrollDepthTracking(dl, settings.scroll_thresholds));
  }
  if (settings.time_on_page) {
    cleanups.push(setupTimeOnPageTracking(dl, settings.time_thresholds));
  }

  // form_submissions is handled via globalFormTracking flag in AnalyticsProvider,
  // which merges into per-form FormAnalyticsSettings in the FormBlock component.

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

function setupPageViewTracking(dl: CMSDataLayer): () => void {
  const pushPageView = () => {
    dl.push({
      event: "page_view",
      timestamp: Date.now(),
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      locale: document.documentElement.lang || "en",
    });
  };

  // Fire on initial load
  pushPageView();

  // SPA navigation: listen for popstate and title changes
  const onPopState = () => {
    pushPageView();
  };
  window.addEventListener("popstate", onPopState);

  // Use MutationObserver on <title> to detect Next.js client navigation
  let observer: MutationObserver | null = null;
  const titleEl = document.querySelector("title");
  if (titleEl) {
    let lastPath = window.location.pathname;
    observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        pushPageView();
      }
    });
    observer.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  return () => {
    window.removeEventListener("popstate", onPopState);
    if (observer) {
      observer.disconnect();
    }
  };
}

function setupOutboundLinkTracking(dl: CMSDataLayer): () => void {
  const handler = (e: Event) => {
    const target = (e.target as Element | null)?.closest("a[href]");
    if (!target) return;

    const anchor = target as HTMLAnchorElement;
    try {
      const url = new URL(anchor.href, window.location.origin);
      if (url.hostname !== window.location.hostname) {
        dl.push({
          event: "outbound_click",
          timestamp: Date.now(),
          url: anchor.href,
          link_text: anchor.textContent?.trim() ?? "",
        });
      }
    } catch {
      // Ignore invalid URLs
    }
  };

  document.addEventListener("click", handler, { passive: true });

  return () => {
    document.removeEventListener("click", handler);
  };
}

function setupFileDownloadTracking(
  dl: CMSDataLayer,
  extensions: string[],
): () => void {
  const extSet = new Set(extensions.map((e) => e.toLowerCase()));

  const handler = (e: Event) => {
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
        const fileName = pathname.split("/").pop() ?? "";
        dl.push({
          event: "file_download",
          timestamp: Date.now(),
          file_url: anchor.href,
          file_name: fileName,
          file_extension: ext,
        });
      }
    } catch {
      // Ignore invalid URLs
    }
  };

  document.addEventListener("click", handler, { passive: true });

  return () => {
    document.removeEventListener("click", handler);
  };
}

function setupScrollDepthTracking(
  dl: CMSDataLayer,
  thresholds: number[],
): () => void {
  const firedThresholds = new Set<number>();
  let lastPath = typeof window !== "undefined" ? window.location.pathname : "";

  const handler = () => {
    // Reset thresholds on navigation
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      firedThresholds.clear();
      lastPath = currentPath;
    }

    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const percent = (window.scrollY / scrollHeight) * 100;

    for (const threshold of thresholds) {
      if (percent >= threshold && !firedThresholds.has(threshold)) {
        firedThresholds.add(threshold);
        dl.push({
          event: "scroll_depth",
          timestamp: Date.now(),
          percent: threshold,
          page_path: window.location.pathname,
        });
      }
    }
  };

  window.addEventListener("scroll", handler, { passive: true });

  return () => {
    window.removeEventListener("scroll", handler);
  };
}

function setupTimeOnPageTracking(
  dl: CMSDataLayer,
  thresholds: number[],
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];

  for (const seconds of thresholds) {
    const timer = setTimeout(() => {
      dl.push({
        event: "content_view",
        timestamp: Date.now(),
        seconds,
        page_path: window.location.pathname,
      });
    }, seconds * 1000);
    timers.push(timer);
  }

  return () => {
    for (const timer of timers) {
      clearTimeout(timer);
    }
  };
}
