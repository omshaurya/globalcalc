import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us – FinCalcPro",
  description: "Learn about FinCalcPro — our mission to make professional-grade financial calculators free and accessible to everyone.",
};

const STATS = [
  { value: "100+", label: "Free Calculators" },
  { value: "500K+", label: "Monthly Users" },
  { value: "20+", label: "Countries Covered" },
  { value: "2M+", label: "Calculations/Day" },
];

const TEAM = [
  { name: "Sarah Chen", role: "Founder & CEO", bio: "Former fintech analyst with 10+ years at Goldman Sachs. Built FinCalcPro to democratize financial planning tools." },
  { name: "Raj Patel", role: "Head of Engineering", bio: "Ex-Google engineer passionate about building fast, accessible financial tools for users worldwide." },
  { name: "Emily Brooks", role: "Head of Finance", bio: "CFA charterholder and certified financial planner who ensures every formula is accurate and up to date." },
  { name: "Marcus Kim", role: "Head of Design", bio: "Product designer focused on making complex financial concepts simple and beautiful for everyday users." },
];

const VALUES = [
  { icon: "🎯", title: "Accuracy First", desc: "Every formula is reviewed by certified financial professionals. We test against industry-standard results before publishing." },
  { icon: "🆓", title: "Always Free", desc: "Core calculators will always be free. We believe financial literacy shouldn't be gated behind paywalls." },
  { icon: "🌍", title: "Built for Everyone", desc: "From students to CFOs, in 20+ countries. We support multiple currencies, tax systems, and financial contexts." },
  { icon: "🔒", title: "Privacy by Design", desc: "All calculations happen in your browser. We never store your financial data — it never leaves your device." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            🏢 Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-6">
            Making Financial Planning<br />Accessible to Everyone
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            FinCalcPro was founded with a simple belief: world-class financial calculators should be free, accurate, and available to anyone — not just those who can afford a financial advisor.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-[var(--primary)]">{s.value}</div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Our Mission</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          FinCalcPro started in 2021 when our founder, frustrated by inaccurate and ad-heavy financial calculators, built a better mortgage calculator for personal use. Friends and colleagues started using it, sharing it, and requesting more tools.
        </p>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Today, FinCalcPro is a platform of 100+ professionally designed calculators covering everything from retirement planning and FIRE calculations to mortgage amortization, SIP investments, EMI breakdowns, and tax estimation.
        </p>
        <p className="text-[var(--muted-foreground)] leading-relaxed">
          Every calculator is built with real financial formulas, reviewed by certified professionals, and tested for accuracy across edge cases. We update our tools whenever tax laws, contribution limits, or financial regulations change.
        </p>
      </div>

      {/* Values */}
      <div className="border-y border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-10 text-center">Meet the Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TEAM.map(m => (
            <div key={m.name} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                {m.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">{m.name}</p>
                <p className="text-xs text-[var(--primary)] font-medium mb-2">{m.role}</p>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Start Calculating</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Join 500,000+ users who trust FinCalcPro for their financial decisions.</p>
          <Link href="/calculators" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] text-white px-8 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            Browse All Calculators →
          </Link>
        </div>
      </div>
    </div>
  );
}
