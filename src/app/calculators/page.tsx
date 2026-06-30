"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { CALCULATORS, CATEGORY_META, getAllCategories, type CalculatorCategory } from "@/lib/calculators";

export default function CalculatorsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CalculatorCategory | "all">("all");
  const [filter, setFilter] = useState<"all" | "popular" | "featured">("all");
  const categories = getAllCategories();

  const filtered = useMemo(() => {
    return CALCULATORS.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        c.name.toLowerCase().includes(q) ||
        c.shortDescription?.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q)) ||
        c.category.toLowerCase().includes(q);
      const matchesCat = category === "all" || c.category === category;
      const matchesFilter =
        filter === "all" ||
        (filter === "popular" && c.popular) ||
        (filter === "featured" && c.featured);
      return matchesSearch && matchesCat && matchesFilter;
    });
  }, [search, category, filter]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-start gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              🧮 {CALCULATORS.length}+ Free Calculators
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">All Financial Calculators</h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl">
              Professional-grade calculators for every financial decision — from retirement planning to mortgage payments, investing, and more.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search by name, category, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Filter pills */}
          <div className="flex items-center gap-2">
            {(["all", "popular", "featured"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {f === "popular" ? "🔥 Popular" : f === "featured" ? "⭐ Featured" : "All"}
              </button>
            ))}
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Showing <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span> of {CALCULATORS.length} calculators
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-[var(--border)]">
          <button
            onClick={() => setCategory("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              category === "all"
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            All ({CALCULATORS.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                category === cat
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {CATEGORY_META[cat].icon} {CATEGORY_META[cat].name}
              <span className={`ml-0.5 ${category === cat ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>
                ({CALCULATORS.filter(c => c.category === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* Calculator grid */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-[var(--foreground)]">No calculators found</p>
            <p className="text-[var(--muted-foreground)] text-sm mt-1 mb-4">Try a different search term or clear the filters</p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); setFilter("all"); }}
              className="rounded-xl bg-[var(--primary)] text-white px-6 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(calc => (
              <Link key={calc.id} href={`/calculator/${calc.slug}`} className="group">
                <div className="relative flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[var(--primary)]/40 hover:shadow-md hover:-translate-y-0.5">
                  {/* Badge */}
                  {(calc.popular || calc.featured) && (
                    <div className="absolute top-3 right-3">
                      {calc.popular
                        ? <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">HOT</span>
                        : <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">TOP</span>
                      }
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${calc.color} text-lg`}>
                    {calc.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pr-6">
                    <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">{calc.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{calc.shortDescription}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-[var(--muted-foreground)]">{CATEGORY_META[calc.category].icon} {CATEGORY_META[calc.category].name}</span>
                      {calc.timeToComplete && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">· ⏱ {calc.timeToComplete}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Category sections when showing all */}
        {category === "all" && !search && filter === "all" && (
          <div className="mt-16 pt-10 border-t border-[var(--border)]">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Browse by Category</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(cat => {
                const catCalcs = CALCULATORS.filter(c => c.category === cat);
                const meta = CATEGORY_META[cat];
                return (
                  <div key={cat} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} text-xl shadow-sm`}>
                        {meta.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">{meta.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">{catCalcs.length} calculators</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {catCalcs.slice(0, 4).map(c => (
                        <li key={c.id}>
                          <Link href={`/calculator/${c.slug}`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors flex items-center gap-1">
                            <span className="text-xs">→</span> {c.name}
                          </Link>
                        </li>
                      ))}
                      {catCalcs.length > 4 && (
                        <li>
                          <button onClick={() => setCategory(cat)} className="text-xs font-semibold text-[var(--primary)] hover:underline">
                            +{catCalcs.length - 4} more →
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
