// ============================================================
// Core Financial Formula Library
// ============================================================

// --- Formatting ---
export function formatCurrency(value: number, currency = "USD", compact = false): string {
  if (!isFinite(value)) return "$0";
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2, notation: "compact" }).format(value);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(value);
}

// --- Compound Interest ---
export function compoundInterest(principal: number, rate: number, n: number, t: number): number {
  // A = P(1 + r/n)^(nt)
  return principal * Math.pow(1 + rate / n, n * t);
}

// --- Future Value of Annuity (SIP/PMT) ---
export function futureValueAnnuity(pmt: number, rate: number, periods: number): number {
  if (rate === 0) return pmt * periods;
  return pmt * ((Math.pow(1 + rate, periods) - 1) / rate);
}

// --- Future Value ---
export function futureValue(pv: number, rate: number, periods: number): number {
  return pv * Math.pow(1 + rate, periods);
}

// --- Present Value ---
export function presentValue(fv: number, rate: number, periods: number): number {
  return fv / Math.pow(1 + rate, periods);
}

// --- Present Value of Annuity ---
export function presentValueAnnuity(pmt: number, rate: number, periods: number): number {
  if (rate === 0) return pmt * periods;
  return pmt * ((1 - Math.pow(1 + rate, -periods)) / rate);
}

// --- Monthly Mortgage / Loan Payment (EMI) ---
export function calcEMI(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// --- Amortization Schedule ---
export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
  totalPrincipal: number;
}

export function amortizationSchedule(principal: number, annualRate: number, months: number): AmortizationRow[] {
  const emi = calcEMI(principal, annualRate, months);
  const r = annualRate / 12 / 100;
  const rows: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let month = 1; month <= months; month++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalPrincipal += principalPaid;
    rows.push({ month, payment: emi, principal: principalPaid, interest, balance, totalInterest, totalPrincipal });
    if (balance === 0) break;
  }
  return rows;
}

// --- CAGR ---
export function cagr(beginValue: number, endValue: number, years: number): number {
  if (beginValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / beginValue, 1 / years) - 1) * 100;
}

// --- Simple Interest ---
export function simpleInterest(principal: number, ratePercent: number, years: number): number {
  return principal * (ratePercent / 100) * years;
}

// --- FIRE Number ---
export function fireNumber(annualExpenses: number, withdrawalRate: number): number {
  return annualExpenses / (withdrawalRate / 100);
}

// --- Years to FIRE ---
export function yearsToFire(currentSavings: number, annualSavings: number, annualReturn: number, targetCorpus: number): number {
  if (currentSavings >= targetCorpus) return 0;
  const r = annualReturn / 100;
  if (r === 0) return (targetCorpus - currentSavings) / annualSavings;
  // Solve: targetCorpus = currentSavings*(1+r)^n + annualSavings*((1+r)^n - 1)/r
  // Iterative approach
  for (let n = 1; n <= 100; n++) {
    const val = currentSavings * Math.pow(1 + r, n) + annualSavings * (Math.pow(1 + r, n) - 1) / r;
    if (val >= targetCorpus) return n;
  }
  return 100;
}

// --- SIP Returns ---
export interface SIPResult {
  totalInvested: number;
  futureValue: number;
  wealthGained: number;
  absoluteReturn: number;
  cagr: number;
}

export function calcSIP(monthly: number, annualReturn: number, years: number): SIPResult {
  const r = annualReturn / 100 / 12;
  const n = years * 12;
  const fv = futureValueAnnuity(monthly, r, n);
  const totalInvested = monthly * n;
  const wealthGained = fv - totalInvested;
  const absoluteReturn = totalInvested > 0 ? (wealthGained / totalInvested) * 100 : 0;
  const cagrVal = cagr(totalInvested, fv, years);
  return { totalInvested, futureValue: fv, wealthGained, absoluteReturn, cagr: cagrVal };
}

// --- Step-Up SIP ---
export interface StepUpSIPResult {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
  absoluteReturn: number;
  cagr: number;
  yearlyData: Array<{ year: number; monthlyAmount: number; totalInvested: number; futureValue: number; wealthGained: number }>;
}

export function calcStepUpSIP(initialMonthly: number, annualReturn: number, years: number, stepUpPercent: number): StepUpSIPResult {
  const monthlyRate = annualReturn / 100 / 12;
  let totalFV = 0;
  let totalInvested = 0;
  const yearlyData: StepUpSIPResult["yearlyData"] = [];

  for (let y = 0; y < years; y++) {
    const monthly = initialMonthly * Math.pow(1 + stepUpPercent / 100, y);
    const monthsRemaining = (years - y) * 12;
    // FV of 12 monthly payments made at start of each year, grown for remaining months
    for (let m = 0; m < 12; m++) {
      const periodsLeft = monthsRemaining - m;
      totalFV += monthly * Math.pow(1 + monthlyRate, periodsLeft);
      totalInvested += monthly;
    }
    // Snapshot for yearly data
    let snapFV = 0;
    let snapInvested = 0;
    for (let sy = 0; sy <= y; sy++) {
      const sm = initialMonthly * Math.pow(1 + stepUpPercent / 100, sy);
      const smMonths = (y - sy + 1) * 12;
      const smFV = futureValueAnnuity(sm, monthlyRate, smMonths);
      snapFV += smFV;
      snapInvested += sm * 12;
    }
    yearlyData.push({
      year: y + 1,
      monthlyAmount: Math.round(monthly),
      totalInvested: Math.round(snapInvested),
      futureValue: Math.round(snapFV),
      wealthGained: Math.round(snapFV - snapInvested),
    });
  }

  const wealthGained = totalFV - totalInvested;
  const absoluteReturn = totalInvested > 0 ? (wealthGained / totalInvested) * 100 : 0;
  const cagrVal = cagr(totalInvested, totalFV, years);
  return { futureValue: totalFV, totalInvested, wealthGained, absoluteReturn, cagr: cagrVal, yearlyData };
}

