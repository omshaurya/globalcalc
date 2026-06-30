import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Tools Hub – Free Planning Tools",
  description: "Access our complete suite of financial planning tools — from inflation trackers to budget planners, debt calculators, investment analyzers, and more.",
};

const TOOL_SECTIONS = [
  {
    title: "Investment & Wealth Tools",
    icon: "📈",
    color: "from-indigo-500 to-purple-600",
    tools: [
      { name: "FIRE Calculator", desc: "Find your Financial Independence number", href: "/calculator/fire-calculator", badge: "Popular" },
      { name: "SIP Calculator", desc: "Plan your monthly SIP investments", href: "/calculator/sip-calculator", badge: "Popular" },
      { name: "Step-Up SIP Calculator", desc: "Accelerate wealth with annual SIP increases", href: "/calculator/step-up-sip-calculator", badge: "New" },
      { name: "Compound Interest Simulator", desc: "See how compound interest builds wealth", href: "/calculator/compound-interest-calculator" },
      { name: "Investment Return Calculator", desc: "Analyze returns across any investment", href: "/calculator/investment-return-calculator" },
      { name: "CAGR Calculator", desc: "Calculate compound annual growth rate", href: "/calculator/cagr-calculator" },
      { name: "Lump Sum Calculator", desc: "One-time investment projections", href: "/calculator/lump-sum-calculator" },
      { name: "ROI Calculator", desc: "Return on investment analysis", href: "/calculator/roi-calculator" },
    ],
  },
  {
    title: "Retirement Planning Tools",
    icon: "🏖️",
    color: "from-amber-500 to-orange-500",
    tools: [
      { name: "Retirement Calculator", desc: "Plan your retirement savings precisely", href: "/calculator/retirement-calculator", badge: "Featured" },
      { name: "401(k) Calculator", desc: "Maximize your employer-sponsored savings", href: "/calculator/401k-calculator" },
      { name: "Roth IRA Calculator", desc: "Tax-free retirement growth projections", href: "/calculator/roth-ira-calculator" },
      { name: "Social Security Calculator", desc: "Estimate your Social Security benefits", href: "/calculator/social-security-calculator" },
      { name: "Retirement Withdrawal", desc: "Plan sustainable portfolio withdrawals", href: "/calculator/retirement-withdrawal-calculator" },
      { name: "Pension Calculator", desc: "Defined benefit pension analysis", href: "/calculator/pension-calculator" },
    ],
  },
  {
    title: "Mortgage & Real Estate",
    icon: "🏠",
    color: "from-green-500 to-emerald-500",
    tools: [
      { name: "Mortgage Calculator", desc: "Monthly payment & amortization", href: "/calculator/mortgage-calculator", badge: "Popular" },
      { name: "Mortgage Affordability", desc: "How much house can you afford?", href: "/calculator/mortgage-affordability-calculator" },
      { name: "Mortgage Payoff Calculator", desc: "Pay off your home faster", href: "/calculator/mortgage-payoff-calculator" },
      { name: "Refinance Calculator", desc: "Should you refinance your mortgage?", href: "/calculator/mortgage-refinance-calculator" },
      { name: "Home Equity Calculator", desc: "Calculate your home equity & LTV", href: "/calculator/home-equity-calculator" },
      { name: "Rent vs Buy Calculator", desc: "Is it better to rent or buy?", href: "/calculator/rent-vs-buy-calculator" },
    ],
  },
  {
    title: "Loans & Debt Management",
    icon: "💳",
    color: "from-red-500 to-rose-500",
    tools: [
      { name: "EMI Calculator", desc: "Loan EMI and amortization", href: "/calculator/emi-calculator", badge: "Popular" },
      { name: "Debt Payoff Planner", desc: "Pay off debt faster with snowball/avalanche", href: "/calculator/credit-card-payoff-calculator" },
      { name: "Debt-to-Income Calculator", desc: "Check your debt-to-income ratio", href: "/calculator/debt-to-income-calculator" },
      { name: "Personal Loan Calculator", desc: "Personal loan payment estimates", href: "/calculator/personal-loan-calculator" },
      { name: "Auto Loan Calculator", desc: "Car payment calculations", href: "/calculator/car-loan-calculator" },
      { name: "Student Loan Calculator", desc: "Plan student loan repayment", href: "/calculator/student-loan-calculator" },
    ],
  },
  {
    title: "Budget & Savings Tools",
    icon: "💰",
    color: "from-cyan-500 to-blue-500",
    tools: [
      { name: "Budget Planner", desc: "50/30/20 budget analysis", href: "/calculator/budget-planner-calculator", badge: "Featured" },
      { name: "Savings Goal Calculator", desc: "Time to reach your savings goal", href: "/calculator/savings-goal-calculator" },
      { name: "Emergency Fund Calculator", desc: "How much emergency fund you need", href: "/calculator/emergency-fund-calculator" },
      { name: "Net Worth Calculator", desc: "Track your total net worth", href: "/calculator/net-worth-calculator" },
      { name: "Cost of Living Calculator", desc: "Compare costs across cities", href: "/calculator/cost-of-living-calculator" },
      { name: "Pay Raise Calculator", desc: "Impact of a salary increase", href: "/calculator/pay-raise-calculator" },
    ],
  },
  {
    title: "Tax Planning Tools",
    icon: "🧾",
    color: "from-slate-500 to-gray-600",
    tools: [
      { name: "Income Tax Calculator", desc: "Federal & state income tax estimation", href: "/calculator/income-tax-calculator", badge: "Popular" },
      { name: "Capital Gains Calculator", desc: "Short & long-term capital gains tax", href: "/calculator/capital-gains-calculator" },
      { name: "Tax Bracket Finder", desc: "Find your effective tax rate", href: "/calculator/tax-bracket-calculator" },
      { name: "Self-Employment Tax", desc: "SE tax for freelancers and contractors", href: "/calculator/self-employment-tax-calculator" },
      { name: "VAT Calculator", desc: "Value-added tax calculations", href: "/calculator/vat-calculator" },
    ],
  },
];

