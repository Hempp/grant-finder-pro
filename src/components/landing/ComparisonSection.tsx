import { Check, X } from "lucide-react";

type Cell = boolean | string;

interface Row {
  label: string;
  cells: [Cell, Cell, Cell, Cell]; // [GrantPilot, Instrumentl, Submittable, Consultants]
}

const ROWS: Row[] = [
  { label: "Upfront cost",                 cells: ["$0", "$179–$329 / mo", "$1,000+ / yr", "$5K–$15K / app"] },
  { label: "Pay only on a win",            cells: [true, false, false, false] },
  { label: "Drafts the application for you", cells: [true, false, true, true] },
  { label: "Predicts score before submit", cells: [true, false, false, "Sometimes"] },
  { label: "Cancel anytime",               cells: [true, true, true, "Per-engagement"] },
  { label: "21-day free trial",            cells: [true, false, false, false] },
  { label: "Time to first ranked match",   cells: ["< 5 min", "Days", "N/A", "Weeks"] },
  { label: "Opportunities indexed",        cells: ["2,000+", "30,000+", "N/A", "Varies"] },
  { label: "Best suited for",              cells: ["Anyone — orgs + students", "Research-heavy orgs", "Active submitters", "High-budget orgs"] },
];

function CellContent({ value }: { value: Cell }) {
  if (value === true) return <Check className="size-4 text-success mx-auto" aria-label="Yes" />;
  if (value === false) return <X className="size-4 text-ink-2/50 mx-auto" aria-label="No" />;
  return <span className="text-[13px] tabular-nums">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section id="compare" className="container mx-auto px-4 sm:px-6 py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-accent mb-3">
          How we compare
        </p>
        <h2 className="font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] tracking-[-0.02em] text-ink mb-3">
          The only platform that gets paid when you do.
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full max-w-5xl mx-auto text-left border-collapse">
          <caption className="sr-only">Comparison of grant-finding tools</caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="py-4 pr-4 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink-2 align-bottom">&nbsp;</th>
              <th scope="col" className="py-4 px-4 text-center align-bottom bg-accent-soft/40 rounded-t-xl">
                <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-accent mb-1">Most efficient</span>
                <span className="block text-[15px] font-bold text-ink">GrantPilot</span>
              </th>
              <th scope="col" className="py-4 px-4 text-center align-bottom">
                <span className="block text-[15px] font-bold text-ink">Instrumentl</span>
              </th>
              <th scope="col" className="py-4 px-4 text-center align-bottom">
                <span className="block text-[15px] font-bold text-ink">Submittable</span>
              </th>
              <th scope="col" className="py-4 pl-4 text-center align-bottom">
                <span className="block text-[15px] font-bold text-ink">Consultants</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-bg-soft/30" : ""}>
                <th scope="row" className="py-3.5 pr-4 text-[14px] font-medium text-ink">{row.label}</th>
                <td className="py-3.5 px-4 text-center bg-accent-soft/25"><CellContent value={row.cells[0]} /></td>
                <td className="py-3.5 px-4 text-center"><CellContent value={row.cells[1]} /></td>
                <td className="py-3.5 px-4 text-center"><CellContent value={row.cells[2]} /></td>
                <td className="py-3.5 pl-4 text-center"><CellContent value={row.cells[3]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-ink-2/70 text-center max-w-3xl mx-auto">
        Competitor pricing as of {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}, sourced from each vendor&apos;s public site. Refer to each vendor for current rates.
      </p>
    </section>
  );
}
