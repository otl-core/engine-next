/**
 * Registry Tests - Block Registry
 */

import { blockRegistry } from "@/lib/registries/block-registry";
import { beforeEach, describe, expect, it } from "vitest";

describe("BlockRegistry", () => {
  const mockComponent = () => null;

  beforeEach(() => {
    // Note: In real tests, we'd need to clear the registry
    // For now, we test the API
  });

  it("should register a block component", () => {
    blockRegistry.register("test-block", mockComponent);
    expect(blockRegistry.has("test-block")).toBe(true);
  });

  it("should retrieve a registered component", () => {
    blockRegistry.register("test-block-2", mockComponent);
    const component = blockRegistry.get("test-block-2");
    expect(component).toBe(mockComponent);
  });

  it("should return undefined for unregistered component", () => {
    const component = blockRegistry.get("non-existent");
    expect(component).toBeUndefined();
  });

  it("should check if component is registered", () => {
    blockRegistry.register("test-block-3", mockComponent);
    expect(blockRegistry.has("test-block-3")).toBe(true);
    expect(blockRegistry.has("non-existent")).toBe(false);
  });

  it("should return all registered types", () => {
    const types = blockRegistry.getAll();
    expect(Array.isArray(types)).toBe(true);
  });

  it("should return registry size", () => {
    const size = blockRegistry.size();
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThanOrEqual(0);
  });
});
