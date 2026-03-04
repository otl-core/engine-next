import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CMSDataLayer } from "@/lib/analytics/data-layer";
import { setupAutoTriggers } from "@/lib/analytics/auto-triggers";
import type { AutoEventSettings } from "@otl-core/cms-types";

function createSettings(
  overrides: Partial<AutoEventSettings> = {},
): AutoEventSettings {
  return {
    page_views: false,
    outbound_links: false,
    file_downloads: false,
    file_extensions: ["pdf", "zip", "docx", "xlsx", "pptx", "csv"],
    scroll_depth: false,
    scroll_thresholds: [25, 50, 75, 100],
    form_submissions: false,
    time_on_page: false,
    time_thresholds: [30, 60, 180],
    ...overrides,
  };
}

beforeEach(() => {
  // Reset document body
  document.body.innerHTML = "";
  Object.defineProperty(document, "title", {
    value: "Test Page",
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("setupAutoTriggers", () => {
  describe("outbound link detection", () => {
    it("should push outbound_click for external links", () => {
      const dl = new CMSDataLayer();

      // Mock hostname
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          hostname: "example.com",
          href: "https://example.com",
          origin: "https://example.com",
          pathname: "/",
        },
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({ outbound_links: true }),
        dl,
      );

      // Create an external link and click it
      const link = document.createElement("a");
      link.href = "https://external-site.com/page";
      link.textContent = "External Link";
      document.body.appendChild(link);

      link.click();

      const outboundEvents = dl.entries.filter(
        (e) => e.event === "outbound_click",
      );
      expect(outboundEvents).toHaveLength(1);
      expect(outboundEvents[0].url).toBe("https://external-site.com/page");
      expect(outboundEvents[0].link_text).toBe("External Link");

      cleanup();
    });

    it("should not push outbound_click for internal links", () => {
      const dl = new CMSDataLayer();

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          hostname: "example.com",
          href: "https://example.com",
          origin: "https://example.com",
          pathname: "/",
        },
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({ outbound_links: true }),
        dl,
      );

      const link = document.createElement("a");
      link.href = "https://example.com/about";
      link.textContent = "About Us";
      document.body.appendChild(link);

      link.click();

      const outboundEvents = dl.entries.filter(
        (e) => e.event === "outbound_click",
      );
      expect(outboundEvents).toHaveLength(0);

      cleanup();
    });
  });

  describe("file download detection", () => {
    it("should push file_download for configured extensions", () => {
      const dl = new CMSDataLayer();

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          hostname: "example.com",
          href: "https://example.com",
          origin: "https://example.com",
          pathname: "/",
        },
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({
          file_downloads: true,
          file_extensions: ["pdf", "zip"],
        }),
        dl,
      );

      const link = document.createElement("a");
      link.href = "https://example.com/files/report.pdf";
      link.textContent = "Download Report";
      document.body.appendChild(link);

      link.click();

      const downloadEvents = dl.entries.filter(
        (e) => e.event === "file_download",
      );
      expect(downloadEvents).toHaveLength(1);
      expect(downloadEvents[0].file_extension).toBe("pdf");
      expect(downloadEvents[0].file_name).toBe("report.pdf");

      cleanup();
    });

    it("should not push file_download for non-configured extensions", () => {
      const dl = new CMSDataLayer();

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          hostname: "example.com",
          href: "https://example.com",
          origin: "https://example.com",
          pathname: "/",
        },
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({
          file_downloads: true,
          file_extensions: ["pdf", "zip"],
        }),
        dl,
      );

      const link = document.createElement("a");
      link.href = "https://example.com/files/image.jpg";
      document.body.appendChild(link);

      link.click();

      const downloadEvents = dl.entries.filter(
        (e) => e.event === "file_download",
      );
      expect(downloadEvents).toHaveLength(0);

      cleanup();
    });
  });

  describe("scroll depth tracking", () => {
    it("should fire at correct thresholds", () => {
      const dl = new CMSDataLayer();

      // Mock scroll height and position
      Object.defineProperty(document.body, "scrollHeight", {
        value: 2000,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 1000,
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({
          scroll_depth: true,
          scroll_thresholds: [25, 50, 75, 100],
        }),
        dl,
      );

      // Simulate scroll to 25%
      Object.defineProperty(window, "scrollY", {
        value: 250,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));

      let scrollEvents = dl.entries.filter((e) => e.event === "scroll_depth");
      expect(scrollEvents).toHaveLength(1);
      expect(scrollEvents[0].percent).toBe(25);

      // Simulate scroll to 50%
      Object.defineProperty(window, "scrollY", {
        value: 500,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));

      scrollEvents = dl.entries.filter((e) => e.event === "scroll_depth");
      expect(scrollEvents).toHaveLength(2);
      expect(scrollEvents[1].percent).toBe(50);

      cleanup();
    });

    it("should not fire the same threshold twice", () => {
      const dl = new CMSDataLayer();

      Object.defineProperty(document.body, "scrollHeight", {
        value: 2000,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 1000,
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({
          scroll_depth: true,
          scroll_thresholds: [50],
        }),
        dl,
      );

      // Scroll past 50% twice
      Object.defineProperty(window, "scrollY", {
        value: 600,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));

      const scrollEvents = dl.entries.filter((e) => e.event === "scroll_depth");
      expect(scrollEvents).toHaveLength(1);

      cleanup();
    });
  });

  describe("time on page tracking", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should fire at configured seconds", () => {
      const dl = new CMSDataLayer();

      const cleanup = setupAutoTriggers(
        createSettings({
          time_on_page: true,
          time_thresholds: [5, 10],
        }),
        dl,
      );

      // Advance to 5 seconds
      vi.advanceTimersByTime(5000);
      let timeEvents = dl.entries.filter((e) => e.event === "content_view");
      expect(timeEvents).toHaveLength(1);
      expect(timeEvents[0].seconds).toBe(5);

      // Advance to 10 seconds
      vi.advanceTimersByTime(5000);
      timeEvents = dl.entries.filter((e) => e.event === "content_view");
      expect(timeEvents).toHaveLength(2);
      expect(timeEvents[1].seconds).toBe(10);

      cleanup();
    });
  });

  describe("cleanup", () => {
    it("should return a cleanup function", () => {
      const dl = new CMSDataLayer();
      const cleanup = setupAutoTriggers(createSettings(), dl);
      expect(typeof cleanup).toBe("function");
      cleanup();
    });

    it("should remove event listeners on cleanup", () => {
      const dl = new CMSDataLayer();

      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          hostname: "example.com",
          href: "https://example.com",
          origin: "https://example.com",
          pathname: "/",
        },
        writable: true,
        configurable: true,
      });

      const cleanup = setupAutoTriggers(
        createSettings({ outbound_links: true }),
        dl,
      );

      cleanup();

      // Click should not be tracked after cleanup
      const link = document.createElement("a");
      link.href = "https://external.com";
      document.body.appendChild(link);
      link.click();

      const events = dl.entries.filter((e) => e.event === "outbound_click");
      expect(events).toHaveLength(0);
    });
  });
});
