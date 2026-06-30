"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { compoundInterest, futureValue, formatCurrency, formatPercent } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

interface Props { meta: CalculatorMeta }

const FREQUENCIES = [{ label: "Annually (1x)", n: 1 }, { label: "Semi-annually (2x)", n: 2 }, { label: "Quarterly (4x)", n: 4 }, { label: "Monthly (12x)", n: 12 }, { label: "Daily (365x)", n: 365 }];

export default function CompoundInterestCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState(12);
  const [additionalMonthly, setAdditionalMonthly] = useState(0);

  const fv = useMemo(() => {
    let val = compoundInterest(principal, rate / 100, frequency, years);
    if (additionalMonthly > 0) {
      const r = rate / 100 / 12;
      const n = years * 12;
      val += additionalMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    }
    return val;
  }, [principal, rate, years, frequency, additionalMonthly]);

  const totalInvested = principal + additionalMonthly * years * 12;
  const totalInterest = fv - totalInvested;

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      let val = compoundInterest(principal, rate / 100, frequency, y);
      if (additionalMonthly > 0 && y > 0) {
        const r = rate / 100 / 12;
        const n = y * 12;
        val += additionalMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      }
      const invested = principal + additionalMonthly * y * 12;
      data.push({ year: new Date().getFullYear() + y, "Total Value": Math.round(val), "Principal + Contributions": Math.round(invested), "Interest Earned": Math.round(val - invested) });
    }
    return data;
  }, [principal, rate, years, frequency, additionalMonthly]);

  const rule72Years = 72 / rate;

  const insights: Insight[] = useMemo(() => [
    { type: "info", title: `Rule of 72: Doubles in ~${rule72Years.toFixed(1)} Years`, body: `At ${rate}% interest, your money doubles approximately every ${rule72Years.toFixed(1)} years. In ${years} years, it doubles roughly ${(years / rule72Years).toFixed(1)} times.` },
    { type: "success", title: "Interest Earned vs Principal", body: `Your ${formatCurrency(totalInvested, currency)} investment grows by ${formatCurrency(totalInterest, currency)} (${((totalInterest / totalInvested) * 100).toFixed(0)}%) through compounding — money working for you.` },
    { type: "info", title: "Frequency Matters", body: "Daily compounding earns slightly more than monthly or annual. On $10,000 at 8% for 10 years, daily vs annual compounding adds ~$50 — meaningful for very large sums." },
    ...(rate < 5 ? [{ type: "warning" as const, title: "Low Interest Rate", body: "At current rates, inflation may erode your real returns. Consider higher-yielding instruments like equity index funds for long-term wealth building." }] : []),
  ], [rate, years, rule72Years, totalInvested, totalInterest, currency]);

  const faqs: FAQ[] = [
    { q: "What is compound interest?", a: "Compound interest is interest earned on both the original principal AND the accumulated interest. This 'interest on interest' creates exponential growth over time." },
    { q: "What is the Rule of 72?", a: "Divide 72 by the annual interest rate to estimate how long it takes for money to double. At 8%, money doubles in 72÷8 = 9 years." },
    { q: "How does compounding frequency affect returns?", a: "More frequent compounding earns slightly more. At 10% annual rate: annually gives $1,100, monthly gives $1,104.71, daily gives $1,105.16 per $1,000 after 1 year." },
    { q: "Simple interest vs compound interest?", a: "Simple interest calculates interest only on principal. Compound interest calculates on principal + accumulated interest, creating much faster growth over time." },
    { q: "What is the best compound interest investment?", a: "Index funds historically offer 7–10% compound returns, significantly beating savings accounts (0.5–5%). Time in the market is the most important factor." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Compound Interest Formula",
      formula: "A = P(1 + r/n)^(nt)",
      variables: [
        { symbol: "A", meaning: "Final amount (principal + interest)" },
        { symbol: "P", meaning: "Principal (initial investment)" },
        { symbol: "r", meaning: "Annual interest rate (decimal)" },
        { symbol: "n", meaning: "Compounding frequency per year" },
        { symbol: "t", meaning: "Time in years" },
      ],
      example: "$10,000 at 8% compounded monthly for 10 years: A = 10,000(1 + 0.08/12)^(12×10) = $22,196",
    },
  ];

  const reset = () => { setPrincipal(10000); setRate(8); setYears(10); setFrequency(12); setAdditionalMonthly(0); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Investment Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Principal Amount" prefix={symbol} type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} showSlider sliderMin={100} sliderMax={1000000} sliderStep={100} tooltip="Initial investment amount" />
            <Input label="Annual Interest Rate" suffix="%" type="number" value={rate} onChange={e => setRate(Number(e.target.value))} showSlider sliderMin={0.5} sliderMax={20} sliderStep={0.5} tooltip="Annual interest or return rate" />
            <Input label="Time Period" suffix="Years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={50} tooltip="Investment duration in years" />
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">Compounding Frequency</label>
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {FREQUENCIES.map(f => (
                  <button key={f.n} onClick={() => setFrequency(f.n)} className={`rounded-lg px-3 py-2 text-sm text-left transition-all ${frequency === f.n ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Monthly Addition" prefix={symbol} type="number" value={additionalMonthly} onChange={e => setAdditionalMonthly(Number(e.target.value))} tooltip="Optional additional monthly contributions" />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Future Value" value={formatCurrency(fv, currency)} icon="🎯" color="text-[var(--primary)]" />
            <MetricCard label="Total Invested" value={formatCurrency(totalInvested, currency)} icon="💰" />
            <MetricCard label="Interest Earned" value={formatCurrency(totalInterest, currency)} icon="📈" color="text-green-600 dark:text-green-400" />
            <MetricCard label="Return %" value={formatPercent((totalInterest / totalInvested) * 100)} subValue={`Doubles in ${rule72Years.toFixed(1)}yr`} icon="⚡" />
          </div>
          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Compound Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Legend />
                <Area type="monotone" dataKey="Total Value" stroke="#6366f1" fill="url(#ciGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Principal + Contributions" stroke="#10b981" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
      <AIInsights insights={insights} />
      <ExportPanel title={meta.name} data={{ "Principal": formatCurrency(principal, currency), "Annual Rate": formatPercent(rate), "Duration": `${years} years`, "Compounding": FREQUENCIES.find(f => f.n === frequency)?.label || "", "Future Value": formatCurrency(fv, currency), "Interest Earned": formatCurrency(totalInterest, currency), "Return": formatPercent((totalInterest / totalInvested) * 100) }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
