// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReveal } from "../useReveal";

describe("useReveal", () => {
  let observerCallback: IntersectionObserverCallback;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      // Use a `function` (not arrow) so `new IntersectionObserver(...)` works.
      vi.fn(function (this: unknown, cb: IntersectionObserverCallback) {
        observerCallback = cb;
        return { observe, disconnect, unobserve: vi.fn(), takeRecords: () => [], root: null, rootMargin: "", thresholds: [] };
      })
    );
    // jsdom doesn't ship matchMedia; default to "no reduced motion" so the
    // hook's prefers-reduced-motion probe doesn't crash. Individual tests
    // can override (see "respects prefers-reduced-motion" below).
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    );
  });

  // Helper: mounts useReveal and synchronously attaches the ref to a DOM node
  // so the hook's IntersectionObserver branch runs. `renderHook` invokes the
  // hook body once before effects fire — we hijack that pass to attach the ref.
  function mount() {
    let attached = false;
    const { result } = renderHook(() => {
      const r = useReveal();
      if (!attached) {
        r.ref(document.createElement("div"));
        attached = true;
      }
      return r;
    });
    return result;
  }

  it("starts hidden", () => {
    const result = mount();
    expect(result.current.visible).toBe(false);
  });

  it("flips to visible when observer fires with intersecting entry", () => {
    const result = mount();
    // Simulate ref attachment + intersection
    const fakeEntry = { isIntersecting: true } as IntersectionObserverEntry;
    act(() => {
      observerCallback([fakeEntry], {} as IntersectionObserver);
    });
    expect(result.current.visible).toBe(true);
  });

  it("respects prefers-reduced-motion by starting visible", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(true);
  });
});
