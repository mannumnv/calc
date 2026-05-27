import type { YearlyProjection } from "../lib/calculator";
import { formatCurrency } from "../lib/formatters";

interface ProjectionTableProps {
  rows: YearlyProjection[];
}

export function ProjectionTable({ rows }: ProjectionTableProps) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="section-title">Year-wise projection</h2>
        <p className="section-subtitle">Returns shown are cumulative gains at each year-end</p>
      </div>
      <div className="max-h-[500px] overflow-auto">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">
            <tr>
              <th className="px-5 py-4 sm:px-6">Year</th>
              <th className="px-4 py-4">Phase</th>
              <th className="px-4 py-4 text-right">Lumpsum value</th>
              <th className="px-4 py-4 text-right">SIP contribution</th>
              <th className="px-4 py-4 text-right">Total invested</th>
              <th className="px-4 py-4 text-right">Portfolio value</th>
              <th className="px-5 py-4 text-right sm:px-6">Returns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr className="transition-colors hover:bg-teal-50/40" key={row.year}>
                <td className="px-5 py-4 font-semibold text-slate-800 sm:px-6">{row.year}</td>
                <td className="px-4 py-4">
                  <span className={row.phase === "Investing" ? "phase-active" : "phase-growth"}>
                    {row.phase}
                  </span>
                </td>
                <td className="px-4 py-4 text-right tabular-nums text-slate-700">{formatCurrency(row.lumpSumValue)}</td>
                <td className="px-4 py-4 text-right tabular-nums text-slate-700">{formatCurrency(row.sipContribution)}</td>
                <td className="px-4 py-4 text-right tabular-nums text-slate-700">{formatCurrency(row.totalInvested)}</td>
                <td className="px-4 py-4 text-right font-semibold tabular-nums text-slate-900">
                  {formatCurrency(row.portfolioValue)}
                </td>
                <td className="px-5 py-4 text-right font-semibold tabular-nums text-teal-700 sm:px-6">
                  {formatCurrency(row.returns)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
