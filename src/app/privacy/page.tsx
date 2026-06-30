import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – FinCalcPro",
  description: "FinCalcPro Privacy Policy. Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-[var(--muted)] py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Last updated: June 29, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 prose-sm">
        <div className="space-y-8 text-[var(--muted-foreground)] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">1. Overview</h2>
            <p>FinCalcPro (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website at fincalcpro.com (the &quot;Service&quot;).</p>
            <p className="mt-3">All calculations performed on FinCalcPro are processed entirely in your browser. We do not transmit your financial inputs to our servers, and we do not store them.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">2. Information We Collect</h2>
            <p className="font-medium text-[var(--foreground)] mb-2">2.1 Information you provide</p>
            <p>We do not require you to create an account to use FinCalcPro. Calculator inputs (principal amounts, interest rates, time periods, etc.) are processed locally in your browser and are not collected or stored by us.</p>
            <p className="font-medium text-[var(--foreground)] mt-4 mb-2">2.2 Automatically collected information</p>
            <p>When you visit our website, we may automatically collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring URL</li>
              <li>Pages visited and time spent</li>
              <li>IP address (anonymised)</li>
              <li>Device type (desktop, mobile, tablet)</li>
            </ul>
            <p className="mt-3">This information is collected through analytics tools to help us understand how our website is used and improve the user experience.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate and improve the FinCalcPro website and calculators</li>
              <li>To analyse usage trends and user behaviour in aggregate</li>
              <li>To detect and prevent technical errors or abuse</li>
              <li>To respond to your enquiries when you contact us</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">4. Cookies</h2>
            <p>We use cookies and similar tracking technologies. Please refer to our <a href="/cookies" className="text-[var(--primary)] hover:underline">Cookie Policy</a> for detailed information on what cookies we use and how to control them.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">5. Third-Party Services</h2>
            <p>We may use third-party services including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-[var(--foreground)]">Analytics:</strong> To understand usage patterns (data is anonymised)</li>
              <li><strong className="text-[var(--foreground)]">Advertising:</strong> To display relevant financial advertising (subject to your consent preferences)</li>
              <li><strong className="text-[var(--foreground)]">CDN providers:</strong> To deliver content quickly and reliably</li>
            </ul>
            <p className="mt-3">These third parties have their own privacy policies and we encourage you to review them.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">6. Data Retention</h2>
            <p>As we do not collect financial calculation data, there is nothing to retain. Anonymised analytics data is retained for up to 26 months, after which it is automatically deleted.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@fincalcpro.com" className="text-[var(--primary)] hover:underline">privacy@fincalcpro.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">8. Children&apos;s Privacy</h2>
            <p>FinCalcPro is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date above. Your continued use of FinCalcPro after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">10. Contact Us</h2>
            <p>For privacy-related questions, contact us at:</p>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-sm">
              <p className="font-medium text-[var(--foreground)]">FinCalcPro Privacy Team</p>
              <p>Email: <a href="mailto:privacy@fincalcpro.com" className="text-[var(--primary)] hover:underline">privacy@fincalcpro.com</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
