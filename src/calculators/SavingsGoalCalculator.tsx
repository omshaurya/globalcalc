"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { formatCurrency } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

interface Props { meta: CalculatorMeta }

export default function SavingsGoalCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [goalAmount, setGoalAmount] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(800);
  const [annualReturn, setAnnualReturn] = useState(5);
  const [goalYears, setGoalYears] = useState(5);

  const r = annualReturn / 100 / 12;
  const remaining = goalAmount - currentSavings;

  // Months needed to reach goal with current contribution
  const monthsNeeded = useMemo(() => {
    if (monthlyContribution <= 0) return Infinity;
    if (r === 0) return Math.ceil(remaining / monthlyContribution);
    return Math.ceil(Math.log(1 + (remaining * r) / monthlyContribution) / Math.log(1 + r));
  }, [remaining, r, monthlyContribution]);

  // Monthly required to hit goal in goalYears
  const requiredMonthly = useMemo(() => {
    const n = goalYears * 12;
    if (r === 0) return remaining / n;
    return (remaining * r) / (Math.pow(1 + r, n) - 1);
  }, [remaining, r, goalYears]);

  // Projected value at goalYears with current contributions
  const projectedAtGoal = useMemo(() => {
    const n = goalYears * 12;
    return currentSavings * Math.pow(1 + r, n) + monthlyContribution * (Math.pow(1 + r, n) - 1) / r;
  }, [currentSavings, r, monthlyContribution, goalYears]);

  const willMeetGoal = projectedAtGoal >= goalAmount;
  const yearsNeeded = Math.floor(monthsNeeded / 12);
  const monthsRemainder = monthsNeeded % 12;

  const chartData = useMemo(() => {
    const data = [];
    const n = Math.max(goalYears, Math.ceil(monthsNeeded / 12)) * 12;
    const showMonths = Math.min(n, 120);
    const step = Math.max(1, Math.floor(showMonths / 36));
    let value = currentSavings;
    for (let m = 0; m <= showMonths; m += step) {
      value = currentSavings * Math.pow(1 + r, m) + (r > 0 ? monthlyContribution * (Math.pow(1 + r, m) - 1) / r : monthlyContribution * m);
      data.push({ month: `M${m}`, Savings: Math.round(value), Goal: goalAmount });
    }
    return data;
  }, [currentSavings, r, monthlyContribution, goalYears, goalAmount, monthsNeeded]);

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (willMeetGoal) list.push({ type: "success", title: `Goal Achieved by Deadline!`, body: `At ${formatCurrency(monthlyContribution, currency)}/month, you'll have ${formatCurrency(projectedAtGoal, currency)} in ${goalYears} years — ${formatCurrency(projectedAtGoal - goalAmount, currency)} above your ${formatCurrency(goalAmount, currency)} goal.` });
    else list.push({ type: "warning", title: `Shortfall: ${formatCurrency(goalAmount - projectedAtGoal, currency)}`, body: `At current pace, you'll reach ${formatCurrency(projectedAtGoal, currency)} in ${goalYears} years. Increase monthly savings to ${formatCurrency(requiredMonthly, currency)} to hit your goal on time.` });
    if (isFinite(monthsNeeded)) list.push({ type: "info", title: `Goal in ${yearsNeeded}y ${monthsRemainder}m`, body: `With ${formatCurrency(monthlyContribution, currency)}/month at ${annualReturn}% return, you'll reach ${formatCurrency(goalAmount, currency)} in ${monthsNeeded} months${willMeetGoal && monthsNeeded < goalYears * 12 ? ` — ${goalYears * 12 - monthsNeeded} months early!` : ""}.` });
    const interestEarned = projectedAtGoal - currentSavings - monthlyContribution * goalYears * 12;
    if (interestEarned > 0) list.push({ type: "success", title: `${formatCurrency(interestEarned, currency)} Earned in Interest`, body: `Interest and returns do ${((interestEarned / (projectedAtGoal - currentSavings)) * 100).toFixed(0)}% of the work. Investing your savings (not just holding cash) accelerates goal achievement significantly.` });
    return list;
  }, [willMeetGoal, monthlyContribution, projectedAtGoal, goalYears, goalAmount, requiredMonthly, yearsNeeded, monthsRemainder, annualReturn, monthsNeeded, currentSavings, currency]);

  const faqs: FAQ[] = [
    { q: "How do I set a realistic savings goal?", a: "Work backwards: define the goal amount, the deadline, and your current savings. This calculator solves for the required monthly contribution. If the number seems too high, extend the timeline or reduce the goal." },
    { q: "Where should I keep my savings?", a: "Short-term goals (under 3 years): High-yield savings account or CDs. Medium-term (3-7 years): mix of bonds and conservative ETFs. Long-term (7+ years): index funds. Match the account type to your timeline." },
    { q: "What return should I assume?", a: "High-yield savings: 4-5% (2024). CDs: 4-5%. Conservative bond portfolio: 3-5%. Balanced portfolio: 5-7%. Stock-heavy portfolio: 7-10%. Use conservative estimates for near-term goals." },
    { q: "Should I automate my savings?", a: "Absolutely. Automatic transfers on payday remove the temptation to spend first. 'Pay yourself first' is one of the most effective personal finance habits. Set it and forget it." },
    { q: "How does compound interest help savings goals?", a: "Compounding earns returns on your returns. On a 5-year goal at 5%, about 13% of your final amount comes from interest. On a 20-year goal, over 60% comes from returns. Time is the multiplier." },
    { q: "What if I can't consistently save each month?", a: "Irregular income? Use an annual target instead. When a windfall comes (bonus, tax refund), put a percentage directly into savings. Even inconsistent saving builds wealth over time." },
    { q: "How do taxes affect a savings goal?", a: "In a taxable account, interest is taxed annually. Using tax-advantaged accounts (Roth IRA for retirement, 529 for education) can increase your effective return by 15-37% depending on your tax bracket." },
    { q: "Emergency fund vs savings goals — which first?", a: "Build 1 month of expenses emergency fund first (floors), then pursue savings goals in parallel with building to 3-6 months. Don't wait for a 'full' emergency fund before starting goal-directed savings." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Months to Reach Goal",
      formula: "n = ln(1 + r×FV÷PMT) ÷ ln(1+r)",
      variables: [
        { symbol: "FV", meaning: "Remaining goal amount (Goal – Current Savings)" },
        { symbol: "PMT", meaning: "Monthly contribution" },
        { symbol: "r", meaning: "Monthly return rate" },
      ],
    },
    {
      name: "Required Monthly Savings",
      formula: "PMT = FV × r ÷ [(1+r)^n – 1]",
      variables: [
        { symbol: "FV", meaning: "Remaining amount to save" },
        { symbol: "r", meaning: "Monthly return rate" },
        { symbol: "n", meaning: "Months to deadline" },
      ],
      example: `$45,000 in 60 months at 5%/yr: PMT = $45,000 × 0.00417 ÷ [(1.00417)^60 – 1] = $657/month`,
    },
  ];

  const reset = () => { setGoalAmount(50000); setCurrentSavings(5000); setMonthlyContribution(800); setAnnualReturn(5); setGoalYears(5); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Your Goal</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Goal Amount" prefix={symbol} type="number" value={goalAmount} onChange={e => setGoalAmount(Number(e.target.value))} showSlider sliderMin={1000} sliderMax={1000000} sliderStep={1000} tooltip="How much you want to save" />
            <Input label="Current Savings" prefix={symbol} type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} showSlider sliderMin={0} sliderMax={500000} sliderStep={500} />
            <Input label="Monthly Contribution" prefix={symbol} type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} showSlider sliderMin={0} sliderMax={10000} sliderStep={50} />
            <Input label="Expected Annual Return" suffix="%" type="number" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} showSlider sliderMin={0} sliderMax={15} sliderStep={0.5} tooltip="Use 4-5% for savings accounts, 7-10% for investments" />
            <Input label="Target Timeline" suffix="years" type="number" value={goalYears} onChange={e => setGoalYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className={`rounded-2xl p-4 flex items-center gap-3 ${willMeetGoal ? "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-900/30" : "bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30"}`}>
            <span className="text-2xl">{willMeetGoal ? "✅" : "🎯"}</span>
            <div>
              <p className={`font-semibold ${willMeetGoal ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                {willMeetGoal ? `Goal Met in ${goalYears} Years` : "Increase Monthly Savings"}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {willMeetGoal ? `You'll exceed your goal by ${formatCurrency(projectedAtGoal - goalAmount, currency)}` : `Need ${formatCurrency(requiredMonthly, currency)}/month to hit ${formatCurrency(goalAmount, currency)} in ${goalYears} years`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Projected Value" value={formatCurrency(projectedAtGoal, currency)} subValue={`In ${goalYears} years`} icon="💰" color={willMeetGoal ? "text-green-600 dark:text-green-400" : "text-[var(--primary)]"} />
            <MetricCard label="Required Monthly" value={formatCurrency(requiredMonthly, currency)} subValue="To meet deadline" icon="📅" color={monthlyContribution >= requiredMonthly ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"} />
            <MetricCard label="Goal Timeline" value={isFinite(monthsNeeded) ? `${yearsNeeded}y ${monthsRemainder}m` : "Never"} subValue="At current rate" icon="⏱️" />
            <MetricCard label="Total Contributions" value={formatCurrency(currentSavings + monthlyContribution * goalYears * 12, currency)} subValue={`Over ${goalYears} years`} icon="📊" />
          </div>

          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Savings Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <ReferenceLine y={goalAmount} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Goal", position: "insideTopRight", fill: "#f59e0b", fontSize: 10 }} />
                <Area type="monotone" dataKey="Savings" stroke="#6366f1" fill="url(#sgGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.min(100, Math.round((projectedAtGoal / goalAmount) * 80 + (willMeetGoal ? 20 : 0)))} scoreLabel="Goal Progress Score" />
      <ExportPanel title={meta.name} data={{
        "Goal Amount": formatCurrency(goalAmount, currency), "Current Savings": formatCurrency(currentSavings, currency),
        "Monthly Contribution": formatCurrency(monthlyContribution, currency), "Required Monthly": formatCurrency(requiredMonthly, currency),
        "Projected Value": formatCurrency(projectedAtGoal, currency), "Timeline": isFinite(monthsNeeded) ? `${monthsNeeded} months` : "N/A",
      }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
