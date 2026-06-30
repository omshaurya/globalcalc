"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { formatCurrency, formatPercent } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

interface Props { meta: CalculatorMeta }

export default function ROICalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [initialCost, setInitialCost] = useState(50000);
  const [finalValue, setFinalValue] = useState(75000);
  const [additionalCosts, setAdditionalCosts] = useState(5000);
  const [annualIncome, setAnnualIncome] = useState(3000);
  const [years, setYears] = useState(3);
  const [taxRate, setTaxRate] = useState(25);
  const [inflationRate, setInflationRate] = useState(3);

  const results = useMemo(() => {
    const totalInvested = initialCost + additionalCosts;
    const totalIncome = annualIncome * years;
    const netGain = finalValue + totalIncome - totalInvested;
    const roi = (netGain / totalInvested) * 100;
    const annualizedROI = (Math.pow((finalValue + totalIncome) / totalInvested, 1 / years) - 1) * 100;
    const afterTaxGain = netGain * (1 - taxRate / 100);
    const afterTaxROI = (afterTaxGain / totalInvested) * 100;
    const realROI = ((1 + roi / 100) / Math.pow(1 + inflationRate / 100, years) - 1) * 100;
    const breakEvenValue = totalInvested - totalIncome;
    const paybackPeriod = annualIncome > 0 ? (totalInvested - finalValue) / annualIncome : Infinity;
    return { totalInvested, totalIncome, netGain, roi, annualizedROI, afterTaxROI, realROI, breakEvenValue, paybackPeriod };
  }, [initialCost, finalValue, additionalCosts, annualIncome, years, taxRate, inflationRate]);

  const scenarios = [
    { name: "Conservative (-20%)", value: finalValue * 0.8 },
    { name: "Expected", value: finalValue },
    { name: "Optimistic (+20%)", value: finalValue * 1.2 },
  ].map(s => {
    const totalInvested = initialCost + additionalCosts;
    const totalIncome = annualIncome * years;
    const roi = ((s.value + totalIncome - totalInvested) / totalInvested) * 100;
    return { ...s, roi: Math.round(roi * 10) / 10 };
  });

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    const { roi, annualizedROI, afterTaxROI, realROI, paybackPeriod } = results;
    if (roi > 0) list.push({ type: roi > 20 ? "success" : "info", title: `${roi.toFixed(1)}% Total ROI`, body: `Your investment returns ${roi.toFixed(1)}% over ${years} years — ${annualizedROI.toFixed(1)}% annualized. ${roi > 50 ? "Excellent return!" : roi > 20 ? "Strong return." : "Moderate return."}` });
    else list.push({ type: "danger", title: `Negative ROI: ${roi.toFixed(1)}%`, body: `This investment loses money. Reconsider the exit strategy or holding period to improve the return profile.` });
    list.push({ type: "info", title: `After-Tax ROI: ${afterTaxROI.toFixed(1)}%`, body: `After ${taxRate}% taxes, your effective ROI is ${afterTaxROI.toFixed(1)}%. Real (inflation-adjusted) return: ${realROI.toFixed(1)}% over ${years} years.` });
    if (isFinite(paybackPeriod) && paybackPeriod > 0) {
      const ppType = paybackPeriod < years ? "success" : "warning";
      list.push({ type: ppType, title: `Payback Period: ${paybackPeriod.toFixed(1)} Years`, body: `Based on ${formatCurrency(annualIncome, currency)}/year income, you recover your investment in ${paybackPeriod.toFixed(1)} years. ${paybackPeriod < years ? "Within the investment window." : "Exceeds planned holding period."}` });
    }
    if (annualizedROI > 10) list.push({ type: "success", title: "Beats S&P 500 Average", body: `${annualizedROI.toFixed(1)}% annualized exceeds the stock market's historical ~10.7% average. Strong standalone investment case.` });
    return list;
  }, [results, years, taxRate, annualIncome, currency]);

  const faqs: FAQ[] = [
    { q: "What is ROI and how is it calculated?", a: "Return on Investment = (Net Profit / Total Cost) × 100. Net profit is what you gained minus what you invested. A 25% ROI means you earned $25 for every $100 invested, regardless of time period." },
    { q: "What's the difference between ROI and annualized ROI?", a: "Simple ROI ignores time. A 50% return over 5 years is very different from 50% over 1 year. Annualized ROI (CAGR) converts any return period to a yearly equivalent, enabling apples-to-apples comparisons." },
    { q: "What is a good ROI?", a: "Context is everything. Stock market: 7-10% annually. Real estate: 8-12%. Business investments: 15-30%. The benchmark is your opportunity cost — what you'd earn in the next-best investment at similar risk." },
    { q: "How does risk affect ROI evaluation?", a: "Higher potential ROI always comes with higher risk. A 5% risk-free return (Treasuries) vs a 15% return in a volatile startup are not the same. Risk-adjusted metrics (Sharpe ratio) formalize this tradeoff." },
    { q: "Should I use pre-tax or after-tax ROI?", a: "After-tax ROI is what you actually keep. The difference can be massive — a 30% gain taxed at 35% (short-term rate) becomes a 19.5% after-tax return. Always compare investments on an after-tax, inflation-adjusted basis." },
    { q: "What is payback period?", a: "How long until cumulative returns equal your initial investment. A shorter payback reduces risk (your capital is locked up for less time). Real estate: 5-10 years. Business projects: 1-3 years is typical." },
    { q: "How do ongoing costs affect ROI?", a: "Every dollar in maintenance, fees, or operating costs reduces your net return. Real estate example: a property with 8% gross yield but 3% in costs only yields 5% net. Always calculate ROI on net (after-cost) returns." },
    { q: "What's the difference between ROI and IRR?", a: "ROI is a simple percentage return. IRR (Internal Rate of Return) accounts for the timing of cash flows — money received earlier is worth more. For multi-year investments with irregular cash flows, IRR is more accurate." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Return on Investment",
      formula: "ROI = (Net Gain ÷ Total Invested) × 100",
      variables: [
        { symbol: "Net Gain", meaning: "Final Value + Income – Total Cost" },
        { symbol: "Total Invested", meaning: "Initial Cost + Additional Costs" },
      ],
      example: "($75k + $9k – $55k) ÷ $55k × 100 = 52.7% ROI",
    },
    {
      name: "Annualized ROI (CAGR)",
      formula: "Annualized ROI = [(1 + ROI/100)^(1/n) – 1] × 100",
      variables: [
        { symbol: "ROI", meaning: "Total ROI over the holding period" },
        { symbol: "n", meaning: "Number of years" },
      ],
      example: "52.7% total ROI over 3 years = (1.527)^(1/3) – 1 = 15.2% annualized",
    },
  ];

  const reset = () => { setInitialCost(50000); setFinalValue(75000); setAdditionalCosts(5000); setAnnualIncome(3000); setYears(3); setTaxRate(25); setInflationRate(3); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Investment Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Initial Investment Cost" prefix={symbol} type="number" value={initialCost} onChange={e => setInitialCost(Number(e.target.value))} showSlider sliderMin={0} sliderMax={1000000} sliderStep={1000} />
            <Input label="Final/Exit Value" prefix={symbol} type="number" value={finalValue} onChange={e => setFinalValue(Number(e.target.value))} showSlider sliderMin={0} sliderMax={1000000} sliderStep={1000} tooltip="What you sell or exit the investment for" />
            <Input label="Additional Costs" prefix={symbol} type="number" value={additionalCosts} onChange={e => setAdditionalCosts(Number(e.target.value))} tooltip="Maintenance, fees, transaction costs over the holding period" />
            <Input label="Annual Income/Cash Flow" prefix={symbol} type="number" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value))} tooltip="Rent, dividends, or other income per year" />
            <Input label="Holding Period" suffix="years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} />
            <Input label="Tax Rate on Gains" suffix="%" type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={50} />
            <Input label="Inflation Rate" suffix="%" type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={10} sliderStep={0.5} />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Total ROI" value={`${results.roi.toFixed(1)}%`} subValue={`${results.annualizedROI.toFixed(1)}% annualized`} icon="📊" color={results.roi >= 0 ? "text-[var(--primary)]" : "text-red-600 dark:text-red-400"} />
            <MetricCard label="Net Gain" value={formatCurrency(results.netGain, currency)} subValue={`On ${formatCurrency(results.totalInvested, currency)} invested`} icon="💰" color={results.netGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
            <MetricCard label="After-Tax ROI" value={`${results.afterTaxROI.toFixed(1)}%`} subValue={`${taxRate}% tax applied`} icon="🏛️" />
            <MetricCard label="Real ROI" value={`${results.realROI.toFixed(1)}%`} subValue="Inflation-adjusted" icon="💵" />
          </div>

          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Scenario Analysis</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "ROI"]} />
                <ReferenceLine y={0} stroke="var(--border)" />
                <Bar dataKey="roi" name="ROI" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Investment Summary</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Total Invested", value: formatCurrency(results.totalInvested, currency) },
                { label: "Exit Value", value: formatCurrency(finalValue, currency) },
                { label: "Total Income", value: formatCurrency(results.totalIncome, currency) },
                { label: "Net Gain", value: formatCurrency(results.netGain, currency), highlight: true },
                { label: "After-Tax Gain", value: formatCurrency(results.netGain * (1 - taxRate / 100), currency) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`flex justify-between py-1.5 border-b border-[var(--border)] last:border-0 ${highlight ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                  <span>{label}</span>
                  <span className={highlight ? (results.netGain >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400") : ""}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.min(100, Math.max(0, Math.round(results.roi / 2 + 50)))} scoreLabel="Investment Score" />
      <ExportPanel title={meta.name} data={{
        "Initial Cost": formatCurrency(initialCost, currency), "Final Value": formatCurrency(finalValue, currency),
        "Holding Period": `${years} years`, "Total ROI": `${results.roi.toFixed(1)}%`,
        "Annualized ROI": `${results.annualizedROI.toFixed(1)}%`, "Net Gain": formatCurrency(results.netGain, currency),
        "After-Tax ROI": `${results.afterTaxROI.toFixed(1)}%`,
      }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
