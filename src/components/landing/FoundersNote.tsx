import { SmallCapsEyebrow } from "./SmallCapsEyebrow";
import { DropCap } from "./DropCap";
import { PullQuote } from "./PullQuote";
import { SignatureBlock } from "./SignatureBlock";

export function FoundersNote() {
  return (
    <section
      id="founder"
      className="border-t border-b border-rule py-20 md:py-32"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-[60ch] mx-auto">
          <SmallCapsEyebrow className="mb-12">
            A note from the founder
          </SmallCapsEyebrow>

          <div className="text-[18px] leading-[1.7] text-ink">
            <DropCap>
              When I started coaching families at the Family Source Center,
              I kept seeing the same thing. A nonprofit director would walk
              in, eligible for a grant that could save their program, and
              walk out because the $7,000 consultant fee made even applying
              impossible.
            </DropCap>

            <p className="mt-6 indent-[1.5em]">
              I watched it for two years. The grants that mattered went to
              organizations that could afford to chase them. Not the ones
              that actually needed them.
            </p>

            <PullQuote>
              Grants don&apos;t go to the most deserving. They go to whoever
              can afford to apply.
            </PullQuote>

            <p className="mt-6 indent-[1.5em]">
              I tried to fix it the only way I knew. After-hours sessions in
              my office. Walking through eligibility line by line. Drafts
              written at the kitchen table. It worked. It didn&apos;t scale.
              One coach, one application at a time.
            </p>

            <p className="mt-6 indent-[1.5em]">
              GrantPilot is the tool I built to keep doing the work without
              being in the room. The hours I used to spend with one
              nonprofit, the software now spends with all of them.
            </p>

            <p className="mt-6 indent-[1.5em]">
              I built it so the platform only earns when you do. No upfront
              fee. No monthly retainer you can&apos;t afford. If the grant
              doesn&apos;t come through, neither does my paycheck.
            </p>
          </div>

          <SignatureBlock
            name="Coach Phillips"
            role="Founder · Family Source Center"
          />
        </div>
      </div>
    </section>
  );
}
