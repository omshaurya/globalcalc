"use client";
import Link from "next/link";
import { type CalculatorMeta, CATEGORY_META, getRelatedCalculators } from "@/lib/calculators";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { CurrencyProvider, CURRENCIES, useCurrency } from "@/context/CurrencyContext";

function CurrencyDropdown() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="relative">
      <select
        value={currency}
        onChange={e => setCurrency(e.target.value)}
        className="appearance-none cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card)] pl-3 pr-7 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
        aria-label="Select currency"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs">▾</span>
    </div>
  );
}

interface CalculatorLayoutProps {
  meta: CalculatorMeta;
  children: React.ReactNode;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  fire:          "from-orange-500/20 via-red-500/10 to-transparent",
  retirement:    "from-blue-500/20 via-indigo-500/10 to-transparent",
  investing:     "from-emerald-500/20 via-teal-500/10 to-transparent",
  "real-estate": "from-amber-500/20 via-yellow-500/10 to-transparent",
  loans:         "from-purple-500/20 via-violet-500/10 to-transparent",
  savings:       "from-cyan-500/20 via-sky-500/10 to-transparent",
  taxes:         "from-rose-500/20 via-pink-500/10 to-transparent",
  business:      "from-indigo-500/20 via-blue-500/10 to-transparent",
  personal:      "from-violet-500/20 via-purple-500/10 to-transparent",
  banking:       "from-teal-500/20 via-emerald-500/10 to-transparent",
  insurance:     "from-sky-500/20 via-blue-500/10 to-transparent",
};

export default function CalculatorLayout({ meta, children }: CalculatorLayoutProps) {
  const { toast } = useToast();
  const related = getRelatedCalculators(meta.related).slice(0, 8);
  const catMeta = CATEGORY_META[meta.category];
  const grad = CATEGORY_GRADIENTS[meta.category] ?? "from-indigo-500/20 to-transparent";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: meta.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard!", "success");
    }
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Hero */}
        <div className={`relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-br ${grad} bg-[var(--card)]`}>
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.04] blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <li><Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link></li>
                <li className="opacity-30">/</li>
                <li><Link href="/calculators" className="hover:text-[var(--foreground)] transition-colors">Calculators</Link></li>
                <li className="opacity-30">/</li>
                <li><Link href={`/category/${meta.category}`} className="hover:text-[var(--primary)] transition-colors">{catMeta.name}</Link></li>
                <li className="opacity-30">/</li>
                <li className="text-[var(--foreground)] font-medium truncate max-w-[160px]">{meta.name}</li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`hidden sm:flex shrink-0 h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${catMeta.color} text-2xl shadow-md`}>
                  {meta.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="default">{catMeta.name}</Badge>
                    {meta.popular && <Badge variant="success">Popular</Badge>}
                    {meta.featured && <Badge variant="warning">Featured</Badge>}
                    {meta.timeToComplete && <Badge variant="outline">&#x23F1; {meta.timeToComplete}</Badge>}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--foreground)] tracking-tight mb-1.5">{meta.name}</h1>
                  <p className="text-[var(--muted-foreground)] text-sm sm:text-base max-w-2xl leading-relaxed">{meta.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
                      Free &bull; Accurate &bull; Updated 2024
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <CurrencyDropdown />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                >
                  &#128228; <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {children}

          {/* Related Calculators */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--foreground)]">Related Calculators</h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">More tools you might find useful</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {related.map(r => (
                  <Link
                    key={r.id}
                    href={`/calculator/${r.slug}`}
                    className="group flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 card-shadow"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">{r.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2 leading-snug">{r.shortDescription}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-5 py-4">
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              <strong className="text-[var(--foreground)]">Disclaimer:</strong> This calculator is for informational and educational purposes only. Results are estimates based on inputs you provide. They are not financial, tax, investment, or legal advice. Consult a qualified financial professional before making financial decisions. Actual results may vary based on market conditions, tax laws, and individual circumstances.
            </p>
          </div>
        </div>
      </div>
    </CurrencyProvider>
  );
}
