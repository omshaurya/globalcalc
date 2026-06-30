"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_META, getAllCategories, CALCULATORS } from "@/lib/calculators";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const categories = getAllCategories();

  // Search results
  const results = query.trim().length > 0
    ? CALCULATORS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.shortDescription?.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : CALCULATORS.filter(c => c.featured || c.popular).slice(0, 6);

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass shadow-sm border-b border-[var(--border)]" : "bg-[var(--background)]"
      )}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Main navigation">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-sm">FC</div>
            <span className="text-lg font-bold text-[var(--foreground)]">FinCalc<span className="text-[var(--primary)]">Pro</span></span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/calculators" className="nav-link rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all">
              All Calculators
            </Link>

            {/* Categories dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all">
                Categories
                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Browse Categories</p>
                {categories.map(cat => (
                  <Link
                    key={cat}
                    href={`/category/${cat}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${CATEGORY_META[cat].color} text-sm shadow-sm`}>
                      {CATEGORY_META[cat].icon}
                    </span>
                    <div>
                      <p className="font-medium leading-tight">{CATEGORY_META[cat].name}</p>
                    </div>
                  </Link>
                ))}
                <div className="mx-4 my-2 border-t border-[var(--border)]" />
                <Link href="/calculators" className="flex items-center justify-between px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--muted)] transition-colors rounded-b-2xl">
                  View all 100+ calculators <span>→</span>
                </Link>
              </div>
            </div>

            <Link href="/tools" className="nav-link rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all">
              Tools
            </Link>
            <Link href="/calculators?filter=popular" className="nav-link rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all">
              Popular
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Search button */}
            <button
              onClick={openSearch}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-1.5 text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all min-w-[200px]"
              aria-label="Search calculators"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={openSearch}
              className="sm:hidden rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleDark}
              className="rounded-lg p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
            <Link href="/calculators" className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => setMenuOpen(false)}>
              🧮 All Calculators
            </Link>
            <Link href="/calculators?filter=popular" className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]" onClick={() => setMenuOpen(false)}>
              🔥 Popular
            </Link>
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Categories</p>
              {categories.map(cat => (
                <Link
                  key={cat}
                  href={`/category/${cat}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-base">{CATEGORY_META[cat].icon}</span>
                  <span className="font-medium">{CATEGORY_META[cat].name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Search modal overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSearchOpen(false); setQuery(""); }}
          />

          {/* Search panel */}
          <div ref={searchRef} className="relative w-full max-w-xl animate-fadeInUp">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
                <svg className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search calculators... (e.g. mortgage, SIP, FIRE)"
                  className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <kbd className="shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">Esc</kbd>
              </div>

              {/* Results */}
              <div className="py-2 max-h-80 overflow-y-auto">
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  {query.trim() ? `Results for "${query}"` : "Featured Calculators"}
                </p>
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">No calculators found for &quot;{query}&quot;</p>
                ) : (
                  results.map(calc => (
                    <Link
                      key={calc.id}
                      href={`/calculator/${calc.slug}`}
                      onClick={() => { setSearchOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)] transition-colors"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${calc.color} text-sm shadow-sm`}>
                        {calc.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{calc.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{calc.shortDescription}</p>
                      </div>
                      <span className="ml-auto shrink-0 text-xs text-[var(--muted-foreground)]">
                        {CATEGORY_META[calc.category]?.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--border)] px-4 py-2.5 flex items-center justify-between">
                <Link
                  href={`/calculators${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                  onClick={() => { setSearchOpen(false); setQuery(""); }}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Browse all 100+ calculators →
                </Link>
                <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                  <kbd className="rounded border border-[var(--border)] px-1 py-0.5">↑↓</kbd> navigate
                  <kbd className="rounded border border-[var(--border)] px-1 py-0.5">↵</kbd> open
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
