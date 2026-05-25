import { Metadata } from "next";
import { BookOpen, FileText, DollarSign, Users, Target, AlertTriangle, ExternalLink } from "lucide-react";
import { CtaBanner } from "@/components/landing";

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
    desc: "Direct vs. indirect costs, cost sharing, matching funds, and how to build budgets funders approve without questions.",
  },
  {
    icon: AlertTriangle,
    title: "Common Grant Application Mistakes",
    desc: "The top errors that get applications rejected — and how to avoid every one of them.",
  },
];

const glossary = [
  { term: "NOFO", def: "Notice of Funding Opportunity — the official announcement that a grant is available for applications." },
  { term: "RFP", def: "Request for Proposal — a document from a funder soliciting proposals for a specific project or program." },
  { term: "CFDA", def: "Catalog of Federal Domestic Assistance — a unique number assigned to each federal assistance program (now called Assistance Listings)." },
  { term: "SAM.gov", def: "System for Award Management — the federal portal where organizations must register before receiving federal grants." },
  { term: "UEI", def: "Unique Entity Identifier — a 12-character alphanumeric ID assigned to entities registered in SAM.gov (replaced DUNS)." },
  { term: "Cost Sharing", def: "The portion of project costs not covered by the grant — your organization's financial contribution." },
  { term: "Matching Funds", def: "Funds from non-federal sources that a grantee must provide as a condition of the award, often 1:1 or percentage-based." },
  { term: "Indirect Costs", def: "Overhead expenses not directly tied to a project (rent, utilities, admin) — covered by your negotiated indirect cost rate." },
  { term: "F&A Rate", def: "Facilities and Administrative rate — the percentage applied to direct costs to cover indirect costs, negotiated with your cognizant agency." },
  { term: "LOI", def: "Letter of Intent — a brief document expressing your intent to apply, sometimes required before submitting a full proposal." },
  { term: "SBIR", def: "Small Business Innovation Research — a federal program funding R&D at small businesses. Phase I ($50–275K), Phase II ($400K–1.75M)." },
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
    <main>
      {/* Hero — quiet. */}
      <section
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p
            className="mb-5"
            style={{
              color: "var(--accent)",
              fontSize: "var(--text-meta)",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Resources
          </p>
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              color: "var(--ink)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Grant writing resources
          </h1>
          <p
            className="mt-5 mx-auto max-w-2xl"
            style={{
              fontSize: "var(--text-body-lg)",
              color: "var(--ink-2)",
              lineHeight: 1.6,
            }}
          >
            Everything you need to find, write, and win grant funding for your organization.
          </p>
        </div>
      </section>

      {/* Guides — band 1, white cards. */}
      <section
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
          background: "var(--bg-soft)",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            className="font-semibold tracking-tight mb-10"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Grant writing guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => (
              <article
                key={guide.title}
                className="p-6"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-card-soft)",
                }}
              >
                <div
                  className="inline-flex p-2.5 mb-4"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    borderRadius: "var(--radius-control)",
                  }}
                >
                  <guide.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ fontSize: "var(--text-body-lg)", color: "var(--ink)" }}
                >
                  {guide.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-body-sm)",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {guide.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary — quiet on white. */}
      <section
        style={{
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py-tight)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            className="font-semibold tracking-tight mb-10"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Grant glossary
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {glossary.map((item) => (
              <div
                key={item.term}
                className="p-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <dt
                  className="font-mono font-semibold mb-1"
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--accent)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.term}
                </dt>
                <dd
                  style={{
                    fontSize: "var(--text-body-sm)",
                    color: "var(--ink-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.def}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* External links — quiet rows. */}
      <section
        style={{
          paddingTop: "var(--section-py-tight)",
          paddingBottom: "var(--section-py)",
          background: "var(--bg-soft)",
          borderTop: "1px solid var(--rule)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            className="font-semibold tracking-tight mb-10"
            style={{ fontSize: "var(--text-title)", color: "var(--ink)" }}
          >
            Useful links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-4 transition-colors"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius-control)",
                }}
              >
                <ExternalLink
                  className="h-4 w-4 mt-0.5 flex-shrink-0 transition-colors group-hover:text-[var(--accent)]"
                  style={{ color: "var(--ink-2)" }}
                  aria-hidden="true"
                />
                <div>
                  <div
                    className="font-medium transition-colors group-hover:text-[var(--accent)]"
                    style={{ fontSize: "var(--text-body-sm)", color: "var(--ink)" }}
                  >
                    {link.name}
                  </div>
                  <div
                    className="mt-0.5"
                    style={{ fontSize: "var(--text-caption)", color: "var(--ink-2)" }}
                  >
                    {link.desc}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA peak — landing's CtaBanner for consistency. */}
      <CtaBanner ctaHref="/signup" ctaLabel="Get started free" />
    </main>
  );
}
