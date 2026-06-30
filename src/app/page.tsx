import Link from "next/link";
import { CALCULATORS, CATEGORY_META, getAllCategories, getFeaturedCalculators, getPopularCalculators } from "@/lib/calculators";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, Reveal, AnimatedBlob } from "@/components/animations/Motion";

export default function HomePage() {
  const categories = getAllCategories();
  const featured = getFeaturedCalculators().slice(0, 6);
  const popular = getPopularCalculators().slice(0, 9);

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--card)] border-b border-[var(--border)]">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 hero-mesh-animated opacity-70" />
        <AnimatedBlob className="top-0 right-0" color="rgba(99,102,241,0.18)" size={560} opacity={1} duration={9} />
        <AnimatedBlob className="-bottom-20 -left-20" color="rgba(139,92,246,0.14)" size={380} opacity={1} duration={11} />
        <AnimatedBlob className="top-1/2 left-1/3" color="rgba(6,182,212,0.08)" size={300} opacity={1} duration={13} />

        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28 text-center">
          <FadeIn delay={0.05}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-1.5 text-sm font-medium text-[var(--muted-foreground)] mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              100+ Free Financial Calculators — Updated 2024
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] mb-6">
              Make <span className="gradient-text">Smarter</span> Financial{" "}
              <span className="gradient-text">Decisions</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Professional-grade calculators for FIRE planning, retirement, investing, mortgages, loans, and taxes — all free, accurate, and instant.
            </p>
          </FadeIn>

          <FadeIn delay={0.28}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link
                href="/calculators"
                className="w-full sm:w-auto rounded-xl bg-[var(--primary)] text-white px-7 py-3.5 font-semibold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Browse All 100+ Calculators →
              </Link>
              <Link
                href="/calculator/fire-calculator"
                className="w-full sm:w-auto rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-7 py-3.5 font-semibold text-sm text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
              >
                Try FIRE Calculator
              </Link>
            </div>
          </FadeIn>

          {/* Trust signals */}
          <FadeIn delay={0.36}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-[var(--muted-foreground)]">
              {["100% Free Forever", "No Sign-up Required", "Real-time Results", "AI-Powered Insights", "Export PDF & CSV"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> {t}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto max-w-6xl px-4 py-5 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center" staggerChildren={0.1}>
            {[
              { value: "100+", label: "Calculators", icon: "🧮" },
              { value: "11",   label: "Categories",  icon: "📂" },
              { value: "500K+",label: "Monthly Users",icon: "👥" },
              { value: "Free", label: "Always",       icon: "✨" },
            ].map(s => (
              <StaggerItem key={s.label}>
                <div className="flex items-center justify-center gap-2.5">
                  <span className="text-xl">{s.icon}</span>
                  <div className="text-left">
                    <div className="text-lg font-bold text-[var(--foreground)]">{s.value}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{s.label}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 space-y-16">

        {/* ── Featured ── */}
        <section>
          <SlideUp className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-1">Most Popular</p>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Featured Calculators</h2>
            </div>
            <Link href="/calculators?filter=featured" className="text-sm font-medium text-[var(--primary)] hover:underline hidden sm:block">
              View all →
            </Link>
          </SlideUp>
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((calc, i) => (
              <StaggerItem key={calc.id}>
                <Link href={`/calculator/${calc.slug}`} className="group block h-full">
                  <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 premium-card card-shadow hover:border-[var(--primary)] transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${calc.color} text-2xl shadow-sm`}>
                        {calc.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-snug">{calc.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{calc.category.replace("-", " ")}</p>
                      </div>
                      {i < 3 && (
                        <span className="shrink-0 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Top</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">{calc.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      {calc.timeToComplete && (
                        <span className="text-xs text-[var(--muted-foreground)]">⏱ {calc.timeToComplete}</span>
                      )}
                      <span className="ml-auto text-xs font-semibold text-[var(--primary)] group-hover:underline">Open →</span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ── Categories ── */}
        <section>
          <SlideUp className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-1">Explore</p>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Browse by Category</h2>
          </SlideUp>
          <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" staggerChildren={0.06}>
            {categories.map(cat => {
              const m = CATEGORY_META[cat];
              const count = CALCULATORS.filter(c => c.category === cat).length;
              return (
                <StaggerItem key={cat}>
                  <Link href={`/category/${cat}`} className="group block">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center premium-card card-shadow hover:border-[var(--primary)] transition-all">
                      <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-xl shadow-sm`}>
                        {m.icon}
                      </div>
                      <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">{m.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">{count} calculators</p>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* ── Popular list ── */}
        <section>
          <SlideUp className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-1">Trending</p>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Popular Right Now</h2>
            </div>
            <Link href="/calculators?filter=popular" className="text-sm font-medium text-[var(--primary)] hover:underline hidden sm:block">
              View all →
            </Link>
          </SlideUp>
          <StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" staggerChildren={0.06}>
            {popular.map((calc, i) => (
              <StaggerItem key={calc.id}>
                <Link href={`/calculator/${calc.slug}`} className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] card-shadow premium-card transition-all">
                  <span className="shrink-0 text-2xl font-black text-[var(--border)] w-6 text-center">{i + 1}</span>
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${calc.color} text-lg shadow-sm`}>{calc.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">{calc.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{calc.shortDescription}</p>
                  </div>
                  <span className="shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">→</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ── Why us ── */}
        <Reveal>
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 lg:p-12 card-shadow">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-2">Why FinCalcPro</p>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Built for Serious Financial Planning</h2>
            </div>
            <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerChildren={0.1}>
              {[
                { icon: "⚡", title: "Instant Results", desc: "Real-time calculation as you type. No submit buttons, no waiting." },
                { icon: "🤖", title: "AI Insights", desc: "Every calculator provides personalized analysis of your financial situation." },
                { icon: "📊", title: "Visual Charts", desc: "Interactive charts show projections, breakdowns, and scenario analysis." },
                { icon: "📥", title: "Export Everything", desc: "Download results as PDF, CSV, or Excel for your records and advisors." },
              ].map(f => (
                <StaggerItem key={f.title}>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-2xl">
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{f.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </Reveal>

      </div>
    </div>
  );
}
