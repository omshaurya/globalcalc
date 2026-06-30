import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise With Us – FinCalcPro",
  description: "Reach 500,000+ financially engaged monthly users on FinCalcPro. Advertising opportunities for financial brands.",
};

const PACKAGES = [
  {
    name: "Sponsored Calculator",
    price: "$2,500/mo",
    desc: "Your brand featured on a single high-traffic calculator page with logo, tagline, and CTA link.",
    features: ["Exclusive placement on one calculator", "Logo + tagline in header", "CTA button to your landing page", "Monthly performance report"],
  },
  {
    name: "Category Sponsor",
    price: "$6,000/mo",
    desc: "Sponsor an entire calculator category (e.g., all Mortgage calculators). Maximum visibility within your vertical.",
    features: ["All calculators in one category", "Category page banner", "Newsletter feature (50K subscribers)", "Quarterly analytics deep-dive"],
    highlight: true,
  },
  {
    name: "Homepage Feature",
    price: "$4,000/mo",
    desc: "Featured placement on the FinCalcPro homepage, seen by every visitor before they navigate to a calculator.",
    features: ["Homepage hero banner", "Featured Tools section", "Social media shoutout", "A/B creative testing"],
  },
];

const AUDIENCE = [
  { label: "Monthly Unique Visitors", value: "500K+" },
  { label: "Avg. Time on Page", value: "4.2 min" },
  { label: "Return Visitor Rate", value: "38%" },
  { label: "Countries", value: "50+" },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-4">
            📣 Advertising
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            Reach High-Intent<br />Financial Consumers
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            FinCalcPro attracts users actively researching mortgages, investments, retirement, and loans — people ready to make financial decisions.
          </p>
        </div>
      </div>

      {/* Audience stats */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {AUDIENCE.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-[var(--primary)]">{s.value}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8 text-center">Advertising Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PACKAGES.map(pkg => (
            <div key={pkg.name} className={`rounded-2xl border p-6 flex flex-col ${pkg.highlight ? "border-[var(--primary)] shadow-md" : "border-[var(--border)] bg-[var(--card)]"}`}>
              {pkg.highlight && (
                <span className="inline-block rounded-full bg-[var(--primary)] text-white text-xs font-bold px-3 py-0.5 mb-3 w-fit">Most Popular</span>
              )}
              <h3 className="font-bold text-[var(--foreground)] mb-1">{pkg.name}</h3>
              <div className="text-2xl font-bold text-[var(--primary)] mb-2">{pkg.price}</div>
              <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">{pkg.desc}</p>
              <ul className="space-y-2 flex-1">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="mt-6 rounded-xl bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Get Started →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Need a custom package? Contact us at{" "}
            <a href="mailto:partnerships@fincalcpro.com" className="text-[var(--primary)] hover:underline font-medium">
              partnerships@fincalcpro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
