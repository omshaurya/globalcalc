import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us – FinCalcPro",
  description: "Get in touch with the FinCalcPro team. We'd love to hear from you.",
};

const CHANNELS = [
  {
    icon: "📧",
    title: "General Enquiries",
    desc: "Questions about our calculators, methodology, or platform.",
    contact: "hello@fincalcpro.com",
    href: "mailto:hello@fincalcpro.com",
  },
  {
    icon: "🐞",
    title: "Bug Reports",
    desc: "Found an error in a calculation or a broken feature?",
    contact: "bugs@fincalcpro.com",
    href: "mailto:bugs@fincalcpro.com",
  },
  {
    icon: "🤝",
    title: "Partnerships & Media",
    desc: "Press inquiries, partnerships, and collaboration requests.",
    contact: "partnerships@fincalcpro.com",
    href: "mailto:partnerships@fincalcpro.com",
  },
  {
    icon: "⚡",
    title: "Developer API",
    desc: "Questions about our API, enterprise plans, or integrations.",
    contact: "api@fincalcpro.com",
    href: "mailto:api@fincalcpro.com",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            ✉️ Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Whether you&apos;ve spotted a bug, have a feature request, or just want to say hello — we respond to every message.
          </p>
        </div>
      </div>

      {/* Contact channels */}
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CHANNELS.map(c => (
            <a
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/50 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">{c.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3 leading-relaxed">{c.desc}</p>
              <p className="text-sm font-medium text-[var(--primary)]">{c.contact}</p>
            </a>
          ))}
        </div>

        {/* Response time */}
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)] mb-1">⏱ Typical Response Time</p>
          <p className="text-sm text-[var(--muted-foreground)]">We respond to all messages within <strong className="text-[var(--foreground)]">1–2 business days</strong>. For urgent issues, email bugs@fincalcpro.com directly.</p>
        </div>

        {/* FAQ teaser */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-2">Looking for quick answers?</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Each calculator page includes a detailed FAQ section addressing common questions about formulas, inputs, and results.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
