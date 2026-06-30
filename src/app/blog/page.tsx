import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog – Financial Tips & Guides | FinCalcPro",
  description: "Expert guides on retirement planning, investing, mortgages, taxes, and personal finance — written by certified financial professionals.",
};

const FEATURED = {
  title: "The Complete Guide to FIRE: How to Retire Early and Live on Your Terms",
  excerpt: "Financial Independence, Retire Early (FIRE) is more than a trend — it's a rigorous financial strategy. This comprehensive guide covers the 4% rule, savings rate math, investment vehicles, and the real numbers behind early retirement.",
  category: "Retirement & FIRE",
  date: "June 20, 2026",
  readTime: "12 min read",
  href: "/calculator/fire-calculator",
};

const POSTS = [
  { title: "Compound Interest: The Eighth Wonder of the World", excerpt: "Why starting to invest at 25 vs 35 can mean $500,000+ difference by retirement.", category: "Investing", date: "June 15, 2026", readTime: "6 min", href: "/calculator/compound-interest-calculator" },
  { title: "Fixed vs Floating Rate Mortgage: Which Is Right for You?", excerpt: "A data-driven comparison of fixed and floating rate mortgages across different market cycles.", category: "Mortgage", date: "June 10, 2026", readTime: "8 min", href: "/calculator/mortgage-calculator" },
  { title: "SIP vs Lump Sum: When Each Strategy Wins", excerpt: "Rupee-cost averaging vs timing the market — a mathematical analysis of both approaches for Indian investors.", category: "Investing", date: "June 5, 2026", readTime: "7 min", href: "/calculator/sip-calculator" },
  { title: "How to Pay Off $50,000 in Debt in 3 Years", excerpt: "Debt snowball vs debt avalanche — plus the psychology of paying off debt and staying motivated.", category: "Debt", date: "May 28, 2026", readTime: "9 min", href: "/calculator/credit-card-payoff-calculator" },
  { title: "The 50/30/20 Budget Rule: Does It Actually Work?", excerpt: "We ran 1,000 household budgets through the 50/30/20 framework and found surprising results.", category: "Budgeting", date: "May 20, 2026", readTime: "5 min", href: "/calculator/budget-planner-calculator" },
  { title: "Step-Up SIP: The Smarter Way to Invest in Mutual Funds", excerpt: "Annual step-up SIP increases aligned to your income growth can multiply your corpus by 2–3x vs regular SIP.", category: "Investing", date: "May 12, 2026", readTime: "6 min", href: "/calculator/step-up-sip-calculator" },
  { title: "Understanding Your Effective Tax Rate vs Marginal Tax Rate", excerpt: "Most people confuse marginal and effective tax rates. This guide clears up the confusion with real examples.", category: "Tax", date: "May 5, 2026", readTime: "5 min", href: "/calculator/income-tax-calculator" },
  { title: "Emergency Fund: How Much Is Enough?", excerpt: "3 months or 6 months? The right emergency fund size depends on your job security, expenses, and risk tolerance.", category: "Savings", date: "April 28, 2026", readTime: "4 min", href: "/calculator/emergency-fund-calculator" },
];

const CATEGORIES = ["All", "Investing", "Retirement & FIRE", "Mortgage", "Tax", "Debt", "Budgeting", "Savings"];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            📝 Financial Insights
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            FinCalcPro Blog
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Expert guides, financial tips, and in-depth analysis from our team of certified financial professionals.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        <Link href={FEATURED.href} className="block group mb-10">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 hover:border-[var(--primary)]/50 hover:shadow-md transition-all">
            <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 mb-4">
              ⭐ Featured · {FEATURED.category}
            </span>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors leading-tight">
              {FEATURED.title}
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">{FEATURED.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
              <span>{FEATURED.date}</span>
              <span>·</span>
              <span>{FEATURED.readTime}</span>
              <span className="ml-auto text-[var(--primary)] font-medium group-hover:underline">Read more →</span>
            </div>
          </div>
        </Link>

        {/* Post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {POSTS.map(post => (
            <Link key={post.title} href={post.href} className="block group">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 h-full hover:border-[var(--primary)]/50 hover:shadow-md transition-all flex flex-col">
                <span className="text-xs font-semibold text-[var(--primary)] mb-2">{post.category}</span>
                <h3 className="font-semibold text-[var(--foreground)] mb-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed flex-1">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-4 pt-3 border-t border-[var(--border)]">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