// --- Rental Yield ---
export function grossRentalYield(annualRent: number, propertyValue: number): number {
  return (annualRent / propertyValue) * 100;
}

export function netRentalYield(annualRent: number, annualExpenses: number, propertyValue: number): number {
  return ((annualRent - annualExpenses) / propertyValue) * 100;
}

// --- Cap Rate ---
export function capRate(noi: number, propertyValue: number): number {
  return (noi / propertyValue) * 100;
}

// --- Cash on Cash ---
export function cashOnCash(annualCashFlow: number, totalCashInvested: number): number {
  return (annualCashFlow / totalCashInvested) * 100;
}

// --- ROI ---
export function roi(netProfit: number, cost: number): number {
  return (netProfit / cost) * 100;
}

// --- NPV ---
export function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

// --- IRR (Newton-Raphson) ---
export function irr(cashFlows: number[], guess = 0.1): number {
  const MAX_ITER = 1000;
  const TOLERANCE = 1e-7;
  let rate = guess;
  for (let i = 0; i < MAX_ITER; i++) {
    const n = npv(rate, cashFlows);
    const dn = cashFlows.reduce((acc, cf, t) => acc - (t * cf) / Math.pow(1 + rate, t + 1), 0);
    if (Math.abs(dn) < TOLERANCE) break;
    const newRate = rate - n / dn;
    if (Math.abs(newRate - rate) < TOLERANCE) return newRate * 100;
    rate = newRate;
  }
  return rate * 100;
}

// --- Inflation Adjusted ---
export function inflationAdjusted(value: number, inflationRate: number, years: number): number {
  return value / Math.pow(1 + inflationRate / 100, years);
}

export function realReturn(nominalReturn: number, inflationRate: number): number {
  return ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
}

// --- APR to APY ---
export function aprToApy(apr: number, n: number): number {
  return (Math.pow(1 + apr / 100 / n, n) - 1) * 100;
}

export function apyToApr(apy: number, n: number): number {
  return (Math.pow(1 + apy / 100, 1 / n) - 1) * n * 100;
}

// --- Break Even ---
export function breakEvenUnits(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): number {
  const cm = pricePerUnit - variableCostPerUnit;
  if (cm <= 0) return Infinity;
  return fixedCosts / cm;
}

export function breakEvenRevenue(fixedCosts: number, contributionMarginRate: number): number {
  if (contributionMarginRate <= 0) return Infinity;
  return fixedCosts / (contributionMarginRate / 100);
}

// --- Profit Margin ---
export function grossMargin(revenue: number, cogs: number): number {
  return ((revenue - cogs) / revenue) * 100;
}

export function markupToMargin(markup: number): number {
  return (markup / (100 + markup)) * 100;
}

export function marginToMarkup(margin: number): number {
  return (margin / (100 - margin)) * 100;
}

// --- Debt Payoff Scenarios ---
export interface DebtItem {
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export function debtSnowball(debts: DebtItem[], extraPayment: number): { months: number; totalInterest: number; schedule: { month: number; debts: { name: string; balance: number }[] }[] } {
  const items = debts.map(d => ({ ...d })).sort((a, b) => a.balance - b.balance);
  let month = 0;
  let totalInterest = 0;
  const schedule: { month: number; debts: { name: string; balance: number }[] }[] = [];

  while (items.some(d => d.balance > 0) && month < 600) {
    month++;
    let extra = extraPayment;
    for (const item of items) {
      if (item.balance <= 0) continue;
      const interest = item.balance * (item.rate / 100 / 12);
      totalInterest += interest;
      item.balance += interest;
      const payment = Math.min(item.balance, item.minPayment + (items.filter(d => d.balance > 0).indexOf(item) === 0 ? extra : 0));
      item.balance -= payment;
      if (item.balance < 0.01) item.balance = 0;
    }
    schedule.push({ month, debts: items.map(i => ({ name: i.name, balance: i.balance })) });
  }
  return { months: month, totalInterest, schedule };
}

export function debtAvalanche(debts: DebtItem[], extraPayment: number): { months: number; totalInterest: number } {
  const items = debts.map(d => ({ ...d })).sort((a, b) => b.rate - a.rate);
  let month = 0;
  let totalInterest = 0;

  while (items.some(d => d.balance > 0) && month < 600) {
    month++;
    let extra = extraPayment;
    for (const item of items) {
      if (item.balance <= 0) continue;
      const interest = item.balance * (item.rate / 100 / 12);
      totalInterest += interest;
      item.balance += interest;
      const payment = Math.min(item.balance, item.minPayment + (items.filter(d => d.balance > 0).indexOf(item) === 0 ? extra : 0));
      item.balance -= payment;
      if (item.balance < 0.01) item.balance = 0;
    }
  }
  return { months: month, totalInterest };
}

// --- Monte Carlo ---
export function monteCarlo(
  initialValue: number,
  annualContribution: number,
  years: number,
  meanReturn: number,
  stdDev: number,
  simulations = 1000,
): { p10: number; p25: number; p50: number; p75: number; p90: number; successRate: number } {
  const results: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    let value = initialValue;
    for (let y = 0; y < years; y++) {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(rand1)) * Math.cos(2 * Math.PI * rand2);
      const annualReturn = meanReturn / 100 + (stdDev / 100) * z;
      value = value * (1 + annualReturn) + annualContribution;
    }
    results.push(value);
  }

  results.sort((a, b) => a - b);
  const p = (pct: number) => results[Math.floor((pct / 100) * simulations)];
  const successRate = (results.filter(r => r > 0).length / simulations) * 100;

  return { p10: p(10), p25: p(25), p50: p(50), p75: p(75), p90: p(90), successRate };
}

