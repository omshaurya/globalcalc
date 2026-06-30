"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { calcSIP, generateProjections, formatCurrency, formatPercent, formatNumber } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import ProjectionTable from "@/components/calculator/ProjectionTable";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

const COLORS = ["#6366f1", "#10b981"];

interface Props { meta: CalculatorMeta }

export default function SIPCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const fmt = (v: number, compact = false) => formatCurrency(v, currency, compact);
  const [monthly, setMonthly] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);

  const result = useMemo(() => calcSIP(monthly, annualReturn, years), [monthly, annualReturn, years]);
  const projections = useMemo(() => generateProjections(0, monthly * 12, annualReturn, inflationRate, Math.min(years, 40)), [monthly, annualReturn, inflationRate, years]);

  const chartData = useMemo(() => projections.map(p => ({
    year: p.year.toString(),
    "Total Value": Math.round(p.value),
    "Amount Invested": Math.round(p.contributions),
    "Wealth Gained": Math.round(p.interest),
  })), [projections]);

  const pieData = [
    { name: "Amount Invested", value: Math.round(result.totalInvested) },
    { name: "Wealth Gained", value: Math.round(result.wealthGained) },
  ];

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (result.absoluteReturn > 100) list.push({ type: "success", title: "Excellent Returns!", body: `Your investment will more than double with ${formatPercent(result.absoluteReturn)} absolute return. The power of compounding is working strongly for you.` });
    if (annualReturn > 15) list.push({ type: "warning", title: "High Return Assumption", body: `${formatPercent(annualReturn)} annual return is optimistic. Consider modeling with 10–12% for equity and 6–8% for balanced funds for realistic planning.` });
    if (years < 5) list.push({ type: "info", title: "Short Investment Horizon", body: "SIP works best over 7+ years. Consider extending your horizon to maximize the compounding effect and reduce timing risk." });
    if (result.futureValue > 10_000_000) list.push({ type: "success", title: "Crorepati Goal Achievable!", body: `You will accumulate ${fmt(result.futureValue)} — a significant corpus that can support financial independence.` });
    list.push({ type: "info", title: "Inflation Impact", body: `At ${inflationRate}% inflation, your corpus real value is ~${fmt(result.futureValue / Math.pow(1 + inflationRate / 100, years))}. Plan your goals in real terms.` });
    if (monthly < 5000) list.push({ type: "warning", title: "Increase SIP Amount", body: "Even a small increase in monthly SIP has a disproportionate long-term impact due to compounding. Consider stepping up 10–15% every year." });
    return list;
  }, [result, annualReturn, years, inflationRate, monthly, currency]);

  const faqs: FAQ[] = [
    { q: "What is a SIP?", a: "A Systematic Investment Plan (SIP) lets you invest a fixed amount regularly in mutual funds. It averages out market volatility through rupee cost averaging and builds wealth through compounding." },
    { q: "How is SIP return calculated?", a: "SIP returns are calculated using the future value of annuity formula: FV = P × [(1 + r)^n – 1] / r × (1 + r), where P is monthly investment, r is monthly return rate, and n is total months." },
    { q: "What is the ideal SIP duration?", a: "The longer the better. SIPs work best for 7+ years as compounding needs time to create significant wealth. A 20-30 year SIP can turn modest monthly investments into crores." },
    { q: "Is SIP return guaranteed?", a: "No. SIP returns depend on market performance. Equity SIPs can deliver 12–15% historically but are subject to volatility. Debt funds offer 6–8% with less risk." },
    { q: "What is Step-Up SIP?", a: "A Step-Up SIP increases your monthly amount by a fixed percentage (typically 10–15%) every year to account for salary hikes and inflation, dramatically improving long-term returns." },
    { q: "Can I stop SIP anytime?", a: "Yes, SIPs can be paused or stopped anytime without penalty in most mutual fund schemes. Your invested amount remains invested and continues to grow." },
    { q: "What is the minimum SIP amount?", a: "Most mutual funds accept SIP starting from ₹100–₹500 per month. Some specialized funds may require higher minimums." },
    { q: "How does SIP help in volatile markets?", a: "Through rupee cost averaging, SIP buys more units when markets are down and fewer when they're up, lowering your average cost over time and reducing the impact of market timing." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "SIP Future Value Formula",
      formula: "FV = P × [(1 + r)^n – 1] / r × (1 + r)",
      variables: [
        { symbol: "FV", meaning: "Future Value (Maturity Amount)" },
        { symbol: "P", meaning: "Monthly Investment Amount" },
        { symbol: "r", meaning: "Monthly Rate of Return (Annual Rate ÷ 12 ÷ 100)" },
        { symbol: "n", meaning: "Total Number of Months (Years × 12)" },
      ],
      example: `For ₹10,000/month at 12% annual return for 10 years: r = 12/12/100 = 0.01, n = 120, FV = 10,000 × [(1.01)^120 – 1] / 0.01 × 1.01 ≈ ₹23.23 Lakhs`,
    },
  ];

  const reset = () => { setMonthly(10000); setAnnualReturn(12); setYears(10); setInflationRate(6); };

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">SIP Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-5">
            <Input label="Monthly Investment" prefix={symbol} type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} showSlider sliderMin={500} sliderMax={200000} sliderStep={500} tooltip="Amount you want to invest every month" />
            <Input label="Expected Annual Return" suffix="%" type="number" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} sliderStep={0.5} tooltip="Expected annual rate of return from your investment" />
            <Input label="Investment Duration" suffix="Years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={40} tooltip="How long you plan to continue the SIP" />
            <Input label="Inflation Rate" suffix="%" type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={15} sliderStep={0.5} tooltip="Expected annual inflation rate to calculate real returns" />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Future Value" value={fmt(result.futureValue)} subValue="At maturity" icon="🎯" accent="primary" trend="up" />
            <MetricCard label="Total Invested" value={fmt(result.totalInvested)} subValue={`${symbol}${formatNumber(monthly)}/month × ${years * 12} mo`} icon="💰" accent="info" />
            <MetricCard label="Wealth Gained" value={fmt(result.wealthGained)} subValue="Pure returns" icon="📈" accent="success" trend="up" />
            <MetricCard label="Absolute Return" value={formatPercent(result.absoluteReturn)} subValue={`CAGR: ${formatPercent(result.cagr)}`} icon="⚡" accent="warning" />
          </div>

          {/* Charts */}
          <Tabs defaultValue="growth">
            <TabsList>
              <TabsTrigger value="growth">Growth Chart</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            </TabsList>
            <TabsContent value="growth">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Investment Growth Over Time</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt(v, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend />
                    <Area type="monotone" dataKey="Total Value" stroke="#6366f1" fill="url(#colorValue)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Amount Invested" stroke="#10b981" fill="url(#colorInvested)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="breakdown">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Invested vs Returns</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AIInsights insights={insights} />
      <ProjectionTable data={projections} title="SIP Future Projections" currency={currency} />
      <ExportPanel title={meta.name} data={{ "Monthly SIP": fmt(monthly), "Annual Return": formatPercent(annualReturn), "Duration": `${years} years`, "Future Value": fmt(result.futureValue), "Total Invested": fmt(result.totalInvested), "Wealth Gained": fmt(result.wealthGained), "Absolute Return": formatPercent(result.absoluteReturn), "CAGR": formatPercent(result.cagr) }} projections={projections.map(p => ({ year: p.year, value: Math.round(p.value) }))} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />

      {/* Educational Guide */}
      <section className="mt-12 prose prose-slate dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Complete Guide to SIP Investing</h2>
        <div className="space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
          <p>A Systematic Investment Plan (SIP) is one of the most powerful wealth-building tools available to retail investors. By investing a fixed amount regularly, you harness the twin benefits of rupee cost averaging and compound interest, creating significant wealth over time even with modest monthly investments.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Why SIP Outperforms Lump Sum</h3>
          <p>Market timing is nearly impossible even for professional fund managers. SIP eliminates this risk entirely by spreading purchases across market cycles. When markets fall, your fixed SIP buys more units at lower prices; when markets rise, you buy fewer units. Over time, this averages down your cost per unit, improving overall returns.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">The Step-Up SIP Strategy</h3>
          <p>The most effective SIP strategy is the Step-Up SIP, where you increase your monthly amount by 10–15% every year aligned with your salary increments. Starting a ₹10,000 SIP with 10% annual step-up can grow to a ₹26,000+ monthly SIP in 10 years, dramatically accelerating wealth creation.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Common SIP Mistakes to Avoid</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stopping SIP during market downturns (this is actually the best time to continue)</li>
            <li>Investing in too many funds — 3–4 well-chosen funds are sufficient</li>
            <li>Not reviewing fund performance annually</li>
            <li>Choosing funds based solely on recent 1-year returns</li>
            <li>Ignoring expense ratios which eat into long-term returns</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
