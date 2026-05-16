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
              the same thing kept happening. A nonprofit director would walk
              in, eligible for a grant that could save their program, and
              walk out because the $7,000 consultant fee made it impossible
              to even apply.
            </DropCap>

            <p className="mt-6 indent-[1.5em]">
              I watched it for two years. The grants that mattered most went
              to the organizations that could afford to chase them, not the
              ones that needed them most.
            </p>

            <PullQuote>
              Grants don&apos;t go to the most deserving. They go to whoever
              can afford to apply.
            </PullQuote>

            <p className="mt-6 indent-[1.5em]">
              I tried to fix it the only way I knew — sitting with clients
              after hours, walking through eligibility, drafting their first
              draft. It worked, and it didn&apos;t scale. One coach can do
              one application at a time.
            </p>

            <p className="mt-6 indent-[1.5em]">
              GrantPilot is the tool I built to keep doing that work without
              being in the room. It finds the grants you qualify for, drafts
              each section against the funder&apos;s rubric, and shows you a
              predicted score before you submit.
            </p>

            <p className="mt-6 indent-[1.5em]">
              I built it so the platform only earns when you do. No upfront
              fee, no monthly retainer you can&apos;t afford. If you
              don&apos;t win, we don&apos;t either.
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
