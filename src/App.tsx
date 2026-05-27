import { lazy, Suspense, useMemo, useState } from "react";
import { ChartNoAxesCombined, IndianRupee, Landmark, RefreshCcw, ShieldCheck, TrendingUp } from "lucide-react";
import { CalculatorInput } from "./components/CalculatorInput";
import { MetricCard } from "./components/MetricCard";
import { MutualFundExplorer } from "./components/MutualFundExplorer";
import { ProjectionTable } from "./components/ProjectionTable";
import {
  calculateProjection,
  initialInputs,
  validateInputs,
  type CalculatorInputs,
} from "./lib/calculator";
import { formatCurrency } from "./lib/formatters";

const ProjectionCharts = lazy(() =>
  import("./components/ProjectionCharts").then((module) => ({ default: module.ProjectionCharts })),
);

const inputDefinitions: Array<{
  field: keyof CalculatorInputs;
  label: string;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  unit?: string;
}> = [
  { field: "lumpSum", label: "Lumpsum investment", min: 0, max: 1_000_000_000_000, step: 10_000, unit: "INR" },
  { field: "monthlySip", label: "Monthly SIP", min: 0, max: 1_000_000_000_000, step: 1_000, unit: "INR" },
  { field: "annualStepUp", label: "Annual SIP step-up", min: 0, max: 100, step: 0.1, unit: "%" },
  { field: "annualReturn", label: "Annual return rate", min: 0, max: 100, step: 0.1, unit: "%", hint: "Max 100%" },
  { field: "investmentYears", label: "Investment duration", min: 1, max: 100, hint: "Years" },
  { field: "sipStopYear", label: "SIP stoppage year", min: 0, max: 100, hint: "0 = no SIP" },
  { field: "withdrawalWaitYears", label: "Years until withdrawal", min: 0, max: 100, hint: "After investment phase" },
];

function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs);
  const errors = useMemo(() => validateInputs(inputs), [inputs]);
  const isValid = Object.keys(errors).length === 0;
  const result = useMemo(() => (isValid ? calculateProjection(inputs) : null), [inputs, isValid]);
  const returnPercentage = result && result.totalInvested > 0
    ? (result.totalReturns / result.totalInvested) * 100
    : 0;

  function updateInput(field: keyof CalculatorInputs, value: number) {
    setInputs((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900">
      <header className="border-b border-slate-200/70 bg-white">
        <div className="page-container flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082d2a] text-white">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">Aurevia Wealth</p>
              <p className="text-xs font-medium tracking-[0.2em] text-slate-400">PREMIUM FINANCIAL INTELLIGENCE</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Projection planner
          </div>
        </div>
      </header>

      <main className="page-container pb-10 pt-8 sm:pt-11">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Premium Interactive Wealth Growth Calculator</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.55rem] sm:leading-[1.15]">
            Design your wealth trajectory with clarity.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
            Model a stepped-up SIP and lumpsum portfolio, then let compounding run until your chosen withdrawal horizon.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[356px_minmax(0,1fr)]">
          <aside className="panel p-5 sm:p-6 lg:sticky lg:top-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="section-title">Plan inputs</h2>
                <p className="section-subtitle">All amounts in Indian rupees</p>
              </div>
              <button
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => setInputs(initialInputs)}
                title="Reset assumptions"
                type="button"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5">
              {inputDefinitions.map((definition) => (
                <CalculatorInput
                  {...definition}
                  error={errors[definition.field]}
                  key={definition.field}
                  max={
                    definition.field === "sipStopYear"
                      ? Math.max(inputs.investmentYears, 0)
                      : definition.max
                  }
                  onChange={updateInput}
                  value={inputs[definition.field]}
                />
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-[#f2f6f5] p-4 text-xs leading-5 text-slate-500">
              Contributions are grouped yearly for annual compounding. Withdrawal occurs after{" "}
              <span className="font-semibold text-slate-700">
                {inputs.investmentYears + inputs.withdrawalWaitYears} years
              </span>
              , including the post-investment wait.
            </div>
          </aside>

          <div className="space-y-6">
            {!result ? (
              <section className="panel flex min-h-[260px] items-center justify-center p-8 text-center">
                <div className="max-w-sm">
                  <p className="text-lg font-semibold text-slate-900">Review your assumptions</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Correct the highlighted inputs to restore your live wealth projection.
                  </p>
                </div>
              </section>
            ) : (
              <>
                <section className="grid gap-4 sm:grid-cols-3">
                  <MetricCard
                    detail={`Projected at withdrawal in year ${result.totalYears}`}
                    featured
                    icon={ChartNoAxesCombined}
                    title="Final corpus"
                    value={formatCurrency(result.finalCorpus)}
                  />
                  <MetricCard
                    detail="Lumpsum plus all SIP installments"
                    icon={IndianRupee}
                    title="Total invested"
                    value={formatCurrency(result.totalInvested)}
                  />
                  <MetricCard
                    detail={`${returnPercentage.toFixed(1)}% gain on invested capital`}
                    icon={TrendingUp}
                    title="Total returns"
                    value={formatCurrency(result.totalReturns)}
                  />
                </section>

                <Suspense fallback={<div className="panel h-[360px] animate-pulse bg-white" aria-label="Loading charts" />}>
                  <ProjectionCharts result={result} />
                </Suspense>
                <ProjectionTable rows={result.rows} />
              </>
            )}
          </div>
        </div>
        <div className="mt-6">
          <MutualFundExplorer />
        </div>
      </main>
    </div>
  );
}

export default App;
