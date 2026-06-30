"use client";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6"];

export default function NetWorthCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  // Assets
  const [checkingSavings, setCheckingSavings] = useState(15000);
  const [investments, setInvestments] = useState(85000);
  const [retirement401k, setRetirement401k] = useState(120000);
  const [homeValue, setHomeValue] = useState(350000);
  const [otherRealEstate, setOtherRealEstate] = useState(0);
  const [vehicles, setVehicles] = useState(25000);
  const [otherAssets, setOtherAssets] = useState(10000);

  // Liabilities
  const [mortgageBalance, setMortgageBalance] = useState(220000);
  const [autoLoans, setAutoLoans] = useState(12000);
  const [studentLoans, setStudentLoans] = useState(18000);
  const [creditCardDebt, setCreditCardDebt] = useState(4500);
  const [otherDebt, setOtherDebt] = useState(0);

  const assets = useMemo(() => [
    { name: "Cash & Savings", value: checkingSavings },
    { name: "Investments", value: investments },
    { name: "Retirement (401k/IRA)", value: retirement401k },
    { name: "Home", value: homeValue },
    { name: "Other Real Estate", value: otherRealEstate },
    { name: "Vehicles", value: vehicles },
    { name: "Other Assets", value: otherAssets },
  ].filter(a => a.value > 0), [checkingSavings, investments, retirement401k, homeValue, otherRealEstate, vehicles, otherAssets]);

  const liabilities = useMemo(() => [
    { name: "Mortgage", value: mortgageBalance },
    { name: "Auto Loans", value: autoLoans },
    { name: "Student Loans", value: studentLoans },
    { name: "Credit Cards", value: creditCardDebt },
    { name: "Other Debt", value: otherDebt },
  ].filter(l => l.value > 0), [mortgageBalance, autoLoans, studentLoans, creditCardDebt, otherDebt]);

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtToAsset = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidAssets = checkingSavings + investments;

  const barData = [
    { name: "Total Assets", value: totalAssets, fill: "#10b981" },
    { name: "Total Debt", value: totalLiabilities, fill: "#ef4444" },
    { name: "Net Worth", value: netWorth, fill: netWorth >= 0 ? "#6366f1" : "#f59e0b" },
  ];

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (netWorth > 0) list.push({ type: "success", title: `Net Worth: ${formatCurrency(netWorth, currency)}`, body: `Your assets exceed your liabilities by ${formatCurrency(netWorth, currency)}. Debt-to-asset ratio: ${debtToAsset.toFixed(1)}% — ${debtToAsset < 30 ? "excellent" : debtToAsset < 50 ? "good" : "needs attention"}.` });
    else list.push({ type: "warning", title: `Negative Net Worth: ${formatCurrency(netWorth, currency)}`, body: `Your liabilities exceed assets by ${formatCurrency(Math.abs(netWorth), currency)}. Focus on paying down high-interest debt and building savings. This is fixable.` });
    if (liquidAssets < 10000) list.push({ type: "warning", title: "Low Liquid Assets", body: `Liquid assets (cash + investments): ${formatCurrency(liquidAssets, currency)}. Aim for 3-6 months of expenses accessible without penalties.` });
    const retirementRatio = retirement401k / totalAssets;
    if (retirementRatio > 0.4) list.push({ type: "info", title: `${(retirementRatio * 100).toFixed(0)}% in Retirement Accounts`, body: "Good retirement savings concentration. Ensure you also have accessible non-retirement investments for pre-retirement goals." });
    const homeEquity = homeValue - mortgageBalance;
    if (homeValue > 0) list.push({ type: "info", title: `Home Equity: ${formatCurrency(homeEquity, currency)}`, body: `Your home is ${((homeValue / totalAssets) * 100).toFixed(0)}% of total assets. Equity: ${formatCurrency(homeEquity, currency)} (${((homeEquity / homeValue) * 100).toFixed(0)}% LTV).` });
    return list;
  }, [netWorth, debtToAsset, liquidAssets, retirement401k, totalAssets, homeValue, mortgageBalance, currency]);

  const faqs: FAQ[] = [
    { q: "What is a good net worth by age?", a: "A common benchmark: save 0.5× salary by 30, 1× by 35, 3× by 45, 5× by 55, 7× by 65. Median US net worth: ~$121k for all adults, $250k for 45-54 year olds. Comparing yourself to medians can be motivating but individual goals matter most." },
    { q: "Should I include home equity in net worth?", a: "Yes, it's a real asset. However, it's illiquid — you can't spend it without selling or borrowing against it. Track liquid net worth (excluding home) separately to understand your true financial flexibility." },
    { q: "How do I increase net worth?", a: "Earn more, spend less, invest the difference, and minimize debt. The formula is simple: Net Worth = Assets – Liabilities. Every dollar saved and invested, and every dollar of debt paid, directly increases net worth." },
    { q: "Is my net worth good for my age?", a: "Benchmarks vary, but if you're saving 15%+ of income and your net worth is growing, you're doing well. Focus on trajectory (is it growing?) more than absolute number. The best time to start was 10 years ago; the second best is today." },
    { q: "Should I count my 401(k) at full value?", a: "You'll owe income tax when you withdraw from a traditional 401(k). For a more conservative estimate, you could use 70-80% of the balance (adjusting for expected taxes). Roth accounts have no tax impact." },
    { q: "What is debt-to-asset ratio?", a: "Your total liabilities as a percentage of total assets. Under 30% is healthy; 30-50% is moderate; above 50% indicates significant leverage risk. Mortgage debt is often considered 'good' debt — focus on eliminating high-interest debt first." },
    { q: "How often should I calculate net worth?", a: "Monthly or quarterly is ideal — frequent enough to track progress, not so frequent that normal fluctuations cause anxiety. Use it to measure the direction of your financial health over time." },
    { q: "Does net worth include emergency fund?", a: "Yes — an emergency fund in a savings account is part of your cash/savings assets. It should be counted in both net worth and tracked separately as a liquidity metric." },
  ];

  const reset = () => { setCheckingSavings(15000); setInvestments(85000); setRetirement401k(120000); setHomeValue(350000); setOtherRealEstate(0); setVehicles(25000); setOtherAssets(10000); setMortgageBalance(220000); setAutoLoans(12000); setStudentLoans(18000); setCreditCardDebt(4500); setOtherDebt(0); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Inputs */}
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Your Finances</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-1 mb-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">ASSETS</p>
            <div className="space-y-3 pt-2">
              <Input label="Cash & Savings" prefix={symbol} type="number" value={checkingSavings} onChange={e => setCheckingSavings(Number(e.target.value))} />
              <Input label="Investments (Brokerage)" prefix={symbol} type="number" value={investments} onChange={e => setInvestments(Number(e.target.value))} />
              <Input label="Retirement Accounts" prefix={symbol} type="number" value={retirement401k} onChange={e => setRetirement401k(Number(e.target.value))} tooltip="401k, IRA, Roth IRA combined" />
              <Input label="Home Value" prefix={symbol} type="number" value={homeValue} onChange={e => setHomeValue(Number(e.target.value))} />
              <Input label="Other Real Estate" prefix={symbol} type="number" value={otherRealEstate} onChange={e => setOtherRealEstate(Number(e.target.value))} />
              <Input label="Vehicles" prefix={symbol} type="number" value={vehicles} onChange={e => setVehicles(Number(e.target.value))} />
              <Input label="Other Assets" prefix={symbol} type="number" value={otherAssets} onChange={e => setOtherAssets(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">LIABILITIES</p>
            <div className="space-y-3 pt-2">
              <Input label="Mortgage Balance" prefix={symbol} type="number" value={mortgageBalance} onChange={e => setMortgageBalance(Number(e.target.value))} />
              <Input label="Auto Loans" prefix={symbol} type="number" value={autoLoans} onChange={e => setAutoLoans(Number(e.target.value))} />
              <Input label="Student Loans" prefix={symbol} type="number" value={studentLoans} onChange={e => setStudentLoans(Number(e.target.value))} />
              <Input label="Credit Card Debt" prefix={symbol} type="number" value={creditCardDebt} onChange={e => setCreditCardDebt(Number(e.target.value))} />
              <Input label="Other Debt" prefix={symbol} type="number" value={otherDebt} onChange={e => setOtherDebt(Number(e.target.value))} />
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          {/* Big net worth number */}
          <div className={`rounded-2xl p-6 text-center ${netWorth >= 0 ? "bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-950/30 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/30" : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30"}`}>
            <p className="text-sm text-[var(--muted-foreground)] mb-1">Your Net Worth</p>
            <p className={`text-4xl font-bold ${netWorth >= 0 ? "text-[var(--primary)]" : "text-red-600 dark:text-red-400"}`}>{formatCurrency(netWorth, currency)}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">Assets: {formatCurrency(totalAssets, currency)} — Liabilities: {formatCurrency(totalLiabilities, currency)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Total Assets" value={formatCurrency(totalAssets, currency)} icon="📈" color="text-green-600 dark:text-green-400" />
            <MetricCard label="Total Debt" value={formatCurrency(totalLiabilities, currency)} icon="📉" color="text-red-600 dark:text-red-400" />
            <MetricCard label="Liquid Assets" value={formatCurrency(liquidAssets, currency)} subValue="Cash + Investments" icon="💧" />
            <MetricCard label="Debt-to-Asset" value={`${debtToAsset.toFixed(1)}%`} subValue={debtToAsset < 30 ? "Healthy" : debtToAsset < 50 ? "Moderate" : "High leverage"} icon="⚖️" color={debtToAsset < 30 ? "text-green-600 dark:text-green-400" : debtToAsset < 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"} />
          </div>

          <Tabs defaultValue="assets">
            <TabsList>
              <TabsTrigger value="assets">Asset Breakdown</TabsTrigger>
              <TabsTrigger value="summary">Assets vs Debt</TabsTrigger>
            </TabsList>
            <TabsContent value="assets">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={assets} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {assets.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
            <TabsContent value="summary">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Financial Summary</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AIInsights insights={insights} score={Math.min(100, Math.max(0, Math.round(100 - debtToAsset)))} scoreLabel="Financial Health Score" />
      <ExportPanel title={meta.name} data={{
        "Total Assets": formatCurrency(totalAssets, currency), "Total Liabilities": formatCurrency(totalLiabilities, currency),
        "Net Worth": formatCurrency(netWorth, currency), "Liquid Assets": formatCurrency(liquidAssets, currency),
        "Debt-to-Asset Ratio": `${debtToAsset.toFixed(1)}%`, "Home Equity": formatCurrency(homeValue - mortgageBalance, currency),
      }} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
