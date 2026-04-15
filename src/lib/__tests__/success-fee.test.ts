import { describe, it, expect } from "vitest";
import { calculateSuccessFee } from "../stripe";

describe("calculateSuccessFee", () => {
  it("returns zero with applies=false on free plan regardless of amount", () => {
    const r = calculateSuccessFee("free", 100_000);
    expect(r).toEqual({ feePercent: 0, feeAmount: 0, applies: false });
  });

  it("respects growth plan threshold — no fee below $10K", () => {
    const below = calculateSuccessFee("growth", 9_999);
    expect(below.applies).toBe(false);
    expect(below.feeAmount).toBe(0);
  });

  it("charges growth plan 5% at threshold", () => {
    const at = calculateSuccessFee("growth", 10_000);
    expect(at.applies).toBe(true);
    expect(at.feePercent).toBe(5);
    expect(at.feeAmount).toBe(500);
  });

  it("charges pro plan 3% with no threshold", () => {
    const r = calculateSuccessFee("pro", 50_000);
    expect(r.applies).toBe(true);
    expect(r.feePercent).toBe(3);
    expect(r.feeAmount).toBe(1500);
  });

  it("charges organization plan 2%", () => {
    const r = calculateSuccessFee("organization", 250_000);
    expect(r.applies).toBe(true);
    expect(r.feePercent).toBe(2);
    expect(r.feeAmount).toBe(5000);
  });

  it("rounds fee to nearest dollar", () => {
    // Pro: 3% of 333 = 9.99 → rounds to 10
    const r = calculateSuccessFee("pro", 333);
    expect(r.feeAmount).toBe(10);
  });

  it("handles zero award gracefully", () => {
    const r = calculateSuccessFee("pro", 0);
    expect(r.applies).toBe(false);
    expect(r.feeAmount).toBe(0);
  });

  it("scales to large awards without overflow", () => {
    // Organization plan at $10M award = $200K fee
    const r = calculateSuccessFee("organization", 10_000_000);
    expect(r.feeAmount).toBe(200_000);
  });
});
