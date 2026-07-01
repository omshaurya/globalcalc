"use client";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { formatCurrency } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";

interface Props { meta: CalculatorMeta }

const COLORS = ["#6366f1", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface Category { label: string; value: number; color: string; recommended?: number }

export default function BudgetPlannerCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [income, setIncome] = useState(6000);
  const [housing, setHousing] = useState(1500);
  const [transportation, setTransportation] = useState(600);
  const [food, setFood] = useState(600);
  const [utilities, setUtilities] = useState(200);
  const [insurance, setInsurance] = useState(300);
  const [healthcare, setHealthcare] = useState(200);
  const [entertainment, setEntertainment] = useState(300);
  const [personalCare, setPersonalCare] = useState(150);
  const [savings, setSavings] = useState(600);
  const [investments, setInvestments] = useState(400);
  const [other, setOther] = useState(150);

  const categories: Category[] = useMemo(() => [
    { label: "Housing", value: housing, color: COLORS[0], recommended: income * 0.28 },
    { label: "Transportation", value: transportation, color: COLORS[1], recommended: income * 0.15 },
    { label: "Food", value: food, color: COLORS[2], recommended: income * 0.12 },
    { label: "Utilities", value: utilities, color: COLORS[3], recommended: income * 0.05 },
    { label: "Insurance", value: insurance, color: COLORS[4], recommended: income * 0.05 },
    { label: "Healthcare", value: healthcare, color: COLORS[5], recommended: income * 0.05 },
    { label: "Entertainment", value: entertainment, color: COLORS[6], recommended: income * 0.05 },
    { label: "Personal Care", value: personalCare, color: COLORS[7], recommended: income * 0.03 },
    { label: "Savings", value: savings, color: COLORS[8], recommended: income * 0.10 },
    { label: "Investments", value: investments, color: COLORS[0], recommended: income * 0.05 },
    { label: "Other", value: other, color: COLORS[1], recommended: income * 0.07 },
  ].filter(c => c.value > 0), [housing, transportation, food, utilities, insurance, healthcare, entertainment, personalCare, savings, investments, other, income]);

  const totalExpenses = categories.reduce((s, c) => s + c.value, 0);
  const remaining = income - totalExpenses;
  const savingsRate = income > 0 ? ((savings + investments + Math.max(0, remaining)) / income) * 100 : 0;
  const housingPct = income > 0 ? (housing / income) * 100 : 0;
  const needsTotal = housing + transportation + food + utilities + insurance + healthcare;
  const wantsTotal = entertainment + personalCare + other;
  const savingsTotal = savings + investments;
  const needsPct = income > 0 ? (needsTotal / income) * 100 : 0;
  const wantsPct = income > 0 ? (wantsTotal / income) * 100 : 0;
  const savingsPct = income > 0 ? (savingsTotal / income) * 100 : 0;

  const budgetRuleData = [
    { category: "Needs (50%)", actual: Math.round(needsPct), target: 50, actualAmt: needsTotal },
    { category: "Wants (30%)", actual: Math.round(wantsPct), target: 30, actualAmt: wantsTotal },
    { category: "Savings (20%)", actual: Math.round(savingsPct), target: 20, actualAmt: savingsTotal },
  ];

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (remaining >= 0) list.push({ type: "success", title: `${formatCurrency(remaining, currency)} Surplus`, body: `Your expenses (${formatCurrency(totalExpenses, currency)}) are below income (${formatCurrency(income, currency)}). ${remaining > 0 ? `Consider directing the extra ${formatCurrency(remaining, currency)} to investments.` : ""}` });
    else list.push({ type: "danger", title: `${formatCurrency(Math.abs(remaining), currency)} Deficit`, body: `You're spending ${formatCurrency(Math.abs(remaining), currency)} more than you earn. This will lead to debt. Review each category for cuts.` });
    if (housingPct > 30) list.push({ type: "warning", title: `Housing at ${housingPct.toFixed(0)}% of Income`, body: `The recommended housing ceiling is 28-30%. You're at ${housingPct.toFixed(0)}%. Consider roommates, refinancing, or a less expensive area.` });
    if (savingsRate < 15) list.push({ type: "warning", title: `Low Savings Rate: ${savingsRate.toFixed(0)}%`, body: `Aim for 15-20% savings rate. You're at ${savingsRate.toFixed(0)}%. Even increasing by 1% each raise can build significant wealth over time.` });
    else list.push({ type: "success", title: `Savings Rate: ${savingsRate.toFixed(0)}%`, body: `${savingsRate >= 20 ? "Excellent!" : "Good."} Saving ${savingsRate.toFixed(0)}% of income. At this rate, you're building a strong financial foundation.` });
    const ruleCheck = Math.abs(needsPct - 50) + Math.abs(wantsPct - 30) + Math.abs(savingsPct - 20);
    if (ruleCheck < 15) list.push({ type: "success", title: "Aligned with 50/30/20 Rule", body: `Your budget closely follows the 50/30/20 framework: Needs ${needsPct.toFixed(0)}%, Wants ${wantsPct.toFixed(0)}%, Savings ${savingsPct.toFixed(0)}%.` });
    return list;
  }, [remaining, income, totalExpenses, housingPct, savingsRate, needsPct, wantsPct, savingsPct, currency]);

  const faqs: FAQ[] = [
    { q: "What is the 50/30/20 rule?", a: "A popular budgeting framework: 50% of after-tax income to needs (housing, food, utilities), 30% to wants (entertainment, dining out, hobbies), 20% to savings and debt repayment. It's a starting point, not a rigid rule." },
    { q: "How much should I spend on housing?", a: "The general guideline is no more than 28-30% of gross income. Include rent/mortgage, insurance, property tax, and maintenance. In high cost-of-living cities, this may be unavoidable, but aim to keep it under 35% maximum." },
    { q: "What counts as needs vs wants?", a: "Needs: housing, basic food, utilities, transportation to work, health insurance. Wants: restaurant meals, streaming subscriptions, gym membership, vacations, new clothes beyond basics. The line can blur — the distinction helps prioritize cuts." },
    { q: "What is a good savings rate?", a: "15% is the minimum for comfortable retirement. 20% is solid. 25-30%+ accelerates financial independence significantly. Include employer 401k match in your calculation — it's part of your total savings rate." },
    { q: "Should emergency fund savings count in my budget?", a: "Yes. Until you have 3-6 months of expenses saved, emergency fund contributions should be a line item. Once funded, redirect to investments. A funded emergency fund prevents going into debt for unexpected costs." },
    { q: "How do I reduce food expenses?", a: "Meal prep weekly, minimize food waste, compare grocery stores, reduce dining out frequency, use loyalty programs, buy in bulk for staples. The average American spends $3,000+/year eating out. Halving that saves $1,500 annually." },
    { q: "Is zero-based budgeting better?", a: "Zero-based budgeting assigns every dollar a job (income – all expenses/savings = 0). More detailed than 50/30/20, it prevents 'lifestyle creep'. Tools like YNAB are built around this approach. Better for those who want granular control." },
    { q: "How often should I review my budget?", a: "Monthly review to track actual vs planned spending. Quarterly adjustment for seasonal changes. Annual overhaul as income, goals, and life circumstances change. The budget is a living document, not a one-time exercise." },
  ];

  const reset = () => { setIncome(6000); setHousing(1500); setTransportation(600); setFood(600); setUtilities(200); setInsurance(300); setHealthcare(200); setEntertainment(300); setPersonalCare(150); setSavings(600); setInvestments(400); setOther(150); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Monthly Budget</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">INCOME</p>
          <div className="mb-5">
            <Input label="Monthly Take-Home Income" prefix={symbol} type="number" value={income} onChange={e => setIncome(Number(e.target.value))} />
          </div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">NEEDS</p>
          <div className="space-y-3 mb-4">
            <Input label="Housing (Rent/Mortgage)" prefix={symbol} type="number" value={housing} onChange={e => setHousing(Number(e.target.value))} />
            <Input label="Transportation" prefix={symbol} type="number" value={transportation} onChange={e => setTransportation(Number(e.target.value))} />
            <Input label="Food & Groceries" prefix={symbol} type="number" value={food} onChange={e => setFood(Number(e.target.value))} />
            <Input label="Utilities" prefix={symbol} type="number" value={utilities} onChange={e => setUtilities(Number(e.target.value))} />
            <Input label="Insurance" prefix={symbol} type="number" value={insurance} onChange={e => setInsurance(Number(e.target.value))} />
            <Input label="Healthcare" prefix={symbol} type="number" value={healthcare} onChange={e => setHealthcare(Number(e.target.value))} />
          </div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">WANTS</p>
          <div className="space-y-3 mb-4">
            <Input label="Entertainment" prefix={symbol} type="number" value={entertainment} onChange={e => setEntertainment(Number(e.target.value))} />
            <Input label="Personal Care" prefix={symbol} type="number" value={personalCare} onChange={e => setPersonalCare(Number(e.target.value))} />
            <Input label="Other" prefix={symbol} type="number" value={other} onChange={e => setOther(Number(e.target.value))} />
          </div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">SAVINGS</p>
          <div className="space-y-3">
            <Input label="Emergency / Savings" prefix={symbol} type="number" value={savings} onChange={e => setSavings(Number(e.target.value))} />
            <Input label="Investments / Retirement" prefix={symbol} type="number" value={investments} onChange={e => setInvestments(Number(e.target.value))} />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className={`rounded-2xl p-4 flex justify-between items-center ${remaining >= 0 ? "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-900/30" : "bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900/30"}`}>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Monthly {remaining >= 0 ? "Surplus" : "Deficit"}</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(Math.abs(remaining), currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted-foreground)]">Savings Rate</p>
              <p className="text-2xl font-bold text-[var(--primary)]">{savingsRate.toFixed(0)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Total Income" value={formatCurrency(income, currency)} icon="💵" color="text-green-600 dark:text-green-400" />
            <MetricCard label="Total Expenses" value={formatCurrency(totalExpenses, currency)} icon="📊" color={remaining < 0 ? "text-red-600 dark:text-red-400" : undefined} />
            <MetricCard label="Needs" value={formatCurrency(needsTotal, currency)} subValue={`${needsPct.toFixed(0)}% of income`} icon="🏠" />
            <MetricCard label="Wants" value={formatCurrency(wantsTotal, currency)} subValue={`${wantsPct.toFixed(0)}% of income`} icon="🎬" />
          </div>

          <Tabs defaultValue="breakdown">
            <TabsList>
              <TabsTrigger value="breakdown">Spending Breakdown</TabsTrigger>
              <TabsTrigger value="rule">50/30/20 Check</TabsTrigger>
            </TabsList>
            <TabsContent value="breakdown">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Where Your Money Goes</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {categories.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="rule">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">50/30/20 Budget Rule Check</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={budgetRuleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v, name) => [`${v}%`, name]} />
                    <Bar dataKey="actual" name="Your %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="target" name="Target %" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.min(100, Math.max(0, Math.round(savingsRate * 3 + (remaining >= 0 ? 20 : 0) + (housingPct <= 30 ? 20 : 0))))} scoreLabel="Budget Health Score" />
      <ExportPanel title={meta.name} data={{
        "Monthly Income": formatCurrency(income, currency), "Total Expenses": formatCurrency(totalExpenses, currency),
        "Monthly Surplus/Deficit": formatCurrency(remaining, currency), "Savings Rate": `${savingsRate.toFixed(1)}%`,
        "Needs": formatCurrency(needsTotal, currency), "Wants": formatCurrency(wantsTotal, currency),
        "Savings & Investments": formatCurrency(savingsTotal, currency),
      }} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
