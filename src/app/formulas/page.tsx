import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Formulas – FinCalcPro",
  description: "All financial formulas used by FinCalcPro calculators. Transparent, accurate, and explained with examples.",
};

const FORMULA_SECTIONS = [
  {
    category: "Compound Interest & Savings",
    formulas: [
      {
        name: "Compound Interest",
        formula: "A = P(1 + r/n)^(nt)",
        vars: { A: "Final amount", P: "Principal", r: "Annual rate (decimal)", n: "Compounds per year", t: "Years" },
        example: "$10,000 at 8% monthly for 10y = $10,000 × (1 + 0.08/12)^120 = $22,196",
        calc: "/calculator/compound-interest-calculator",
      },
      {
        name: "Future Value of Lump Sum",
        formula: "FV = PV × (1 + r)^n",
        vars: { FV: "Future value", PV: "Present value", r: "Rate per period", n: "Number of periods" },
        example: "$50,000 at 7% for 20y = $50,000 × (1.07)^20 = $193,484",
        calc: "/calculator/lump-sum-calculator",
      },
      {
        name: "Savings Goal Time",
        formula: "n = ln(FV/PV) / ln(1 + r)",
        vars: { n: "Periods needed", FV: "Target amount", PV: "Current savings", r: "Rate per period" },
        example: "To reach $100,000 from $20,000 at 6%/yr: n = ln(5) / ln(1.06) ≈ 27.6 years",
        calc: "/calculator/savings-goal-calculator",
      },
    ],
  },
  {
    category: "SIP & Systematic Investment",
    formulas: [
      {
        name: "SIP Future Value",
        formula: "FV = P × [((1 + r)^n - 1) / r] × (1 + r)",
        vars: { FV: "Future value", P: "Monthly SIP", r: "Monthly rate", n: "Total months" },
        example: "₹5,000/mo at 12%/yr for 10y: FV = 5000 × [(1.01^120 - 1)/0.01] × 1.01 = ₹11.6L",
        calc: "/calculator/sip-calculator",
      },
      {
        name: "CAGR",
        formula: "CAGR = (FV / IV)^(1/n) - 1",
        vars: { CAGR: "Compound annual growth rate", FV: "Final value", IV: "Initial value", n: "Years" },
        example: "$10K → $18K in 6y: CAGR = (18000/10000)^(1/6) - 1 = 10.3%",
        calc: "/calculator/cagr-calculator",
      },
    ],
  },
  {
    category: "Mortgages & Loans",
    formulas: [
      {
        name: "Monthly Mortgage Payment (EMI)",
        formula: "M = P × [r(1+r)^n] / [(1+r)^n - 1]",
        vars: { M: "Monthly payment", P: "Loan principal", r: "Monthly interest rate", n: "Total months" },
        example: "$320,000 at 7%/yr for 30y: r=0.00583, n=360 → M = $2,129/mo",
        calc: "/calculator/mortgage-calculator",
      },
      {
        name: "Loan-to-Value Ratio",
        formula: "LTV = (Loan Amount / Property Value) × 100",
        vars: { LTV: "Loan-to-value %", "Loan Amount": "Amount borrowed", "Property Value": "Appraised value" },
        example: "$320K loan on $400K home: LTV = (320,000 / 400,000) × 100 = 80%",
        calc: "/calculator/home-equity-calculator",
      },
    ],
  },
  {
    category: "Retirement & FIRE",
    formulas: [
      {
        name: "FIRE Number (4% Rule)",
        formula: "FIRE Number = Annual Expenses × 25",
        vars: { "FIRE Number": "Portfolio needed to retire", "Annual Expenses": "Yearly spending in retirement", "25": "= 1 / 4% withdrawal rate" },
        example: "$60,000/yr expenses × 25 = $1,500,000 target portfolio",
        calc: "/calculator/fire-calculator",
      },
      {
        name: "Safe Withdrawal Rate",
        formula: "Annual Withdrawal = Portfolio × SWR",
        vars: { "Annual Withdrawal": "Amount withdrawn per year", Portfolio: "Total portfolio value", SWR: "Safe withdrawal rate (typically 4%)" },
        example: "$1.5M × 4% = $60,000/yr sustainable withdrawal",
        calc: "/calculator/fire-calculator",
      },
    ],
  },
  {
    category: "ROI & Returns",
    formulas: [
      {
        name: "Return on Investment",
        formula: "ROI = (Net Profit / Cost of Investment) × 100",
        vars: { ROI: "Return on investment %", "Net Profit": "Final value minus initial cost", "Cost of Investment": "Total amount invested" },
        example: "Bought for $10,000, sold for $13,500: ROI = (3,500 / 10,000) × 100 = 35%",
        calc: "/calculator/roi-calculator",
      },
      {
        name: "Rental Yield",
        formula: "Yield = (Annual Rent / Property Value) × 100",
        vars: { Yield: "Gross rental yield %", "Annual Rent": "Yearly rental income", "Property Value": "Purchase price" },
        example: "$24,000 rent / $400,000 property = 6% gross yield",
        calc: "/calculator/rental-yield-calculator",
      },
    ],
  },
];

export default function FormulasPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-14">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            Financial Formulas Used
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Every FinCalcPro calculator is built on standard financial formulas. We believe in full transparency — here&apos;s exactly what we calculate and how.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8 space-y-12">
        {FORMULA_SECTIONS.map(section => (
          <div key={section.category}>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-5 pb-3 border-b border-[var(--border)]">{section.category}</h2>
            <div className="space-y-5">
              {section.formulas.map(f => (
                <div key={f.name} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="font-semibold text-[var(--foreground)]">{f.name}</h3>
                    <Link href={f.calc} className="shrink-0 text-xs text-[var(--primary)] hover:underline font-medium">
                      Try Calculator →
                    </Link>
                  </div>
                  <div className="rounded-xl bg-[var(--muted)] px-4 py-3 font-mono text-sm text-[var(--foreground)] mb-4">
                    {f.formula}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {Object.entries(f.vars).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="font-mono font-bold text-[var(--primary)]">{k}</span>
                        <span className="text-[var(--muted-foreground)]"> = {v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
                    <p className="text-xs text-green-800 dark:text-green-300"><span className="font-semibold">Example: </span>{f.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
