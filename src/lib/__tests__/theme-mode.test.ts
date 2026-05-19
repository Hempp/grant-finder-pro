import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  resolveEffectiveMode,
} from "../theme-mode";

describe("theme-mode helper", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
  });

  it("returns 'auto' when nothing is stored", () => {
    expect(getStoredThemeMode()).toBe("auto");
  });

  it("returns the stored value when valid", () => {
    localStorage.setItem("theme-mode", "dark");
    expect(getStoredThemeMode()).toBe("dark");
  });

  it("returns 'auto' when stored value is invalid", () => {
    localStorage.setItem("theme-mode", "garbage");
    expect(getStoredThemeMode()).toBe("auto");
  });

  it("persists a valid mode and returns it", () => {
    setStoredThemeMode("light");
    expect(localStorage.getItem("theme-mode")).toBe("light");
    expect(getStoredThemeMode()).toBe("light");
  });

  it("removes the key when given 'auto'", () => {
    localStorage.setItem("theme-mode", "dark");
    setStoredThemeMode("auto");
    expect(localStorage.getItem("theme-mode")).toBeNull();
  });

  it("resolveEffectiveMode returns stored when stored is explicit", () => {
    expect(resolveEffectiveMode("light", true)).toBe("light");
    expect(resolveEffectiveMode("light", false)).toBe("light");
    expect(resolveEffectiveMode("dark", true)).toBe("dark");
    expect(resolveEffectiveMode("dark", false)).toBe("dark");
  });

  it("resolveEffectiveMode follows system when stored is 'auto'", () => {
    expect(resolveEffectiveMode("auto", true)).toBe("dark");
    expect(resolveEffectiveMode("auto", false)).toBe("light");
  });

  it("survives localStorage throwing (private browsing)", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    });
    expect(() => getStoredThemeMode()).not.toThrow();
    expect(getStoredThemeMode()).toBe("auto");
    expect(() => setStoredThemeMode("dark")).not.toThrow();
  });
});
