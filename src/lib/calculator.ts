export interface CalculatorInputs {
  lumpSum: number;
  monthlySip: number;
  annualStepUp: number;
  annualReturn: number;
  investmentYears: number;
  sipStopYear: number;
  withdrawalWaitYears: number;
}

export interface YearlyProjection {
  year: number;
  phase: "Investing" | "Growth only";
  lumpSumValue: number;
  sipContribution: number;
  totalInvested: number;
  portfolioValue: number;
  returns: number;
}

export interface ProjectionResult {
  rows: YearlyProjection[];
  finalCorpus: number;
  totalInvested: number;
  totalReturns: number;
  totalYears: number;
}

export type InputErrors = Partial<Record<keyof CalculatorInputs, string>>;

export const initialInputs: CalculatorInputs = {
  lumpSum: 1_000_000,
  monthlySip: 25_000,
  annualStepUp: 10,
  annualReturn: 12,
  investmentYears: 20,
  sipStopYear: 15,
  withdrawalWaitYears: 5,
};

const MAX_AMOUNT = 1_000_000_000_000;

export function validateInputs(inputs: CalculatorInputs): InputErrors {
  const errors: InputErrors = {};

  if (!Number.isFinite(inputs.lumpSum) || inputs.lumpSum < 0) {
    errors.lumpSum = "Enter a non-negative amount.";
  } else if (inputs.lumpSum > MAX_AMOUNT) {
    errors.lumpSum = "Amount cannot exceed INR 1 trillion.";
  }

  if (!Number.isFinite(inputs.monthlySip) || inputs.monthlySip < 0) {
    errors.monthlySip = "Enter a non-negative monthly SIP.";
  } else if (inputs.monthlySip > MAX_AMOUNT) {
    errors.monthlySip = "Amount cannot exceed INR 1 trillion.";
  }

  if (inputs.annualStepUp < 0 || inputs.annualStepUp > 100) {
    errors.annualStepUp = "Step-up must be between 0% and 100%.";
  }

  if (inputs.annualReturn < 0 || inputs.annualReturn > 100) {
    errors.annualReturn = "Annual return must be between 0% and 100%.";
  }

  if (!Number.isInteger(inputs.investmentYears) || inputs.investmentYears < 1 || inputs.investmentYears > 100) {
    errors.investmentYears = "Choose 1 to 100 years.";
  }

  if (!Number.isInteger(inputs.sipStopYear) || inputs.sipStopYear < 0 || inputs.sipStopYear > inputs.investmentYears) {
    errors.sipStopYear = "Stop year must be from 0 through investment duration.";
  }

  if (!Number.isInteger(inputs.withdrawalWaitYears) || inputs.withdrawalWaitYears < 0 || inputs.withdrawalWaitYears > 100) {
    errors.withdrawalWaitYears = "Choose 0 to 100 years.";
  } else if (inputs.investmentYears + inputs.withdrawalWaitYears > 100) {
    errors.withdrawalWaitYears = "Total time until withdrawal cannot exceed 100 years.";
  }

  return errors;
}

export function calculateProjection(inputs: CalculatorInputs): ProjectionResult {
  const totalYears = inputs.investmentYears + inputs.withdrawalWaitYears;
  const annualGrowth = 1 + inputs.annualReturn / 100;
  const annualSipStepUp = 1 + inputs.annualStepUp / 100;
  const rows: YearlyProjection[] = [];

  let lumpSumValue = inputs.lumpSum;
  let sipValue = 0;
  let totalInvested = inputs.lumpSum;

  for (let year = 1; year <= totalYears; year += 1) {
    const isContributionYear = year <= inputs.sipStopYear && year <= inputs.investmentYears;
    const sipContribution = isContributionYear
      ? inputs.monthlySip * 12 * annualSipStepUp ** (year - 1)
      : 0;

    lumpSumValue *= annualGrowth;
    sipValue = (sipValue + sipContribution) * annualGrowth;
    totalInvested += sipContribution;

    const portfolioValue = lumpSumValue + sipValue;
    rows.push({
      year,
      phase: year <= inputs.investmentYears ? "Investing" : "Growth only",
      lumpSumValue,
      sipContribution,
      totalInvested,
      portfolioValue,
      returns: portfolioValue - totalInvested,
    });
  }

  const finalCorpus = rows.at(-1)?.portfolioValue ?? inputs.lumpSum;
  return {
    rows,
    finalCorpus,
    totalInvested,
    totalReturns: finalCorpus - totalInvested,
    totalYears,
  };
}
