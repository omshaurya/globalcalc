import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculator Glossary – FinCalcPro",
  description: "Plain-English definitions of financial terms used in FinCalcPro calculators. From APR to XIRR, understand every term.",
};

const TERMS: { term: string; abbr?: string; def: string; category: string }[] = [
  { term: "Annual Percentage Rate", abbr: "APR", def: "The yearly interest rate charged on a loan or earned on an investment, including fees. APR is more comprehensive than a simple interest rate.", category: "Loans & Credit" },
  { term: "Annual Percentage Yield", abbr: "APY", def: "The effective annual rate of return on a savings account or investment, accounting for compound interest. Higher than APR for the same nominal rate.", category: "Savings" },
  { term: "Amortisation", def: "The process of paying off a loan through regular instalments over time, with each payment covering both interest and principal.", category: "Loans & Credit" },
  { term: "Asset Allocation", def: "The distribution of investments across different asset classes (stocks, bonds, cash, real estate) to balance risk and return based on goals and risk tolerance.", category: "Investing" },
  { term: "Compound Annual Growth Rate", abbr: "CAGR", def: "The rate at which an investment grows from its starting to its ending value, assuming profits are reinvested each year. The 'smoothed' annual return.", category: "Investing" },
  { term: "Capital Gains", def: "The profit made from selling an asset (stock, property, etc.) for more than its purchase price. Can be short-term (under 1 year) or long-term, with different tax rates.", category: "Tax" },
  { term: "Debt-to-Income Ratio", abbr: "DTI", def: "Your total monthly debt payments divided by your gross monthly income. Lenders use DTI to assess your ability to manage monthly payments.", category: "Loans & Credit" },
  { term: "Dollar-Cost Averaging", abbr: "DCA", def: "Investing a fixed amount at regular intervals regardless of market price. Reduces the impact of volatility by buying more shares when prices are low.", category: "Investing" },
  { term: "EMI", abbr: "EMI", def: "Equated Monthly Instalment. The fixed monthly payment amount on a loan, comprising both principal and interest components.", category: "Loans & Credit" },
  { term: "Equated Monthly Instalment", abbr: "EMI", def: "See EMI.", category: "Loans & Credit" },
  { term: "Expense Ratio", def: "The annual fee charged by a mutual fund or ETF as a percentage of assets under management. A 1% expense ratio means $10 per year per $1,000 invested.", category: "Investing" },
  { term: "Financial Independence, Retire Early", abbr: "FIRE", def: "A financial movement based on extreme savings and investment to retire far earlier than the traditional age. Typically requires accumulating 25× annual expenses.", category: "Retirement" },
  { term: "Future Value", abbr: "FV", def: "The value of a current asset at a specified date in the future, based on an assumed growth rate. The core output of most investment calculators.", category: "Investing" },
  { term: "Gross Income", def: "Total income before taxes, deductions, or other withholdings. Contrasted with net (take-home) income.", category: "Tax" },
  { term: "Home Equity", def: "The portion of your home that you own outright, calculated as the property's current market value minus the outstanding mortgage balance.", category: "Mortgage" },
  { term: "Inflation", def: "The rate at which the general level of prices rises over time, eroding purchasing power. A 3% inflation rate means $100 today buys only $97 worth of goods next year.", category: "Economics" },
  { term: "Internal Rate of Return", abbr: "IRR", def: "The discount rate that makes the Net Present Value (NPV) of all cash flows equal to zero. Used to compare the profitability of investments.", category: "Investing" },
  { term: "Loan-to-Value", abbr: "LTV", def: "The ratio of a loan to the value of the asset purchased. An 80% LTV on a $400,000 home = a $320,000 loan. Higher LTV typically means higher rates or PMI.", category: "Mortgage" },
  { term: "Net Present Value", abbr: "NPV", def: "The difference between the present value of cash inflows and outflows over a period of time. A positive NPV means an investment adds value.", category: "Investing" },
  { term: "Net Worth", def: "Total assets (savings, investments, property, etc.) minus total liabilities (loans, credit card debt, etc.). A key measure of financial health.", category: "Personal Finance" },
  { term: "Present Value", abbr: "PV", def: "The current value of a future sum of money, discounted at a specific rate. $100 in 5 years is worth less than $100 today due to inflation and opportunity cost.", category: "Investing" },
  { term: "Principal", def: "The original amount of money borrowed in a loan, or the initial investment amount, before interest is added.", category: "Loans & Credit" },
  { term: "Return on Investment", abbr: "ROI", def: "A measure of the profitability of an investment, calculated as net profit divided by the cost of investment, expressed as a percentage.", category: "Investing" },
  { term: "Safe Withdrawal Rate", abbr: "SWR", def: "The percentage of a portfolio that can be withdrawn annually without running out of money over a given period. The '4% rule' is the most widely cited SWR.", category: "Retirement" },
  { term: "SIP", abbr: "SIP", def: "Systematic Investment Plan. A method of investing a fixed amount regularly (typically monthly) in mutual funds. The Indian equivalent of Dollar-Cost Averaging.", category: "Investing" },
  { term: "Time Value of Money", abbr: "TVM", def: "The concept that a sum of money is worth more now than the same sum in the future due to its potential earning capacity.", category: "Economics" },
  { term: "XIRR", def: "Extended Internal Rate of Return. A function used to calculate the IRR for investments with irregular cash flows (unlike IRR which assumes regular intervals).", category: "Investing" },
];

const CATEGORIES = [...new Set(TERMS.map(t => t.category))].sort();
const LETTERS = [...new Set(TERMS.map(t => t.term.charAt(0)))].sort();

export default function GlossaryPage() {
  const grouped = LETTERS.reduce<Record<string, typeof TERMS>>((acc, letter) => {
    acc[letter] = TERMS.filter(t => t.term.startsWith(letter));
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-14">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
            Calculator Glossary
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Plain-English definitions of every financial term used across FinCalcPro calculators.
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">{TERMS.length} terms defined</p>
        </div>
      </div>

      {/* A–Z index */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] sticky top-[57px] z-10">
        <div className="mx-auto max-w-4xl px-4 py-3 lg:px-8 flex flex-wrap gap-1.5">
          {LETTERS.map(l => (
            <a key={l} href={`#letter-${l}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8 space-y-8">
        {LETTERS.map(letter => (
          <div key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">{letter}</h2>
            <div className="space-y-3">
              {grouped[letter].map(term => (
                <div key={term.term} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {term.term}
                      {term.abbr && term.abbr !== term.term && (
                        <span className="ml-2 text-xs font-bold text-[var(--primary)] bg-indigo-100 dark:bg-indigo-900/30 rounded px-1.5 py-0.5">{term.abbr}</span>
                      )}
                    </h3>
                    <span className="shrink-0 rounded-full bg-[var(--muted)] border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)]">{term.category}</span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{term.def}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
