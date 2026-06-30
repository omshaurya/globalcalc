"use client";
import { useState } from "react";

const SUBJECTS = [
  "General Enquiry",
  "Bug Report",
  "Feature Request",
  "Partnership / Media",
  "Developer API",
  "Advertising",
  "Careers",
  "Other",
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send message.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors";

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Send Us a Message</h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Fill in the form and we&apos;ll get back to you within 1–2 business days.
      </p>

      {status === "success" ? (
        <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">Message Sent!</h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            Thanks for reaching out. We&apos;ll reply to <strong>{form.email || "your email"}</strong> within 1–2 business days.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-5 rounded-xl border border-green-300 dark:border-green-700 px-4 py-2 text-sm font-medium text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select a subject…</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Tell us how we can help…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {status === "error" && (
            <p className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-[var(--primary)] text-white py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending…" : "Send Message →"}
          </button>
        </form>
      )}
    </div>
  );
}
