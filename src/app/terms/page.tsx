import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions – FinCalcPro",
  description: "FinCalcPro Terms and Conditions. Please read these terms carefully before using our financial calculators.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-[var(--muted)] py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Last updated: June 29, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="space-y-8 text-[var(--muted-foreground)] leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using FinCalcPro (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">2. Description of Service</h2>
            <p>FinCalcPro provides free online financial calculators for informational and educational purposes. Our calculators are designed to help users understand financial concepts and estimate outcomes based on inputs they provide.</p>
            <p className="mt-3">The Service is provided &quot;as is&quot; and we make no guarantees as to the accuracy, completeness, or suitability of the calculations for any particular purpose.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">3. Not Financial Advice</h2>
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 mb-3">
              <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">Important Disclaimer</p>
            </div>
            <p>FinCalcPro does not provide financial, investment, tax, legal, or accounting advice. All content on this website is for informational and educational purposes only.</p>
            <p className="mt-3">Calculator results are estimates based on the inputs you provide and mathematical formulas. They should not be relied upon as the sole basis for any financial decision. Before making any significant financial decisions, you should consult a qualified financial professional.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">4. Accuracy of Information</h2>
            <p>We strive to ensure our calculators use accurate formulas and up-to-date information (such as tax brackets and contribution limits). However, we do not warrant that information is always current, complete, or free of errors.</p>
            <p className="mt-3">Tax laws, interest rates, and financial regulations change frequently. Always verify current figures with official government sources or a qualified professional.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">5. Intellectual Property</h2>
            <p>All content on FinCalcPro — including text, graphics, logos, calculator designs, and software — is the property of FinCalcPro and protected by applicable intellectual property laws.</p>
            <p className="mt-3">You may use our calculators for personal, non-commercial purposes. You may not copy, reproduce, distribute, or create derivative works from our content without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">6. Prohibited Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, or systematically extract content without permission</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Transmit malicious code, viruses, or harmful software</li>
              <li>Use the Service in a way that could damage or impair it</li>
              <li>Republish or resell calculator results as your own financial advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, FinCalcPro and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Service — including any financial losses resulting from reliance on calculator results.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">8. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. These links are provided for convenience only. We have no control over the content of those sites and accept no responsibility for them.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will update the &quot;Last updated&quot; date when changes are made. Continued use of the Service after changes constitutes your acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in the relevant jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@fincalcpro.com" className="text-[var(--primary)] hover:underline">legal@fincalcpro.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
