import { ScoreRing } from "@/components/ui/ScoreRing";

/**
 * Floating ScoreRing overlay anchored to the top-right of the hero
 * preview. The signature object of the product — animated arc fill +
 * count-up to 94 on viewport entry, then a single pulse at the
 * ≥90 high-score tier.
 */
export function FloatingScoreCard() {
  return (
    <div
      className="absolute z-10 top-0 right-0 translate-x-[14%] -translate-y-[28%] rotate-2
        drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]
        max-[480px]:hidden
        max-[768px]:rotate-0 max-[768px]:translate-x-[6%] max-[768px]:translate-y-[-12%]"
    >
      <ScoreRing
        score={94}
        size="md"
        label="Predicted score for top match"
      />
    </div>
  );
}