const QUICK_STATS = [
  { label: "Free Tools", value: "100+", icon: "🛠️" },
  { label: "Countries Covered", value: "20+", icon: "🌍" },
  { label: "Monthly Users", value: "500K+", icon: "👥" },
  { label: "Calculations/Day", value: "2M+", icon: "⚡" },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
              🛠️ Financial Tools Hub
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
              Every Financial Tool<br />You&apos;ll Ever Need
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] mb-8">
              Professional-grade financial calculators and planning tools used by 500,000+ users across 20+ countries. Free, accurate, and instant.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/calculators" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                Browse All Calculators →
              </Link>
              <Link href="/calculator/fire-calculator" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-6 py-3 text-sm font-semibold hover:bg-[var(--muted)] transition-colors">
                🔥 Try FIRE Calculator
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {QUICK_STATS.map(stat => (
              <div key={stat.label} className="text-center rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tool sections */}
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 space-y-16">
        {TOOL_SECTIONS.map(section => (
          <div key={section.title}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} text-xl shadow-sm`}>
                {section.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">{section.title}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{section.tools.length} tools available</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.tools.map(tool => (
                <Link key={tool.name} href={tool.href} className="group">
                  <div className="relative flex flex-col gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 h-full transition-all hover:border-[var(--primary)]/50 hover:shadow-md hover:-translate-y-0.5">
                    {tool.badge && (
                      <span className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        tool.badge === "New" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                        tool.badge === "Popular" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                      }`}>
                        {tool.badge}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors pr-12">
                      {tool.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{tool.desc}</p>
                    <span className="text-xs text-[var(--primary)] font-medium mt-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open calculator →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Can&apos;t find what you need?</h2>
          <p className="text-[var(--muted-foreground)] mb-6">We have 100+ calculators. Use our search to find the perfect tool for your situation.</p>
          <Link href="/calculators" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] text-white px-8 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            Browse All 100+ Calculators →
          </Link>
        </div>
      </div>
    </div>
  );
}
