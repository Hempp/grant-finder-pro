// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ScoreRing } from "../ScoreRing";

/**
 * Helper: stub `matchMedia` so the reduced-motion probe doesn't crash
 * (jsdom ships no matchMedia). `reduce` controls what the probe returns.
 */
function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduce,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  );
}

describe("ScoreRing", () => {
  beforeEach(() => {
    // Default: no reduced motion. Individual tests override as needed.
    stubMatchMedia(false);
    // Drive rAF synchronously with an ever-advancing timestamp so the eased
    // animation reaches t=1 (FILL_DURATION elapsed) and the count-up lands on
    // its final value. The first frame seeds `start`; the next jumps well past
    // the 700ms duration so the loop terminates in two ticks.
    let frameTime = 0;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        frameTime += 5_000;
        cb(frameTime);
        return frameTime;
      })
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("clamps a score above 100 to 100", () => {
    const { container } = render(<ScoreRing score={120} />);
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("aria-valuenow")).toBe("100");
    expect(container.querySelector("span")?.textContent).toBe("100");
  });

  it("clamps a negative score to 0", () => {
    const { container } = render(<ScoreRing score={-5} />);
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("aria-valuenow")).toBe("0");
    expect(container.querySelector("span")?.textContent).toBe("0");
  });

  it("rounds a fractional score", () => {
    const { container } = render(<ScoreRing score={73.6} />);
    expect(
      container.querySelector('[role="meter"]')!.getAttribute("aria-valuenow")
    ).toBe("74");
  });

  it("selects the warn tier for a low score (< 60)", () => {
    const { container } = render(<ScoreRing score={42} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--warn)");
  });

  it("selects the accent tier for a mid score (60–89)", () => {
    const { container } = render(<ScoreRing score={75} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--accent)");
  });

  it("selects the success tier for a high score (>= 90)", () => {
    const { container } = render(<ScoreRing score={94} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--success)");
  });

  it("exposes role=meter with correct aria value bounds", () => {
    const { container } = render(<ScoreRing score={88} />);
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("role")).toBe("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("88");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
  });

  it("incorporates a custom label into the accessible name", () => {
    const { container } = render(
      <ScoreRing score={91} label="Draft strength" />
    );
    expect(
      container.querySelector('[role="meter"]')!.getAttribute("aria-label")
    ).toBe("Draft strength: 91 out of 100");
  });

  it("uses a default accessible name when no label is given", () => {
    const { container } = render(<ScoreRing score={64} />);
    expect(
      container.querySelector('[role="meter"]')!.getAttribute("aria-label")
    ).toBe("Predicted score: 64 out of 100");
  });

  it("renders the final numeral immediately under reduced motion", () => {
    stubMatchMedia(true);
    // rAF must NOT be needed for the final value when motion is reduced.
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => {
        throw new Error("rAF should not run under reduced motion");
      })
    );
    const { container } = render(<ScoreRing score={87} />);
    expect(container.querySelector("span")?.textContent).toBe("87");
    expect(
      container.querySelector('[role="meter"]')!.getAttribute("aria-valuenow")
    ).toBe("87");
  });

  it("renders a Geist Mono tabular numeral", () => {
    const { container } = render(<ScoreRing score={80} />);
    const numeral = container.querySelector("span")!;
    expect(numeral.className).toContain("font-mono");
    expect(numeral.className).toContain("tabular-nums");
  });

  it("renders the requested size", () => {
    const { container } = render(<ScoreRing score={50} size="lg" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("128");
  });
});
