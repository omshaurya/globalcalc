"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { futureValueAnnuity, futureValue, generateProjections, formatCurrency, formatPercent, monteCarlo } from "@/lib/formulas";
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

interface Props { meta: CalculatorMeta }

export default function RetirementCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(75000);
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [retirementReturn, setRetirementReturn] = useState(5);
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [socialSecurity, setSocialSecurity] = useState(2000);
  const [inflationRate, setInflationRate] = useState(3);
  const [lifeExpectancy, setLifeExpectancy] = useState(90);

  const yearsToRetire = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const r = annualReturn / 100;
  const rm = r / 12;

  const corpusAtRetirement = useMemo(() =>
    futureValue(currentSavings, r, yearsToRetire) +
    futureValueAnnuity(monthlyContribution, rm, yearsToRetire * 12),
    [currentSavings, r, rm, yearsToRetire, monthlyContribution]
  );

  const inflationAdjExpenses = useMemo(() =>
    annualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetire),
    [annualExpenses, inflationRate, yearsToRetire]
  );

  const monthlyShortfall = useMemo(() => {
    const monthlyExpenses = inflationAdjExpenses / 12;
    const monthlyInvestmentIncome = (corpusAtRetirement * retirementReturn / 100) / 12;
    return Math.max(0, monthlyExpenses - monthlyInvestmentIncome - socialSecurity);
  }, [inflationAdjExpenses, corpusAtRetirement, retirementReturn, socialSecurity]);

  const corpusNeeded = useMemo(() => {
    const annualShortfall = inflationAdjExpenses - socialSecurity * 12;
    return Math.max(0, annualShortfall / (retirementReturn / 100));
  }, [inflationAdjExpenses, socialSecurity, retirementReturn]);

  const surplusDeficit = corpusAtRetirement - corpusNeeded;
  const onTrack = surplusDeficit >= 0;

  const projections = useMemo(() =>
    generateProjections(currentSavings, monthlyContribution * 12, annualReturn, inflationRate, Math.min(yearsToRetire + 20, 50), currentAge),
    [currentSavings, monthlyContribution, annualReturn, inflationRate, yearsToRetire, currentAge]
  );

  const monte = useMemo(() =>
    monteCarlo(currentSavings, monthlyContribution * 12, yearsToRetire, annualReturn, 12, 500),
    [currentSavings, monthlyContribution, yearsToRetire, annualReturn]
  );

  const chartData = useMemo(() => projections.map(p => ({
    year: p.year.toString(),
    age: p.age,
    "Portfolio": Math.round(p.value),
    "Contributions": Math.round(p.contributions),
    "Target": Math.round(corpusNeeded),
  })), [projections, corpusNeeded]);

  const monteChartData = [
    { scenario: "Conservative (P10)", value: Math.round(monte.p10) },
    { scenario: "Pessimistic (P25)", value: Math.round(monte.p25) },
    { scenario: "Expected (P50)", value: Math.round(monte.p50) },
    { scenario: "Optimistic (P75)", value: Math.round(monte.p75) },
    { scenario: "Best Case (P90)", value: Math.round(monte.p90) },
  ];

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (onTrack) {
      list.push({ type: "success", title: `On Track! ${formatCurrency(surplusDeficit, currency)} Surplus`, body: `Your projected retirement corpus of ${formatCurrency(corpusAtRetirement, currency)} exceeds your target of ${formatCurrency(corpusNeeded, currency)}. Keep it up!` });
    } else {
      list.push({ type: "danger", title: `${formatCurrency(Math.abs(surplusDeficit), currency)} Shortfall`, body: `You need ${formatCurrency(corpusNeeded, currency)} but are on track for ${formatCurrency(corpusAtRetirement, currency)}. Increase contributions by ~${formatCurrency(Math.abs(surplusDeficit) / yearsToRetire / 12, currency)}/month.` });
    }
    list.push({ type: "info", title: "Inflation Impact", body: `${formatCurrency(annualExpenses, currency)} today = ${formatCurrency(inflationAdjExpenses, currency)}/year at retirement after ${inflationRate}% inflation for ${yearsToRetire} years.` });
    if (monte.successRate < 85) list.push({ type: "warning", title: `${monte.successRate.toFixed(0)}% Monte Carlo Success Rate`, body: "Consider increasing savings or reducing expected expenses to improve your plan's reliability across different market scenarios." });
    else list.push({ type: "success", title: `${monte.successRate.toFixed(0)}% Monte Carlo Success Rate`, body: "Your plan has a strong probability of success across 500 simulated market scenarios. Well-positioned for retirement." });
    if (socialSecurity > 0) list.push({ type: "info", title: "Social Security Benefit", body: `Your ${formatCurrency(socialSecurity, currency)}/month Social Security income reduces the required portfolio by ${formatCurrency(socialSecurity * 12 / (retirementReturn / 100), currency)}.` });
    return list;
  }, [onTrack, surplusDeficit, corpusAtRetirement, corpusNeeded, yearsToRetire, annualExpenses, inflationAdjExpenses, inflationRate, monte, socialSecurity, retirementReturn, currency]);

  const faqs: FAQ[] = [
    { q: "How much should I have saved for retirement by age?", a: "Fidelity's guideline: 1× salary by 30, 3× by 40, 6× by 50, 8× by 60, 10× by 67. These are targets — your actual needs depend on lifestyle, Social Security, and other income." },
    { q: "What is the 4% rule for retirement?", a: "You can safely withdraw 4% of your portfolio annually and not run out of money for 30 years. For a 30-year retirement with $60k/year expenses, you need $1.5M (25× annual expenses)." },
    { q: "Should I prioritize 401(k) or Roth IRA?", a: "First get the full employer 401(k) match (free money), then max the HSA if eligible, then Roth IRA, then back to 401(k). Tax diversification is important — having both pre-tax and Roth accounts gives flexibility." },
    { q: "What is a good retirement savings rate?", a: "Save 15% of gross income including employer match. If starting late (after 35), aim for 20-25%. Time is your biggest asset — even small increases early compound dramatically." },
    { q: "What will $1 million look like in retirement?", a: "At 4% withdrawal: $40,000/year or $3,333/month before taxes. In today's dollars (adjusted for 30 years of 3% inflation), $1M is worth about $412,000 in purchasing power." },
    { q: "How do I account for healthcare in retirement?", a: "Healthcare is often the biggest retirement expense. Budget $300-600/month before Medicare eligibility at 65. Medicare isn't free — premiums, deductibles, and long-term care can cost $250k+ over retirement." },
    { q: "What if I haven't saved enough?", a: "Options: work longer (huge impact), reduce expected spending, take Social Security later (delayed credits add 8%/year from 62-70), downsize home, consider part-time work in early retirement." },
    { q: "When should I claim Social Security?", a: "Earliest: 62 (reduced). Full retirement age: 66-67. Latest: 70 (maximum). Delaying from 62 to 70 can increase your benefit by 75%+. If you're healthy and have savings, delayed claiming is often optimal." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Retirement Corpus Required",
      formula: "Corpus Needed = (Annual Expenses – Other Income) ÷ Withdrawal Rate",
      variables: [
        { symbol: "Annual Expenses", meaning: "Inflation-adjusted spending at retirement" },
        { symbol: "Other Income", meaning: "Social Security, pension, part-time work" },
        { symbol: "Withdrawal Rate", meaning: "Safe withdrawal rate (typically 3.5–4%)" },
      ],
      example: `$60k expenses, $2k/month SS, 4% SWR: ($60,000 – $24,000) ÷ 0.04 = $900,000 needed`,
    },
    {
      name: "Future Portfolio Value",
      formula: "FV = PV × (1+r)^n + PMT × [(1+r)^n – 1] / r",
      variables: [
        { symbol: "PV", meaning: "Current savings balance" },
        { symbol: "PMT", meaning: "Monthly contribution" },
        { symbol: "r", meaning: "Monthly return rate (Annual ÷ 12)" },
        { symbol: "n", meaning: "Total months until retirement" },
      ],
      example: `$75k today + $1,500/month at 7% for 30 years = ~$2.14M at retirement`,
    },
  ];

  const reset = () => { setCurrentAge(35); setRetirementAge(65); setCurrentSavings(75000); setMonthlyContribution(1500); setAnnualReturn(7); setRetirementReturn(5); setAnnualExpenses(60000); setSocialSecurity(2000); setInflationRate(3); setLifeExpectancy(90); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Retirement Plan</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Current Age" suffix="yrs" type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} />
              <Input label="Retire At" suffix="yrs" type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} />
            </div>
            <Input label="Current Savings" prefix={symbol} type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} showSlider sliderMin={0} sliderMax={2000000} sliderStep={5000} tooltip="Total retirement savings today" />
            <Input label="Monthly Contribution" prefix={symbol} type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} showSlider sliderMin={0} sliderMax={5000} sliderStep={50} tooltip="Monthly amount added to retirement accounts" />
            <Input label="Pre-Retirement Return" suffix="%" type="number" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} showSlider sliderMin={1} sliderMax={15} sliderStep={0.5} />
            <Input label="Retirement Withdrawal Rate" suffix="%" type="number" value={retirementReturn} onChange={e => setRetirementReturn(Number(e.target.value))} showSlider sliderMin={2} sliderMax={7} sliderStep={0.1} tooltip="Annual withdrawal rate in retirement (4% is standard)" />
            <Input label="Annual Expenses (Today)" prefix={symbol} type="number" value={annualExpenses} onChange={e => setAnnualExpenses(Number(e.target.value))} showSlider sliderMin={20000} sliderMax={300000} sliderStep={5000} />
            <Input label="Social Security Income" prefix={symbol} suffix="/mo" type="number" value={socialSecurity} onChange={e => setSocialSecurity(Number(e.target.value))} tooltip="Expected monthly Social Security benefit" />
            <Input label="Inflation Rate" suffix="%" type="number" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} showSlider sliderMin={0} sliderMax={8} sliderStep={0.5} />
            <Input label="Life Expectancy" suffix="yrs" type="number" value={lifeExpectancy} onChange={e => setLifeExpectancy(Number(e.target.value))} showSlider sliderMin={70} sliderMax={100} />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          {/* Status banner */}
          <div className={`rounded-2xl p-4 flex items-center gap-3 ${onTrack ? "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-900/30" : "bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900/30"}`}>
            <span className="text-2xl">{onTrack ? "✅" : "⚠️"}</span>
            <div>
              <p className={`font-semibold ${onTrack ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {onTrack ? "On Track for Retirement" : "Retirement Gap Detected"}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {onTrack ? `${formatCurrency(surplusDeficit, currency)} surplus over target` : `${formatCurrency(Math.abs(surplusDeficit), currency)} shortfall from ${formatCurrency(corpusNeeded, currency)} target`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Projected Corpus" value={formatCurrency(corpusAtRetirement, currency)} subValue={`At age ${retirementAge}`} icon="🏦" color="text-[var(--primary)]" />
            <MetricCard label="Target Corpus" value={formatCurrency(corpusNeeded, currency)} subValue="To fund retirement" icon="🎯" />
            <MetricCard label="Monthly Income" value={formatCurrency((corpusAtRetirement * retirementReturn / 100) / 12 + socialSecurity, currency)} subValue="Investment + SS" icon="💵" color="text-green-600 dark:text-green-400" />
            <MetricCard label="Monthly Shortfall" value={monthlyShortfall > 0 ? formatCurrency(monthlyShortfall, currency) : "None"} subValue={monthlyShortfall > 0 ? "Gap to cover" : "Fully funded"} icon={monthlyShortfall > 0 ? "⚠️" : "✅"} color={monthlyShortfall > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"} />
          </div>

          <Tabs defaultValue="growth">
            <TabsList>
              <TabsTrigger value="growth">Growth Chart</TabsTrigger>
              <TabsTrigger value="monte">Monte Carlo</TabsTrigger>
            </TabsList>
            <TabsContent value="growth">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Portfolio vs Target ({yearsToRetire} years to retirement)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Legend />
                    <ReferenceLine y={corpusNeeded} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Target", position: "insideTopRight", fill: "#f59e0b", fontSize: 10 }} />
                    <Area type="monotone" dataKey="Portfolio" stroke="#6366f1" fill="url(#retGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Contributions" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="monte">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-2">Monte Carlo Simulation — 500 Scenarios</h3>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">Success Rate: <span className="font-semibold text-[var(--foreground)]">{monte.successRate.toFixed(1)}%</span></p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monteChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="scenario" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Bar dataKey="value" name="Corpus" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.round(Math.min(100, (corpusAtRetirement / corpusNeeded) * 100))} scoreLabel="Retirement Score" />
      <ProjectionTable data={projections} title="Retirement Savings Projections" currency={currency} />
      <ExportPanel title={meta.name} data={{
        "Current Age": `${currentAge}`, "Retirement Age": `${retirementAge}`, "Years to Retire": `${yearsToRetire}`,
        "Current Savings": formatCurrency(currentSavings, currency), "Monthly Contribution": formatCurrency(monthlyContribution, currency),
        "Projected Corpus": formatCurrency(corpusAtRetirement, currency), "Target Corpus": formatCurrency(corpusNeeded, currency),
        "Surplus / Deficit": formatCurrency(surplusDeficit, currency), "Monte Carlo Success": `${monte.successRate.toFixed(1)}%`,
      }} projections={projections.map(p => ({ year: p.year, value: Math.round(p.value) }))} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Complete Retirement Planning Guide</h2>
        <div className="space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
          <p>Retirement planning is the single most important financial exercise you&apos;ll undertake. Unlike other financial goals, retirement has a fixed deadline and escalating costs due to healthcare, longevity risk, and inflation. Starting early and planning systematically makes the difference between financial security and struggle in your later years.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">The Three-Legged Stool of Retirement Income</h3>
          <p>Traditional retirement planning relies on three income sources: <strong className="text-[var(--foreground)]">Social Security</strong> (government guarantee, claim optimally), <strong className="text-[var(--foreground)]">Pension/Employer Plans</strong> (401k, 403b — maximize employer match), and <strong className="text-[var(--foreground)]">Personal Savings</strong> (IRA, taxable brokerage, real estate). Diversifying across these ensures resilience if any one source underperforms.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Sequence-of-Returns Risk</h3>
          <p>The order of returns matters more than average returns in retirement. A market crash in your first 5 years of retirement can permanently impair your portfolio even if long-term averages recover. Mitigation strategies include a 2-year cash buffer, the bucket strategy (cash/bonds/stocks), and flexible spending (reduce 10-15% in down years).</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">The Impact of Starting Age</h3>
          <p>Saving $500/month from age 25 to 65 at 7% grows to $1.32M. Starting at 35 grows to only $606k. Starting at 45 grows to $248k. The $500/month missed from 25-35 costs you $1.07M in retirement — the price of waiting 10 years is enormous.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Healthcare Planning</h3>
          <p>Healthcare is the wildcard in retirement planning. Fidelity estimates a couple retiring at 65 needs $315,000 for healthcare costs in retirement. Budget $300-600/month for premiums and out-of-pocket before Medicare, and consider a long-term care insurance policy in your 50s when premiums are still manageable.</p>
        </div>
      </section>
    </div>
  );
}
