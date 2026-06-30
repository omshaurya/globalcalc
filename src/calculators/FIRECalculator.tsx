"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { fireNumber, yearsToFire, formatCurrency, formatPercent, generateProjections } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import ProjectionTable from "@/components/calculator/ProjectionTable";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

interface Props { meta: CalculatorMeta }

export default function FIRECalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [annualSavings, setAnnualSavings] = useState(24000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [currentAge, setCurrentAge] = useState(30);
  const [inflationRate, setInflationRate] = useState(3);

  const fireNum = useMemo(() => fireNumber(annualExpenses, withdrawalRate), [annualExpenses, withdrawalRate]);
  const years = useMemo(() => yearsToFire(currentSavings, annualSavings, annualReturn, fireNum), [currentSavings, annualSavings, annualReturn, fireNum]);
  const fireAge = currentAge + years;
  const progressPct = Math.min(100, (currentSavings / fireNum) * 100);

  const projections = useMemo(() => generateProjections(currentSavings, annualSavings, annualReturn, inflationRate, Math.min(years + 5, 40), currentAge), [currentSavings, annualSavings, annualReturn, inflationRate, years, currentAge]);

  const chartData = useMemo(() => projections.map(p => ({
    year: p.year.toString(),
    age: p.age,
    "Portfolio Value": Math.round(p.value),
    "FIRE Target": Math.round(fireNum),
  })), [projections, fireNum]);

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (progressPct >= 100) {
      list.push({ type: "success", title: "You've Already Reached FIRE!", body: `Your current savings of ${formatCurrency(currentSavings, currency)} exceeds your FIRE number of ${formatCurrency(fireNum, currency)}. You can retire today!` });
    } else {
      list.push({ type: "info", title: `${progressPct.toFixed(1)}% of the Way to FIRE`, body: `You need ${formatCurrency(fireNum - currentSavings, currency)} more to reach your FIRE number. At your current savings rate, you'll get there in ~${years} years.` });
    }
    if (withdrawalRate > 4) list.push({ type: "warning", title: "High Withdrawal Rate Risk", body: `A ${withdrawalRate}% SWR increases sequence-of-returns risk. The original Trinity Study found 4% to be safe for 30-year retirements. Consider 3.5–4% for extra safety.` });
    if (annualReturn > 8) list.push({ type: "warning", title: "Return Assumption", body: `${annualReturn}% is on the higher end. Historically, a diversified portfolio returns 6–8% in real terms. Consider running scenarios with 5–7%.` });
    if (annualSavings / (annualExpenses + annualSavings) < 0.2) list.push({ type: "warning", title: "Low Savings Rate", body: "Your savings rate is below 20%. The FIRE community typically aims for 50%+ savings rate to retire early. Every 1% increase in savings rate significantly reduces years to FIRE." });
    list.push({ type: "info", title: "Inflation Impact", body: `By the time you reach FIRE in ${years} years, your annual expenses will be ~${formatCurrency(annualExpenses * Math.pow(1 + inflationRate / 100, years), currency)} in nominal terms (${inflationRate}% inflation). Your FIRE number accounts for this.` });
    return list;
  }, [progressPct, currentSavings, fireNum, years, withdrawalRate, annualReturn, annualSavings, annualExpenses, inflationRate, currency]);

  const faqs: FAQ[] = [
    { q: "What is FIRE?", a: "FIRE stands for Financial Independence, Retire Early. It's a movement where people aggressively save and invest to achieve financial independence and retire well before traditional retirement age." },
    { q: "How is the FIRE number calculated?", a: "Your FIRE number = Annual Expenses ÷ Safe Withdrawal Rate. With a 4% SWR and $60,000 annual expenses, your FIRE number = $60,000 ÷ 0.04 = $1,500,000 (the 25x rule)." },
    { q: "What is the 4% rule?", a: "The 4% rule states that you can safely withdraw 4% of your portfolio annually without running out of money for 30+ years. Based on the Trinity Study analyzing historical market returns." },
    { q: "What savings rate do I need for FIRE?", a: "A 50% savings rate gets you to FIRE in ~17 years, 65% in ~10 years, and 80% in ~5.5 years. The higher your savings rate, the faster you reach FI." },
    { q: "Should I use 3% or 4% withdrawal rate?", a: "Use 3.5% for very early retirement (age 30–40), 4% for age 40–55, and up to 5% if retiring at 60+ with shorter expected portfolio life." },
    { q: "Does FIRE work in any country?", a: "Yes, but the numbers vary. Adjust for local investment returns, cost of living, healthcare, and tax systems. In lower cost-of-living countries, the absolute FIRE number can be much smaller." },
    { q: "What investments should I use for FIRE?", a: "Most FIRE practitioners use low-cost index funds (S&P 500, total market, international). The simple 3-fund portfolio (US stocks, international stocks, bonds) is extremely popular." },
    { q: "What happens if markets crash after I retire?", a: "This is sequence-of-returns risk. Mitigation strategies include a cash buffer (1–2 years expenses), flexible spending (reduce by 10–20% in down years), or part-time work for the first few years." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "FIRE Number (25x Rule)",
      formula: "FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate",
      variables: [
        { symbol: "Annual Expenses", meaning: "Your expected annual spending in retirement" },
        { symbol: "Safe Withdrawal Rate", meaning: "The % you can safely withdraw annually (typically 4%)" },
      ],
      example: "With $60,000/year expenses and 4% SWR: FIRE Number = $60,000 ÷ 0.04 = $1,500,000",
    },
  ];

  const reset = () => { setAnnualExpenses(60000); setCurrentSavings(50000); setAnnualSavings(24000); setAnnualReturn(7); setWithdrawalRate(4); setCurrentAge(30); setInflationRate(3); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Your FIRE Plan</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Annual Expenses" prefix={symbol} type="number" value={annualExpenses} onChange={e => setAnnualExpenses(Number(e.target.value))} showSlider sliderMin={10000} sliderMax={500000} sliderStep={1000} tooltip="Your expected annual spending in retirement" />
            <Input label="Current Savings" prefix={symbol} type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} showSlider sliderMin={0} sliderMax={5000000} sliderStep={5000} tooltip="Your current invested net worth" />
            <Input label="Annual Savings" prefix={symbol} type="number" value={annualSavings} onChange={e => setAnnualSavings(Number(e.target.value))} showSlider sliderMin={0} sliderMax={300000} sliderStep={1000} tooltip="How much you save/invest each year" />
            <Input label="Expected Annual Return" suffix="%" type="number" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} showSlider sliderMin={1} sliderMax={15} sliderStep={0.5} tooltip="Expected investment return per year" />
            <Input label="Safe Withdrawal Rate" suffix="%" type="number" value={withdrawalRate} onChange={e => setWithdrawalRate(Number(e.target.value))} showSlider sliderMin={2} sliderMax={6} sliderStep={0.1} tooltip="Annual withdrawal rate in retirement (4% is standard)" />
            <Input label="Current Age" suffix="Years" type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} showSlider sliderMin={18} sliderMax={65} tooltip="Your current age" />
            <Input label="Inflation Rate" suffix="%" type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={10} sliderStep={0.5} tooltip="Expected annual inflation rate" />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="FIRE Number" value={formatCurrency(fireNum, currency)} subValue="Target portfolio size" icon="🎯" color="text-[var(--primary)]" />
            <MetricCard label="Years to FIRE" value={`${years} years`} subValue={`FIRE Age: ${fireAge}`} icon="⏰" color="text-amber-600 dark:text-amber-400" />
            <MetricCard label="Annual Income" value={formatCurrency(annualExpenses, currency)} subValue={`${withdrawalRate}% SWR`} icon="💵" />
            <MetricCard label="Progress" value={`${progressPct.toFixed(1)}%`} subValue={formatCurrency(currentSavings, currency)} icon="🚀" color="text-green-600 dark:text-green-400" />
          </div>

          {/* Progress bar */}
          <Card>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-[var(--foreground)]">Progress to FIRE</span>
              <span className="text-[var(--primary)] font-semibold">{progressPct.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>{formatCurrency(currentSavings, currency)} saved</span>
              <span>{formatCurrency(fireNum, currency)} needed</span>
            </div>
          </Card>

          {/* Chart */}
          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Portfolio Growth to FIRE</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fireGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [formatCurrency(Number(v), currency), String(name)]} />
                <Legend />
                <ReferenceLine y={fireNum} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "FIRE Target", position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }} />
                <Area type="monotone" dataKey="Portfolio Value" stroke="#6366f1" fill="url(#fireGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.round(progressPct)} scoreLabel="FI Score" />
      <ProjectionTable data={projections} title="Portfolio Growth Projections" currency={currency} />
      <ExportPanel title={meta.name} data={{ "FIRE Number": formatCurrency(fireNum, currency), "Years to FIRE": `${years} years`, "FIRE Age": `${fireAge}`, "Current Savings": formatCurrency(currentSavings, currency), "Annual Savings": formatCurrency(annualSavings, currency), "Safe Withdrawal Rate": formatPercent(withdrawalRate), "Progress": `${progressPct.toFixed(1)}%` }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Complete FIRE Planning Guide</h2>
        <div className="space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
          <p>Financial Independence, Retire Early (FIRE) is more than a financial strategy — it&apos;s a philosophy of intentional living. By saving aggressively and investing wisely, you gain the freedom to choose how you spend your time rather than being forced to work for money.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">The Four Pillars of FIRE</h3>
          <p><strong className="text-[var(--foreground)]">1. High Savings Rate:</strong> Most FIRE practitioners save 40–70% of their income. This serves two purposes: it builds your portfolio faster AND it proves you can live on less, reducing your FIRE number simultaneously.</p>
          <p><strong className="text-[var(--foreground)]">2. Low-Cost Investing:</strong> Index funds with expense ratios below 0.1% are the FIRE community&apos;s weapon of choice. Actively managed funds rarely beat the market after fees.</p>
          <p><strong className="text-[var(--foreground)]">3. The 4% Rule:</strong> Research by Bengen (1994) and the Trinity Study showed that a 4% withdrawal rate survived 95%+ of all 30-year historical periods in US markets. For longer retirements (40+ years), consider 3.5%.</p>
          <p><strong className="text-[var(--foreground)]">4. Tax Optimization:</strong> Max out tax-advantaged accounts (401k, IRA, HSA) first. In early retirement, strategic Roth conversions can further reduce your lifetime tax burden.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">FIRE Variants</h3>
          <p>FIRE isn&apos;t one-size-fits-all. <strong className="text-[var(--foreground)]">Lean FIRE</strong> targets minimal spending ($30k–$40k/year), <strong className="text-[var(--foreground)]">Fat FIRE</strong> plans for $100k+/year, and <strong className="text-[var(--foreground)]">Barista FIRE</strong> supplements investment income with part-time work.</p>
        </div>
      </section>
    </div>
  );
}