// --- Coast FIRE ---
export function coastFireNumber(targetFire: number, annualReturn: number, yearsToGrow: number): number {
  return targetFire / Math.pow(1 + annualReturn / 100, yearsToGrow);
}

// --- Safe Withdrawal Rate ---
export function safeWithdrawal(corpus: number, swr: number): number {
  return corpus * (swr / 100);
}

// --- RMD ---
export function rmd(accountBalance: number, distributionPeriod: number): number {
  return accountBalance / distributionPeriod;
}

// IRS Uniform Lifetime Table approximation
export function getDistributionPeriod(age: number): number {
  const table: Record<number, number> = {
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
    80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
    88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  };
  return table[age] || 8.9;
}

// --- Sharpe Ratio ---
export function sharpeRatio(portfolioReturn: number, riskFreeRate: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (portfolioReturn - riskFreeRate) / stdDev;
}

// --- DTI ---
export function debtToIncomeRatio(monthlyDebt: number, monthlyIncome: number): number {
  return (monthlyDebt / monthlyIncome) * 100;
}

// --- Credit Utilization ---
export function creditUtilization(totalBalance: number, totalLimit: number): number {
  return (totalBalance / totalLimit) * 100;
}

// --- Property Tax ---
export function propertyTax(assessedValue: number, millRate: number): number {
  return (assessedValue * millRate) / 1000;
}

// --- Home Equity ---
export function homeEquity(currentValue: number, remainingBalance: number): number {
  return currentValue - remainingBalance;
}

export function loanToValue(loanBalance: number, propertyValue: number): number {
  return (loanBalance / propertyValue) * 100;
}

// --- Self-Employment Tax ---
export function selfEmploymentTax(netSelfEmploymentIncome: number): { seTax: number; deductible: number } {
  const netEarnings = netSelfEmploymentIncome * 0.9235;
  const seTax = netEarnings * 0.153;
  const deductible = seTax / 2;
  return { seTax, deductible };
}

// --- US Income Tax Brackets 2024 ---
const TAX_BRACKETS_SINGLE_2024 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

export function calcFederalTax(taxableIncome: number): number {
  let tax = 0;
  for (const bracket of TAX_BRACKETS_SINGLE_2024) {
    if (taxableIncome <= bracket.min) break;
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

export function effectiveTaxRate(tax: number, income: number): number {
  return income > 0 ? (tax / income) * 100 : 0;
}

// --- FIRE Progress ---
export function fireProgressPercent(currentNetWorth: number, fireNumber: number): number {
  return Math.min(100, (currentNetWorth / fireNumber) * 100);
}

// --- Savings Rate ---
export function savingsRate(monthlySavings: number, monthlyIncome: number): number {
  return (monthlySavings / monthlyIncome) * 100;
}

// --- Generate Projection Data ---
export interface ProjectionYear {
  year: number;
  age?: number;
  value: number;
  contributions: number;
  interest: number;
  inflationAdjustedValue: number;
}

export function generateProjections(
  initialValue: number,
  annualContribution: number,
  annualReturn: number,
  inflationRate: number,
  years: number,
  startAge?: number,
): ProjectionYear[] {
  const data: ProjectionYear[] = [];
  let value = initialValue;
  let totalContributions = initialValue;
  let totalInterest = 0;

  for (let y = 1; y <= years; y++) {
    const interest = value * (annualReturn / 100);
    value = value + interest + annualContribution;
    totalContributions += annualContribution;
    totalInterest += interest;
    data.push({
      year: new Date().getFullYear() + y,
      age: startAge ? startAge + y : undefined,
      value,
      contributions: totalContributions,
      interest: totalInterest,
      inflationAdjustedValue: inflationAdjusted(value, inflationRate, y),
    });
  }
  return data;
}
