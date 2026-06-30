"use client";
import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
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

const BENCHMARKS = [
  { name: "S&P 500 (30yr avg)", cagr: 10.7 },
  { name: "Bonds (Agg)", cagr: 4.5 },
  { name: "REITs", cagr: 9.2 },
  { name: "Gold", cagr: 7.1 },
  { name: "Savings Acct", cagr: 0.5 },
];

export default function InvestmentReturnCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualContribution, setAnnualContribution] = useState(6000);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [years, setYears] = useState(20);
  const [taxRate, setTaxRate] = useState(15);
  const [inflationRate, setInflationRate] = useState(3);
  const [dividendYield, setDividendYield] = useState(1.5);

  const results = useMemo(() => {
    const r = annualReturn / 100;
    const inf = inflationRate / 100;
    const divYield = dividendYield / 100;
    const yearData: { year: number; value: number; contributions: number; realValue: number; dividends: number }[] = [];

    let value = initialInvestment;
    let totalContributions = initialInvestment;
    let totalDividends = 0;

    for (let y = 1; y <= years; y++) {
      value = value * (1 + r) + annualContribution;
      totalContributions += annualContribution;
      const annualDividend = value * divYield;
      totalDividends += annualDividend;
      yearData.push({
        year: y,
        value: Math.round(value),
        contributions: Math.round(totalContributions),
        realValue: Math.round(value / Math.pow(1 + inf, y)),
        dividends: Math.round(totalDividends),
      });
    }

    const finalValue = value;
    const totalGain = finalValue - totalContributions;
    const afterTaxGain = totalGain * (1 - taxRate / 100);
    const afterTaxValue = totalContributions + afterTaxGain;
    const cagr = Math.pow(finalValue / initialInvestment, 1 / years) - 1;
    const realValue = finalValue / Math.pow(1 + inf, years);

    return { yearData, finalValue, totalContributions, totalGain, afterTaxValue, totalDividends, cagr, realValue };
  }, [initialInvestment, annualContribution, annualReturn, years, taxRate, inflationRate, dividendYield]);

  const benchmarkData = useMemo(() =>
    BENCHMARKS.map(b => {
      let v = initialInvestment;
      for (let y = 1; y <= years; y++) v = v * (1 + b.cagr / 100) + annualContribution;
      return { ...b, finalValue: Math.round(v) };
    }),
    [initialInvestment, annualContribution, years]
  );

  const chartData = useMemo(() =>
    results.yearData.filter((_, i) => i % Math.max(1, Math.floor(years / 20)) === 0 || i === years - 1).map(d => ({
      year: `Y${d.year}`,
      "Portfolio Value": d.value,
      "Contributions": d.contributions,
      "Real Value": d.realValue,
    })),
    [results.yearData, years]
  );

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    const multiple = results.finalValue / results.totalContributions;
    list.push({ type: multiple >= 3 ? "success" : multiple >= 2 ? "info" : "warning", title: `${multiple.toFixed(1)}× Money Multiplier`, body: `Your ${formatCurrency(results.totalContributions, currency)} in contributions grows to ${formatCurrency(results.finalValue, currency)} — a ${formatCurrency(results.totalGain, currency)} gain (${((results.totalGain / results.totalContributions) * 100).toFixed(0)}% return on invested capital).` });
    const inflationImpact = results.finalValue - results.realValue;
    list.push({ type: "info", title: "Inflation Erodes Purchasing Power", body: `${formatCurrency(results.finalValue, currency)} in nominal terms = ${formatCurrency(results.realValue, currency)} in today&apos;s dollars after ${inflationRate}% inflation for ${years} years. Real gain: ${formatCurrency(results.realValue - results.totalContributions, currency)}.` });
    list.push({ type: "info", title: `${formatCurrency(results.totalDividends, currency)} Dividend Income`, body: `At ${dividendYield}% yield, your portfolio generates ~${formatCurrency(results.totalDividends / years, currency)}/year in dividends on average, totaling ${formatCurrency(results.totalDividends, currency)} over ${years} years.` });
    const spy = benchmarkData.find(b => b.name.includes("S&P"));
    if (spy && results.finalValue > spy.finalValue) list.push({ type: "success", title: "Outperforming S&P 500 Average", body: `At ${annualReturn}%, your return beats the S&P 500 30-year average (10.7%). Your portfolio ends ${formatCurrency(results.finalValue - spy.finalValue, currency)} ahead.` });
    else if (spy) list.push({ type: "warning", title: "Below S&P 500 Average", body: `The S&P 500 has averaged 10.7% historically. At ${annualReturn}%, consider low-cost index funds for potentially higher long-term returns.` });
    return list;
  }, [results, inflationRate, years, dividendYield, benchmarkData, annualReturn, currency]);

  const faqs: FAQ[] = [
    { q: "What is a realistic stock market return?", a: "The S&P 500 has averaged about 10.7% annually over 30 years (7.7% inflation-adjusted). Individual year returns range from -38% to +38%. Most financial planners use 7-8% as a conservative long-term assumption." },
    { q: "How does compound interest work with investments?", a: "Compounding means you earn returns on your returns. $10,000 at 10% for 30 years grows to $174,494 — not just $30,000 (if it were simple interest). The longer the time horizon, the more dramatic this effect." },
    { q: "What is the difference between nominal and real returns?", a: "Nominal return is what you see on paper. Real return adjusts for inflation. At 10% nominal with 3% inflation, your real return is about 6.8%. Preserving purchasing power, not just growing dollars, is the actual goal." },
    { q: "How do taxes affect investment returns?", a: "Long-term capital gains (held 1+ year) are taxed at 0%, 15%, or 20% depending on income. Short-term gains are taxed as ordinary income (up to 37%). Tax-advantaged accounts (401k, IRA) can save thousands in lifetime taxes." },
    { q: "What is dollar-cost averaging?", a: "Investing a fixed amount regularly (monthly, quarterly) regardless of price. You automatically buy more shares when prices are low and fewer when high. Reduces timing risk and emotional decision-making." },
    { q: "How important is expense ratio in funds?", a: "Very. A 1% expense ratio vs 0.05% (like Vanguard index funds) on $100,000 over 30 years costs about $140,000 in lost returns. Always minimize fees — they compound against you just as returns compound for you." },
    { q: "When should I rebalance my portfolio?", a: "Rebalance when allocations drift more than 5-10% from target, or annually. This forces systematic buy-low/sell-high discipline. Tax-loss harvesting during rebalancing can offset gains." },
    { q: "What is the rule of 72?", a: "Divide 72 by your annual return to find how many years it takes to double your money. At 7%: 72/7 = ~10 years. At 10%: 72/10 = ~7.2 years. A quick mental math shortcut for compound growth." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Future Value with Contributions",
      formula: "FV = PV×(1+r)^n + PMT×[(1+r)^n – 1]÷r",
      variables: [
        { symbol: "PV", meaning: "Initial investment" },
        { symbol: "PMT", meaning: "Annual contribution" },
        { symbol: "r", meaning: "Annual return rate" },
        { symbol: "n", meaning: "Number of years" },
      ],
      example: "$10,000 initial + $6,000/yr at 10% for 20 years = $420,500",
    },
    {
      name: "Real (Inflation-Adjusted) Return",
      formula: "Real Return = (1 + Nominal) ÷ (1 + Inflation) – 1",
      variables: [
        { symbol: "Nominal", meaning: "Stated annual return" },
        { symbol: "Inflation", meaning: "Annual inflation rate" },
      ],
      example: "(1.10) ÷ (1.03) – 1 = 6.80% real return",
    },
  ];

  const reset = () => { setInitialInvestment(10000); setAnnualContribution(6000); setAnnualReturn(10); setYears(20); setTaxRate(15); setInflationRate(3); setDividendYield(1.5); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Investment Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Initial Investment" prefix={symbol} type="number" value={initialInvestment} onChange={e => setInitialInvestment(Number(e.target.value))} showSlider sliderMin={0} sliderMax={500000} sliderStep={1000} />
            <Input label="Annual Contribution" prefix={symbol} type="number" value={annualContribution} onChange={e => setAnnualContribution(Number(e.target.value))} showSlider sliderMin={0} sliderMax={100000} sliderStep={500} />
            <Input label="Expected Annual Return" suffix="%" type="number" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} showSlider sliderMin={1} sliderMax={20} sliderStep={0.5} />
            <Input label="Time Horizon" suffix="years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={50} />
            <Input label="Capital Gains Tax Rate" suffix="%" type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={40} tooltip="Long-term capital gains rate (0%, 15%, or 20%)" />
            <Input label="Inflation Rate" suffix="%" type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={10} sliderStep={0.5} />
            <Input label="Dividend Yield" suffix="%" type="number" value={dividendYield} onChange={e => setDividendYield(Number(e.target.value))} showSlider sliderMin={0} sliderMax={10} sliderStep={0.1} />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Final Value" value={formatCurrency(results.finalValue, currency)} subValue={`After ${years} years`} icon="📈" color="text-[var(--primary)]" />
            <MetricCard label="Total Gain" value={formatCurrency(results.totalGain, currency)} subValue={`${((results.totalGain / results.totalContributions) * 100).toFixed(0)}% ROI`} icon="💰" color="text-green-600 dark:text-green-400" />
            <MetricCard label="After-Tax Value" value={formatCurrency(results.afterTaxValue, currency)} subValue={`At ${taxRate}% cap gains tax`} icon="🏛️" />
            <MetricCard label="Real Value Today" value={formatCurrency(results.realValue, currency)} subValue={`Inflation-adjusted`} icon="💵" />
          </div>

          <Tabs defaultValue="growth">
            <TabsList>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            </TabsList>
            <TabsContent value="growth">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Portfolio Growth Over {years} Years</h3>
                <ResponsiveContainer width="100%" height={270}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Legend />
                    <Line type="monotone" dataKey="Portfolio Value" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="Contributions" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                    <Line type="monotone" dataKey="Real Value" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="benchmarks">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Your Return vs Asset Class Benchmarks</h3>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={[{ name: "Your Return", finalValue: Math.round(results.finalValue), cagr: annualReturn }, ...benchmarkData]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Bar dataKey="finalValue" name={`${years}yr Final Value`} fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.min(100, Math.round((results.finalValue / results.totalContributions - 1) * 20))} scoreLabel="Return Score" />
      <ExportPanel title={meta.name} data={{
        "Initial Investment": formatCurrency(initialInvestment, currency), "Annual Contribution": formatCurrency(annualContribution, currency),
        "Annual Return": `${annualReturn}%`, "Years": `${years}`,
        "Final Value": formatCurrency(results.finalValue, currency), "Total Gain": formatCurrency(results.totalGain, currency),
        "After-Tax Value": formatCurrency(results.afterTaxValue, currency), "Real Value": formatCurrency(results.realValue, currency),
      }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
