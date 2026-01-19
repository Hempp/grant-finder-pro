import Link from "next/link";
import { ArrowRight, Upload, Search, FileText, CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">Grant Finder Pro</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="hidden sm:block text-slate-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white transition text-sm sm:text-base">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
          <span className="text-emerald-400 text-xs sm:text-sm font-medium">AI-Powered Grant Discovery</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Find & Apply for Grants
          <br />
          <span className="text-emerald-400">Automatically</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
          Upload your pitch deck. We find matching grants, fill out applications with AI,
          and you just review and submit. It&apos;s that simple.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href={session?.user ? "/dashboard" : "/signup"}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition shadow-lg shadow-emerald-500/25 w-full sm:w-auto justify-center"
          >
            Start Finding Grants
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 text-slate-300 hover:text-white px-6 py-3 sm:px-8 sm:py-4 font-medium transition"
          >
            See How It Works
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-12 sm:mt-20">
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-bold text-white">$50B+</div>
            <div className="text-slate-400 text-xs sm:text-base mt-1">Grants Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-bold text-white">10K+</div>
            <div className="text-slate-400 text-xs sm:text-base mt-1">Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-4xl font-bold text-white">85%</div>
            <div className="text-slate-400 text-xs sm:text-base mt-1">Time Saved</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-3 sm:mb-4">
          How It Works
        </h2>
        <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 sm:mb-16 text-sm sm:text-base">
          From upload to funded in four simple steps
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative">
            <div className="absolute -top-4 left-6 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <Upload className="h-10 w-10 text-emerald-400 mb-4 mt-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Upload Your Docs</h3>
            <p className="text-slate-400">
              Pitch deck, financials, website URL - we extract everything we need.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative">
            <div className="absolute -top-4 left-6 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <Search className="h-10 w-10 text-emerald-400 mb-4 mt-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Find Matching Grants</h3>
            <p className="text-slate-400">
              AI scans federal, state, and foundation grants matching your profile.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative">
            <div className="absolute -top-4 left-6 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <FileText className="h-10 w-10 text-emerald-400 mb-4 mt-4" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Fills Applications</h3>
            <p className="text-slate-400">
              Our expert grant writer AI completes applications using your data.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative">
            <div className="absolute -top-4 left-6 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <CheckCircle className="h-10 w-10 text-emerald-400 mb-4 mt-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Review & Submit</h3>
            <p className="text-slate-400">
              You control the final review. Verify everything, then hit submit.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">
            Everything You Need to Win Grants
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Discovery</h3>
              <p className="text-slate-400">
                Scrapes grants.gov, SBIR, foundations, and state programs to find your matches.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Grant Writer</h3>
              <p className="text-slate-400">
                30+ years of grant expertise encoded. Writes compelling narratives that win.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Everything</h3>
              <p className="text-slate-400">
                Monitor applications from draft to awarded. Never miss a deadline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
          Ready to Fund Your Vision?
        </h2>
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10">
          Join thousands of organizations using AI to win grants faster.
        </p>
        <Link
          href={session?.user ? "/dashboard" : "/signup"}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition shadow-lg shadow-emerald-500/25"
        >
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
            <span className="text-base sm:text-lg font-semibold text-white">Grant Finder Pro</span>
          </div>
          <p className="text-slate-500 text-sm sm:text-base">
            Fund your vision, change the world.
          </p>
        </div>
      </footer>
    </div>
  );
}
