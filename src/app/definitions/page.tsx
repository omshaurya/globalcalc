import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Definitions – FinCalcPro",
  description: "Key financial concepts and calculator input definitions. Understand exactly what each input and output in our calculators means.",
};

const DEFINITION_GROUPS = [
  {
    title: "Calculator Inputs",
    icon: "📥",
    defs: [
      { term: "Principal / Initial Investment", def: "The starting amount of money you invest or borrow. In loan calculators, this is the amount borrowed. In investment calculators, this is your opening balance." },
      { term: "Annual Interest Rate / Expected Return", def: "The yearly percentage rate applied to your balance. For loans, this is the rate charged by the lender. For investments, this is the assumed annual growth rate." },
      { term: "Time Period / Tenure", def: "The duration of the loan or investment, usually expressed in years or months. Longer periods result in more growth (investments) or more interest paid (loans)." },
      { term: "Compounding Frequency", def: "How often interest is calculated and added to your balance. Daily compounding earns slightly more than monthly, which earns more than annual — all at the same nominal rate." },
      { term: "Monthly Contribution / SIP Amount", def: "The fixed amount added to an investment every month. Regular contributions dramatically accelerate wealth building through consistent dollar-cost averaging." },
      { term: "Inflation Rate", def: "The assumed annual rate at which prices rise. Used in retirement and FIRE calculators to show the 'real' purchasing power of future money." },
      { term: "Down Payment", def: "The upfront cash portion paid when purchasing a property or vehicle. A higher down payment reduces the loan amount, monthly payment, and total interest paid." },
      { term: "Step-Up Rate", def: "The annual percentage by which you increase your SIP contribution each year. A 10% step-up means if you invest ₹5,000 in Year 1, you invest ₹5,500 in Year 2." },
    ],
  },
  {
    title: "Calculator Outputs",
    icon: "📤",
    defs: [
      { term: "Future Value (FV)", def: "The projected total value of an investment at a future date, based on assumed growth rates and contributions. This is the headline number in most investment calculators." },
      { term: "Total Invested / Total Principal", def: "The sum of all money you have put into an investment — your initial amount plus all subsequent contributions. Excludes any growth or interest earned." },
      { term: "Wealth Gained / Interest Earned", def: "The difference between Future Value and Total Invested. This is the money your money made for you — the power of compound interest." },
      { term: "Absolute Return", def: "Total percentage gain calculated as: (Wealth Gained / Total Invested) × 100. Shows total return without accounting for the time taken." },
      { term: "CAGR (Compound Annual Growth Rate)", def: "The annualised return rate that would produce the same end result as the actual investment performance. Useful for comparing investments over different time periods." },
      { term: "Monthly EMI / Payment", def: "The fixed amount you pay every month on a loan, covering both interest and principal repayment. Remains constant throughout the loan term for fixed-rate loans." },
      { term: "Total Interest Payable", def: "The total amount of interest you will pay over the entire loan term. Calculated as (Monthly Payment × Total Months) − Principal." },
      { term: "FIRE Number", def: "The total portfolio value needed to safely retire and live off investment returns indefinitely. Typically calculated as Annual Expenses × 25, based on the 4% safe withdrawal rate." },
    ],
  },
  {
    title: "Rates & Percentages",
    icon: "📊",
    defs: [
      { term: "Nominal Rate", def: "The stated or advertised interest rate before accounting for compounding. A 12% nominal rate compounded monthly is different from 12% compounded annually." },
      { term: "Effective Rate (EAR / APY)", def: "The actual annual return after accounting for compounding within the year. Always higher than the nominal rate when compounding occurs more than once per year." },
      { term: "Real Return", def: "Investment return after adjusting for inflation. If your investment returns 8% and inflation is 3%, your real return is approximately 5%." },
      { term: "Marginal Tax Rate", def: "The tax rate applied to the last dollar of income earned. In progressive tax systems, each income bracket has its own rate — your marginal rate is the highest bracket you reach." },
      { term: "Effective Tax Rate", def: "The average tax rate you actually pay on your total income, calculated as Total Tax Paid ÷ Total Taxable Income. Always lower than your marginal rate in progressive systems." },
      { term: "Withdrawal Rate", def: "The percentage of your investment portfolio you withdraw each year in retirement. The widely cited '4% rule' suggests 4% is sustainable over a 30-year retirement." },
    ],
  },
];

export default function DefinitionsPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-14">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            Definitions
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Understand exactly what every input and output in our calculators means — in plain English, with no jargon.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8 space-y-12">
        {DEFINITION_GROUPS.map(group => (
          <div key={group.title}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{group.icon}</span>
              <h2 className="text-xl font-bold text-[var(--foreground)]">{group.title}</h2>
            </div>
            <div className="space-y-3">
              {group.defs.map(d => (
                <div key={d.term} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <h3 className="font-semibold text-[var(--foreground)] mb-1.5">{d.term}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{d.def}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Looking for more terms?</p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Our full glossary has 25+ financial terms defined alphabetically.</p>
          <Link href="/glossary" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
            Browse Full Glossary →
          </Link>
        </div>
      </div>
    </div>
  );
}
