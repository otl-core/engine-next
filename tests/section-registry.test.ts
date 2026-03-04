/**
 * Registry Tests - Section Registry
 */

import { sectionRegistry } from "@/lib/registries/section-registry";
import { beforeEach, describe, expect, it } from "vitest";

describe("SectionRegistry", () => {
  const mockComponent = () => null;

  beforeEach(() => {
    // Note: In real tests, we'd need to clear the registry
    // For now, we test the API
  });

  it("should register a section component", () => {
    sectionRegistry.register("test-section", mockComponent);
    expect(sectionRegistry.has("test-section")).toBe(true);
  });

  it("should retrieve a registered component", () => {
    sectionRegistry.register("test-section-2", mockComponent);
    const component = sectionRegistry.get("test-section-2");
    expect(component).toBe(mockComponent);
  });

  it("should return undefined for unregistered component", () => {
    const component = sectionRegistry.get("non-existent");
    expect(component).toBeUndefined();
  });

  it("should check if component is registered", () => {
    sectionRegistry.register("test-section-3", mockComponent);
    expect(sectionRegistry.has("test-section-3")).toBe(true);
    expect(sectionRegistry.has("non-existent")).toBe(false);
  });

  it("should return all registered types", () => {
    const types = sectionRegistry.getAll();
    expect(Array.isArray(types)).toBe(true);
  });

  it("should return registry size", () => {
    const size = sectionRegistry.size();
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThanOrEqual(0);
  });
});
