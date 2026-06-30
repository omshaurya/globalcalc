"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { calcFederalTax, effectiveTaxRate, formatCurrency, formatPercent } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";

const STANDARD_DEDUCTION = { single: 14600, married: 29200, hoh: 21900 };
const STATE_TAX_RATES: Record<string, number> = {
  "TX": 0, "FL": 0, "NV": 0, "WA": 0, "AK": 0, "WY": 0, "SD": 0, "TN": 0,
  "CA": 9.3, "NY": 6.85, "NJ": 5.53, "IL": 4.95, "PA": 3.07, "OH": 2.77,
  "GA": 5.49, "NC": 4.5, "VA": 5.75, "MA": 5.0, "AZ": 2.5, "CO": 4.4,
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

interface Props { meta: CalculatorMeta }

export default function IncomeTaxCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [income, setIncome] = useState(75000);
  const [filingStatus, setFilingStatus] = useState<"single" | "married" | "hoh">("single");
  const [state, setState] = useState("TX");
  const [additionalDeductions, setAdditionalDeductions] = useState(0);
  const [retirement401k, setRetirement401k] = useState(6000);

  const stdDeduction = STANDARD_DEDUCTION[filingStatus];
  const totalDeductions = stdDeduction + additionalDeductions + retirement401k;
  const taxableIncome = Math.max(0, income - totalDeductions);
  const federalTax = useMemo(() => calcFederalTax(taxableIncome), [taxableIncome]);
  const stateTaxRate = STATE_TAX_RATES[state] || 5;
  const stateTax = taxableIncome * (stateTaxRate / 100);
  const ficaTax = Math.min(income, 168600) * 0.062 + income * 0.0145;
  const totalTax = federalTax + stateTax + ficaTax;
  const effectiveRate = effectiveTaxRate(totalTax, income);
  const takeHome = income - totalTax;

  const bracketData = [
    { bracket: "10%", taxable: Math.min(taxableIncome, 11600), rate: "10%" },
    { bracket: "12%", taxable: Math.max(0, Math.min(taxableIncome - 11600, 35550)), rate: "12%" },
    { bracket: "22%", taxable: Math.max(0, Math.min(taxableIncome - 47150, 53375)), rate: "22%" },
    { bracket: "24%", taxable: Math.max(0, Math.min(taxableIncome - 100525, 91425)), rate: "24%" },
    { bracket: "32%+", taxable: Math.max(0, taxableIncome - 191950), rate: "32%+" },
  ].filter(b => b.taxable > 0);

  const pieData = [
    { name: "Take-Home Pay", value: Math.round(takeHome) },
    { name: "Federal Tax", value: Math.round(federalTax) },
    { name: "State Tax", value: Math.round(stateTax) },
    { name: "FICA", value: Math.round(ficaTax) },
  ];

  const insights: Insight[] = useMemo(() => [
    { type: "info", title: `Effective Tax Rate: ${formatPercent(effectiveRate)}`, body: `Your marginal rate is higher but your effective (average) rate is ${formatPercent(effectiveRate)}. Only the income in each bracket is taxed at that rate.` },
    ...(retirement401k < 23000 ? [{ type: "success" as const, title: "Maximize Tax-Advantaged Savings", body: `Increasing 401(k) contributions by ${formatCurrency(23000 - retirement401k, currency)} would reduce taxable income by the same amount, saving ~${formatCurrency((23000 - retirement401k) * 0.22, currency)} in federal tax.` }] : [{ type: "success" as const, title: "Maxing 401(k) — Great Job!", body: "You're contributing the maximum to your 401(k), reducing your taxable income and saving significantly on taxes." }]),
    { type: "info", title: "No-Tax States", body: "States like Texas, Florida, Nevada, and Washington have no state income tax, saving 5-9% on top of federal taxes." },
  ], [effectiveRate, retirement401k, currency]);

  const faqs: FAQ[] = [
    { q: "What is the difference between marginal and effective tax rate?", a: "Marginal rate is the rate on your last dollar of income. Effective rate is total tax ÷ total income. Due to progressive brackets, effective rate is always lower than marginal rate." },
    { q: "What deductions reduce federal income tax?", a: "Common deductions: standard deduction ($14,600 single in 2024), 401(k)/IRA contributions, mortgage interest, student loan interest, health insurance premiums (self-employed), business expenses." },
    { q: "What is FICA tax?", a: "FICA (Federal Insurance Contributions Act) includes Social Security (6.2% on wages up to $168,600) and Medicare (1.45% on all wages). Your employer matches these." },
    { q: "When do you need to pay estimated taxes?", a: "If you expect to owe $1,000+ in taxes after withholding (common for freelancers, investors, and self-employed), you must pay quarterly estimated taxes to avoid underpayment penalties." },
    { q: "Can I deduct both standard and itemized deductions?", a: "No, you must choose one or the other for federal taxes. Itemize only if your deductions exceed the standard deduction ($14,600 single, $29,200 married in 2024)." },
  ];

  const reset = () => { setIncome(75000); setFilingStatus("single"); setState("TX"); setAdditionalDeductions(0); setRetirement401k(6000); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Tax Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Annual Income" prefix={symbol} type="number" value={income} onChange={e => setIncome(Number(e.target.value))} showSlider sliderMin={10000} sliderMax={500000} sliderStep={1000} />
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-2">Filing Status</label>
              <div className="grid grid-cols-3 gap-1">
                {(["single", "married", "hoh"] as const).map(s => (
                  <button key={s} onClick={() => setFilingStatus(s)} className={`rounded-lg py-2 text-xs font-medium capitalize ${filingStatus === s ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
                    {s === "hoh" ? "Head of HH" : s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-2">State</label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
                {Object.entries(STATE_TAX_RATES).map(([s, r]) => <option key={s} value={s}>{s} ({r}%)</option>)}
              </select>
            </div>
            <Input label="401(k) / IRA Contribution" prefix={symbol} type="number" value={retirement401k} onChange={e => setRetirement401k(Number(e.target.value))} showSlider sliderMin={0} sliderMax={23000} sliderStep={500} tooltip="Pre-tax retirement contributions reduce taxable income" />
            <Input label="Other Deductions" prefix={symbol} type="number" value={additionalDeductions} onChange={e => setAdditionalDeductions(Number(e.target.value))} tooltip="Additional itemized deductions beyond standard" />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Take-Home Pay" value={formatCurrency(takeHome, currency)} subValue={`${formatCurrency(takeHome / 12, currency)}/month`} icon="💵" color="text-green-600 dark:text-green-400" />
            <MetricCard label="Total Tax" value={formatCurrency(totalTax, currency)} subValue={`Effective: ${formatPercent(effectiveRate)}`} icon="📊" color="text-red-600 dark:text-red-400" />
            <MetricCard label="Federal Tax" value={formatCurrency(federalTax, currency)} subValue="Income tax" icon="🏛️" />
            <MetricCard label="Taxable Income" value={formatCurrency(taxableIncome, currency)} subValue={`After ${formatCurrency(totalDeductions, currency)} deductions`} icon="📋" />
          </div>

          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">How Your Income is Allocated</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Tax Bracket Breakdown</h3>
            <div className="space-y-2">
              {bracketData.map(b => (
                <div key={b.bracket} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm font-medium text-[var(--foreground)]">{b.rate} bracket</span>
                  <span className="text-sm text-[var(--muted-foreground)]">{formatCurrency(b.taxable, currency)} taxed</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(b.taxable * parseFloat(b.rate) / 100, currency)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <AIInsights insights={insights} />
      <ExportPanel title={meta.name} data={{ "Gross Income": formatCurrency(income, currency), "Total Deductions": formatCurrency(totalDeductions, currency), "Taxable Income": formatCurrency(taxableIncome, currency), "Federal Tax": formatCurrency(federalTax, currency), "State Tax": formatCurrency(stateTax, currency), "FICA Tax": formatCurrency(ficaTax, currency), "Total Tax": formatCurrency(totalTax, currency), "Effective Rate": formatPercent(effectiveRate), "Take-Home Pay": formatCurrency(takeHome, currency) }} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
