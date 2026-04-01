import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, BookOpen, FileText, DollarSign, Users, Target, AlertTriangle, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Grant Writing Resources & Guides",
  description: "Free grant writing guides, glossary, and resources. Learn how to write winning grant proposals for federal, state, and foundation funding.",
  keywords: ["grant writing tips", "grant proposal guide", "SBIR application", "federal grant help", "grant glossary"],
  alternates: { canonical: "/resources" },
};

const guides = [
  {
    icon: BookOpen,
    title: "How to Write a Winning Grant Proposal",
    desc: "Master the fundamentals: needs statements, objectives, methodology, evaluation plans, and budget narratives that score high on every rubric.",
  },
  {
    icon: FileText,
    title: "Understanding Federal Grant Requirements",
    desc: "Navigate SAM.gov registration, UEI numbers, CFDA codes, and compliance requirements before you start your first federal application.",
  },
  {
    icon: Target,
    title: "SBIR/STTR Application Guide",
    desc: "Phase I and Phase II strategies for small business innovation research grants across all 11 participating federal agencies.",
  },
  {
    icon: Users,
    title: "Building a Strong Organization Profile",
    desc: "How to present your team, track record, and capabilities to maximize match scores and reviewer confidence.",
  },
  {
    icon: DollarSign,
    title: "Grant Budget Preparation Tips",
    desc: "Direct vs. indirect costs, cost sharing, matching funds, and how to build budgets that funders approve without questions.",
  },
  {
    icon: AlertTriangle,
    title: "Common Grant Application Mistakes",
    desc: "The top 10 errors that get applications rejected — and how to avoid every single one of them.",
  },
];

const glossary = [
  { term: "NOFO", def: "Notice of Funding Opportunity — the official announcement that a grant is available for applications." },
  { term: "RFP", def: "Request for Proposal — a document from a funder soliciting proposals for a specific project or program." },
  { term: "CFDA", def: "Catalog of Federal Domestic Assistance — a unique number assigned to each federal assistance program (now called Assistance Listings)." },
  { term: "SAM.gov", def: "System for Award Management — the federal portal where organizations must register before receiving federal grants." },
  { term: "UEI", def: "Unique Entity Identifier — a 12-character alphanumeric ID assigned to entities registered in SAM.gov (replaced DUNS)." },
  { term: "Cost Sharing", def: "The portion of project costs not covered by the grant — your organization's financial contribution to the project." },
  { term: "Matching Funds", def: "Funds from non-federal sources that a grantee must provide as a condition of the award, often 1:1 or percentage-based." },
  { term: "Indirect Costs", def: "Overhead expenses not directly tied to a project (rent, utilities, admin) — covered by your negotiated indirect cost rate." },
  { term: "F&A Rate", def: "Facilities and Administrative rate — the percentage applied to direct costs to cover indirect costs, negotiated with your cognizant agency." },
  { term: "LOI", def: "Letter of Intent — a brief document expressing your intent to apply, sometimes required before submitting a full proposal." },
  { term: "SBIR", def: "Small Business Innovation Research — a federal program funding R&D at small businesses. Phase I ($50-275K), Phase II ($400K-1.75M)." },
  { term: "STTR", def: "Small Business Technology Transfer — similar to SBIR but requires partnership with a research institution." },
];

const externalLinks = [
  { name: "Grants.gov", url: "https://www.grants.gov", desc: "Official portal for all federal grant opportunities" },
  { name: "SAM.gov", url: "https://sam.gov", desc: "Entity registration and federal contract/grant search" },
  { name: "SBIR.gov", url: "https://www.sbir.gov", desc: "Small Business Innovation Research program portal" },
  { name: "NSF Award Search", url: "https://www.nsf.gov/awardsearch/", desc: "National Science Foundation funded projects" },
  { name: "NIH RePORTER", url: "https://reporter.nih.gov", desc: "NIH-funded research projects and grants database" },
  { name: "Simpler.Grants.gov", url: "https://simpler.grants.gov", desc: "Modernized federal grant search with better filtering" },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-white text-lg">GrantPilot</span>
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Grant Writing Resources
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to find, write, and win grant funding for your organization.
          </p>
        </div>

        {/* Guides */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Grant Writing Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-emerald-500/30 transition-all duration-300"
              >
                <guide.icon className="h-8 w-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">{guide.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{guide.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Glossary */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Grant Glossary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {glossary.map((item) => (
              <div key={item.term} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <dt className="text-emerald-400 font-bold text-sm mb-1">{item.term}</dt>
                <dd className="text-slate-400 text-sm leading-relaxed">{item.def}</dd>
              </div>
            ))}
          </div>
        </section>

        {/* External Links */}
        <section className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Useful Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group"
              >
                <ExternalLink className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 mt-0.5 flex-shrink-0 transition-colors" />
                <div>
                  <div className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">{link.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{link.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Automate Your Grant Applications?
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">
            GrantPilot reads the RFP, maps scoring criteria, and drafts every section from your data — scoring 100/100 on the rubric.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-white">GrantPilot</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
