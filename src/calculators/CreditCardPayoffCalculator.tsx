"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

interface Props { meta: CalculatorMeta }

function calcPayoff(balance: number, apr: number, monthlyPayment: number) {
  const monthlyRate = apr / 100 / 12;
  const minPayment = Math.max(balance * 0.02, 25);
  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  const schedule: { month: number; balance: number; interest: number; principal: number }[] = [];
  if (monthlyPayment <= bal * monthlyRate) return null; // payment doesn't cover interest
  while (bal > 0.01 && months < 600) {
    const interest = bal * monthlyRate;
    const payment = Math.min(monthlyPayment, bal + interest);
    const principal = payment - interest;
    bal -= principal;
    totalInterest += interest;
    months++;
    schedule.push({ month: months, balance: Math.max(0, Math.round(bal)), interest: Math.round(interest * 100) / 100, principal: Math.round(principal * 100) / 100 });
  }
  return { months, totalInterest, minPayment, schedule };
}

export default function CreditCardPayoffCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [balance, setBalance] = useState(8500);
  const [apr, setApr] = useState(22.5);
  const [monthlyPayment, setMonthlyPayment] = useState(400);
  const [extraPayment, setExtraPayment] = useState(0);

  const result = useMemo(() => calcPayoff(balance, apr, monthlyPayment + extraPayment), [balance, apr, monthlyPayment, extraPayment]);
  const baseResult = useMemo(() => calcPayoff(balance, apr, monthlyPayment), [balance, apr, monthlyPayment]);
  const minPaymentResult = useMemo(() => {
    const min = Math.max(balance * 0.02, 25);
    return calcPayoff(balance, apr, min);
  }, [balance, apr]);

  const years = result ? Math.floor(result.months / 12) : 0;
  const months = result ? result.months % 12 : 0;
  const interestSaved = extraPayment > 0 && baseResult && result ? baseResult.totalInterest - result.totalInterest : 0;
  const monthsSaved = extraPayment > 0 && baseResult && result ? baseResult.months - result.months : 0;

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.schedule.filter((_, i) => i % Math.max(1, Math.floor(result.schedule.length / 24)) === 0 || result.schedule.length <= 24).map(r => ({
      month: `M${r.month}`,
      Balance: r.balance,
      Interest: r.interest,
    }));
  }, [result]);

  const comparisonData = [
    { name: "Minimum Payment", months: minPaymentResult?.months ?? 0, interest: Math.round(minPaymentResult?.totalInterest ?? 0) },
    { name: "Your Payment", months: result?.months ?? 0, interest: Math.round(result?.totalInterest ?? 0) },
    ...(extraPayment > 0 ? [{ name: `+${symbol}${extraPayment} Extra`, months: result?.months ?? 0, interest: Math.round(result?.totalInterest ?? 0) }] : []),
  ];

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (!result) { list.push({ type: "danger", title: "Payment Too Low", body: "Your monthly payment doesn't cover the interest. Increase payment to start paying down the balance." }); return list; }
    const effectiveAPR = apr;
    if (effectiveAPR > 20) list.push({ type: "warning", title: `High APR: ${apr}%`, body: `At ${apr}% APR, you're paying ${formatCurrency(result.totalInterest, currency)} in interest on a ${formatCurrency(balance, currency)} balance — ${((result.totalInterest / balance) * 100).toFixed(0)}% more than you borrowed. Consider a 0% balance transfer.` });
    else list.push({ type: "info", title: `APR: ${apr}%`, body: `Total interest cost: ${formatCurrency(result.totalInterest, currency)}. ${((result.totalInterest / balance) * 100).toFixed(0)}% extra on top of the principal.` });
    if (result.months <= 12) list.push({ type: "success", title: `Debt-Free in ${result.months} Months`, body: "You're on a fast track to being debt-free. Keep making consistent payments." });
    else if (result.months <= 36) list.push({ type: "info", title: `${years}y ${months}m to Debt-Free`, body: `Manageable timeline. Increasing payment by just $50/month could save significant interest.` });
    else list.push({ type: "warning", title: `${years}y ${months}m Timeline is Long`, body: `Consider a balance transfer card with 0% intro APR, or a personal loan at lower rates to accelerate payoff.` });
    if (extraPayment > 0 && interestSaved > 0) list.push({ type: "success", title: `Extra ${symbol}${extraPayment}/mo Saves ${formatCurrency(interestSaved, currency)}`, body: `Your extra payment cuts ${monthsSaved} months off your payoff and saves ${formatCurrency(interestSaved, currency)} in interest. Every extra dollar counts!` });
    if (minPaymentResult && minPaymentResult.totalInterest > result.totalInterest) list.push({ type: "danger", title: "Minimum Payment Trap", body: `Paying only the minimum costs ${formatCurrency(minPaymentResult.totalInterest, currency)} in interest over ${Math.ceil(minPaymentResult.months / 12)} years. Your payment saves ${formatCurrency(minPaymentResult.totalInterest - result.totalInterest, currency)}.` });
    return list;
  }, [result, apr, balance, interestSaved, monthsSaved, extraPayment, years, months, minPaymentResult, currency, symbol]);

  const faqs: FAQ[] = [
    { q: "How is credit card interest calculated?", a: "Credit card interest uses the Daily Periodic Rate (DPR = APR ÷ 365). Your daily balance is multiplied by the DPR, and charges accumulate. Most cards compound interest daily, making the effective rate slightly higher than the stated APR." },
    { q: "What is the minimum payment trap?", a: "Paying only the minimum (typically 1-3% of balance) barely covers interest. On an $8,500 balance at 22% APR paying 2% minimum, you'd take 25+ years and pay $9,000+ in interest — more than the original debt." },
    { q: "Should I do a balance transfer?", a: "A 0% APR balance transfer can be ideal if: (1) you can pay off before the promo period ends, (2) the balance transfer fee (typically 3-5%) is less than the interest you'd pay, and (3) you won't add new charges." },
    { q: "Is debt snowball or avalanche better?", a: "Mathematically, the avalanche method (highest APR first) saves the most money. Psychologically, the snowball method (smallest balance first) provides quick wins that keep you motivated. Both work — pick what you'll stick to." },
    { q: "How much does APR actually matter?", a: "Hugely. On $8,500 paying $400/month: at 15% APR you pay $1,850 in interest over 25 months; at 22% you pay $2,900 over 28 months; at 29% you pay $4,100 over 32 months. Reducing APR is as powerful as paying more." },
    { q: "What credit score do I need for a 0% balance transfer?", a: "Typically 670+ (good) for most 0% balance transfer cards. Cards with the best terms (15-21 month 0% periods, low fees) usually require 720+ (very good) credit." },
    { q: "Should I pay off credit cards or invest?", a: "Pay off any card with APR above ~8% before investing (except 401k employer match — always capture that first). The risk-adjusted return on paying off 22% APR debt is guaranteed 22%, which beats almost any investment." },
    { q: "Does paying more than the minimum hurt my credit score?", a: "No — paying more than the minimum helps your score by reducing your credit utilization ratio. Utilization above 30% hurts your score; below 10% is ideal." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Monthly Interest Charge",
      formula: "Interest = Balance × (APR ÷ 12)",
      variables: [
        { symbol: "Balance", meaning: "Current outstanding balance" },
        { symbol: "APR", meaning: "Annual Percentage Rate (as decimal)" },
      ],
      example: "$8,500 × (22.5% ÷ 12) = $8,500 × 0.01875 = $159.38 interest per month",
    },
    {
      name: "Months to Pay Off",
      formula: "n = –ln(1 – r×B÷P) ÷ ln(1+r)",
      variables: [
        { symbol: "B", meaning: "Current balance" },
        { symbol: "P", meaning: "Monthly payment" },
        { symbol: "r", meaning: "Monthly interest rate (APR ÷ 12)" },
      ],
    },
  ];

  const reset = () => { setBalance(8500); setApr(22.5); setMonthlyPayment(400); setExtraPayment(0); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Card Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Current Balance" prefix={symbol} type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} showSlider sliderMin={100} sliderMax={100000} sliderStep={100} />
            <Input label="Interest Rate (APR)" suffix="%" type="number" value={apr} onChange={e => setApr(Number(e.target.value))} showSlider sliderMin={1} sliderMax={36} sliderStep={0.5} tooltip="Your card's annual percentage rate" />
            <Input label="Monthly Payment" prefix={symbol} type="number" value={monthlyPayment} onChange={e => setMonthlyPayment(Number(e.target.value))} showSlider sliderMin={25} sliderMax={5000} sliderStep={25} />
            <Input label="Extra Monthly Payment" prefix={symbol} type="number" value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))} showSlider sliderMin={0} sliderMax={2000} sliderStep={25} tooltip="Additional amount above your regular payment" />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Payoff Timeline" value={result ? `${years > 0 ? `${years}y ` : ""}${months}m` : "Never"} subValue={result ? `${result.months} months total` : "Payment too low"} icon="📅" color="text-[var(--primary)]" />
            <MetricCard label="Total Interest" value={result ? formatCurrency(result.totalInterest, currency) : "—"} subValue={result ? `${((result.totalInterest / balance) * 100).toFixed(0)}% extra cost` : "—"} icon="💸" color="text-red-600 dark:text-red-400" />
            <MetricCard label="Total Paid" value={result ? formatCurrency(balance + result.totalInterest, currency) : "—"} subValue="Principal + Interest" icon="💳" />
            {extraPayment > 0 ? <MetricCard label="Interest Saved" value={formatCurrency(interestSaved, currency)} subValue={`${monthsSaved} months faster`} icon="🎉" color="text-green-600 dark:text-green-400" /> : <MetricCard label="Minimum Payment" value={formatCurrency(Math.max(balance * 0.02, 25), currency)} subValue={`Would take ${minPaymentResult ? Math.ceil(minPaymentResult.months / 12) : "?"}+ years`} icon="⚠️" color="text-orange-600 dark:text-orange-400" />}
          </div>

          <Tabs defaultValue="balance">
            <TabsList>
              <TabsTrigger value="balance">Balance Paydown</TabsTrigger>
              <TabsTrigger value="compare">Comparison</TabsTrigger>
            </TabsList>
            <TabsContent value="balance">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="ccGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Area type="monotone" dataKey="Balance" stroke="#ef4444" fill="url(#ccGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="compare">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Payment Strategies Compared</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Legend />
                    <Bar dataKey="interest" name="Total Interest" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AIInsights insights={insights} />
      <ExportPanel title={meta.name} data={{
        "Balance": formatCurrency(balance, currency), "APR": `${apr}%`, "Monthly Payment": formatCurrency(monthlyPayment + extraPayment, currency),
        "Payoff Timeline": result ? `${result.months} months` : "N/A",
        "Total Interest": result ? formatCurrency(result.totalInterest, currency) : "N/A",
        "Total Cost": result ? formatCurrency(balance + result.totalInterest, currency) : "N/A",
      }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Credit Card Debt Payoff Guide</h2>
        <div className="space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
          <p>Credit card debt is the most expensive debt most people carry. With average APRs around 20-24%, the cost compounds quickly if you&apos;re only making minimum payments. Understanding how interest is calculated and using strategic payoff methods can save thousands of dollars.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Payoff Strategies</h3>
          <p><strong className="text-[var(--foreground)]">Debt Avalanche:</strong> Pay minimums on all cards, direct extra money to the highest APR card first. Mathematically optimal — minimizes total interest paid. Best for disciplined savers focused on numbers.</p>
          <p><strong className="text-[var(--foreground)]">Debt Snowball:</strong> Pay minimums everywhere, attack the smallest balance first. Each paid-off card creates momentum. Research shows higher success rates because psychological wins keep people on track.</p>
          <p><strong className="text-[var(--foreground)]">Balance Transfer:</strong> Move high-APR debt to a 0% intro APR card. Can save thousands if you pay off during the promotional period. Watch for transfer fees (3-5%) and what happens after the promo expires.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">The Power of Extra Payments</h3>
          <p>An extra $100/month on an $8,500 balance at 22% APR reduces your payoff from 28 months to 22 months and saves over $750 in interest. The math is simple: every dollar of principal eliminated stops generating future interest charges.</p>
        </div>
      </section>
    </div>
  );
}
