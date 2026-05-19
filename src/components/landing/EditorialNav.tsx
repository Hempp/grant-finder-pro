import Link from "next/link";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

interface NavSubscriptionState {
  loggedIn: boolean;
  destinationHref: string;
  trialDaysLeft?: number;
  pastDue?: boolean;
}

export function EditorialNav({ state }: { state: NavSubscriptionState }) {
  return (
    <nav className="border-b border-rule">
      <div className="container mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="font-display text-xl">GrantPilot</span>
        </Link>
        <div className="flex items-center gap-6">
          {state.pastDue && (
            <SmallCapsEyebrow className="text-accent">
              <Link
                href="/dashboard/billing"
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Payment needed
              </Link>
            </SmallCapsEyebrow>
          )}
          {state.trialDaysLeft !== undefined && !state.pastDue && (
            <SmallCapsEyebrow>
              Trial · {state.trialDaysLeft} days left
            </SmallCapsEyebrow>
          )}
          {state.loggedIn ? (
            <Link
              href={state.destinationHref}
              className="text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-ink-2 hover:text-ink transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
