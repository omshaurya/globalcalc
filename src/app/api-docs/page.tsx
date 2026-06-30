import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer API – FinCalcPro Financial Calculator API",
  description: "Integrate 100+ financial calculators into your app with the FinCalcPro REST API. Free tier available. JSON responses, SDKs, and interactive playground.",
};

const ENDPOINTS = [
  { method: "GET", path: "/api/v1/calculators", desc: "List all available calculators with metadata" },
  { method: "POST", path: "/api/v1/calculate/compound-interest", desc: "Calculate compound interest" },
  { method: "POST", path: "/api/v1/calculate/mortgage", desc: "Calculate mortgage payment & amortization" },
  { method: "POST", path: "/api/v1/calculate/sip", desc: "Calculate SIP future value" },
  { method: "POST", path: "/api/v1/calculate/emi", desc: "Calculate EMI and loan amortization" },
  { method: "POST", path: "/api/v1/calculate/fire", desc: "Calculate FIRE number and timeline" },
  { method: "POST", path: "/api/v1/calculate/retirement", desc: "Retirement corpus projection" },
  { method: "POST", path: "/api/v1/calculate/cagr", desc: "Compound Annual Growth Rate" },
  { method: "GET", path: "/api/v1/currency/rates", desc: "Live currency exchange rates (20+ currencies)" },
  { method: "POST", path: "/api/v1/currency/convert", desc: "Convert between currencies" },
];

const CODE_EXAMPLES: Record<string, string> = {
  javascript: `// FinCalcPro API — JavaScript Example
const response = await fetch('https://api.fincalcpro.com/v1/calculate/sip', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    monthly_investment: 10000,   // INR
    annual_return: 12,           // %
    years: 10,
    currency: 'INR'
  })
});

const data = await response.json();
console.log(data);
// {
//   "future_value": 2323217,
//   "total_invested": 1200000,
//   "wealth_gained": 1123217,
//   "cagr": 6.72,
//   "currency": "INR"
// }`,

  python: `# FinCalcPro API — Python Example
import requests

response = requests.post(
    'https://api.fincalcpro.com/v1/calculate/mortgage',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'home_price': 400000,
        'down_payment': 80000,
        'interest_rate': 7.0,
        'loan_term': 30,
        'currency': 'USD'
    }
)

data = response.json()
monthly = data['monthly_payment']
interest = data['total_interest']
print("Monthly Payment: $" + format(monthly, ",.0f"))
print("Total Interest: $" + format(interest, ",.0f"))
# Output:
# Monthly Payment: $2,129
# Total Interest: $446,428`,

  curl: `# FinCalcPro API — cURL Example
curl -X POST https://api.fincalcpro.com/v1/calculate/compound-interest \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "principal": 100000,
    "annual_rate": 8,
    "years": 10,
    "compound_frequency": "monthly"
  }'

# Response:
# {
#   "future_value": 221964,
#   "interest_earned": 121964,
#   "effective_annual_rate": 8.30
# }`,

  php: `<?php
// FinCalcPro API — PHP Example
$client = new GuzzleHttp\\Client();

$response = $client->post('https://api.fincalcpro.com/v1/calculate/emi', [
    'headers' => [
        'Authorization' => 'Bearer YOUR_API_KEY',
        'Content-Type' => 'application/json',
    ],
    'json' => [
        'principal' => 500000,
        'annual_rate' => 10.5,
        'tenure_months' => 60,
        'currency' => 'INR',
    ]
]);

$data = json_decode($response->getBody(), true);
echo "EMI: ₹" . number_format($data['emi']);`,
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
              ⚡ Developer API
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              Financial Calculator API
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Integrate 100+ financial calculators into your app, website, or workflow. REST API with JSON responses, SDKs, and an interactive playground. Free tier available.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 text-sm font-semibold transition-colors">
                Get Free API Key →
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-200 px-6 py-3 text-sm font-semibold transition-colors">
                View API Reference
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 space-y-16">

        {/* Base URL */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Base URL</h2>
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 font-mono text-sm">
            <span className="text-[var(--muted-foreground)]">Base URL: </span>
            <span className="text-[var(--primary)]">https://api.fincalcpro.com/v1</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">All requests require an <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-xs">Authorization: Bearer YOUR_API_KEY</code> header.</p>
        </div>

        {/* Endpoints */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Available Endpoints</h2>
          <div className="space-y-2">
            {ENDPOINTS.map(ep => (
              <div key={ep.path} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold font-mono ${
                  ep.method === "GET"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm text-[var(--primary)] font-mono">{ep.path}</code>
                <span className="text-sm text-[var(--muted-foreground)] ml-auto hidden sm:block">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code examples */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Code Examples</h2>
          <div className="space-y-4">
            {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
              <div key={lang} className="rounded-2xl overflow-hidden border border-[var(--border)]">
                <div className="flex items-center justify-between bg-[var(--muted)] px-4 py-2.5 border-b border-[var(--border)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] capitalize">{lang}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">Click to copy</span>
                </div>
                <pre className="bg-[var(--card)] p-4 text-xs text-[var(--foreground)] overflow-x-auto leading-relaxed">
                  <code>{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Why FinCalcPro API?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Median response time < 50ms. Built on globally distributed edge infrastructure." },
              { icon: "🎯", title: "100+ Calculators", desc: "Compound interest, mortgage, SIP, FIRE, EMI, retirement, tax, and more." },
              { icon: "🌍", title: "Multi-Currency", desc: "Support for USD, EUR, GBP, INR, AED, CAD, AUD, and 13+ more currencies." },
              { icon: "📖", title: "OpenAPI Spec", desc: "Full Swagger/OpenAPI 3.0 documentation with interactive playground." },
              { icon: "🔒", title: "Secure", desc: "API key authentication, HTTPS only, SOC 2 compliant infrastructure." },
              { icon: "📊", title: "Detailed Responses", desc: "Rich JSON with projections, breakdowns, charts data, and insights." },
            ].map(f => (
              <div key={f.title} className="flex gap-3">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="font-semibold text-[var(--foreground)] mb-0.5">{f.title}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
