import { type CalculatorMeta } from "@/lib/calculators";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type CalculatorComponent = ComponentType<{ meta: CalculatorMeta }>;

// Specialized calculators with full implementations
const SIPCalculator = dynamic(() => import("./SIPCalculator"));
const StepUpSIPCalculator = dynamic(() => import("./StepUpSIPCalculator"));
const FIRECalculator = dynamic(() => import("./FIRECalculator"));
const MortgageCalculator = dynamic(() => import("./MortgageCalculator"));
const CompoundInterestCalculator = dynamic(() => import("./CompoundInterestCalculator"));
const EMICalculator = dynamic(() => import("./EMICalculator"));
const CAGRCalculator = dynamic(() => import("./CAGRCalculator"));
const IncomeTaxCalculator = dynamic(() => import("./IncomeTaxCalculator"));
const RetirementCalculator = dynamic(() => import("./RetirementCalculator"));
const CreditCardPayoffCalculator = dynamic(() => import("./CreditCardPayoffCalculator"));
const InvestmentReturnCalculator = dynamic(() => import("./InvestmentReturnCalculator"));
const NetWorthCalculator = dynamic(() => import("./NetWorthCalculator"));
const BudgetPlannerCalculator = dynamic(() => import("./BudgetPlannerCalculator"));
const ROICalculator = dynamic(() => import("./ROICalculator"));
const SavingsGoalCalculator = dynamic(() => import("./SavingsGoalCalculator"));
const GenericCalculator = dynamic(() => import("./GenericCalculator"));

const CALCULATOR_MAP: Record<string, CalculatorComponent> = {
  // Investment & Savings
  "sip-calculator": SIPCalculator,
  "step-up-sip-calculator": StepUpSIPCalculator,
  "compound-interest-calculator": CompoundInterestCalculator,
  "cagr-calculator": CAGRCalculator,
  "investment-return-calculator": InvestmentReturnCalculator,
  "roi-calculator": ROICalculator,
  "savings-goal-calculator": SavingsGoalCalculator,

  // Retirement & FIRE
  "fire-calculator": FIRECalculator,
  "retirement-calculator": RetirementCalculator,

  // Loans & Debt
  "mortgage-calculator": MortgageCalculator,
  "emi-calculator": EMICalculator,
  "credit-card-payoff-calculator": CreditCardPayoffCalculator,

  // Tax
  "income-tax-calculator": IncomeTaxCalculator,

  // Personal Finance
  "net-worth-calculator": NetWorthCalculator,
  "budget-planner-calculator": BudgetPlannerCalculator,
};

// All remaining calculators use the intelligent generic calculator
const GENERIC_SLUGS = [
  "coast-fire-calculator", "lean-fire-calculator", "fat-fire-calculator",
  "barista-fire-calculator", "financial-independence-calculator", "retirement-age-calculator",
  "fire-progress-tracker", "401k-calculator", "roth-ira-calculator",
  "traditional-ira-calculator", "pension-calculator", "social-security-calculator",
  "safe-withdrawal-rate-calculator", "rmd-calculator", "retirement-income-calculator",
  "retirement-savings-gap-calculator", "lump-sum-calculator",
  "future-value-calculator", "present-value-calculator", "dollar-cost-averaging-calculator",
  "dividend-calculator", "drip-calculator", "annualized-return-calculator",
  "portfolio-return-calculator", "portfolio-allocation-calculator", "etf-calculator",
  "mutual-fund-calculator", "stock-average-calculator", "capital-gains-calculator",
  "inflation-adjusted-return-calculator", "risk-reward-calculator", "investment-goal-calculator",
  "mortgage-affordability-calculator", "mortgage-payoff-calculator", "rental-yield-calculator",
  "rental-roi-calculator", "cash-flow-calculator", "cap-rate-calculator",
  "cash-on-cash-calculator", "property-tax-calculator", "closing-cost-calculator",
  "mortgage-refinance-calculator", "home-equity-calculator", "personal-loan-calculator",
  "home-loan-calculator", "car-loan-calculator", "student-loan-calculator",
  "business-loan-calculator", "debt-snowball-calculator",
  "debt-avalanche-calculator", "loan-comparison-calculator",
  "emergency-fund-calculator", "high-yield-savings-calculator", "fixed-deposit-calculator",
  "recurring-deposit-calculator", "time-value-calculator", "capital-gains-tax-calculator",
  "sales-tax-calculator", "vat-calculator", "self-employment-tax-calculator",
  "crypto-tax-calculator", "irr-calculator", "npv-calculator",
  "break-even-calculator", "profit-margin-calculator", "markup-calculator",
  "revenue-growth-calculator", "business-valuation-calculator",
  "expense-ratio-calculator", "debt-to-income-calculator",
  "salary-calculator", "hourly-wage-calculator", "take-home-pay-calculator",
  "inflation-calculator", "credit-utilization-calculator", "financial-health-score-calculator",
  "currency-exchange-calculator", "interest-rate-calculator", "apr-vs-apy-calculator",
  "simple-interest-calculator", "effective-interest-rate-calculator",
  "life-insurance-calculator", "disability-insurance-calculator", "home-insurance-calculator",
  "auto-insurance-calculator", "health-insurance-affordability-calculator",
];

GENERIC_SLUGS.forEach(slug => {
  CALCULATOR_MAP[slug] = GenericCalculator;
});

export function getCalculatorComponent(slug: string): CalculatorComponent | null {
  return CALCULATOR_MAP[slug] || null;
}
