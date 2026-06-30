import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement – FinCalcPro",
  description: "FinCalcPro Accessibility Statement. Our commitment to making financial calculators accessible to all users.",
};

const FEATURES = [
  { icon: "⌨️", title: "Keyboard Navigation", desc: "All interactive elements are fully accessible via keyboard. Tab through inputs, activate buttons with Enter/Space, and navigate results without a mouse." },
  { icon: "🔊", title: "Screen Reader Support", desc: "We use semantic HTML, ARIA labels, and live regions so screen readers can announce calculator results and dynamic updates correctly." },
  { icon: "🎨", title: "High Contrast", desc: "Our dark and light themes both maintain WCAG AA contrast ratios (minimum 4.5:1 for text, 3:1 for UI components)." },
  { icon: "📐", title: "Responsive Text", desc: "Text scales gracefully with browser font size settings. Our layouts reflow correctly at up to 400% zoom." },
  { icon: "🚫", title: "No Reliance on Colour Alone", desc: "Information is never conveyed by colour alone. Icons, text labels, and patterns supplement colour coding throughout." },
  { icon: "📱", title: "Mobile Accessible", desc: "Touch targets meet minimum 44×44px guidelines. Pinch-to-zoom is never disabled on mobile devices." },
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-[var(--muted)] py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Accessibility Statement</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Last updated: June 29, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="space-y-8 text-[var(--muted-foreground)] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Our Commitment</h2>
            <p>FinCalcPro is committed to ensuring that our financial calculators are accessible to everyone, including people with disabilities. We aim to conform to the <strong className="text-[var(--foreground)]">Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong> standards.</p>
            <p className="mt-3">We believe that financial planning tools should be available to all users, regardless of how they interact with the web.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Accessibility Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map(f => (
                <div key={f.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1 text-sm">{f.title}</h3>
                  <p className="text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Known Limitations</h2>
            <p>While we strive for full accessibility, some areas of our site are still being improved:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Interactive charts (bar, area, pie) provide alternative text summaries but may not be fully navigable via keyboard in all screen readers</li>
              <li>Some third-party embedded content may not meet our accessibility standards</li>
              <li>PDF export functionality has limited accessibility features</li>
            </ul>
            <p className="mt-3">We are actively working on improving these areas in upcoming releases.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Technical Specifications</h2>
            <p>FinCalcPro relies on the following technologies for conformance:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>HTML5 semantic elements</li>
              <li>WAI-ARIA 1.2 attributes</li>
              <li>CSS (including prefers-reduced-motion support)</li>
              <li>JavaScript (progressive enhancement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Feedback &amp; Contact</h2>
            <p>We welcome feedback on the accessibility of FinCalcPro. If you encounter any accessibility barriers or need assistance accessing content, please contact us:</p>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-sm">
              <p className="font-medium text-[var(--foreground)] mb-1">Accessibility Team</p>
              <p>Email: <a href="mailto:accessibility@fincalcpro.com" className="text-[var(--primary)] hover:underline">accessibility@fincalcpro.com</a></p>
              <p className="mt-1 text-xs">We aim to respond to accessibility feedback within 2 business days.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Formal Complaints</h2>
            <p>If you are not satisfied with our response, you may contact your relevant national or regional accessibility enforcement body. In the UK, this is the <strong className="text-[var(--foreground)]">Equality and Human Rights Commission</strong>; in the US, the <strong className="text-[var(--foreground)]">Department of Justice</strong>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
