import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Plans That Pay for Themselves",
  description:
    "GrantPilot pricing starts free. Smart Fill auto-generates 100/100 grant applications from $29/mo. Success fee model — we only earn when you win grants.",
  openGraph: {
    title: "GrantPilot Pricing — Plans That Pay for Themselves",
    description:
      "Free to start. AI fills grant applications to 100/100. Success fee model — 2-5% only when you win. Compare plans.",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
