import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grantpilot.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GrantPilot — AI-Powered Grant Intelligence Platform",
    template: "%s | GrantPilot",
  },
  description:
    "Find grants you'll win. AI reads applications, drafts proposals from your data, and optimizes every section to score 100/100 on the rubric.",
  keywords: [
    "grant writing",
    "grant application",
    "AI grant writer",
    "SBIR grants",
    "federal grants",
    "grant matching",
    "nonprofit grants",
    "grant management",
    "small business grants",
    "grant proposal software",
  ],
  authors: [{ name: "GrantPilot" }],
  creator: "GrantPilot",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "GrantPilot",
    title: "GrantPilot — AI-Powered Grant Intelligence Platform",
    description:
      "Find grants you'll win. AI fills your application to 100/100, optimized for each funder's scoring criteria. 3% success fee — we only earn when you win.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrantPilot — AI-Powered Grant Intelligence",
    description:
      "AI fills grant applications to 100/100. Upload your docs, enter your URL, click Apply. We only charge when you win.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip Navigation Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
