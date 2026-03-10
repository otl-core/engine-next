import { describe, it, expect, vi } from "vitest";
import { CMSDataLayer } from "@otl-core/analytics";
import type { DataLayerEntry } from "@otl-core/analytics";

describe("CMSDataLayer", () => {
  function createEntry(
    event: DataLayerEntry["event"],
    extra?: Record<string, unknown>,
  ): DataLayerEntry {
    return {
      event,
      timestamp: Date.now(),
      ...extra,
    };
  }

  describe("push and subscribe", () => {
    it("should push an entry and notify subscribers", () => {
      const dl = new CMSDataLayer();
      const subscriber = vi.fn();

      dl.subscribe(subscriber);
      // Subscriber receives no entries yet (empty data layer)

      const entry = createEntry("page_view", { page_path: "/test" });
      dl.push(entry);

      expect(subscriber).toHaveBeenCalledWith(entry);
    });

    it("should store entries in the entries array", () => {
      const dl = new CMSDataLayer();
      const entry = createEntry("page_view");

      dl.push(entry);

      expect(dl.entries).toHaveLength(1);
      expect(dl.entries[0]).toBe(entry);
    });
  });

  describe("replay for late subscribers", () => {
    it("should replay existing entries to new subscribers", () => {
      const dl = new CMSDataLayer();
      const entry1 = createEntry("page_view");
      const entry2 = createEntry("scroll_depth", { percent: 50 });

      dl.push(entry1);
      dl.push(entry2);

      const lateSubscriber = vi.fn();
      dl.subscribe(lateSubscriber);

      // Should have been called twice during replay
      expect(lateSubscriber).toHaveBeenCalledTimes(2);
      expect(lateSubscriber).toHaveBeenNthCalledWith(1, entry1);
      expect(lateSubscriber).toHaveBeenNthCalledWith(2, entry2);
    });

    it("should still receive new events after replay", () => {
      const dl = new CMSDataLayer();
      const entry1 = createEntry("page_view");
      dl.push(entry1);

      const subscriber = vi.fn();
      dl.subscribe(subscriber);

      // 1 call from replay
      expect(subscriber).toHaveBeenCalledTimes(1);

      const entry2 = createEntry("outbound_click");
      dl.push(entry2);

      // 1 from replay + 1 from push
      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenLastCalledWith(entry2);
    });
  });

  describe("unsubscribe", () => {
    it("should stop receiving events after unsubscribe", () => {
      const dl = new CMSDataLayer();
      const subscriber = vi.fn();

      const unsubscribe = dl.subscribe(subscriber);

      dl.push(createEntry("page_view"));
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();

      dl.push(createEntry("scroll_depth"));
      // Should still be 1 -- no more calls after unsubscribe
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("multiple subscribers", () => {
    it("should notify all subscribers of the same event", () => {
      const dl = new CMSDataLayer();
      const sub1 = vi.fn();
      const sub2 = vi.fn();
      const sub3 = vi.fn();

      dl.subscribe(sub1);
      dl.subscribe(sub2);
      dl.subscribe(sub3);

      const entry = createEntry("purchase", { value: 100, currency: "EUR" });
      dl.push(entry);

      expect(sub1).toHaveBeenCalledWith(entry);
      expect(sub2).toHaveBeenCalledWith(entry);
      expect(sub3).toHaveBeenCalledWith(entry);
    });
  });

  describe("error handling", () => {
    it("should not throw when a subscriber throws during push", () => {
      const dl = new CMSDataLayer();
      const badSubscriber = vi.fn(() => {
        throw new Error("subscriber error");
      });
      const goodSubscriber = vi.fn();

      dl.subscribe(badSubscriber);
      dl.subscribe(goodSubscriber);

      const entry = createEntry("page_view");
      expect(() => dl.push(entry)).not.toThrow();

      // The good subscriber should still have been called
      expect(goodSubscriber).toHaveBeenCalledWith(entry);
    });

    it("should not throw when a subscriber throws during replay", () => {
      const dl = new CMSDataLayer();
      dl.push(createEntry("page_view"));

      const badSubscriber = vi.fn(() => {
        throw new Error("replay error");
      });

      expect(() => dl.subscribe(badSubscriber)).not.toThrow();
    });
  });
});
