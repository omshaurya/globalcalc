"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

interface Props { meta: CalculatorMeta }

export default function MortgageCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [annualRate, setAnnualRate] = useState(7.0);
  const [termYears, setTermYears] = useState(30);
  const [propertyTax, setPropertyTax] = useState(300);
  const [insurance, setInsurance] = useState(150);
  const [pmi, setPmi] = useState(0);

  const loanAmount = homePrice - downPayment;
  const downPct = (downPayment / homePrice) * 100;
  const emi = useMemo(() => calcEMI(loanAmount, annualRate, termYears * 12), [loanAmount, annualRate, termYears]);
  const totalMonthly = emi + propertyTax + insurance + pmi;
  const totalPayments = emi * termYears * 12;
  const totalInterest = totalPayments - loanAmount;
  const schedule = useMemo(() => amortizationSchedule(loanAmount, annualRate, termYears * 12), [loanAmount, annualRate, termYears]);

  const annualData = useMemo(() => {
    const byYear: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let y = 1; y <= termYears; y++) {
      const endIdx = Math.min(y * 12, schedule.length) - 1;
      const startIdx = (y - 1) * 12;
      let principal = 0, interest = 0;
      for (let i = startIdx; i < Math.min(y * 12, schedule.length); i++) {
        principal += schedule[i].principal;
        interest += schedule[i].interest;
      }
      byYear.push({ year: y, principal: Math.round(principal), interest: Math.round(interest), balance: Math.round(schedule[endIdx]?.balance || 0) });
    }
    return byYear;
  }, [schedule, termYears]);

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (downPct < 20) list.push({ type: "warning", title: "PMI May Be Required", body: `With ${downPct.toFixed(1)}% down payment, lenders typically require Private Mortgage Insurance (PMI), adding ${symbol}50–${symbol}200/month to your costs.` });
    if (annualRate > 7.5) list.push({ type: "warning", title: "High Interest Rate", body: `At ${annualRate}%, a 1-point rate reduction would save ~${formatCurrency((calcEMI(loanAmount, annualRate - 1, termYears * 12) - emi) * -1 * termYears * 12, currency)} over the loan life. Consider buying down the rate if staying long-term.` });
    const interestRatio = totalInterest / loanAmount;
    if (interestRatio > 1) list.push({ type: "info", title: "Total Interest Exceeds Principal", body: `You'll pay ${formatCurrency(totalInterest, currency)} in interest — ${(interestRatio * 100).toFixed(0)}% of the original loan. Extra principal payments can significantly reduce this.` });
    if (totalMonthly / (homePrice * 0.003) > 0.33) list.push({ type: "warning", title: "Payment to Income Check", body: "Ensure your monthly mortgage payment doesn't exceed 28% of gross monthly income (the 28/36 rule)." });
    list.push({ type: "success", title: "Equity Building", body: `After 5 years, you'll have paid ~${formatCurrency(schedule[59]?.totalPrincipal || 0, currency)} in principal, building meaningful home equity.` });
    return list;
  }, [downPct, annualRate, totalInterest, loanAmount, totalMonthly, homePrice, emi, schedule, currency]);

  const faqs: FAQ[] = [
    { q: "What is included in a mortgage payment?", a: "A full mortgage payment often includes PITI: Principal, Interest, Taxes (property tax), and Insurance (homeowners insurance). PMI may also apply if your down payment is below 20%." },
    { q: "How much house can I afford?", a: "A common rule is that your monthly housing costs should not exceed 28% of gross income (housing ratio) and total debt should not exceed 36% (debt ratio). Use our Mortgage Affordability Calculator for a personalized estimate." },
    { q: "What is the difference between pre-qualification and pre-approval?", a: "Pre-qualification is an informal estimate based on self-reported info. Pre-approval involves a full credit check and documentation review, making your offer stronger." },
    { q: "Should I choose a 15-year or 30-year mortgage?", a: "A 15-year mortgage saves significant interest and builds equity faster but has higher monthly payments. A 30-year offers lower payments and more cash flow flexibility. If you can comfortably afford the 15-year payment, it often saves $100,000+ in interest." },
    { q: "What credit score do I need for a mortgage?", a: "Conventional loans typically require 620+; FHA loans accept as low as 580 (with 3.5% down) or 500 (with 10% down). Higher scores get lower interest rates." },
    { q: "How does making extra payments work?", a: "Extra payments reduce your principal balance, which reduces future interest charges. Even one extra payment per year can reduce a 30-year mortgage by 4–6 years." },
    { q: "What are closing costs?", a: "Closing costs typically run 2–5% of the loan amount and include lender fees, title insurance, appraisal, attorney fees, and prepaid items like insurance and taxes." },
    { q: "Is mortgage interest tax deductible?", a: "For US taxpayers who itemize deductions, mortgage interest on loans up to $750,000 is deductible. However, the standard deduction is now higher, so many homeowners no longer benefit from itemizing." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Monthly Mortgage Payment (EMI Formula)",
      formula: "M = P × [r(1+r)^n] / [(1+r)^n – 1]",
      variables: [
        { symbol: "M", meaning: "Monthly payment (EMI)" },
        { symbol: "P", meaning: "Principal loan amount" },
        { symbol: "r", meaning: "Monthly interest rate (Annual Rate ÷ 12 ÷ 100)" },
        { symbol: "n", meaning: "Total number of payments (Years × 12)" },
      ],
      example: `$320,000 loan at 7% for 30 years: r = 7/12/100 = 0.00583, n = 360, M = $2,129/month`,
    },
  ];

  const reset = () => { setHomePrice(400000); setDownPayment(80000); setAnnualRate(7.0); setTermYears(30); setPropertyTax(300); setInsurance(150); setPmi(0); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Loan Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Home Price" prefix={symbol} type="number" value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} showSlider sliderMin={50000} sliderMax={2000000} sliderStep={5000} tooltip="Total purchase price of the home" />
            <Input label="Down Payment" prefix={symbol} type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} showSlider sliderMin={0} sliderMax={homePrice} sliderStep={1000} tooltip={`${downPct.toFixed(1)}% of home price`} />
            <Input label="Interest Rate (APR)" suffix="%" type="number" value={annualRate} onChange={e => setAnnualRate(Number(e.target.value))} showSlider sliderMin={2} sliderMax={15} sliderStep={0.05} tooltip="Annual interest rate on the mortgage" />
            <Input label="Loan Term" suffix="Years" type="number" value={termYears} onChange={e => setTermYears(Number(e.target.value))} showSlider sliderMin={5} sliderMax={30} tooltip="Duration of the mortgage loan" />
            <div className="border-t border-[var(--border)] pt-3">
              <p className="text-xs text-[var(--muted-foreground)] mb-3 font-medium">Monthly Expenses</p>
              <div className="space-y-3">
                <Input label="Property Tax" prefix={symbol} type="number" value={propertyTax} onChange={e => setPropertyTax(Number(e.target.value))} tooltip="Monthly property tax estimate" />
                <Input label="Home Insurance" prefix={symbol} type="number" value={insurance} onChange={e => setInsurance(Number(e.target.value))} tooltip="Monthly homeowners insurance" />
                <Input label="PMI" prefix={symbol} type="number" value={pmi} onChange={e => setPmi(Number(e.target.value))} tooltip="Private Mortgage Insurance if down payment < 20%" />
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Monthly Payment" value={formatCurrency(emi, currency)} subValue="Principal + Interest" icon="🏠" color="text-[var(--primary)]" />
            <MetricCard label="Total Monthly" value={formatCurrency(totalMonthly, currency)} subValue="With tax & insurance" icon="💵" />
            <MetricCard label="Loan Amount" value={formatCurrency(loanAmount, currency)} subValue={`${downPct.toFixed(1)}% down`} icon="🏦" />
            <MetricCard label="Total Interest" value={formatCurrency(totalInterest, currency)} subValue={`Over ${termYears} years`} icon="📊" color="text-red-600 dark:text-red-400" />
          </div>

          <Tabs defaultValue="amortization">
            <TabsList>
              <TabsTrigger value="amortization">Balance Over Time</TabsTrigger>
              <TabsTrigger value="annual">Annual Breakdown</TabsTrigger>
            </TabsList>
            <TabsContent value="amortization">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Loan Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={annualData}>
                    <defs>
                      <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Legend />
                    <Area type="monotone" dataKey="balance" name="Remaining Balance" stroke="#6366f1" fill="url(#balanceGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="annual">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Annual Principal vs Interest</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={annualData.filter((_, i) => i % 5 === 4 || i === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
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
      <ExportPanel title={meta.name} data={{ "Home Price": formatCurrency(homePrice, currency), "Loan Amount": formatCurrency(loanAmount, currency), "Down Payment": `${formatCurrency(downPayment, currency)} (${downPct.toFixed(1)}%)`, "Interest Rate": formatPercent(annualRate), "Term": `${termYears} years`, "Monthly P&I": formatCurrency(emi, currency), "Total Monthly": formatCurrency(totalMonthly, currency), "Total Interest": formatCurrency(totalInterest, currency), "Total Payments": formatCurrency(totalPayments, currency) }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
