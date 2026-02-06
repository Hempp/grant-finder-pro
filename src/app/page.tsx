import Link from "next/link";
import { ArrowRight, Upload, Search, FileText, CheckCircle, Sparkles, TrendingUp, Zap, Shield, Clock, Users } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

      {/* Header */}
      <header className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav className="flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">Grant Finder Pro</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {session?.user ? (
              <>
                <Link href="/pricing" className="hidden sm:block text-slate-300 hover:text-white transition">
                  Pricing
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98]"
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
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-sm font-medium">AI-Powered Grant Discovery</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Find & Apply for Grants
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-gradient bg-[length:200%_auto]">
            Automatically
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 px-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          Upload your pitch deck. We find matching grants, fill out applications with AI,
          and you just review and submit. It&apos;s that simple.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link
            href={session?.user ? "/dashboard" : "/signup"}
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
          >
            Start Finding Grants
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 text-slate-300 hover:text-white px-8 py-4 font-medium transition border border-slate-700 hover:border-slate-600 rounded-xl hover:bg-slate-800/50"
          >
            See How It Works
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-16 sm:mt-24 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          {[
            { value: "$50B+", label: "Grants Available" },
            { value: "10K+", label: "Opportunities" },
            { value: "85%", label: "Time Saved" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition stagger-1" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <div className="text-2xl sm:text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted By / Social Proof */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <p className="text-center text-slate-500 text-sm mb-6">Trusted by innovative teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50">
          {["TechStart", "GreenFund", "AI Labs", "BioVenture", "CleanTech"].map((company) => (
            <span key={company} className="text-slate-400 font-semibold text-lg">{company}</span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            From upload to funded in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: Upload, title: "Upload Your Docs", desc: "Pitch deck, financials, website URL - we extract everything we need.", num: 1 },
            { icon: Search, title: "Find Matching Grants", desc: "AI scans federal, state, and foundation grants matching your profile.", num: 2 },
            { icon: FileText, title: "AI Fills Applications", desc: "Our expert grant writer AI completes applications using your data.", num: 3 },
            { icon: CheckCircle, title: "Review & Submit", desc: "You control the final review. Verify everything, then hit submit.", num: 4 },
          ].map((step, i) => (
            <div
              key={step.title}
              className="group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-emerald-500/30 hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
                {step.num}
              </div>
              <step.icon className="h-10 w-10 text-emerald-400 mb-4 mt-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative bg-gradient-to-br from-emerald-500/10 via-slate-800/50 to-purple-500/10 border border-emerald-500/20 rounded-3xl p-8 sm:p-12 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4">
              Everything You Need to Win Grants
            </h2>
            <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12 text-lg">
              Powerful tools designed to maximize your funding success
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: Search, title: "Smart Discovery", desc: "Scrapes grants.gov, SBIR, foundations, and state programs to find your matches.", color: "emerald" },
                { icon: Sparkles, title: "AI Grant Writer", desc: "30+ years of grant expertise encoded. Writes compelling narratives that win.", color: "purple" },
                { icon: TrendingUp, title: "Track Everything", desc: "Monitor applications from draft to awarded. Never miss a deadline.", color: "blue" },
                { icon: Zap, title: "Auto-Apply", desc: "One click to start an application. AI pre-fills based on your profile.", color: "amber" },
                { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and never shared. SOC2 compliant infrastructure.", color: "cyan" },
                { icon: Users, title: "Team Collaboration", desc: "Invite team members, assign tasks, and track progress together.", color: "pink" },
              ].map((feature) => (
                <div key={feature.title} className="group text-center p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300">
                  <div className={`bg-${feature.color}-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          Loved by Grant Seekers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "We secured $500K in SBIR funding within 3 months. The AI-written narratives were impressive.", author: "Sarah Chen", role: "CEO, BioTech Innovations" },
            { quote: "Grant Finder Pro saved us 40+ hours per application. Game changer for our small team.", author: "Marcus Williams", role: "Founder, CleanEnergy Labs" },
            { quote: "The matching algorithm found opportunities we never knew existed. Highly recommend!", author: "Dr. Emily Park", role: "Research Director, AI Health" },
          ].map((testimonial) => (
            <div key={testimonial.author} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/80 transition">
              <p className="text-slate-300 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <p className="text-white font-semibold">{testimonial.author}</p>
                <p className="text-slate-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="relative bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-3xl p-8 sm:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Fund Your Vision?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Join thousands of organizations using AI to win grants faster.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session?.user ? "/dashboard" : "/signup"}
                className="group flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg w-full sm:w-auto justify-center"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2"
              >
                View Pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-6">
              <Clock className="h-4 w-4 inline mr-1" />
              14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-8 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-semibold text-white">Grant Finder Pro</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="#" className="hover:text-white transition">Privacy</Link>
            <Link href="#" className="hover:text-white transition">Terms</Link>
          </div>
          <p className="text-slate-500 text-sm">
            Fund your vision, change the world.
          </p>
        </div>
      </footer>
    </div>
  );
}
