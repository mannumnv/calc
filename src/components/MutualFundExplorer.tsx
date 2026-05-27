import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import {
  getFundReturnMetrics,
  getMutualFundDetails,
  searchMutualFunds,
  type MutualFundDetails,
  type MutualFundSearchResult,
} from "../lib/mutualFunds";

const defaultScheme: MutualFundSearchResult = {
  schemeCode: 125497,
  schemeName: "SBI Small Cap Fund - Direct Plan - Growth",
};

function formatNav(value: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 4,
    maximumFractionDigits: 5,
  }).format(Number(value));
}

function formatPerformance(value: number | null) {
  if (value === null) {
    return "Not available";
  }
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function MutualFundExplorer() {
  const [query, setQuery] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<MutualFundSearchResult>(defaultScheme);
  const [results, setResults] = useState<MutualFundSearchResult[]>([]);
  const [details, setDetails] = useState<MutualFundDetails | null>(null);
  const [searchError, setSearchError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const matches = await searchMutualFunds(trimmedQuery, controller.signal);
        setResults(matches.slice(0, 8));
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setSearchError(error.message);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingDetails(true);
    setDetailsError("");

    getMutualFundDetails(selectedScheme.schemeCode, controller.signal)
      .then(setDetails)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setDetailsError(error.message);
          setDetails(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingDetails(false);
        }
      });

    return () => controller.abort();
  }, [selectedScheme]);

  const latestNav = details?.data[0];
  const returnMetrics = useMemo(() => getFundReturnMetrics(details?.data ?? []), [details]);

  function selectFund(fund: MutualFundSearchResult) {
    setSelectedScheme(fund);
    setQuery("");
    setResults([]);
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <p className="eyebrow">Mutual fund navigator</p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Explore published fund NAV details</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Search Indian mutual fund schemes and view NAV history from the latest published daily dataset.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
            href="https://www.mfapi.in/"
            rel="noreferrer"
            target="_blank"
          >
            Data source: MFapi.in
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="fund-search">
            Search a mutual fund
          </label>
          <div className="input-shell mt-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
              id="fund-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Parag Parikh, HDFC"
              type="search"
              value={query}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {isSearching ? "Searching published schemes..." : "Enter at least two characters."}
          </p>
          {searchError && <p className="mt-3 text-xs font-medium text-rose-600">{searchError}</p>}
          {results.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {results.map((fund) => (
                <button
                  className="block w-full border-b border-slate-100 px-3.5 py-3 text-left text-xs leading-5 text-slate-700 transition last:border-none hover:bg-teal-50 hover:text-teal-900"
                  key={fund.schemeCode}
                  onClick={() => selectFund(fund)}
                  type="button"
                >
                  {fund.schemeName}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoadingDetails ? (
          <div className="min-h-[255px] animate-pulse rounded-2xl bg-slate-50" aria-label="Loading fund details" />
        ) : detailsError ? (
          <div className="flex min-h-[255px] items-center justify-center rounded-2xl bg-slate-50 p-6 text-sm text-rose-600">
            {detailsError}
          </div>
        ) : details && latestNav ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-teal-700">{details.meta.fund_house}</p>
                <h3 className="mt-2 text-lg font-semibold leading-7 text-slate-950">{details.meta.scheme_name}</h3>
                <p className="mt-2 text-xs text-slate-500">{details.meta.scheme_category}</p>
              </div>
              <div className="rounded-2xl bg-[#082d2a] px-4 py-3.5 text-white sm:text-right">
                <p className="text-xs text-teal-100">Latest NAV</p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums">{formatNav(latestNav.nav)}</p>
                <p className="mt-1 text-xs text-teal-100">Published {latestNav.date}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {returnMetrics.map((metric) => (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5" key={metric.label}>
                  <p className="text-xs text-slate-500">{metric.label}</p>
                  <p className={`mt-2 text-base font-semibold tabular-nums ${metric.value !== null && metric.value < 0 ? "text-rose-600" : "text-teal-700"}`}>
                    {formatPerformance(metric.value)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Scheme type</dt>
                <dd className="mt-1 font-medium text-slate-800">{details.meta.scheme_type}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Scheme code</dt>
                <dd className="mt-1 font-medium tabular-nums text-slate-800">{details.meta.scheme_code}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ISIN growth</dt>
                <dd className="mt-1 font-medium text-slate-800">{details.meta.isin_growth ?? "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ISIN dividend/reinvestment</dt>
                <dd className="mt-1 font-medium text-slate-800">{details.meta.isin_div_reinvestment ?? "Not available"}</dd>
              </div>
            </dl>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Recent NAV history</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {details.data.slice(0, 8).map((entry) => (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-xs" key={entry.date}>
                    <span className="text-slate-500">{entry.date}</span>
                    <span className="font-semibold tabular-nums text-slate-800">{formatNav(entry.nav)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <p className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
        NAV is updated on published valuation dates and is not an intraday market price. Past NAV movement is informational and
        does not determine the future return assumption in the calculator above.
      </p>
    </section>
  );
}
