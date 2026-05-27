import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionResult } from "../lib/calculator";
import { formatCompactCurrency, formatCurrency } from "../lib/formatters";

interface ProjectionChartsProps {
  result: ProjectionResult;
}

function tooltipCurrency(value: unknown) {
  const scalarValue = Array.isArray(value) ? value[0] : value;
  return formatCurrency(Number(scalarValue ?? 0));
}

export function ProjectionCharts({ result }: ProjectionChartsProps) {
  const comparisonData = [
    { label: "Invested", value: result.totalInvested, fill: "#b8c9c5" },
    { label: "Corpus", value: result.finalCorpus, fill: "#0d766e" },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <section className="panel p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="section-title">Portfolio growth</h2>
          <p className="section-subtitle">Projected year-end value until withdrawal</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={result.rows} margin={{ top: 5, right: 10, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="#0d766e" />
                  <stop offset="100%" stopColor="#1aa693" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e9efed" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="year" fontSize={12} stroke="#71817d" tickLine={false} />
              <YAxis
                axisLine={false}
                fontSize={12}
                stroke="#71817d"
                tickFormatter={formatCompactCurrency}
                tickLine={false}
                width={76}
              />
              <Tooltip
                formatter={(value) => [tooltipCurrency(value), "Portfolio value"]}
                labelFormatter={(year) => `End of year ${year}`}
              />
              <Line
                activeDot={{ fill: "#0d766e", r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                dataKey="portfolioValue"
                dot={false}
                stroke="url(#portfolioLine)"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
        <section className="panel p-5 sm:p-6">
          <h2 className="section-title">Annual SIP</h2>
          <p className="section-subtitle">Step-up contributions until stoppage</p>
          <div className="mt-5 h-[205px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={result.rows} margin={{ left: -12, right: 4 }}>
                <CartesianGrid stroke="#e9efed" strokeDasharray="4 5" vertical={false} />
                <XAxis dataKey="year" fontSize={11} stroke="#71817d" tickLine={false} />
                <YAxis
                  axisLine={false}
                  fontSize={11}
                  stroke="#71817d"
                  tickFormatter={formatCompactCurrency}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => [tooltipCurrency(value), "SIP contribution"]} />
                <Bar dataKey="sipContribution" fill="#22aa96" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <h2 className="section-title">Value creation</h2>
          <p className="section-subtitle">Capital invested versus ending corpus</p>
          <div className="mt-5 h-[205px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis
                  axisLine={false}
                  fontSize={11}
                  stroke="#71817d"
                  tickFormatter={formatCompactCurrency}
                  tickLine={false}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="label"
                  fontSize={12}
                  stroke="#475754"
                  tickLine={false}
                  type="category"
                  width={62}
                />
                <Tooltip formatter={(value) => [tooltipCurrency(value), "Amount"]} />
                <Bar dataKey="value" radius={[0, 7, 7, 0]}>
                  {comparisonData.map((entry) => (
                    <Cell fill={entry.fill} key={entry.label} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
