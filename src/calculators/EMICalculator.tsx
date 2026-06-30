"use client";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { calcEMI, amortizationSchedule, formatCurrency, formatPercent } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

const COLORS = ["#6366f1", "#f43f5e"];

interface Props { meta: CalculatorMeta }

export default function EMICalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [annualRate, setAnnualRate] = useState(10);
  const [tenureYears, setTenureYears] = useState(5);
  const [extraMonthly, setExtraMonthly] = useState(0);

  const emi = useMemo(() => calcEMI(loanAmount, annualRate, tenureYears * 12), [loanAmount, annualRate, tenureYears]);
  const totalPayment = emi * tenureYears * 12;
  const totalInterest = totalPayment - loanAmount;
  const interestPct = (totalInterest / totalPayment) * 100;
  const schedule = useMemo(() => amortizationSchedule(loanAmount, annualRate, tenureYears * 12), [loanAmount, annualRate, tenureYears]);

  const pieData = [{ name: "Principal", value: loanAmount }, { name: "Total Interest", value: Math.round(totalInterest) }];

  const annualData = useMemo(() => {
    const result = [];
    for (let y = 1; y <= tenureYears; y++) {
      const startIdx = (y - 1) * 12;
      let principal = 0, interest = 0;
      for (let i = startIdx; i < Math.min(y * 12, schedule.length); i++) {
        principal += schedule[i].principal;
        interest += schedule[i].interest;
      }
      result.push({ year: `Y${y}`, principal: Math.round(principal), interest: Math.round(interest) });
    }
    return result;
  }, [schedule, tenureYears]);

  // Early payoff with extra payments
  const payoffSchedule = useMemo(() => {
    if (extraMonthly === 0) return null;
    let balance = loanAmount;
    const r = annualRate / 100 / 12;
    let months = 0;
    let totalInt = 0;
    while (balance > 0 && months < tenureYears * 12) {
      months++;
      const interest = balance * r;
      totalInt += interest;
      balance = balance + interest - emi - extraMonthly;
      if (balance < 0) balance = 0;
    }
    return { months, totalInterest: totalInt, savings: totalInterest - totalInt };
  }, [extraMonthly, loanAmount, annualRate, emi, tenureYears, totalInterest]);

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (interestPct > 40) list.push({ type: "warning", title: "High Interest Cost", body: `Interest makes up ${formatPercent(interestPct)} of your total payments. Consider prepaying or refinancing at a lower rate.` });
    if (payoffSchedule) list.push({ type: "success", title: `Pay Off ${tenureYears * 12 - payoffSchedule.months} Months Early!`, body: `With ${formatCurrency(extraMonthly, currency)}/month extra payment, you save ${formatCurrency(payoffSchedule.savings, currency)} in interest and pay off ${Math.round((tenureYears * 12 - payoffSchedule.months) / 12 * 10) / 10} years early.` });
    if (annualRate > 12) list.push({ type: "warning", title: "Consider Refinancing", body: `At ${annualRate}% interest rate, refinancing even 1–2 percentage points lower could save thousands over the loan term.` });
    list.push({ type: "info", title: "EMI to Income Guideline", body: "Your total EMI obligations should ideally not exceed 40-50% of your net monthly income for financial stability." });
    return list;
  }, [interestPct, payoffSchedule, tenureYears, annualRate, extraMonthly, currency]);

  const faqs: FAQ[] = [
    { q: "What is EMI?", a: "EMI (Equated Monthly Installment) is a fixed monthly payment made toward a loan. It includes both a principal component (reducing your debt) and an interest component (cost of borrowing)." },
    { q: "How is EMI calculated?", a: "EMI = P × [r(1+r)^n] / [(1+r)^n – 1], where P is the loan principal, r is the monthly interest rate, and n is the number of monthly payments." },
    { q: "Does extra EMI payment help?", a: "Yes, significantly. Extra payments directly reduce the principal, which reduces future interest. Even one extra EMI per year can save lakhs and cut years off your loan tenure." },
    { q: "What is a loan amortization schedule?", a: "It's a complete breakdown of every EMI payment showing how much goes to principal vs interest each month, and the outstanding balance after each payment." },
    { q: "Fixed vs floating interest rate?", a: "Fixed rates stay constant throughout the loan, giving payment predictability. Floating rates change with market rates — they can save money when rates fall but increase payments when rates rise." },
    { q: "What is the best tenure for a personal loan?", a: "Shorter tenure = lower total interest but higher EMI. Longer tenure = lower EMI but much higher total interest. Choose the shortest tenure your budget comfortably allows." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "EMI (Equated Monthly Installment) Formula",
      formula: "EMI = P × r × (1+r)^n / [(1+r)^n – 1]",
      variables: [
        { symbol: "P", meaning: "Principal loan amount" },
        { symbol: "r", meaning: "Monthly interest rate (Annual Rate ÷ 12 ÷ 100)" },
        { symbol: "n", meaning: "Total number of monthly payments (Years × 12)" },
      ],
      example: "₹10,00,000 loan at 10% for 5 years: r=0.00833, n=60, EMI = ₹21,247/month",
    },
  ];

  const reset = () => { setLoanAmount(1000000); setAnnualRate(10); setTenureYears(5); setExtraMonthly(0); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Loan Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Loan Amount" prefix={symbol} type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} showSlider sliderMin={10000} sliderMax={10000000} sliderStep={10000} tooltip="Total loan principal amount" />
            <Input label="Annual Interest Rate" suffix="%" type="number" value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} sliderStep={0.1} tooltip="Annual rate of interest on the loan" />
            <Input label="Loan Tenure" suffix="Years" type="number" value={tenureYears} onChange={e => setTenureYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} tooltip="Duration of the loan repayment" />
            <div className="border-t border-[var(--border)] pt-3">
              <Input label="Extra Monthly Payment" prefix={symbol} type="number" value={extraMonthly} onChange={e => setExtraMonthly(Number(e.target.value))} tooltip="Optional extra monthly principal payment to pay off faster" />
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Monthly EMI" value={formatCurrency(emi, currency)} subValue="Fixed monthly payment" icon="💳" color="text-[var(--primary)]" />
            <MetricCard label="Total Payment" value={formatCurrency(totalPayment, currency)} subValue={`Over ${tenureYears} years`} icon="💰" />
            <MetricCard label="Total Interest" value={formatCurrency(totalInterest, currency)} subValue={formatPercent(interestPct) + " of total"} icon="📊" color="text-red-600 dark:text-red-400" />
            {payoffSchedule ? (
              <MetricCard label="Interest Saved" value={formatCurrency(payoffSchedule.savings, currency)} subValue={`${Math.round((tenureYears * 12 - payoffSchedule.months) / 12 * 10) / 10} yrs early`} icon="🚀" color="text-green-600 dark:text-green-400" />
            ) : (
              <MetricCard label="Principal Share" value={formatPercent(100 - interestPct)} subValue="of total payments" icon="🏦" />
            )}
          </div>

          <Tabs defaultValue="pie">
            <TabsList>
              <TabsTrigger value="pie">Payment Split</TabsTrigger>
              <TabsTrigger value="annual">Annual Breakdown</TabsTrigger>
            </TabsList>
            <TabsContent value="pie">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Principal vs Interest</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="annual">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Annual Principal vs Interest</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={annualData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Legend />
                    <Bar dataKey="principal" name="Principal" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interest" name="Interest" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AIInsights insights={insights} />
      <ExportPanel title={meta.name} data={{ "Loan Amount": formatCurrency(loanAmount, currency), "Annual Rate": formatPercent(annualRate), "Tenure": `${tenureYears} years`, "Monthly EMI": formatCurrency(emi, currency), "Total Payment": formatCurrency(totalPayment, currency), "Total Interest": formatCurrency(totalInterest, currency), "Interest %": formatPercent(interestPct) }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
