"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { calcStepUpSIP, calcSIP, formatCurrency, formatPercent, formatNumber } from "@/lib/formulas";
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

export default function StepUpSIPCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const fmt = (v: number, compact = false) => formatCurrency(v, currency, compact);
  const [monthly, setMonthly] = useState(10000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUpPercent, setStepUpPercent] = useState(10);

  const result = useMemo(() => calcStepUpSIP(monthly, annualReturn, years, stepUpPercent), [monthly, annualReturn, years, stepUpPercent]);
  const regularSIP = useMemo(() => calcSIP(monthly, annualReturn, years), [monthly, annualReturn, years]);

  const extraWealth = result.futureValue - regularSIP.futureValue;
  const extraPercent = regularSIP.futureValue > 0 ? (extraWealth / regularSIP.futureValue) * 100 : 0;

  const chartData = useMemo(() => result.yearlyData.map(d => ({
    year: `Y${d.year}`,
    "Step-Up SIP": d.futureValue,
    "Regular SIP": Math.round(calcSIP(monthly, annualReturn, d.year).futureValue),
    "Amount Invested": d.totalInvested,
  })), [result.yearlyData, monthly, annualReturn]);

  const sipAmountData = useMemo(() => result.yearlyData.map(d => ({
    year: `Y${d.year}`,
    "Monthly SIP": d.monthlyAmount,
  })), [result.yearlyData]);

  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (extraWealth > 0) list.push({ type: "success", title: "Step-Up Advantage", body: `Step-Up SIP generates ${fmt(extraWealth)} (${formatPercent(extraPercent, 0)}) more wealth than a regular SIP. This is the power of annual increases!` });
    if (stepUpPercent >= 15) list.push({ type: "warning", title: "Aggressive Step-Up", body: `${stepUpPercent}% annual step-up is aggressive. Your monthly SIP will grow to ${fmt(result.yearlyData[result.yearlyData.length - 1]?.monthlyAmount ?? monthly)} by year ${years}. Ensure your income growth supports this.` });
    if (result.absoluteReturn > 150) list.push({ type: "success", title: "Exceptional Wealth Creation", body: `Your ${formatPercent(result.absoluteReturn, 0)} absolute return demonstrates the incredible power of compounding combined with step-up investing.` });
    if (stepUpPercent < 5) list.push({ type: "info", title: "Consider Higher Step-Up", body: "Most financial advisors recommend 10-15% annual step-up aligned with salary increments. Even a 5% increase to your current step-up rate would significantly boost long-term returns." });
    const finalMonthly = result.yearlyData[result.yearlyData.length - 1]?.monthlyAmount ?? monthly;
    list.push({ type: "info", title: "Future SIP Amount", body: `By year ${years}, your monthly SIP will be ${fmt(finalMonthly)}/month — a ${formatPercent((finalMonthly - monthly) / monthly * 100, 0)} increase from today's ${fmt(monthly)}.` });
    return list;
  }, [result, extraWealth, extraPercent, stepUpPercent, years, monthly, currency]);

  const faqs: FAQ[] = [
    { q: "What is a Step-Up SIP?", a: "A Step-Up SIP (also called Top-Up SIP) is a Systematic Investment Plan where you increase your monthly investment amount by a fixed percentage every year. For example, starting with ₹10,000/month and increasing 10% annually means you invest ₹11,000 in year 2, ₹12,100 in year 3, and so on." },
    { q: "Why is Step-Up SIP better than regular SIP?", a: "Step-Up SIP leverages both compounding and increasing investments to generate significantly more wealth. A 10% annual step-up on ₹10,000/month SIP can generate 40-60% more wealth over 15-20 years compared to a regular SIP at the same return rate." },
    { q: "What step-up percentage should I choose?", a: "Most financial planners recommend aligning your step-up percentage with your expected annual salary increment — typically 10-15%. This way, you invest a consistent portion of your growing income without impacting your lifestyle." },
    { q: "Can I pause the step-up feature?", a: "Yes! Most mutual fund houses allow you to pause or modify the step-up feature without breaking the SIP. You can pause in years when finances are tight and resume when comfortable." },
    { q: "Is Step-Up SIP available for all mutual funds?", a: "Most major mutual funds in India support Step-Up SIP. SEBI regulations require funds to offer this feature. You can set up Step-Up SIP through your fund's website, app, or through investment platforms like Zerodha, Groww, or Kuvera." },
    { q: "How is Step-Up SIP return calculated?", a: "Each year's contribution is treated as a new SIP starting at the stepped-up amount. The total future value is the sum of all yearly SIP future values. Our calculator uses this exact methodology for accurate results." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "Step-Up SIP Future Value",
      formula: "FV = Σ [Pₙ × {(1 + r)^(12×(Y-n+1)) - 1} / r × (1 + r)]",
      variables: [
        { symbol: "Pₙ", meaning: "Monthly SIP in year n = P₁ × (1 + g)^(n-1)" },
        { symbol: "P₁", meaning: "Initial Monthly Investment" },
        { symbol: "g", meaning: "Annual Step-Up Rate (e.g., 10% = 0.10)" },
        { symbol: "r", meaning: "Monthly Rate of Return (Annual Rate ÷ 12 ÷ 100)" },
        { symbol: "Y", meaning: "Total Investment Duration in Years" },
        { symbol: "n", meaning: "Current Year Number (1 to Y)" },
      ],
      example: `₹10,000/month, 12% annual return, 10 years, 10% step-up: Year 1 SIP = ₹10,000, Year 2 = ₹11,000, Year 3 = ₹12,100... Final value ≈ ₹27.89 Lakhs vs ₹23.23 Lakhs (regular SIP)`,
    },
  ];

  const reset = () => { setMonthly(10000); setAnnualReturn(12); setYears(10); setStepUpPercent(10); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Step-Up SIP Details</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-5">
            <Input label="Initial Monthly Investment" prefix={symbol} type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} showSlider sliderMin={500} sliderMax={200000} sliderStep={500} tooltip="Your starting monthly SIP amount" />
            <Input label="Annual Step-Up Rate" suffix="%" type="number" value={stepUpPercent} onChange={e => setStepUpPercent(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} sliderStep={1} tooltip="Percentage by which your monthly SIP increases every year" />
            <Input label="Expected Annual Return" suffix="%" type="number" value={annualReturn} onChange={e => setAnnualReturn(Number(e.target.value))} showSlider sliderMin={1} sliderMax={30} sliderStep={0.5} tooltip="Expected annual return from your mutual fund" />
            <Input label="Investment Duration" suffix="Years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={40} tooltip="Total SIP investment period" />
          </div>

          {/* Comparison hint */}
          <div className="mt-5 rounded-xl bg-[var(--muted)] border border-[var(--border)] p-3">
            <p className="text-xs font-semibold text-[var(--foreground)] mb-1">vs. Regular SIP</p>
            <p className="text-xs text-[var(--muted-foreground)]">Regular SIP at same rate would yield</p>
            <p className="text-sm font-bold text-[var(--foreground)] mt-0.5">{fmt(regularSIP.futureValue)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Step-Up earns {fmt(extraWealth)} more (+{formatPercent(extraPercent, 0)})
            </p>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Future Value" value={fmt(result.futureValue)} subValue="At maturity" icon="🎯" accent="primary" trend="up" />
            <MetricCard label="Total Invested" value={fmt(result.totalInvested)} subValue={`${years} years of step-up SIP`} icon="💰" accent="info" />
            <MetricCard label="Wealth Gained" value={fmt(result.wealthGained)} subValue="Pure returns" icon="📈" accent="success" trend="up" />
            <MetricCard label="Absolute Return" value={formatPercent(result.absoluteReturn)} subValue={`CAGR: ${formatPercent(result.cagr)}`} icon="⚡" accent="warning" />
          </div>

          <Tabs defaultValue="comparison">
            <TabsList>
              <TabsTrigger value="comparison">SIP Comparison</TabsTrigger>
              <TabsTrigger value="growth">Growth Chart</TabsTrigger>
              <TabsTrigger value="amounts">SIP Amounts</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Step-Up SIP vs Regular SIP</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorStepUp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRegular" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt(v, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend />
                    <Area type="monotone" dataKey="Step-Up SIP" stroke="#8b5cf6" fill="url(#colorStepUp)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="Regular SIP" stroke="#10b981" fill="url(#colorRegular)" strokeWidth={2} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="growth">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Step-Up SIP Wealth Growth</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorStepUp2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt(v, true)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Legend />
                    <Area type="monotone" dataKey="Step-Up SIP" stroke="#8b5cf6" fill="url(#colorStepUp2)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Amount Invested" stroke="#6366f1" fill="url(#colorInvested)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="amounts">
              <Card className="mt-3">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Monthly SIP Amount Over Years</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={sipAmountData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `${symbol}${formatNumber(v)}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="Monthly SIP" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-[var(--muted-foreground)] text-center mt-2">
                  Your monthly SIP grows from {fmt(monthly)} to {fmt(result.yearlyData[result.yearlyData.length - 1]?.monthlyAmount ?? monthly)} by year {years}
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Yearly Breakdown Table */}
          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Year-by-Year Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-[var(--muted-foreground)]">YEAR</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-[var(--muted-foreground)]">MONTHLY SIP</th>
                    <th className="text-right py-2 pr-4 text-xs font-semibold text-[var(--muted-foreground)]">TOTAL INVESTED</th>
                    <th className="text-right py-2 text-xs font-semibold text-[var(--muted-foreground)]">PORTFOLIO VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map(d => (
                    <tr key={d.year} className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="py-2 pr-4 text-[var(--muted-foreground)]">Year {d.year}</td>
                      <td className="py-2 pr-4 text-right font-medium text-[var(--foreground)] tabular-nums">{fmt(d.monthlyAmount)}</td>
                      <td className="py-2 pr-4 text-right text-[var(--muted-foreground)] tabular-nums">{fmt(d.totalInvested)}</td>
                      <td className="py-2 text-right font-semibold text-[var(--primary)] tabular-nums">{fmt(d.futureValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <AIInsights insights={insights} />

      <ExportPanel
        title={meta.name}
        data={{
          "Initial Monthly SIP": fmt(monthly),
          "Annual Step-Up": `${stepUpPercent}%`,
          "Annual Return": formatPercent(annualReturn),
          "Duration": `${years} years`,
          "Future Value": fmt(result.futureValue),
          "Total Invested": fmt(result.totalInvested),
          "Wealth Gained": fmt(result.wealthGained),
          "Absolute Return": formatPercent(result.absoluteReturn),
          "CAGR": formatPercent(result.cagr),
          "vs Regular SIP": `+${fmt(extraWealth)} (+${formatPercent(extraPercent, 0)})`,
        }}
        projections={result.yearlyData.map(d => ({ year: d.year, value: d.futureValue }))}
      />

      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Complete Guide to Step-Up SIP Investing</h2>
        <div className="space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
          <p>Step-Up SIP (also called Top-Up SIP or Increasing SIP) is one of the most powerful yet underutilized wealth-building strategies in India. By simply increasing your monthly SIP amount by a small percentage each year, you can dramatically accelerate your path to financial goals like a crore portfolio, retirement corpus, or child&apos;s education fund.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">The Mathematics of Step-Up SIP</h3>
          <p>The mathematical advantage of Step-Up SIP comes from two compounding engines working simultaneously: the compounding of your existing corpus, and the increasing principal itself. In a regular SIP, only your corpus compounds. In a Step-Up SIP, your investment amount also grows, creating an exponential wealth accumulation curve that widens significantly in later years.</p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Ideal Step-Up Percentages by Income Profile</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-[var(--foreground)]">Conservative (5-7%):</strong> For fixed-income earners or those with limited income growth potential</li>
            <li><strong className="text-[var(--foreground)]">Moderate (8-12%):</strong> For salaried professionals expecting regular increments — the most popular range</li>
            <li><strong className="text-[var(--foreground)]">Aggressive (13-20%):</strong> For high-growth careers, entrepreneurs, or those with variable incomes</li>
          </ul>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Best Practices for Step-Up SIP</h3>
          <p>Set your step-up date aligned with your appraisal cycle so the increase feels natural rather than burdensome. Use direct plans (0% commission) through platforms like Kuvera or Groww. Review your step-up percentage annually and adjust if your financial situation changes. Don&apos;t stop the SIP during market corrections — these are the best buying opportunities.</p>
        </div>
      </section>
    </div>
  );
}
