"use client";

import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  threshold?: number;
  once?: boolean;
}

export interface UseRevealResult {
  ref: React.RefCallback<HTMLElement>;
  visible: boolean;
}

/**
 * Reveal hook backed by IntersectionObserver. Honors prefers-reduced-motion
 * by short-circuiting to "visible immediately" so motion-sensitive readers
 * never see content animate in.
 */
export function useReveal(options: UseRevealOptions = {}): UseRevealResult {
  const { threshold = 0.2, once = true } = options;
  const [visible, setVisible] = useState(false);
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reduce = typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    if (reduce) {
      setVisible(true);
      return;
    }
    const node = elRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  const ref: React.RefCallback<HTMLElement> = (node) => {
    elRef.current = node;
  };

  return { ref, visible };
}
