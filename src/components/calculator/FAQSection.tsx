"use client";
import { useState } from "react";

export interface FAQ {
  q: string;
  a: string;
}

export default function FAQSection({ faqs, title = "Frequently Asked Questions" }: { faqs: FAQ[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold text-[var(--foreground)] mb-6">{title}</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              aria-expanded={open === i}
            >
              <span className="pr-4 text-sm leading-snug">{faq.q}</span>
              <svg
                className={`flex-shrink-0 h-4 w-4 text-[var(--muted-foreground)] transition-transform ${open === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)] pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
