import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy – FinCalcPro",
  description: "FinCalcPro Cookie Policy. Learn what cookies we use and how to manage them.",
};

const COOKIE_TYPES = [
  {
    name: "Essential Cookies",
    required: true,
    desc: "These cookies are necessary for the website to function. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.",
    examples: ["Session management", "Security tokens", "Theme preference (dark/light mode)"],
  },
  {
    name: "Analytics Cookies",
    required: false,
    desc: "These cookies help us understand how visitors interact with our website by collecting anonymous information. This helps us improve our calculators and user experience.",
    examples: ["Page view counts", "Time spent on calculators", "Navigation paths", "Device type"],
  },
  {
    name: "Advertising Cookies",
    required: false,
    desc: "These cookies are used to deliver relevant advertisements to you and measure the effectiveness of our advertising campaigns. They may be set by us or our advertising partners.",
    examples: ["Ad personalisation", "Frequency capping", "Conversion tracking"],
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-[var(--muted)] py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Cookie Policy</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Last updated: June 29, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="space-y-8 text-[var(--muted-foreground)] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and provide relevant content.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">How We Use Cookies</h2>
            <p>FinCalcPro uses cookies to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Remember your theme preference (dark or light mode)</li>
              <li>Understand how calculators are used so we can improve them</li>
              <li>Deliver relevant financial advertising</li>
              <li>Maintain site security and performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Types of Cookies We Use</h2>
            <div className="space-y-4">
              {COOKIE_TYPES.map(ct => (
                <div key={ct.name} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{ct.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ct.required ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}`}>
                      {ct.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{ct.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {ct.examples.map(e => (
                      <span key={e} className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-0.5 text-xs text-[var(--muted-foreground)]">{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Managing Your Cookie Preferences</h2>
            <p>You can control and manage cookies in several ways:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong className="text-[var(--foreground)]">Browser settings:</strong> Most browsers allow you to view, manage, and delete cookies through their settings menus.</li>
              <li><strong className="text-[var(--foreground)]">Opt-out links:</strong> For analytics cookies, you may opt out through your browser settings or by using browser privacy extensions.</li>
              <li><strong className="text-[var(--foreground)]">Cookie banner:</strong> You can update your preferences at any time using the cookie preferences link in our footer.</li>
            </ul>
            <p className="mt-3">Note: Disabling certain cookies may affect the functionality of our website, including theme persistence.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Third-Party Cookies</h2>
            <p>Some cookies on our site are set by third-party services. We do not control these cookies and recommend reviewing the privacy policies of these third parties for more information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Updates to This Policy</h2>
            <p>We may update this Cookie Policy periodically. The &quot;Last updated&quot; date above indicates when the most recent changes were made.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">Contact</h2>
            <p>Questions about our cookie use? Contact us at <a href="mailto:privacy@fincalcpro.com" className="text-[var(--primary)] hover:underline">privacy@fincalcpro.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
