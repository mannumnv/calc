export interface MutualFundSearchResult {
  schemeCode: number;
  schemeName: string;
}

export interface MutualFundMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
  isin_growth: string | null;
  isin_div_reinvestment: string | null;
}

export interface NavEntry {
  date: string;
  nav: string;
}

export interface MutualFundDetails {
  meta: MutualFundMeta;
  data: NavEntry[];
  status: string;
}

export interface FundReturnMetric {
  label: string;
  value: number | null;
}

const API_BASE_URL = "https://api.mfapi.in/mf";

export async function searchMutualFunds(query: string, signal?: AbortSignal): Promise<MutualFundSearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) {
    throw new Error("Unable to search mutual funds right now.");
  }

  return (await response.json()) as MutualFundSearchResult[];
}

export async function getMutualFundDetails(schemeCode: number, signal?: AbortSignal): Promise<MutualFundDetails> {
  const response = await fetch(`${API_BASE_URL}/${schemeCode}`, { signal });
  if (!response.ok) {
    throw new Error("Unable to load the selected fund details.");
  }

  return (await response.json()) as MutualFundDetails;
}

function parseNavDate(date: string): Date {
  const [day, month, year] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function findPriorNav(data: NavEntry[], target: Date): NavEntry | undefined {
  return data.find((item) => parseNavDate(item.date) <= target);
}

function calculateReturn(latest: NavEntry, earlier: NavEntry | undefined): number | null {
  if (!earlier) {
    return null;
  }

  return (Number(latest.nav) / Number(earlier.nav) - 1) * 100;
}

export function getFundReturnMetrics(data: NavEntry[]): FundReturnMetric[] {
  const latest = data[0];
  if (!latest) {
    return [];
  }

  const latestDate = parseNavDate(latest.date);
  const monthAgo = new Date(latestDate);
  monthAgo.setUTCMonth(monthAgo.getUTCMonth() - 1);
  const yearAgo = new Date(latestDate);
  yearAgo.setUTCFullYear(yearAgo.getUTCFullYear() - 1);
  const threeYearsAgo = new Date(latestDate);
  threeYearsAgo.setUTCFullYear(threeYearsAgo.getUTCFullYear() - 3);

  return [
    { label: "1M return", value: calculateReturn(latest, findPriorNav(data, monthAgo)) },
    { label: "1Y return", value: calculateReturn(latest, findPriorNav(data, yearAgo)) },
    { label: "3Y return", value: calculateReturn(latest, findPriorNav(data, threeYearsAgo)) },
  ];
}
