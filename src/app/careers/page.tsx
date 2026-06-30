import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers – Join FinCalcPro",
  description: "Join the FinCalcPro team. We're building the world's best free financial calculators. Remote-first, mission-driven, and growing.",
};

const OPENINGS = [
  { title: "Senior Full-Stack Engineer", dept: "Engineering", type: "Full-time · Remote", desc: "Build and scale Next.js features, improve calculator performance, and lead architecture decisions." },
  { title: "Financial Content Writer", dept: "Content", type: "Full-time · Remote", desc: "Write accurate, engaging financial guides and calculator documentation reviewed by CFPs." },
  { title: "Product Designer", dept: "Design", type: "Full-time · Remote", desc: "Design intuitive financial calculator UIs, data visualizations, and mobile experiences." },
  { title: "Data Scientist – Financial Models", dept: "Engineering", type: "Full-time · Remote", desc: "Improve calculator accuracy, build forecasting models, and validate financial formulas at scale." },
];

const BENEFITS = [
  { icon: "🌍", title: "Fully Remote", desc: "Work from anywhere in the world. We have team members in 8 countries." },
  { icon: "💰", title: "Competitive Pay", desc: "Top-of-market salaries benchmarked against major tech companies." },
  { icon: "🏥", title: "Health & Wellness", desc: "Full health, dental, and vision coverage plus a $1,500/year wellness budget." },
  { icon: "📚", title: "Learning Budget", desc: "$2,000/year for courses, books, conferences, or certifications of your choice." },
  { icon: "🏖️", title: "Unlimited PTO", desc: "We trust you to manage your time. Take what you need to do your best work." },
  { icon: "🚀", title: "Equity", desc: "Meaningful equity stake so you share in the company's success." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300 mb-4">
            🟢 We&apos;re Hiring
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            Help Us Democratize<br />Financial Planning
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Join a small, high-impact team building free financial tools used by 500,000+ people every month. Remote-first, mission-driven, and growing.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8 text-center">Why Work With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <div className="text-2xl mb-2">{b.icon}</div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">{b.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open roles */}
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Open Positions</h2>
        <div className="space-y-4">
          {OPENINGS.map(role => (
            <div key={role.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[var(--primary)] bg-indigo-100 dark:bg-indigo-900/30 rounded-full px-2 py-0.5">{role.dept}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{role.type}</span>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">{role.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{role.desc}</p>
              </div>
              <a
                href="/contact"
                className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all"
              >
                Apply →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Don&apos;t see a role that fits? We&apos;re always looking for exceptional people.{" "}
            <a href="mailto:careers@fincalcpro.com" className="text-[var(--primary)] hover:underline font-medium">
              Send us your resume →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
