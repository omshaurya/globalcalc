"use client";
import Link from "next/link";
import { useState } from "react";
import { CALCULATORS, CATEGORY_META, getAllCategories } from "@/lib/calculators";

const FINANCIAL_TOOLS = [
  { name: "Compound Interest Simulator", href: "/calculator/compound-interest-calculator" },
  { name: "SIP Planner", href: "/calculator/sip-calculator" },
  { name: "Retirement Planner", href: "/calculator/retirement-calculator" },
  { name: "FIRE Calculator", href: "/calculator/fire-calculator" },
  { name: "Budget Planner", href: "/calculator/budget-planner-calculator" },
  { name: "Net Worth Tracker", href: "/calculator/net-worth-calculator" },
  { name: "Debt Payoff Planner", href: "/calculator/credit-card-payoff-calculator" },
  { name: "Savings Goal Planner", href: "/calculator/savings-goal-calculator" },
  { name: "Investment Return Analyzer", href: "/calculator/investment-return-calculator" },
  { name: "EMI Comparison Tool", href: "/calculator/emi-calculator" },
  { name: "Mortgage Affordability", href: "/calculator/mortgage-calculator" },
  { name: "Portfolio Allocation", href: "/calculator/portfolio-allocation-calculator" },
];

const COMPANY_LINKS = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Blog", href: "/blog" },
  { name: "Careers", href: "/careers" },
  { name: "Advertise With Us", href: "/advertise" },
];

const DEVELOPER_LINKS = [
  { name: "API Documentation", href: "/api-docs" },
  { name: "Developer Portal", href: "/developers" },
  { name: "Formulas Used", href: "/formulas" },
  { name: "Calculator Glossary", href: "/glossary" },
  { name: "Definitions", href: "/definitions" },
];

const SOCIAL_LINKS = [
  {
    name: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 5.894zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

const TRUST_BADGES = [
  { icon: "🔒", label: "SSL Secured" },
  { icon: "✓", label: "GDPR Compliant" },
  { icon: "♿", label: "WCAG 2.2 AA" },
  { icon: "⚡", label: "< 2s Load Time" },
];

export default function Footer() {
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      setSubStatus(res.ok ? "success" : "error");
    } catch {
      setSubStatus("error");
    }
  };
  const categories = getAllCategories();
  const popularCalcs = CALCULATORS.filter(c => c.popular).slice(0, 10);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-16">

      {/* Newsletter bar */}
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-cyan-600/10">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[var(--foreground)] text-sm">📬 Get financial tips & calculator updates</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Join 50,000+ subscribers. No spam, unsubscribe anytime.</p>
            </div>
            {subStatus === "success" ? (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">&#10003; Subscribed! Thanks for joining.</p>
            ) : (
              <form className="flex gap-2 w-full sm:w-auto" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  className="flex-1 sm:w-56 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={subStatus === "sending"}
                  className="rounded-xl bg-[var(--primary)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 disabled:opacity-60"
                >
                  {subStatus === "sending" ? "..." : "Subscribe"}
                </button>
                {subStatus === "error" && <p className="text-xs text-red-500 mt-1">Failed, try again.</p>}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Col 1 — Brand + About */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md">FC</div>
              <span className="text-lg font-bold text-[var(--foreground)]">FinCalc<span className="text-[var(--primary)]">Pro</span></span>
            </Link>

            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">
              The world&apos;s most comprehensive suite of free financial calculators. Trusted by 500,000+ users across 50+ countries for accurate, instant financial planning.
            </p>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-5 border-l-2 border-[var(--primary)] pl-3">
              Our mission: make professional-grade financial tools accessible to everyone, everywhere — for free.
            </p>

            {/* Social links */}
            <div className="flex gap-2 mb-5">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {TRUST_BADGES.map(b => (
                <span key={b.label} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                  <span>{b.icon}</span> {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2 — Calculator Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-4">Calculator Categories</h3>
            <ul className="space-y-2.5">
              {categories.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/category/${cat}`}
                    className="group flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    <span className="text-base leading-none">{CATEGORY_META[cat].icon}</span>
                    <span>{CATEGORY_META[cat].name}</span>
                    <span className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/calculators" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                  All 100+ Calculators →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Popular Calculators */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-4">Popular Calculators</h3>
            <ul className="space-y-2.5">
              {popularCalcs.map(c => (
                <li key={c.id}>
                  <Link
                    href={`/calculator/${c.slug}`}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Financial Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-4">Financial Tools</h3>
            <ul className="space-y-2.5">
              {FINANCIAL_TOOLS.map(t => (
                <li key={t.name}>
                  <Link
                    href={t.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Company & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-4">Company</h3>
            <ul className="space-y-2.5 mb-4">
              {COMPANY_LINKS.map(l => (
                <li key={l.name}>
                  <Link href={l.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">{l.name}</Link>
                </li>
              ))}
            </ul>

            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-4">Developers</h3>
            <ul className="space-y-2.5">
              {DEVELOPER_LINKS.map(l => (
                <li key={l.name}>
                  <Link href={l.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Country coverage */}
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-6 py-4">
          <p className="text-xs font-semibold text-[var(--foreground)] mb-2">🌍 Serving users in 50+ countries</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {["🇺🇸 USA", "🇬🇧 UK", "🇨🇦 Canada", "🇦🇺 Australia", "🇦🇪 UAE", "🇩🇪 Germany", "🇫🇷 France", "🇮🇳 India", "🇸🇬 Singapore", "🇳🇿 New Zealand", "🇨🇭 Switzerland", "🇳🇱 Netherlands"].map(c => (
              <span key={c} className="text-xs text-[var(--muted-foreground)]">{c}</span>
            ))}
            <span className="text-xs text-[var(--muted-foreground)]">+ 38 more</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-[var(--border)] pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} FinCalcPro. All rights reserved. For informational purposes only — not financial advice.
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Calculations are estimates. Consult a qualified financial advisor before making financial decisions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[var(--primary)] transition-colors">Cookies</Link>
            <Link href="/disclaimer" className="hover:text-[var(--primary)] transition-colors">Disclaimer</Link>
            <Link href="/accessibility" className="hover:text-[var(--primary)] transition-colors">Accessibility</Link>
            <Link href="/sitemap.xml" className="hover:text-[var(--primary)] transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
