"use client";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { formatCurrency, formatPercent, futureValue, futureValueAnnuity, generateProjections, coastFireNumber } from "@/lib/formulas";
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

export default function GenericCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const config = getConfig(meta.id);
  const [amount, setAmount] = useState(config.defaults.amount);
  const [rate, setRate] = useState(config.defaults.rate);
  const [years, setYears] = useState(config.defaults.years);
  const [monthly, setMonthly] = useState(config.defaults.monthly ?? 1000);
  const [inflation, setInflation] = useState(config.defaults.inflation ?? 3);
  const [extraField, setExtraField] = useState(config.defaults.extraField ?? 0);

  const result = useMemo(() => config.compute({ amount, rate, years, monthly, inflation, extraField, currency }), [amount, rate, years, monthly, inflation, extraField, currency, config]);

  const projections = useMemo(() => generateProjections(amount, monthly * 12, rate, inflation, Math.min(years, 40)), [amount, monthly, rate, inflation, years]);

  const chartData = useMemo(() => projections.map(p => ({
    year: p.year.toString(),
    "Value": Math.round(p.value),
    "Contributions": Math.round(p.contributions),
  })), [projections]);

  const insights: Insight[] = useMemo(() => config.insights({ amount, rate, years, monthly, inflation, extraField, result, currency }), [amount, rate, years, monthly, inflation, extraField, result, currency, config]);

  const reset = () => {
    setAmount(config.defaults.amount);
    setRate(config.defaults.rate);
    setYears(config.defaults.years);
    setMonthly(config.defaults.monthly ?? 1000);
    setInflation(config.defaults.inflation ?? 3);
    setExtraField(config.defaults.extraField ?? 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:sticky lg:top-24 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">{config.title || "Calculator Inputs"}</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            {config.fields.map(field => {
              const value = field.key === "amount" ? amount : field.key === "rate" ? rate : field.key === "years" ? years : field.key === "monthly" ? monthly : field.key === "inflation" ? inflation : extraField;
              const setter = field.key === "amount" ? setAmount : field.key === "rate" ? setRate : field.key === "years" ? setYears : field.key === "monthly" ? setMonthly : field.key === "inflation" ? setInflation : setExtraField;
              return (
                <Input
                  key={field.key}
                  label={field.label}
                  prefix={field.prefix === "$" ? symbol : field.prefix}
                  suffix={field.suffix}
                  type="number"
                  value={value}
                  onChange={e => setter(Number(e.target.value))}
                  showSlider
                  sliderMin={field.min}
                  sliderMax={field.max}
                  sliderStep={field.step}
                  tooltip={field.tooltip}
                />
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {result.metrics.map((m, i) => (
              <MetricCard key={i} label={m.label} value={m.value} subValue={m.sub} icon={m.icon} color={i === 0 ? "text-[var(--primary)]" : undefined} />
            ))}
          </div>
          {!config.hideChart && (
          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">{config.chartTitle || "Growth Over Time"}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="genericGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Legend />
                <Area type="monotone" dataKey="Value" stroke="#6366f1" fill="url(#genericGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Contributions" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          )}
        </div>
      </div>

      <AIInsights insights={insights} />
      {!config.hideTable && <ProjectionTable data={projections} currency={currency} />}
      <ExportPanel title={meta.name} data={Object.fromEntries(result.metrics.map(m => [m.label, m.value]))} projections={projections.map(p => ({ year: p.year, value: Math.round(p.value) }))} />
      <FormulaSection formulas={config.formulas} />
      <FAQSection faqs={config.faqs} />

      {config.guide && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">{config.guide.title}</h2>
          <div className="space-y-4 text-sm text-[var(--muted-foreground)] leading-relaxed" dangerouslySetInnerHTML={{ __html: config.guide.content }} />
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Calculator Configurations
// ─────────────────────────────────────────────────────────

interface CalcParams { amount: number; rate: number; years: number; monthly: number; inflation: number; extraField: number; currency: string }
interface MetricResult { label: string; value: string; sub?: string; icon?: string }
interface CalcResult { metrics: MetricResult[] }

interface CalculatorConfig {
  title?: string;
  chartTitle?: string;
  hideChart?: boolean;
  hideTable?: boolean;
  defaults: { amount: number; rate: number; years: number; monthly?: number; extraField?: number; inflation?: number };
  fields: { key: string; label: string; prefix?: string; suffix?: string; min: number; max: number; step?: number; tooltip?: string }[];
  compute: (p: CalcParams) => CalcResult;
  insights: (p: CalcParams & { result: CalcResult }) => Insight[];
  formulas: FormulaItem[];
  faqs: FAQ[];
  guide?: { title: string; content: string };
}

function loanConfig(name: string, amountDefault: number, rateDefault: number, yearsDefault: number, tooltip: string): CalculatorConfig {
  return {
    title: `${name} Inputs`,
    chartTitle: "Balance Over Time",
    defaults: { amount: amountDefault, rate: rateDefault, years: yearsDefault },
    fields: [
      { key: "amount", label: `${name} Amount`, prefix: "$", min: 500, max: 2000000, step: 500, tooltip },
      { key: "rate", label: "Annual Interest Rate", suffix: "%", min: 0.5, max: 30, step: 0.1 },
      { key: "years", label: "Loan Term", suffix: "Years", min: 1, max: 30, step: 1 },
      { key: "extraField", label: "Extra Monthly Payment", prefix: "$", min: 0, max: 5000, step: 25, tooltip: "Optional additional payment toward principal each month" },
    ],
    compute: ({ amount, rate, years, extraField, currency }) => {
      const r = rate / 100 / 12;
      const n = years * 12;
      const payment = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPaid = payment * n;
      const totalInterest = totalPaid - amount;
      let balance = amount, monthsWithExtra = 0;
      while (balance > 0 && monthsWithExtra < 600) {
        const interestPortion = balance * r;
        balance = balance - (payment + extraField - interestPortion);
        monthsWithExtra++;
      }
      return { metrics: [
        { label: "Monthly Payment", value: formatCurrency(payment, currency), icon: "💳" },
        { label: "Total Interest", value: formatCurrency(totalInterest, currency), icon: "📊" },
        { label: "Total Paid", value: formatCurrency(totalPaid, currency), icon: "💰" },
        { label: "Payoff With Extra", value: `${(monthsWithExtra / 12).toFixed(1)} yrs`, sub: extraField > 0 ? `Saves ${(years - monthsWithExtra / 12).toFixed(1)} yrs` : "No extra payment", icon: "⏱️" },
      ]};
    },
    insights: ({ rate, years, extraField, currency }) => [
      { type: "info" as const, title: "Loan Summary", body: `At ${rate}% over ${years} years, interest makes up a significant portion of your total payments. Paying extra toward principal reduces this substantially.` },
      ...(extraField > 0 ? [{ type: "success" as const, title: "Extra Payments Save Money", body: `Adding ${formatCurrency(extraField, currency)}/month toward principal shortens your loan term and cuts total interest paid.` }] : [{ type: "warning" as const, title: "Consider Extra Payments", body: "Even small additional monthly payments toward principal can save thousands in interest and years off your loan." }]),
    ],
    formulas: [{ name: "Loan Payment (Amortization)", formula: "PMT = P × r(1+r)^n / [(1+r)^n − 1]", variables: [{ symbol: "P", meaning: "Loan principal" }, { symbol: "r", meaning: "Monthly interest rate" }, { symbol: "n", meaning: "Total number of payments" }], example: `${amountDefault.toLocaleString()} at ${rateDefault}% for ${yearsDefault} years` }],
    faqs: [
      { q: "How is my monthly payment calculated?", a: "Lenders use the amortization formula, which spreads principal and interest across equal payments so the loan is fully paid off by the end of the term." },
      { q: "Should I make extra payments?", a: "Yes, if there's no prepayment penalty. Extra payments go directly to principal, reducing the interest charged on remaining balance and shortening your payoff timeline." },
      { q: "Fixed vs variable interest rate?", a: "Fixed rates stay the same for the loan term, offering predictability. Variable rates can start lower but fluctuate with market conditions, creating payment uncertainty." },
    ],
  };
}

function getConfig(id: string): CalculatorConfig {
  const configs: Record<string, CalculatorConfig> = {
    "coast-fire": {
      title: "Coast FIRE Inputs",
      defaults: { amount: 50000, rate: 7, years: 30 },
      fields: [
        { key: "amount", label: "Current Savings", prefix: "$", min: 0, max: 2000000, step: 1000, tooltip: "Current invested amount" },
        { key: "extraField", label: "FIRE Target", prefix: "$", min: 100000, max: 10000000, step: 10000, tooltip: "Your full FIRE number" },
        { key: "rate", label: "Expected Return", suffix: "%", min: 1, max: 15, step: 0.5, tooltip: "Annual investment return" },
        { key: "years", label: "Years to Retirement", suffix: "Years", min: 1, max: 50, tooltip: "Years until traditional retirement" },
      ],
      compute: ({ amount, rate, years, extraField, currency }) => {
        const coastNum = coastFireNumber(extraField || 1500000, rate, years);
        const isCoasted = amount >= coastNum;
        return { metrics: [
          { label: "Coast FIRE Number", value: formatCurrency(coastNum, currency), sub: "Needed today to coast", icon: "🌊" },
          { label: "Current Savings", value: formatCurrency(amount, currency), sub: isCoasted ? "✅ You've coasted!" : `Need ${formatCurrency(coastNum - amount, currency)} more`, icon: "💰" },
          { label: "FIRE Target", value: formatCurrency(extraField || 1500000, currency), sub: "Full FI number", icon: "🎯" },
          { label: "Growth Needed", value: formatCurrency((extraField || 1500000) - amount, currency), sub: "From compounding", icon: "📈" },
        ]};
      },
      insights: ({ amount, rate, years, extraField, currency }) => {
        const coastNum = coastFireNumber(extraField || 1500000, rate, years);
        return amount >= coastNum
          ? [{ type: "success" as const, title: "You've Reached Coast FIRE!", body: "Your current savings will grow to your FIRE target through compounding alone. You no longer NEED to save more — any additional savings just accelerates retirement." }]
          : [{ type: "info" as const, title: `${formatCurrency(coastNum - amount, currency)} Away from Coast FIRE`, body: `Once you reach ${formatCurrency(coastNum, currency)}, you can stop saving and let compound interest carry you to full FIRE by retirement age.` }];
      },
      formulas: [{ name: "Coast FIRE Number", formula: "Coast FIRE = FIRE Target ÷ (1 + r)^t", variables: [{ symbol: "r", meaning: "Annual return rate" }, { symbol: "t", meaning: "Years to retirement" }], example: "FIRE Target $1.5M, 7% return, 30 years: Coast = $1,500,000 ÷ (1.07)^30 = $197,157" }],
      faqs: [
        { q: "What is Coast FIRE?", a: "Coast FIRE is when you have enough invested that it will grow to your full FIRE number by retirement age at normal market returns, without any additional contributions." },
        { q: "How does Coast FIRE differ from regular FIRE?", a: "Regular FIRE requires both a large enough portfolio AND aggressive savings until retirement. Coast FIRE just requires a smaller 'seed amount' early enough that compounding does the rest." },
        { q: "What can I do after reaching Coast FIRE?", a: "After reaching Coast FIRE, you can switch to a lower-paying but more fulfilling job, reduce work hours, or cover just living expenses without worrying about retirement savings." },
      ],
    },
    "retirement": {
      title: "Retirement Inputs",
      defaults: { amount: 50000, rate: 7, years: 30, monthly: 1500 },
      fields: [
        { key: "amount", label: "Current Savings", prefix: "$", min: 0, max: 5000000, step: 1000 },
        { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 10000, step: 100 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years Until Retirement", suffix: "Years", min: 1, max: 50 },
        { key: "inflation", label: "Inflation Rate", suffix: "%", min: 0, max: 10, step: 0.5 },
      ],
      compute: ({ amount, rate, years, monthly, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const totalContrib = amount + monthly * years * 12;
        const monthlyIncome = fv * 0.04 / 12;
        return { metrics: [
          { label: "Retirement Corpus", value: formatCurrency(fv, currency), icon: "🏖️" },
          { label: "Total Contributions", value: formatCurrency(totalContrib, currency), icon: "💰" },
          { label: "Monthly Income (4%)", value: formatCurrency(monthlyIncome, currency), icon: "💵" },
          { label: "Investment Growth", value: formatCurrency(fv - totalContrib, currency), icon: "📈" },
        ]};
      },
      insights: ({ amount, rate, years, monthly, result, currency }) => [
        { type: "info" as const, title: "Retirement Readiness", body: `At ${rate}% returns for ${years} years, your ${formatCurrency(amount, currency)} savings + ${formatCurrency(monthly, currency)}/month contributions will grow to ${result.metrics[0].value}.` },
        ...(rate > 10 ? [{ type: "warning" as const, title: "Return Assumption", body: "Consider using 6-7% for a more conservative retirement projection." }] : []),
      ],
      formulas: [{ name: "Retirement Corpus Formula", formula: "FV = PV×(1+r)^n + PMT×[(1+r)^n-1]/r", variables: [{ symbol: "PV", meaning: "Current savings" }, { symbol: "PMT", meaning: "Monthly contribution" }, { symbol: "r", meaning: "Monthly return rate" }, { symbol: "n", meaning: "Total months" }], example: "$50k today + $1,500/month at 7% for 30 years = ~$2.1M" }],
      faqs: [
        { q: "How much do I need to retire?", a: "A common rule is 25x your annual expenses (the 4% rule). If you spend $60,000/year, you need $1,500,000 to retire safely." },
        { q: "What is the best retirement account order?", a: "1) 401(k) up to employer match (free money), 2) Max HSA if eligible, 3) Max Roth IRA, 4) Back to 401(k) to the limit, 5) Taxable brokerage account." },
        { q: "When should I start saving for retirement?", a: "Start immediately! Due to compounding, $1 saved at 25 is worth ~$16 at 65 at 7% returns, vs $1 saved at 45 being worth only $4. Time is your greatest asset." },
      ],
    },
    "401k": {
      title: "401(k) Inputs",
      defaults: { amount: 10000, rate: 8, years: 25, monthly: 1500 },
      fields: [
        { key: "amount", label: "Current 401(k) Balance", prefix: "$", min: 0, max: 2000000, step: 1000 },
        { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 2000, step: 50, tooltip: "2024 limit: $23,000/year ($1,917/month)" },
        { key: "extraField", label: "Employer Match", suffix: "%", min: 0, max: 10, step: 0.5, tooltip: "Employer match % of salary (typically 3-6%)" },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years Until Retirement", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, years, monthly, extraField, currency }) => {
        const totalMonthly = monthly + monthly * (extraField / 100);
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(totalMonthly, rate / 100 / 12, years * 12);
        const employerTotal = futureValueAnnuity(monthly * (extraField / 100), rate / 100 / 12, years * 12);
        return { metrics: [
          { label: "Total at Retirement", value: formatCurrency(fv, currency), icon: "🏛️" },
          { label: "Employer Match Value", value: formatCurrency(employerTotal, currency), sub: "Free money!", icon: "🎁" },
          { label: "Monthly Income (4%)", value: formatCurrency(fv * 0.04 / 12, currency), icon: "💵" },
          { label: "Total Contributions", value: formatCurrency(amount + monthly * years * 12, currency), icon: "💰" },
        ]};
      },
      insights: ({ monthly, extraField, currency }) => [
        ...(extraField > 0 ? [{ type: "success" as const, title: "Don't Leave Free Money!", body: `Always contribute at least enough to get the full ${extraField}% employer match. It's an instant 100% return on matched dollars.` }] : [{ type: "warning" as const, title: "Missing Employer Match?", body: "If your employer offers matching, make sure you're contributing at least enough to get the full match — it's the best guaranteed return available." }]),
        { type: "info" as const, title: "2024 Contribution Limit", body: `The 2024 401(k) limit is $23,000 ($30,500 if 50+). You're contributing ${formatCurrency(monthly * 12, currency)}/year. ${monthly * 12 >= 23000 ? "You're maxing out — great job!" : `You can contribute ${formatCurrency(23000 - monthly * 12, currency)} more.`}` },
      ],
      formulas: [{ name: "Future Value with Employer Match", formula: "FV = Balance×(1+r)^n + (Your + Match)×[(1+r)^n-1]/r", variables: [{ symbol: "Match", meaning: "Monthly employer match amount" }], example: "$500/month + 3% match on $5,000 salary = $500 + $150 = $650/month total" }],
      faqs: [
        { q: "What is an employer match and how does it work?", a: "An employer match is free money added to your 401(k). Common is 100% match up to 3-6% of salary. If your employer matches 50% up to 6%, contributing 6% of salary gets you an extra 3%." },
        { q: "Traditional vs Roth 401(k)?", a: "Traditional 401(k) reduces today's taxable income (better if you're in a high tax bracket now). Roth 401(k) pays taxes now for tax-free growth (better if you expect higher taxes in retirement)." },
        { q: "Can I withdraw from my 401(k) early?", a: "Early withdrawals (before 59½) incur a 10% penalty plus income tax. Exceptions include certain hardships, substantially equal payments (72(t)), and separation from service at 55+." },
      ],
    },
    "roth-ira": {
      title: "Roth IRA Inputs",
      defaults: { amount: 5000, rate: 8, years: 30, monthly: 500 },
      fields: [
        { key: "amount", label: "Current Balance", prefix: "$", min: 0, max: 500000, step: 100 },
        { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 541, step: 50, tooltip: "2024 limit: $7,000/year ($583/month)" },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years Until Retirement", suffix: "Years", min: 1, max: 50 },
        { key: "extraField", label: "Marginal Tax Rate", suffix: "%", min: 10, max: 37, step: 1, tooltip: "Your current federal marginal tax rate" },
      ],
      compute: ({ amount, rate, years, monthly, extraField, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const traditionalFv = fv * (1 - extraField / 100);
        const taxSavings = fv - traditionalFv;
        return { metrics: [
          { label: "Tax-Free Balance", value: formatCurrency(fv, currency), sub: "Roth IRA at retirement", icon: "⭐" },
          { label: "Tax Savings vs Traditional", value: formatCurrency(taxSavings, currency), sub: `At ${extraField}% tax rate`, icon: "💰" },
          { label: "Tax-Free Monthly Income", value: formatCurrency(fv * 0.04 / 12, currency), icon: "💵" },
          { label: "Total Contributions", value: formatCurrency(amount + monthly * years * 12, currency), icon: "🏦" },
        ]};
      },
      insights: ({ monthly, years, extraField, currency }) => [
        { type: "success" as const, title: "Tax-Free Growth Advantage", body: `All growth in a Roth IRA is 100% tax-free. At your ${extraField}% tax rate, this is a massive long-term benefit.` },
        { type: "info" as const, title: "2024 Roth IRA Limits", body: `Contribution limit is $7,000/year ($583/month). You're contributing ${formatCurrency(monthly * 12, currency)}/year. Income limits: $161,000 single / $240,000 married.` },
        ...(years > 20 ? [{ type: "success" as const, title: "Time is Your Superpower", body: `With ${years} years of tax-free compounding, your Roth IRA will be one of your most valuable assets in retirement.` }] : []),
      ],
      formulas: [{ name: "Roth IRA Growth", formula: "FV = Balance×(1+r)^n + PMT×[(1+r)^n-1]/r (all tax-free)", variables: [{ symbol: "FV", meaning: "Tax-free balance at retirement" }], example: "$500/month at 8% for 30 years = ~$735,000 (all tax-free)" }],
      faqs: [
        { q: "What is the income limit for Roth IRA?", a: "2024 limits: Single filers can contribute fully below $146,000, phase out $146k–$161k. Married filing jointly: full contribution below $230,000, phase out $230k–$240k." },
        { q: "Can I withdraw contributions early from Roth IRA?", a: "Yes! Unlike Traditional IRAs, you can withdraw your CONTRIBUTIONS (not earnings) at any time, penalty-free. Earnings must wait until 59½ and 5-year holding period." },
        { q: "Roth IRA vs Traditional IRA?", a: "Roth IRA: pay taxes now, tax-free growth. Best if you expect higher taxes in retirement. Traditional IRA: deduct now, pay taxes later. Best if you expect lower taxes in retirement." },
      ],
    },
    "savings-goal": {
      title: "Savings Goal",
      defaults: { amount: 10000, rate: 5, years: 3, monthly: 200 },
      fields: [
        { key: "amount", label: "Savings Goal", prefix: "$", min: 100, max: 1000000, step: 100, tooltip: "Your target savings amount" },
        { key: "extraField", label: "Current Savings", prefix: "$", min: 0, max: 500000, step: 100, tooltip: "Amount already saved" },
        { key: "rate", label: "Interest Rate", suffix: "%", min: 0, max: 15, step: 0.5 },
        { key: "years", label: "Target Timeline", suffix: "Years", min: 0.5, max: 30, step: 0.5 },
      ],
      compute: ({ amount, rate, years, extraField, currency }) => {
        const r = rate / 100 / 12;
        const n = years * 12;
        let monthlyNeeded: number;
        if (r === 0) {
          monthlyNeeded = (amount - extraField) / n;
        } else {
          monthlyNeeded = (amount - extraField * Math.pow(1 + r, n)) * r / (Math.pow(1 + r, n) - 1);
        }
        const totalSaved = extraField + monthlyNeeded * n;
        const interestEarned = amount - totalSaved;
        return { metrics: [
          { label: "Monthly Savings Needed", value: formatCurrency(Math.max(0, monthlyNeeded), currency), sub: "To reach your goal", icon: "🎯" },
          { label: "Target Amount", value: formatCurrency(amount, currency), icon: "🏆" },
          { label: "Current Progress", value: formatCurrency(extraField, currency), sub: `${((extraField / amount) * 100).toFixed(1)}% of goal`, icon: "📊" },
          { label: "Interest Earned", value: formatCurrency(Math.max(0, interestEarned), currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, rate, years, extraField }) => [
        { type: "info" as const, title: "Timeline Analysis", body: `Saving for ${amount.toLocaleString()} over ${years} years at ${rate}% interest. Starting from ${extraField.toLocaleString()}.` },
        ...(rate > 0 ? [{ type: "success" as const, title: "Interest Working for You", body: `At ${rate}% interest, your money grows while you save, reducing the monthly amount needed.` }] : []),
      ],
      formulas: [{ name: "Required Monthly Savings", formula: "PMT = (Goal - PV×(1+r)^n) × r / [(1+r)^n - 1]", variables: [{ symbol: "Goal", meaning: "Target savings amount" }, { symbol: "PV", meaning: "Current savings" }, { symbol: "r", meaning: "Monthly interest rate" }, { symbol: "n", meaning: "Number of months" }], example: "Goal $10,000, current $1,000, 5% rate, 3 years: PMT = ~$233/month" }],
      faqs: [
        { q: "What is the best savings account for a goal?", a: "High-yield savings accounts (HYSA) currently offer 4-5% APY. For goals 3+ years away, consider I-bonds or short-term CDs for potentially higher returns." },
        { q: "Should I pay off debt or save for goals?", a: "High-interest debt (>7%) should usually be paid off first. For low-interest debt, saving and investing simultaneously can be more beneficial due to investment returns." },
        { q: "How do I stay motivated for long-term savings goals?", a: "Use automatic transfers, track progress visually, break big goals into milestones, celebrate small wins, and keep the goal visible with reminders of why it matters." },
      ],
    },
    "budget-planner": {
      title: "Monthly Budget",
      defaults: { amount: 5000, rate: 20, years: 1, monthly: 5000 },
      fields: [
        { key: "monthly", label: "Monthly Income", prefix: "$", min: 1000, max: 50000, step: 100, tooltip: "Total net monthly income" },
        { key: "amount", label: "Monthly Expenses", prefix: "$", min: 0, max: 50000, step: 100, tooltip: "Total monthly expenses" },
        { key: "rate", label: "Savings Target", suffix: "%", min: 0, max: 80, step: 5, tooltip: "% of income to save (50/30/20 rule: save 20%)" },
        { key: "extraField", label: "Current Savings Rate", suffix: "%", min: 0, max: 100, step: 1, tooltip: "Your actual current savings rate" },
      ],
      compute: ({ amount, monthly, rate, currency }) => {
        const savingsAmount = monthly - amount;
        const actualSavingsRate = (savingsAmount / monthly) * 100;
        const targetSavings = monthly * rate / 100;
        const needs = monthly * 0.5;
        const wants = monthly * 0.3;
        return { metrics: [
          { label: "Monthly Savings", value: formatCurrency(Math.max(0, savingsAmount), currency), sub: `${actualSavingsRate.toFixed(1)}% rate`, icon: "💰" },
          { label: "Target Savings", value: formatCurrency(targetSavings, currency), sub: `${rate}% of income`, icon: "🎯" },
          { label: "50% Needs", value: formatCurrency(needs, currency), sub: "Housing, food, utilities", icon: "🏠" },
          { label: "30% Wants", value: formatCurrency(wants, currency), sub: "Entertainment, dining", icon: "🎉" },
        ]};
      },
      insights: ({ amount, monthly, rate, currency }) => {
        const savingsRate = ((monthly - amount) / monthly) * 100;
        return [
          { type: savingsRate >= rate ? "success" as const : "warning" as const, title: savingsRate >= rate ? "Savings Goal Met!" : "Savings Gap", body: savingsRate >= rate ? `You're saving ${savingsRate.toFixed(1)}% of income, meeting your ${rate}% target.` : `You're saving ${savingsRate.toFixed(1)}% vs your ${rate}% target. Reduce expenses to hit your goal.` },
          { type: "info" as const, title: "50/30/20 Rule", body: `The 50/30/20 rule: 50% for needs (${formatCurrency(monthly * 0.5, currency)}), 30% for wants (${formatCurrency(monthly * 0.3, currency)}), 20% savings (${formatCurrency(monthly * 0.2, currency)}).` },
        ];
      },
      formulas: [{ name: "50/30/20 Budget Rule", formula: "Savings = Income × 20%, Needs = Income × 50%, Wants = Income × 30%", variables: [{ symbol: "Income", meaning: "Monthly net take-home pay" }], example: "$5,000 income: $2,500 needs, $1,500 wants, $1,000 savings" }],
      faqs: [
        { q: "What is the 50/30/20 budget rule?", a: "Allocate 50% of after-tax income to needs (rent, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment." },
        { q: "How do I reduce expenses?", a: "Track spending for 30 days, identify highest expense categories, cancel unused subscriptions, negotiate bills, cook more at home, and use cashback credit cards responsibly." },
        { q: "What should I budget first?", a: "Pay yourself first: automatically transfer savings to a separate account before spending. Then cover fixed essentials (rent, utilities, debt), then variable expenses." },
      ],
    },
    "net-worth": {
      title: "Net Worth Calculator",
      defaults: { amount: 50000, rate: 8, years: 10, monthly: 1000 },
      fields: [
        { key: "amount", label: "Total Assets", prefix: "$", min: 0, max: 10000000, step: 1000, tooltip: "Cash + investments + property + retirement accounts" },
        { key: "extraField", label: "Total Liabilities", prefix: "$", min: 0, max: 5000000, step: 1000, tooltip: "All debts: mortgage, loans, credit cards" },
        { key: "monthly", label: "Monthly Savings", prefix: "$", min: 0, max: 20000, step: 100, tooltip: "Net monthly amount added to net worth" },
        { key: "rate", label: "Expected Asset Growth", suffix: "%", min: 0, max: 15, step: 0.5 },
        { key: "years", label: "Projection Years", suffix: "Years", min: 1, max: 40 },
      ],
      compute: ({ amount, extraField, monthly, rate, years, currency }) => {
        const netWorth = amount - extraField;
        const projectedNetWorth = netWorth * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const debtRatio = extraField > 0 ? (extraField / amount) * 100 : 0;
        return { metrics: [
          { label: "Net Worth Today", value: formatCurrency(netWorth, currency), sub: "Assets - Liabilities", icon: "💎" },
          { label: "Projected Net Worth", value: formatCurrency(projectedNetWorth, currency), sub: `In ${years} years`, icon: "📈" },
          { label: "Total Assets", value: formatCurrency(amount, currency), icon: "🏦" },
          { label: "Debt Ratio", value: formatPercent(debtRatio), sub: debtRatio > 50 ? "High - reduce debt" : "Healthy", icon: "⚖️" },
        ]};
      },
      insights: ({ amount, extraField, currency }) => {
        const nw = amount - extraField;
        const debtRatio = extraField > 0 ? (extraField / amount) * 100 : 0;
        return [
          { type: nw > 0 ? "success" as const : "danger" as const, title: nw > 0 ? "Positive Net Worth" : "Negative Net Worth", body: nw > 0 ? `Your net worth is ${formatCurrency(nw, currency)}. Keep building assets and reducing liabilities.` : `Your net worth is ${formatCurrency(nw, currency)}. Focus on paying down high-interest debt while building assets.` },
          ...(debtRatio > 50 ? [{ type: "warning" as const, title: "High Debt-to-Asset Ratio", body: `Your debts are ${debtRatio.toFixed(0)}% of total assets. Aim to reduce this below 30-40% for financial stability.` }] : []),
        ];
      },
      formulas: [{ name: "Net Worth Formula", formula: "Net Worth = Total Assets - Total Liabilities", variables: [{ symbol: "Assets", meaning: "Cash, investments, real estate, retirement accounts, personal property" }, { symbol: "Liabilities", meaning: "Mortgage, car loans, student loans, credit card debt" }], example: "$250,000 assets - $100,000 liabilities = $150,000 net worth" }],
      faqs: [
        { q: "What is a good net worth by age?", a: "A rough guide: Net worth should be ~1x salary by 30, 3x by 40, 6x by 50, 8x by 60. But these are guidelines — focus on steady growth rather than comparisons." },
        { q: "What counts as an asset?", a: "Assets include: cash and checking/savings accounts, investment accounts (stocks, bonds, mutual funds), retirement accounts (401k, IRA), real estate equity, business interests, and valuable personal property." },
        { q: "What should I track in net worth?", a: "Track major assets and liabilities monthly. Include all investment accounts, real estate equity (current value - mortgage balance), and all debts. Exclude everyday personal items unless very valuable." },
      ],
    },
    "currency-exchange": {
      title: "Currency Converter",
      hideChart: true, hideTable: true,
      defaults: { amount: 1000, rate: 83.5, years: 1 },
      fields: [
        { key: "amount", label: "Amount to Convert", prefix: "$", min: 1, max: 1000000, step: 100, tooltip: "Amount in your source currency" },
        { key: "rate", label: "Exchange Rate", min: 0.01, max: 200, step: 0.01, tooltip: "Units of target currency per 1 unit of source currency" },
        { key: "extraField", label: "Transfer Fee", suffix: "%", min: 0, max: 5, step: 0.1, tooltip: "Bank or service transfer fee" },
      ],
      compute: ({ amount, rate, extraField }) => {
        const fee = amount * (extraField / 100);
        const converted = (amount - fee) * rate;
        return { metrics: [
          { label: "Converted Amount", value: converted.toLocaleString(undefined, { maximumFractionDigits: 2 }), icon: "💱" },
          { label: "Transfer Fee", value: fee.toLocaleString(undefined, { maximumFractionDigits: 2 }), icon: "💸" },
          { label: "Effective Rate", value: (converted / amount).toFixed(4), icon: "📊" },
          { label: "Amount Sent", value: amount.toLocaleString(), icon: "💰" },
        ]};
      },
      insights: ({ amount, rate, extraField }) => [
        { type: "info" as const, title: "Exchange Summary", body: `Converting ${amount.toLocaleString()} at a rate of ${rate} with a ${extraField}% fee.` },
        ...(extraField > 2 ? [{ type: "warning" as const, title: "High Transfer Fee", body: "Services like Wise or Revolut typically charge 0.3-0.7% vs traditional banks at 2-4%. Compare before transferring large amounts." }] : []),
      ],
      formulas: [{ name: "Currency Conversion", formula: "Converted = (Amount − Fee) × Exchange Rate", variables: [{ symbol: "Fee", meaning: "Amount × Fee %" }], example: "1,000 at rate 83.5 with 1% fee: (1,000 − 10) × 83.5 = 82,665" }],
      faqs: [
        { q: "What is a good exchange rate?", a: "Compare against the mid-market rate (shown on Google or XE.com). Providers typically mark up 0.5-4% above mid-market." },
        { q: "How do I avoid high transfer fees?", a: "Online services like Wise, Revolut, or OFX usually offer near mid-market rates with fees under 1%, far cheaper than traditional banks." },
      ],
    },
    "simple-interest": {
      title: "Simple Interest Inputs",
      defaults: { amount: 10000, rate: 6, years: 5 },
      fields: [
        { key: "amount", label: "Principal Amount", prefix: "$", min: 100, max: 1000000, step: 100 },
        { key: "rate", label: "Annual Interest Rate", suffix: "%", min: 0.5, max: 25, step: 0.25 },
        { key: "years", label: "Time Period", suffix: "Years", min: 1, max: 30, step: 1 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const interest = (amount * rate * years) / 100;
        const total = amount + interest;
        return { metrics: [
          { label: "Total Interest", value: formatCurrency(interest, currency), icon: "📐" },
          { label: "Total Amount", value: formatCurrency(total, currency), icon: "💰" },
          { label: "Principal", value: formatCurrency(amount, currency), icon: "🏦" },
          { label: "Monthly Interest", value: formatCurrency(interest / (years * 12), currency), icon: "📅" },
        ]};
      },
      insights: ({ amount, rate, years, currency }) => [
        { type: "info" as const, title: "Simple Interest Basics", body: `${formatCurrency(amount, currency)} at ${rate}% simple interest over ${years} years earns interest only on the principal, unlike compound interest.` },
      ],
      formulas: [{ name: "Simple Interest", formula: "SI = (P × R × T) / 100", variables: [{ symbol: "P", meaning: "Principal" }, { symbol: "R", meaning: "Rate %" }, { symbol: "T", meaning: "Time in years" }], example: "$10,000 at 6% for 5 years: SI = (10,000 × 6 × 5) / 100 = $3,000" }],
      faqs: [
        { q: "Simple vs compound interest?", a: "Simple interest is calculated only on the principal. Compound interest is calculated on principal + accumulated interest, growing faster over time." },
        { q: "Where is simple interest used?", a: "Common in short-term loans, car loans, and some personal loans, where interest doesn't compound over the loan term." },
      ],
    },
    "sales-tax": {
      title: "Sales Tax Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100, rate: 7, years: 1 },
      fields: [
        { key: "amount", label: "Price Before Tax", prefix: "$", min: 0, max: 100000, step: 10 },
        { key: "rate", label: "Sales Tax Rate", suffix: "%", min: 0, max: 15, step: 0.1, tooltip: "Combined state + local sales tax rate" },
      ],
      compute: ({ amount, rate, currency }) => {
        const tax = amount * (rate / 100);
        return { metrics: [
          { label: "Sales Tax", value: formatCurrency(tax, currency), icon: "🧾" },
          { label: "Total Price", value: formatCurrency(amount + tax, currency), icon: "💵" },
          { label: "Price Before Tax", value: formatCurrency(amount, currency), icon: "🏷️" },
          { label: "Tax Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ rate, currency, amount }) => [
        { type: "info" as const, title: "Tax Breakdown", body: `At ${rate}% sales tax, a ${formatCurrency(amount, currency)} purchase costs ${formatCurrency(amount * (1 + rate / 100), currency)} total.` },
      ],
      formulas: [{ name: "Sales Tax", formula: "Tax = Price × Rate%", variables: [{ symbol: "Price", meaning: "Pre-tax price" }, { symbol: "Rate", meaning: "Sales tax rate" }], example: "$100 at 7% tax: Tax = $7.00, Total = $107.00" }],
      faqs: [
        { q: "How do I calculate price before tax?", a: "Divide the total price by (1 + tax rate). E.g. $107 total at 7% tax: $107 / 1.07 = $100 pre-tax." },
        { q: "Are sales tax rates the same everywhere?", a: "No, rates vary by state, county, and city. Combined rates in the US range from 0% to over 10% depending on location." },
      ],
    },
    "vat": {
      title: "VAT Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100, rate: 20, years: 1 },
      fields: [
        { key: "amount", label: "Price (Excl. VAT)", prefix: "$", min: 0, max: 100000, step: 10 },
        { key: "rate", label: "VAT Rate", suffix: "%", min: 0, max: 27, step: 0.5, tooltip: "Standard VAT rate (varies by country, e.g. UK 20%, EU 17-27%)" },
      ],
      compute: ({ amount, rate, currency }) => {
        const vat = amount * (rate / 100);
        return { metrics: [
          { label: "VAT Amount", value: formatCurrency(vat, currency), icon: "🧾" },
          { label: "Price Incl. VAT", value: formatCurrency(amount + vat, currency), icon: "💵" },
          { label: "Price Excl. VAT", value: formatCurrency(amount, currency), icon: "🏷️" },
          { label: "VAT Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ rate, currency, amount }) => [
        { type: "info" as const, title: "VAT Breakdown", body: `At ${rate}% VAT, a ${formatCurrency(amount, currency)} item costs ${formatCurrency(amount * (1 + rate / 100), currency)} including VAT.` },
      ],
      formulas: [{ name: "VAT Calculation", formula: "VAT = Price × Rate%", variables: [{ symbol: "Price", meaning: "Price excluding VAT" }, { symbol: "Rate", meaning: "VAT rate" }], example: "$100 at 20% VAT: VAT = $20, Total = $120" }],
      faqs: [
        { q: "How do I remove VAT from a total price?", a: "Divide by (1 + VAT rate). E.g. $120 incl. 20% VAT: $120 / 1.20 = $100 excl. VAT." },
        { q: "Is VAT the same as sales tax?", a: "VAT is collected at each stage of production, while sales tax is collected only at the final sale. Economically, the end consumer pays a similar effective rate." },
      ],
    },
    "profit-margin": {
      title: "Profit Margin Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 50000, rate: 8, years: 1 },
      fields: [
        { key: "amount", label: "Revenue", prefix: "$", min: 0, max: 10000000, step: 1000 },
        { key: "extraField", label: "Total Cost", prefix: "$", min: 0, max: 10000000, step: 1000 },
      ],
      compute: ({ amount, extraField, currency }) => {
        const profit = amount - extraField;
        const margin = amount > 0 ? (profit / amount) * 100 : 0;
        const markupPct = extraField > 0 ? (profit / extraField) * 100 : 0;
        return { metrics: [
          { label: "Gross Profit", value: formatCurrency(profit, currency), icon: "💰" },
          { label: "Profit Margin", value: formatPercent(margin), icon: "📊" },
          { label: "Markup", value: formatPercent(markupPct), icon: "📈" },
          { label: "Total Cost", value: formatCurrency(extraField, currency), icon: "💵" },
        ]};
      },
      insights: ({ amount, extraField, currency }) => {
        const margin = amount > 0 ? ((amount - extraField) / amount) * 100 : 0;
        return [
          { type: margin >= 20 ? "success" as const : "warning" as const, title: margin >= 20 ? "Healthy Margin" : "Thin Margin", body: `Your profit margin is ${margin.toFixed(1)}%. ${margin >= 20 ? "This is generally considered a healthy margin for most industries." : "Consider raising prices or reducing costs to improve profitability."}` },
        ];
      },
      formulas: [{ name: "Profit Margin", formula: "Margin % = (Revenue − Cost) / Revenue × 100", variables: [{ symbol: "Revenue", meaning: "Total sales revenue" }, { symbol: "Cost", meaning: "Total cost of goods/services" }], example: "$50,000 revenue, $40,000 cost: Margin = (50,000−40,000)/50,000 = 20%" }],
      faqs: [
        { q: "What is a good profit margin?", a: "Varies by industry: retail 2-5%, restaurants 3-9%, software/SaaS 70-90%, professional services 15-25%. Compare against industry benchmarks." },
        { q: "Margin vs markup, what's the difference?", a: "Margin is profit as % of revenue (Profit/Revenue). Markup is profit as % of cost (Profit/Cost). A 50% markup is only a 33% margin." },
      ],
    },
    "markup": {
      title: "Markup Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100, rate: 50, years: 1 },
      fields: [
        { key: "amount", label: "Cost Price", prefix: "$", min: 0, max: 1000000, step: 10 },
        { key: "rate", label: "Markup", suffix: "%", min: 0, max: 500, step: 5 },
      ],
      compute: ({ amount, rate, currency }) => {
        const sellingPrice = amount * (1 + rate / 100);
        const profit = sellingPrice - amount;
        const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
        return { metrics: [
          { label: "Selling Price", value: formatCurrency(sellingPrice, currency), icon: "🏷️" },
          { label: "Profit", value: formatCurrency(profit, currency), icon: "💰" },
          { label: "Equivalent Margin", value: formatPercent(margin), icon: "📊" },
          { label: "Cost Price", value: formatCurrency(amount, currency), icon: "💵" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "Markup vs Margin", body: `A ${rate}% markup translates to a lower margin percentage. Remember markup is calculated on cost, margin on selling price.` },
      ],
      formulas: [{ name: "Markup Pricing", formula: "Selling Price = Cost × (1 + Markup%)", variables: [{ symbol: "Cost", meaning: "Cost price" }, { symbol: "Markup", meaning: "Markup percentage" }], example: "$100 cost at 50% markup: Selling Price = 100 × 1.5 = $150" }],
      faqs: [
        { q: "How do I choose a markup percentage?", a: "Consider your costs, competitor pricing, perceived value, and target margin. Retail often uses 50-100% markup (keystone pricing)." },
      ],
    },
    "break-even": {
      title: "Break-Even Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 20000, rate: 50, years: 1 },
      fields: [
        { key: "amount", label: "Fixed Costs", prefix: "$", min: 0, max: 1000000, step: 500, tooltip: "Rent, salaries, and other fixed monthly/annual costs" },
        { key: "rate", label: "Selling Price per Unit", prefix: "$", min: 0.1, max: 10000, step: 0.5 },
        { key: "extraField", label: "Variable Cost per Unit", prefix: "$", min: 0, max: 10000, step: 0.5, tooltip: "Cost to produce/deliver one unit" },
      ],
      compute: ({ amount, rate, extraField, currency }) => {
        const contributionMargin = rate - extraField;
        const beUnits = contributionMargin > 0 ? amount / contributionMargin : 0;
        const beRevenue = beUnits * rate;
        const cmRatio = rate > 0 ? (contributionMargin / rate) * 100 : 0;
        return { metrics: [
          { label: "Break-Even Units", value: Math.ceil(beUnits).toLocaleString(), icon: "📦" },
          { label: "Break-Even Revenue", value: formatCurrency(beRevenue, currency), icon: "💰" },
          { label: "Contribution Margin", value: formatCurrency(contributionMargin, currency), sub: "Per unit", icon: "📊" },
          { label: "CM Ratio", value: formatPercent(cmRatio), icon: "⚖️" },
        ]};
      },
      insights: ({ rate, extraField }) => {
        const cm = rate - extraField;
        return cm <= 0
          ? [{ type: "danger" as const, title: "Negative Contribution Margin", body: "Your variable cost exceeds your selling price. You lose money on every unit sold — raise prices or cut costs immediately." }]
          : [{ type: "info" as const, title: "Path to Profitability", body: `Each unit sold contributes ${cm.toFixed(2)} toward fixed costs. Once you hit your break-even units, every additional sale is pure profit.` }];
      },
      formulas: [{ name: "Break-Even Point", formula: "BEP (units) = Fixed Costs / (Price − Variable Cost)", variables: [{ symbol: "Fixed Costs", meaning: "Costs that don't change with volume" }, { symbol: "Price", meaning: "Selling price per unit" }, { symbol: "Variable Cost", meaning: "Cost per unit produced" }], example: "$20,000 fixed, $50 price, $30 variable cost: BEP = 20,000/(50−30) = 1,000 units" }],
      faqs: [
        { q: "What is break-even analysis used for?", a: "It tells you how many units you must sell to cover all costs before turning a profit — essential for pricing, budgeting, and new product launches." },
        { q: "How can I lower my break-even point?", a: "Reduce fixed costs, lower variable costs per unit, or increase your selling price — any of these reduces the units needed to break even." },
      ],
    },
    "debt-to-income": {
      title: "Debt-to-Income Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 1500, rate: 1, years: 1, monthly: 6000 },
      fields: [
        { key: "monthly", label: "Monthly Gross Income", prefix: "$", min: 500, max: 100000, step: 100 },
        { key: "amount", label: "Housing Payment", prefix: "$", min: 0, max: 20000, step: 50, tooltip: "Rent or mortgage payment" },
        { key: "extraField", label: "Other Monthly Debts", prefix: "$", min: 0, max: 20000, step: 50, tooltip: "Car loans, student loans, credit cards, etc." },
      ],
      compute: ({ amount, extraField, monthly, currency }) => {
        const totalDebt = amount + extraField;
        const dti = monthly > 0 ? (totalDebt / monthly) * 100 : 0;
        const frontEnd = monthly > 0 ? (amount / monthly) * 100 : 0;
        return { metrics: [
          { label: "DTI Ratio", value: formatPercent(dti), sub: dti <= 36 ? "Healthy" : dti <= 43 ? "Acceptable" : "High", icon: "📊" },
          { label: "Front-End Ratio", value: formatPercent(frontEnd), sub: "Housing only", icon: "🏠" },
          { label: "Total Monthly Debt", value: formatCurrency(totalDebt, currency), icon: "💳" },
          { label: "Monthly Income", value: formatCurrency(monthly, currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, extraField, monthly }) => {
        const dti = monthly > 0 ? ((amount + extraField) / monthly) * 100 : 0;
        return dti <= 36
          ? [{ type: "success" as const, title: "Healthy DTI Ratio", body: `Your DTI of ${dti.toFixed(1)}% is well within the 36% threshold most lenders prefer for mortgage approval.` }]
          : dti <= 43
          ? [{ type: "warning" as const, title: "Borderline DTI", body: `Your DTI of ${dti.toFixed(1)}% is at the upper limit (43%) most lenders accept for qualified mortgages.` }]
          : [{ type: "danger" as const, title: "High DTI Ratio", body: `Your DTI of ${dti.toFixed(1)}% exceeds typical lender limits. Pay down debt or increase income before applying for new credit.` }];
      },
      formulas: [{ name: "Debt-to-Income Ratio", formula: "DTI = (Total Monthly Debt / Gross Monthly Income) × 100", variables: [{ symbol: "Total Monthly Debt", meaning: "Housing + all other debt payments" }], example: "$2,500 debt / $6,000 income = 41.7% DTI" }],
      faqs: [
        { q: "What is a good DTI ratio?", a: "Lenders generally prefer DTI below 36%, with a maximum of 43% for most qualified mortgages. Below 20% is considered excellent." },
        { q: "Front-end vs back-end DTI?", a: "Front-end DTI only counts housing costs. Back-end DTI (the standard DTI) counts ALL monthly debt obligations including housing." },
      ],
    },
    "credit-utilization": {
      title: "Credit Utilization Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 2000, rate: 1, years: 1, extraField: 10000 },
      fields: [
        { key: "amount", label: "Total Credit Used", prefix: "$", min: 0, max: 200000, step: 100 },
        { key: "extraField", label: "Total Credit Limit", prefix: "$", min: 100, max: 500000, step: 500 },
      ],
      compute: ({ amount, extraField, currency }) => {
        const utilization = extraField > 0 ? (amount / extraField) * 100 : 0;
        const idealBalance = extraField * 0.1;
        const toReduce = Math.max(0, amount - idealBalance);
        return { metrics: [
          { label: "Utilization Rate", value: formatPercent(utilization), sub: utilization <= 30 ? "Good" : "High", icon: "📊" },
          { label: "Available Credit", value: formatCurrency(extraField - amount, currency), icon: "💳" },
          { label: "Ideal Balance (10%)", value: formatCurrency(idealBalance, currency), icon: "🎯" },
          { label: "Amount to Pay Down", value: formatCurrency(toReduce, currency), icon: "📉" },
        ]};
      },
      insights: ({ amount, extraField }) => {
        const util = extraField > 0 ? (amount / extraField) * 100 : 0;
        return util <= 10
          ? [{ type: "success" as const, title: "Excellent Utilization", body: `Your ${util.toFixed(1)}% utilization is in the ideal range for maximizing your credit score.` }]
          : util <= 30
          ? [{ type: "info" as const, title: "Good Utilization", body: `Your ${util.toFixed(1)}% utilization is healthy. For the best score impact, aim under 10%.` }]
          : [{ type: "warning" as const, title: "High Utilization", body: `Your ${util.toFixed(1)}% utilization may be hurting your credit score. Most experts recommend staying under 30%, ideally under 10%.` }];
      },
      formulas: [{ name: "Credit Utilization", formula: "Utilization % = (Balance / Credit Limit) × 100", variables: [{ symbol: "Balance", meaning: "Total credit card balances" }, { symbol: "Credit Limit", meaning: "Total available credit limit" }], example: "$2,000 balance / $10,000 limit = 20% utilization" }],
      faqs: [
        { q: "What is a good credit utilization ratio?", a: "Under 30% is generally recommended, but under 10% is ideal for the best credit scores. This applies both per-card and across all cards combined." },
        { q: "How often is utilization reported?", a: "Most issuers report your balance to credit bureaus once per statement cycle (monthly), so paying down balances before the statement date can improve utilization quickly." },
      ],
    },
    "salary": {
      title: "Salary Converter",
      hideChart: true, hideTable: true,
      defaults: { amount: 80000, rate: 22, years: 1, extraField: 40 },
      fields: [
        { key: "amount", label: "Annual Salary", prefix: "$", min: 10000, max: 1000000, step: 1000 },
        { key: "extraField", label: "Hours per Week", min: 1, max: 80, step: 1 },
        { key: "rate", label: "Estimated Tax Rate", suffix: "%", min: 0, max: 50, step: 1, tooltip: "Combined federal + state effective tax rate" },
      ],
      compute: ({ amount, extraField, rate, currency }) => {
        const weeklyHours = extraField || 40;
        const monthlyGross = amount / 12;
        const weeklyGross = amount / 52;
        const hourlyGross = weeklyGross / weeklyHours;
        const afterTax = amount * (1 - rate / 100);
        return { metrics: [
          { label: "Monthly Salary", value: formatCurrency(monthlyGross, currency), icon: "📅" },
          { label: "Weekly Salary", value: formatCurrency(weeklyGross, currency), icon: "🗓️" },
          { label: "Hourly Rate", value: formatCurrency(hourlyGross, currency), icon: "⏱️" },
          { label: "After-Tax Annual", value: formatCurrency(afterTax, currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, rate, currency }) => [
        { type: "info" as const, title: "Take-Home Estimate", body: `At a ${rate}% effective tax rate, your ${formatCurrency(amount, currency)} salary leaves about ${formatCurrency(amount * (1 - rate / 100), currency)} after taxes.` },
      ],
      formulas: [{ name: "Salary Conversion", formula: "Hourly = (Annual / 52) / Weekly Hours", variables: [{ symbol: "Annual", meaning: "Annual gross salary" }, { symbol: "Weekly Hours", meaning: "Hours worked per week" }], example: "$80,000 / 52 weeks / 40 hours = $38.46/hour" }],
      faqs: [
        { q: "How many work weeks are in a year?", a: "Standard calculations use 52 weeks/year (2,080 hours at 40hrs/week), though actual paid weeks may be less after unpaid leave or holidays." },
        { q: "Is this gross or net salary?", a: "The base conversions are gross (pre-tax). Use the tax rate field to estimate your net (after-tax) annual income." },
      ],
    },
    "hourly-wage": {
      title: "Hourly Wage Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 25, rate: 18, years: 1, extraField: 40 },
      fields: [
        { key: "amount", label: "Hourly Rate", prefix: "$", min: 1, max: 500, step: 0.5 },
        { key: "extraField", label: "Hours per Week", min: 1, max: 80, step: 1 },
        { key: "rate", label: "Estimated Tax Rate", suffix: "%", min: 0, max: 50, step: 1 },
      ],
      compute: ({ amount, extraField, rate, currency }) => {
        const weeklyHours = extraField || 40;
        const weekly = amount * weeklyHours;
        const annual = weekly * 52;
        const afterTax = annual * (1 - rate / 100);
        return { metrics: [
          { label: "Annual Salary", value: formatCurrency(annual, currency), icon: "📅" },
          { label: "Weekly Pay", value: formatCurrency(weekly, currency), icon: "🗓️" },
          { label: "Monthly Pay", value: formatCurrency(annual / 12, currency), icon: "💵" },
          { label: "After-Tax Annual", value: formatCurrency(afterTax, currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, extraField }) => [
        { type: "info" as const, title: "Annual Equivalent", body: `At ${amount}/hour for ${extraField} hours/week, you'll earn approximately ${(amount * extraField * 52).toLocaleString()} per year before taxes.` },
      ],
      formulas: [{ name: "Hourly to Annual", formula: "Annual = Hourly Rate × Hours/Week × 52", variables: [{ symbol: "Hourly Rate", meaning: "Pay per hour" }], example: "$25/hour × 40 hours × 52 weeks = $52,000/year" }],
      faqs: [
        { q: "Does this account for overtime?", a: "No, this is a straight-time estimate. Overtime (typically 1.5x rate after 40 hrs/week) would increase actual earnings." },
        { q: "How do I convert to a part-time annual salary?", a: "Just adjust the hours per week field — the calculator scales the annual figure proportionally." },
      ],
    },
    "take-home-pay": {
      title: "Take-Home Pay Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 80000, rate: 12, years: 1, extraField: 5, monthly: 7.65 },
      fields: [
        { key: "amount", label: "Annual Gross Salary", prefix: "$", min: 10000, max: 1000000, step: 1000 },
        { key: "rate", label: "Federal Tax Rate", suffix: "%", min: 0, max: 37, step: 1 },
        { key: "extraField", label: "State Tax Rate", suffix: "%", min: 0, max: 13, step: 0.5 },
        { key: "monthly", label: "FICA Rate", suffix: "%", min: 0, max: 10, step: 0.05, tooltip: "Social Security + Medicare, typically 7.65%" },
      ],
      compute: ({ amount, rate, extraField, monthly, currency }) => {
        const fica = amount * (monthly / 100);
        const federal = amount * (rate / 100);
        const state = amount * (extraField / 100);
        const takeHome = amount - fica - federal - state;
        return { metrics: [
          { label: "Annual Take-Home", value: formatCurrency(takeHome, currency), icon: "💰" },
          { label: "Monthly Take-Home", value: formatCurrency(takeHome / 12, currency), icon: "📅" },
          { label: "Total Taxes", value: formatCurrency(fica + federal + state, currency), icon: "🧾" },
          { label: "Effective Tax Rate", value: formatPercent(((fica + federal + state) / amount) * 100), icon: "📊" },
        ]};
      },
      insights: ({ amount, currency, rate, extraField, monthly }) => {
        const totalTax = amount * ((rate + extraField + monthly) / 100);
        return [{ type: "info" as const, title: "Take-Home Summary", body: `On a ${formatCurrency(amount, currency)} salary, estimated total deductions are ${formatCurrency(totalTax, currency)}, leaving ${formatCurrency(amount - totalTax, currency)} take-home.` }];
      },
      formulas: [{ name: "Take-Home Pay", formula: "Net Pay = Gross − (Federal + State + FICA)", variables: [{ symbol: "FICA", meaning: "Social Security (6.2%) + Medicare (1.45%)" }], example: "$80,000 gross with 12% federal, 5% state, 7.65% FICA: Net ≈ $60,280" }],
      faqs: [
        { q: "What is FICA?", a: "FICA funds Social Security (6.2%, capped annually) and Medicare (1.45%, no cap), totaling 7.65% for most employees." },
        { q: "Does this include pre-tax deductions?", a: "No, this is a simplified estimate. 401(k), HSA, and health insurance premiums (if pre-tax) would further reduce your taxable income and change the result." },
      ],
    },
    "inflation": {
      title: "Inflation Inputs",
      defaults: { amount: 10000, rate: 3.5, years: 20 },
      fields: [
        { key: "amount", label: "Current Value", prefix: "$", min: 1, max: 10000000, step: 100, tooltip: "Today's value of money or goods" },
        { key: "rate", label: "Inflation Rate", suffix: "%", min: 0, max: 15, step: 0.25 },
        { key: "years", label: "Time Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const futureCost = amount * Math.pow(1 + rate / 100, years);
        const purchasingPower = amount / Math.pow(1 + rate / 100, years);
        const totalLoss = amount - purchasingPower;
        return { metrics: [
          { label: "Future Cost", value: formatCurrency(futureCost, currency), sub: `In ${years} years`, icon: "📈" },
          { label: "Purchasing Power Today", value: formatCurrency(purchasingPower, currency), sub: `Of today's ${formatCurrency(amount, currency)}`, icon: "📉" },
          { label: "Value Lost", value: formatCurrency(totalLoss, currency), icon: "💸" },
          { label: "Cumulative Inflation", value: formatPercent((futureCost / amount - 1) * 100), icon: "📊" },
        ]};
      },
      insights: ({ amount, rate, years, currency }) => [
        { type: "info" as const, title: "Inflation Impact", body: `At ${rate}% average inflation, ${formatCurrency(amount, currency)} today will need to grow to ${formatCurrency(amount * Math.pow(1 + rate / 100, years), currency)} in ${years} years to maintain the same purchasing power.` },
      ],
      formulas: [{ name: "Future Cost Due to Inflation", formula: "FV = PV × (1 + i)^n", variables: [{ symbol: "PV", meaning: "Present value" }, { symbol: "i", meaning: "Inflation rate" }, { symbol: "n", meaning: "Years" }], example: "$10,000 at 3.5% inflation for 20 years: FV = 10,000 × 1.035^20 = $19,898" }],
      faqs: [
        { q: "What is a typical inflation rate?", a: "The US Federal Reserve targets 2% annually. Historically, average long-term US inflation has been around 3-3.5%." },
        { q: "How does inflation affect my savings?", a: "If your savings earn less than the inflation rate, your purchasing power decreases over time even as the account balance grows." },
      ],
    },
    "emergency-fund": {
      title: "Emergency Fund Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 2000, rate: 4, years: 1, monthly: 4000, extraField: 6 },
      fields: [
        { key: "monthly", label: "Monthly Expenses", prefix: "$", min: 500, max: 50000, step: 100 },
        { key: "extraField", label: "Months of Coverage", min: 3, max: 12, step: 1, tooltip: "3-6 months is standard; 6-12 for variable income" },
        { key: "amount", label: "Current Emergency Savings", prefix: "$", min: 0, max: 500000, step: 100 },
        { key: "rate", label: "Savings APY", suffix: "%", min: 0, max: 8, step: 0.1, tooltip: "Interest rate on your emergency fund account" },
      ],
      compute: ({ monthly, extraField, amount, currency }) => {
        const target = monthly * extraField;
        const gap = Math.max(0, target - amount);
        const monthsCovered = monthly > 0 ? amount / monthly : 0;
        return { metrics: [
          { label: "Target Fund Size", value: formatCurrency(target, currency), icon: "🎯" },
          { label: "Current Coverage", value: `${monthsCovered.toFixed(1)} months`, icon: "🛟" },
          { label: "Amount Still Needed", value: formatCurrency(gap, currency), icon: "📉" },
          { label: "Current Savings", value: formatCurrency(amount, currency), icon: "💰" },
        ]};
      },
      insights: ({ monthly, extraField, amount, currency }) => {
        const target = monthly * extraField;
        const monthsCovered = monthly > 0 ? amount / monthly : 0;
        return monthsCovered >= extraField
          ? [{ type: "success" as const, title: "Fully Funded!", body: `Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses, meeting your ${extraField}-month target.` }]
          : [{ type: "warning" as const, title: "Building Your Cushion", body: `You're covered for ${monthsCovered.toFixed(1)} of ${extraField} target months. Aim to save ${formatCurrency(target - amount, currency)} more.` }];
      },
      formulas: [{ name: "Emergency Fund Target", formula: "Target = Monthly Expenses × Months of Coverage", variables: [{ symbol: "Months", meaning: "Typically 3-6 months (6-12 for variable income)" }], example: "$4,000/month × 6 months = $24,000 target" }],
      faqs: [
        { q: "How many months of expenses should I save?", a: "3-6 months is standard for stable employment. Freelancers or those with variable income should aim for 6-12 months." },
        { q: "Where should I keep my emergency fund?", a: "A high-yield savings account (HYSA) is ideal — liquid, FDIC-insured, and earning interest, unlike a low-yield checking account or volatile investments." },
      ],
    },
    "personal-loan": loanConfig("Personal Loan", 15000, 11, 4, "Unsecured personal loan amount"),
    "home-loan": loanConfig("Home Loan", 300000, 6.5, 25, "Total home loan principal"),
    "car-loan": loanConfig("Car Loan", 30000, 7, 5, "Vehicle loan amount"),
    "student-loan": loanConfig("Student Loan", 35000, 5.5, 10, "Total student loan balance"),
    "business-loan": loanConfig("Business Loan", 100000, 9, 7, "Business financing amount"),
    "rental-yield": {
      title: "Rental Yield Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 300000, rate: 1.5, years: 1, monthly: 2200 },
      fields: [
        { key: "amount", label: "Property Value", prefix: "$", min: 10000, max: 10000000, step: 5000 },
        { key: "monthly", label: "Monthly Rent", prefix: "$", min: 0, max: 50000, step: 50 },
        { key: "rate", label: "Annual Expenses", suffix: "%", min: 0, max: 10, step: 0.25, tooltip: "Maintenance, insurance, management fees as % of property value" },
        { key: "extraField", label: "Occupancy Rate", suffix: "%", min: 50, max: 100, step: 1 },
      ],
      compute: ({ amount, monthly, rate, extraField, currency }) => {
        const occupancy = (extraField || 95) / 100;
        const annualRent = monthly * 12 * occupancy;
        const expenses = amount * (rate / 100);
        const netIncome = annualRent - expenses;
        const grossYield = amount > 0 ? (annualRent / amount) * 100 : 0;
        const netYield = amount > 0 ? (netIncome / amount) * 100 : 0;
        return { metrics: [
          { label: "Gross Yield", value: formatPercent(grossYield), icon: "📊" },
          { label: "Net Yield", value: formatPercent(netYield), icon: "💹" },
          { label: "Annual Rent Income", value: formatCurrency(annualRent, currency), icon: "💰" },
          { label: "Net Annual Income", value: formatCurrency(netIncome, currency), icon: "💵" },
        ]};
      },
      insights: ({ amount, monthly }) => {
        const grossYield = amount > 0 ? ((monthly * 12) / amount) * 100 : 0;
        return [{ type: grossYield >= 6 ? "success" as const : "info" as const, title: grossYield >= 6 ? "Strong Yield" : "Moderate Yield", body: `Your gross rental yield is ${grossYield.toFixed(2)}%. Yields above 6-8% are generally considered strong for buy-to-let investments.` }];
      },
      formulas: [{ name: "Gross Rental Yield", formula: "Gross Yield = (Annual Rent / Property Value) × 100", variables: [{ symbol: "Annual Rent", meaning: "Monthly rent × 12" }], example: "$2,200/month × 12 = $26,400 / $300,000 = 8.8% gross yield" }],
      faqs: [
        { q: "What is a good rental yield?", a: "Gross yields of 6-8%+ are generally considered good. Net yield (after expenses) of 4-6%+ is solid for most markets." },
        { q: "Gross vs net yield?", a: "Gross yield ignores expenses. Net yield subtracts maintenance, insurance, management fees, and vacancy — giving a more realistic return figure." },
      ],
    },
    "cap-rate": {
      title: "Cap Rate Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 400000, rate: 1, years: 1, monthly: 3000, extraField: 800 },
      fields: [
        { key: "amount", label: "Property Value", prefix: "$", min: 10000, max: 20000000, step: 5000 },
        { key: "monthly", label: "Monthly Gross Rental Income", prefix: "$", min: 0, max: 100000, step: 50 },
        { key: "extraField", label: "Monthly Operating Expenses", prefix: "$", min: 0, max: 50000, step: 50, tooltip: "Taxes, insurance, maintenance, management (excludes mortgage)" },
      ],
      compute: ({ amount, monthly, extraField, currency }) => {
        const noi = (monthly - extraField) * 12;
        const capRate = amount > 0 ? (noi / amount) * 100 : 0;
        return { metrics: [
          { label: "Cap Rate", value: formatPercent(capRate), icon: "📊" },
          { label: "Annual NOI", value: formatCurrency(noi, currency), icon: "💰" },
          { label: "Gross Annual Income", value: formatCurrency(monthly * 12, currency), icon: "💵" },
          { label: "Annual Expenses", value: formatCurrency(extraField * 12, currency), icon: "🧾" },
        ]};
      },
      insights: ({ amount, monthly, extraField }) => {
        const capRate = amount > 0 ? (((monthly - extraField) * 12) / amount) * 100 : 0;
        return [{ type: capRate >= 5 ? "success" as const : "info" as const, title: "Cap Rate Assessment", body: `A ${capRate.toFixed(2)}% cap rate is ${capRate >= 8 ? "excellent for most markets" : capRate >= 5 ? "solid and competitive" : "on the lower side — compare against local market averages"}.` }];
      },
      formulas: [{ name: "Capitalization Rate", formula: "Cap Rate = NOI / Property Value × 100", variables: [{ symbol: "NOI", meaning: "Net Operating Income (annual income − operating expenses, excludes debt)" }], example: "$26,400 NOI / $400,000 value = 6.6% cap rate" }],
      faqs: [
        { q: "What is a good cap rate?", a: "4-10% is typical depending on market and risk. Higher cap rates suggest higher returns but often higher risk areas; lower cap rates are common in stable, desirable markets." },
        { q: "Cap rate vs cash-on-cash return?", a: "Cap rate ignores financing (assumes all-cash purchase). Cash-on-cash return factors in your actual mortgage and down payment, giving a more personalized return figure." },
      ],
    },
    "cash-on-cash": {
      title: "Cash-on-Cash Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 80000, rate: 1, years: 1, monthly: 500 },
      fields: [
        { key: "amount", label: "Total Cash Invested", prefix: "$", min: 1000, max: 5000000, step: 1000, tooltip: "Down payment + closing costs + repairs" },
        { key: "monthly", label: "Monthly Cash Flow", prefix: "$", min: -5000, max: 50000, step: 50, tooltip: "Rental income minus all expenses and mortgage" },
      ],
      compute: ({ amount, monthly, currency }) => {
        const annualCashFlow = monthly * 12;
        const coc = amount > 0 ? (annualCashFlow / amount) * 100 : 0;
        return { metrics: [
          { label: "Cash-on-Cash Return", value: formatPercent(coc), icon: "📊" },
          { label: "Annual Cash Flow", value: formatCurrency(annualCashFlow, currency), icon: "💰" },
          { label: "Monthly Cash Flow", value: formatCurrency(monthly, currency), icon: "💵" },
          { label: "Cash Invested", value: formatCurrency(amount, currency), icon: "🏦" },
        ]};
      },
      insights: ({ amount, monthly }) => {
        const coc = amount > 0 ? ((monthly * 12) / amount) * 100 : 0;
        return [{ type: coc >= 8 ? "success" as const : coc >= 0 ? "info" as const : "danger" as const, title: "Cash-on-Cash Assessment", body: coc < 0 ? "Negative cash flow means the property costs you money monthly — reassess financing or purchase price." : `Your ${coc.toFixed(2)}% cash-on-cash return ${coc >= 8 ? "is strong for real estate" : "is moderate — many investors target 8-12%+"}.` }];
      },
      formulas: [{ name: "Cash-on-Cash Return", formula: "CoC = Annual Cash Flow / Total Cash Invested × 100", variables: [{ symbol: "Annual Cash Flow", meaning: "Income remaining after all expenses, including mortgage" }], example: "$6,000 annual cash flow / $80,000 invested = 7.5% CoC return" }],
      faqs: [
        { q: "What is a good cash-on-cash return?", a: "8-12%+ is a common target for active real estate investors, though this varies widely by market and strategy." },
        { q: "Why use cash-on-cash instead of cap rate?", a: "Cash-on-cash accounts for your actual financing (mortgage), giving a real picture of return on the cash you put in, unlike cap rate which assumes an all-cash purchase." },
      ],
    },
    "property-tax": {
      title: "Property Tax Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 350000, rate: 1.1, years: 1 },
      fields: [
        { key: "amount", label: "Assessed Home Value", prefix: "$", min: 10000, max: 20000000, step: 5000 },
        { key: "rate", label: "Property Tax Rate", suffix: "%", min: 0.1, max: 4, step: 0.05, tooltip: "Effective tax rate varies widely by location (US avg ~1.1%)" },
      ],
      compute: ({ amount, rate, currency }) => {
        const annual = amount * (rate / 100);
        return { metrics: [
          { label: "Annual Property Tax", value: formatCurrency(annual, currency), icon: "🧾" },
          { label: "Monthly Equivalent", value: formatCurrency(annual / 12, currency), icon: "📅" },
          { label: "Assessed Value", value: formatCurrency(amount, currency), icon: "🏠" },
          { label: "Effective Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "Rate Comparison", body: `Your ${rate}% rate is ${rate < 0.8 ? "below" : rate > 1.8 ? "above" : "near"} the US national average of approximately 1.1%. Rates vary significantly by state and county.` },
      ],
      formulas: [{ name: "Property Tax", formula: "Annual Tax = Assessed Value × Tax Rate", variables: [{ symbol: "Assessed Value", meaning: "Local government's valuation of the property (may differ from market value)" }], example: "$350,000 at 1.1% = $3,850/year" }],
      faqs: [
        { q: "Why does my assessed value differ from market value?", a: "Many jurisdictions assess properties below market value, or reassess only periodically, causing a gap between assessed and current market value." },
        { q: "Can I appeal my property tax assessment?", a: "Yes, most jurisdictions allow assessment appeals if you believe your property is overvalued. Check your local assessor's office for the process and deadlines." },
      ],
    },
    "home-equity": {
      title: "Home Equity Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 450000, rate: 1, years: 1, extraField: 280000 },
      fields: [
        { key: "amount", label: "Current Home Value", prefix: "$", min: 10000, max: 20000000, step: 5000 },
        { key: "extraField", label: "Remaining Mortgage Balance", prefix: "$", min: 0, max: 20000000, step: 1000 },
      ],
      compute: ({ amount, extraField, currency }) => {
        const equity = amount - extraField;
        const ltv = amount > 0 ? (extraField / amount) * 100 : 0;
        const maxHELOC = Math.max(0, amount * 0.85 - extraField);
        return { metrics: [
          { label: "Home Equity", value: formatCurrency(equity, currency), icon: "💎" },
          { label: "Loan-to-Value (LTV)", value: formatPercent(ltv), icon: "📊" },
          { label: "Est. Max HELOC/Loan", value: formatCurrency(maxHELOC, currency), sub: "At 85% combined LTV", icon: "🏦" },
          { label: "Mortgage Balance", value: formatCurrency(extraField, currency), icon: "🏠" },
        ]};
      },
      insights: ({ amount, extraField }) => {
        const ltv = amount > 0 ? (extraField / amount) * 100 : 0;
        return [{ type: ltv <= 80 ? "success" as const : "info" as const, title: "Equity Position", body: `Your LTV is ${ltv.toFixed(1)}%. ${ltv <= 80 ? "Below 80% LTV typically means no PMI and strong borrowing options." : "Above 80% LTV may mean PMI requirements or limited home equity loan options."}` }];
      },
      formulas: [{ name: "Home Equity & LTV", formula: "Equity = Home Value − Mortgage Balance; LTV = Mortgage / Value × 100", variables: [{ symbol: "LTV", meaning: "Loan-to-Value ratio" }], example: "$450,000 value − $280,000 balance = $170,000 equity (62% LTV)" }],
      faqs: [
        { q: "How much equity can I borrow against?", a: "Most lenders allow borrowing up to 80-85% combined LTV (existing mortgage + new loan) for HELOCs or home equity loans." },
        { q: "What's the difference between a HELOC and home equity loan?", a: "A HELOC is a revolving credit line with variable rates. A home equity loan is a lump sum with a fixed rate, similar to a second mortgage." },
      ],
    },
    "capital-gains": {
      title: "Capital Gains Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 10000, rate: 15, years: 1, extraField: 16000 },
      fields: [
        { key: "amount", label: "Cost Basis (Purchase Price)", prefix: "$", min: 0, max: 10000000, step: 100 },
        { key: "extraField", label: "Sale Price", prefix: "$", min: 0, max: 10000000, step: 100 },
        { key: "rate", label: "Capital Gains Tax Rate", suffix: "%", min: 0, max: 37, step: 1, tooltip: "0/15/20% for long-term; ordinary rates for short-term" },
      ],
      compute: ({ amount, extraField, rate, currency }) => {
        const gain = extraField - amount;
        const tax = Math.max(0, gain) * (rate / 100);
        const netProceeds = extraField - tax;
        return { metrics: [
          { label: "Capital Gain", value: formatCurrency(gain, currency), icon: gain >= 0 ? "📈" : "📉" },
          { label: "Tax Owed", value: formatCurrency(tax, currency), icon: "🧾" },
          { label: "Net Proceeds", value: formatCurrency(netProceeds, currency), icon: "💰" },
          { label: "Effective Return", value: amount > 0 ? formatPercent((gain / amount) * 100) : "N/A", icon: "📊" },
        ]};
      },
      insights: ({ amount, extraField, rate, currency }) => {
        const gain = extraField - amount;
        return gain <= 0
          ? [{ type: "info" as const, title: "No Taxable Gain", body: "You have a loss or break-even sale — no capital gains tax owed. Losses may offset other gains (tax-loss harvesting)." }]
          : [{ type: "info" as const, title: "Gain Tax Summary", body: `Your ${formatCurrency(gain, currency)} gain at ${rate}% results in ${formatCurrency(gain * (rate / 100), currency)} in tax owed.` }];
      },
      formulas: [{ name: "Capital Gains Tax", formula: "Tax = (Sale Price − Cost Basis) × Tax Rate", variables: [{ symbol: "Cost Basis", meaning: "Original purchase price + improvements" }], example: "$16,000 sale − $10,000 basis = $6,000 gain × 15% = $900 tax" }],
      faqs: [
        { q: "Long-term vs short-term capital gains?", a: "Assets held over 1 year qualify for long-term rates (0/15/20% federally). Assets held under 1 year are taxed as ordinary income, usually at a higher rate." },
        { q: "Can I offset gains with losses?", a: "Yes, tax-loss harvesting lets you sell losing investments to offset gains, reducing your tax bill. Up to $3,000 in net losses can offset ordinary income annually." },
      ],
    },
    "capital-gains-tax": {
      title: "Capital Gains Tax Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 6000, rate: 15, years: 1 },
      fields: [
        { key: "amount", label: "Gain Amount", prefix: "$", min: 0, max: 10000000, step: 100, tooltip: "Sale price minus cost basis" },
        { key: "rate", label: "Tax Rate", suffix: "%", min: 0, max: 37, step: 1 },
      ],
      compute: ({ amount, rate, currency }) => {
        const tax = amount * (rate / 100);
        return { metrics: [
          { label: "Tax Owed", value: formatCurrency(tax, currency), icon: "🧾" },
          { label: "After-Tax Gain", value: formatCurrency(amount - tax, currency), icon: "💰" },
          { label: "Gain Amount", value: formatCurrency(amount, currency), icon: "📈" },
          { label: "Tax Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "Bracket Awareness", body: `At ${rate}%, this assumes a flat rate. Actual capital gains brackets (0/15/20% federal) depend on your total taxable income and filing status.` },
      ],
      formulas: [{ name: "Capital Gains Tax", formula: "Tax = Gain × Rate%", variables: [{ symbol: "Gain", meaning: "Sale price minus cost basis" }], example: "$6,000 gain at 15% = $900 tax" }],
      faqs: [
        { q: "What are the 2024 capital gains brackets?", a: "0% up to $47,025 (single)/$94,050 (married); 15% up to $518,900/$583,750; 20% above that, for long-term gains." },
        { q: "Does state tax apply too?", a: "Yes, most states also tax capital gains, often as ordinary income. Check your state's specific rules in addition to federal tax." },
      ],
    },
    "dividend": {
      title: "Dividend Inputs",
      defaults: { amount: 25000, rate: 4, years: 15, monthly: 200 },
      fields: [
        { key: "amount", label: "Investment Amount", prefix: "$", min: 0, max: 5000000, step: 500 },
        { key: "rate", label: "Dividend Yield", suffix: "%", min: 0.5, max: 12, step: 0.1 },
        { key: "monthly", label: "Monthly Additional Investment", prefix: "$", min: 0, max: 20000, step: 50 },
        { key: "years", label: "Holding Period", suffix: "Years", min: 1, max: 40 },
      ],
      compute: ({ amount, rate, monthly, years, currency }) => {
        const annualDividend = amount * (rate / 100);
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const totalInvested = amount + monthly * years * 12;
        return { metrics: [
          { label: "Current Annual Dividend", value: formatCurrency(annualDividend, currency), icon: "💵" },
          { label: "Future Value (Reinvested)", value: formatCurrency(fv, currency), sub: `In ${years} years`, icon: "📈" },
          { label: "Future Annual Dividend", value: formatCurrency(fv * (rate / 100), currency), icon: "💰" },
          { label: "Total Invested", value: formatCurrency(totalInvested, currency), icon: "🏦" },
        ]};
      },
      insights: ({ rate, years }) => [
        { type: "info" as const, title: "Dividend Growth", body: `At a ${rate}% yield reinvested over ${years} years, dividend compounding can significantly accelerate portfolio growth via DRIP.` },
      ],
      formulas: [{ name: "Dividend Income & Growth", formula: "Annual Dividend = Investment × Yield%; FV = P(1+r)^n + PMT×[(1+r)^n−1]/r", variables: [{ symbol: "Yield", meaning: "Annual dividend yield %" }], example: "$25,000 at 4% yield = $1,000/year in dividends" }],
      faqs: [
        { q: "What is a good dividend yield?", a: "2-5% is typical for established dividend stocks. Yields above 7-8% may signal risk (a 'yield trap') — research the company's payout sustainability." },
        { q: "What is DRIP investing?", a: "Dividend Reinvestment Plans automatically use dividend payouts to buy more shares, compounding your returns without manual intervention." },
      ],
    },
    "mortgage-affordability": {
      title: "Mortgage Affordability Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 60000, rate: 6.5, years: 30, monthly: 8000, extraField: 500 },
      fields: [
        { key: "monthly", label: "Monthly Gross Income", prefix: "$", min: 1000, max: 200000, step: 500 },
        { key: "amount", label: "Down Payment", prefix: "$", min: 0, max: 5000000, step: 1000 },
        { key: "rate", label: "Mortgage Rate", suffix: "%", min: 1, max: 12, step: 0.1 },
        { key: "extraField", label: "Monthly Taxes & Insurance", prefix: "$", min: 0, max: 5000, step: 50 },
      ],
      compute: ({ monthly, amount, rate, extraField, currency }) => {
        const maxHousingPayment = monthly * 0.28;
        const maxPI = maxHousingPayment - extraField;
        const r = rate / 100 / 12;
        const n = 30 * 12;
        const maxLoan = maxPI > 0 && r > 0 ? (maxPI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : maxPI > 0 && r === 0 ? maxPI * n : 0;
        const maxHomePrice = maxLoan + amount;
        return { metrics: [
          { label: "Max Home Price", value: formatCurrency(maxHomePrice, currency), icon: "🏠" },
          { label: "Max Loan Amount", value: formatCurrency(maxLoan, currency), icon: "🏦" },
          { label: "Max Monthly Payment", value: formatCurrency(maxHousingPayment, currency), sub: "28% of gross income", icon: "💳" },
          { label: "Down Payment", value: formatCurrency(amount, currency), icon: "💰" },
        ]};
      },
      insights: ({ monthly, currency }) => [
        { type: "info" as const, title: "28% Rule", body: `Lenders typically cap housing costs at 28% of gross monthly income (${formatCurrency(monthly * 0.28, currency)}/month here), and total debt at 36%.` },
      ],
      formulas: [{ name: "Affordability (28% Rule)", formula: "Max Payment = Gross Monthly Income × 28%", variables: [{ symbol: "28% Rule", meaning: "Standard front-end DTI limit used by most lenders" }], example: "$8,000 income × 28% = $2,240 max housing payment" }],
      faqs: [
        { q: "What is the 28/36 rule?", a: "Housing costs shouldn't exceed 28% of gross monthly income, and total debt payments shouldn't exceed 36% — common lender guidelines for mortgage approval." },
        { q: "Does this include PMI?", a: "No, add private mortgage insurance (PMI, typically required below 20% down) to your taxes & insurance field for a more accurate estimate." },
      ],
    },
    "mortgage-payoff": {
      title: "Mortgage Payoff Inputs",
      defaults: { amount: 250000, rate: 6, years: 25, extraField: 300 },
      fields: [
        { key: "amount", label: "Remaining Balance", prefix: "$", min: 1000, max: 10000000, step: 1000 },
        { key: "rate", label: "Interest Rate", suffix: "%", min: 0.5, max: 15, step: 0.1 },
        { key: "years", label: "Remaining Term", suffix: "Years", min: 1, max: 40 },
        { key: "extraField", label: "Extra Monthly Payment", prefix: "$", min: 0, max: 10000, step: 25 },
      ],
      compute: ({ amount, rate, years, extraField, currency }) => {
        const r = rate / 100 / 12;
        const n = years * 12;
        const payment = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        let balanceNormal = amount, balanceExtra = amount, monthsExtra = 0;
        let interestNormal = 0, interestExtra = 0;
        for (let i = 0; i < n && balanceNormal > 0; i++) { const ip = balanceNormal * r; interestNormal += ip; balanceNormal -= (payment - ip); }
        while (balanceExtra > 0 && monthsExtra < 600) { const ip = balanceExtra * r; interestExtra += ip; balanceExtra -= (payment + extraField - ip); monthsExtra++; }
        return { metrics: [
          { label: "New Payoff Time", value: `${(monthsExtra / 12).toFixed(1)} yrs`, sub: `vs ${years} yrs original`, icon: "⏱️" },
          { label: "Time Saved", value: `${Math.max(0, years - monthsExtra / 12).toFixed(1)} yrs`, icon: "🎉" },
          { label: "Interest Saved", value: formatCurrency(Math.max(0, interestNormal - interestExtra), currency), icon: "💰" },
          { label: "Monthly Payment", value: formatCurrency(payment + extraField, currency), icon: "💳" },
        ]};
      },
      insights: ({ extraField, currency, years }) => extraField > 0
        ? [{ type: "success" as const, title: "Accelerated Payoff", body: `Adding ${formatCurrency(extraField, currency)}/month toward principal meaningfully shortens your payoff timeline and cuts interest costs.` }]
        : [{ type: "info" as const, title: "Try Extra Payments", body: `Set an extra monthly payment to see how much faster you could pay off your ${years}-year mortgage and how much interest you'd save.` }],
      formulas: [{ name: "Mortgage Payoff with Extra Payments", formula: "New Balance = Old Balance − (Payment + Extra − Interest)", variables: [{ symbol: "Extra", meaning: "Additional principal payment per month" }], example: "$300/month extra on a $250k, 6%, 25-yr mortgage can save years and thousands in interest" }],
      faqs: [
        { q: "Is it better to pay off my mortgage early or invest?", a: "If your mortgage rate exceeds expected investment returns (after tax), paying off early may win. Otherwise, investing the difference often yields more long-term, though paying off debt offers guaranteed 'return' and peace of mind." },
        { q: "Are there prepayment penalties?", a: "Some loans have prepayment penalties for paying off early. Check your loan terms before making large extra payments." },
      ],
    },
    "mortgage-refinance": {
      title: "Mortgage Refinance Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 280000, rate: 7, years: 25, extraField: 5.5 },
      fields: [
        { key: "amount", label: "Current Loan Balance", prefix: "$", min: 1000, max: 10000000, step: 1000 },
        { key: "rate", label: "Current Interest Rate", suffix: "%", min: 0.5, max: 15, step: 0.1 },
        { key: "extraField", label: "New Interest Rate", suffix: "%", min: 0.5, max: 15, step: 0.1 },
        { key: "years", label: "Remaining Term", suffix: "Years", min: 1, max: 40 },
      ],
      compute: ({ amount, rate, extraField, years, currency }) => {
        const calcPayment = (r: number) => { const m = r / 100 / 12; const n = years * 12; return m === 0 ? amount / n : (amount * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1); };
        const oldPayment = calcPayment(rate);
        const newPayment = calcPayment(extraField);
        const monthlySavings = oldPayment - newPayment;
        const estClosingCosts = amount * 0.02;
        const breakEvenMonths = monthlySavings > 0 ? estClosingCosts / monthlySavings : Infinity;
        return { metrics: [
          { label: "New Monthly Payment", value: formatCurrency(newPayment, currency), icon: "💳" },
          { label: "Monthly Savings", value: formatCurrency(monthlySavings, currency), icon: monthlySavings > 0 ? "📉" : "📈" },
          { label: "Break-Even Point", value: isFinite(breakEvenMonths) ? `${breakEvenMonths.toFixed(0)} months` : "N/A", icon: "⏱️" },
          { label: "Est. Closing Costs", value: formatCurrency(estClosingCosts, currency), sub: "~2% of loan", icon: "🧾" },
        ]};
      },
      insights: ({ rate, extraField }) => extraField < rate
        ? [{ type: "success" as const, title: "Refinancing Could Help", body: `Dropping from ${rate}% to ${extraField}% reduces your monthly payment. Compare the break-even point to how long you plan to stay in the home.` }]
        : [{ type: "warning" as const, title: "New Rate Isn't Lower", body: "Your new rate isn't lower than your current rate — refinancing wouldn't reduce payments unless you need to change loan terms or cash out equity." }],
      formulas: [{ name: "Refinance Break-Even", formula: "Break-Even (months) = Closing Costs / Monthly Savings", variables: [{ symbol: "Monthly Savings", meaning: "Old payment − New payment" }], example: "$5,600 closing costs / $200 monthly savings = 28 months to break even" }],
      faqs: [
        { q: "When does refinancing make sense?", a: "Generally when the new rate is at least 0.5-1% lower than your current rate, and you plan to stay in the home longer than the break-even period." },
        { q: "What costs are involved in refinancing?", a: "Typically 2-5% of the loan amount, covering appraisal, origination fees, title insurance, and closing costs." },
      ],
    },
    "closing-cost": {
      title: "Closing Cost Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 350000, rate: 3, years: 1 },
      fields: [
        { key: "amount", label: "Home Purchase Price", prefix: "$", min: 10000, max: 20000000, step: 5000 },
        { key: "rate", label: "Estimated Closing Cost Rate", suffix: "%", min: 1, max: 6, step: 0.25, tooltip: "Typically 2-5% of purchase price" },
      ],
      compute: ({ amount, rate, currency }) => {
        const closingCosts = amount * (rate / 100);
        return { metrics: [
          { label: "Estimated Closing Costs", value: formatCurrency(closingCosts, currency), icon: "🧾" },
          { label: "Purchase Price", value: formatCurrency(amount, currency), icon: "🏠" },
          { label: "Cash Needed at Closing", value: formatCurrency(closingCosts + amount * 0.2, currency), sub: "Incl. 20% down payment", icon: "💰" },
          { label: "Closing Cost Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "What's Included", body: `At ${rate}%, closing costs typically cover loan origination fees, appraisal, title insurance, attorney fees, and prepaid taxes/insurance.` },
      ],
      formulas: [{ name: "Closing Costs Estimate", formula: "Closing Costs = Purchase Price × Rate%", variables: [{ symbol: "Rate", meaning: "Typically 2-5% of purchase price" }], example: "$350,000 at 3% = $10,500 closing costs" }],
      faqs: [
        { q: "Who pays closing costs?", a: "Typically the buyer, though sellers sometimes contribute via negotiated seller credits, especially in buyer's markets." },
        { q: "Can closing costs be rolled into the loan?", a: "Some loans allow this, but it increases your loan balance and total interest paid over the life of the loan." },
      ],
    },
    "lean-fire": {
      title: "Lean FIRE Inputs",
      defaults: { amount: 30000, rate: 7, years: 25, extraField: 4 },
      fields: [
        { key: "amount", label: "Annual Lean Expenses", prefix: "$", min: 10000, max: 100000, step: 1000, tooltip: "Minimal/frugal annual spending target" },
        { key: "extraField", label: "Safe Withdrawal Rate", suffix: "%", min: 2.5, max: 5, step: 0.1 },
        { key: "rate", label: "Expected Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years to Retirement", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, extraField, currency }) => {
        const fireNumber = amount / (extraField / 100);
        return { metrics: [
          { label: "Lean FIRE Number", value: formatCurrency(fireNumber, currency), icon: "🌱" },
          { label: "Annual Expenses", value: formatCurrency(amount, currency), icon: "💵" },
          { label: "Monthly Budget", value: formatCurrency(amount / 12, currency), icon: "📅" },
          { label: "Withdrawal Rate", value: formatPercent(extraField), icon: "📊" },
        ]};
      },
      insights: ({ amount, currency }) => [
        { type: "info" as const, title: "Lean FIRE Lifestyle", body: `Living on ${formatCurrency(amount, currency)}/year requires disciplined budgeting but dramatically lowers the savings target needed for early retirement.` },
      ],
      formulas: [{ name: "Lean FIRE Number", formula: "FIRE Number = Annual Expenses / SWR%", variables: [{ symbol: "SWR", meaning: "Safe withdrawal rate, typically 4%" }], example: "$30,000 / 4% = $750,000 Lean FIRE number" }],
      faqs: [
        { q: "What counts as Lean FIRE?", a: "Lean FIRE typically means retiring on a frugal budget, often under $40,000/year in expenses, requiring a smaller portfolio than traditional FIRE." },
        { q: "Is Lean FIRE risky?", a: "It leaves less margin for unexpected costs (healthcare, emergencies). Many Lean FIRE practitioners maintain flexibility through part-time work or a larger cash buffer." },
      ],
    },
    "fat-fire": {
      title: "Fat FIRE Inputs",
      defaults: { amount: 150000, rate: 7, years: 25, extraField: 3.5 },
      fields: [
        { key: "amount", label: "Target Annual Spending", prefix: "$", min: 80000, max: 1000000, step: 5000, tooltip: "Luxury lifestyle annual spending target" },
        { key: "extraField", label: "Safe Withdrawal Rate", suffix: "%", min: 2.5, max: 5, step: 0.1 },
        { key: "rate", label: "Expected Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years to Retirement", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, extraField, currency }) => {
        const fireNumber = amount / (extraField / 100);
        return { metrics: [
          { label: "Fat FIRE Number", value: formatCurrency(fireNumber, currency), icon: "💎" },
          { label: "Annual Spending", value: formatCurrency(amount, currency), icon: "💵" },
          { label: "Monthly Budget", value: formatCurrency(amount / 12, currency), icon: "📅" },
          { label: "Withdrawal Rate", value: formatPercent(extraField), icon: "📊" },
        ]};
      },
      insights: ({ amount, currency }) => [
        { type: "info" as const, title: "Fat FIRE Target", body: `A ${formatCurrency(amount, currency)}/year lifestyle requires substantial savings but allows for travel, dining, and luxury spending in retirement.` },
      ],
      formulas: [{ name: "Fat FIRE Number", formula: "FIRE Number = Annual Spending / SWR%", variables: [{ symbol: "SWR", meaning: "Safe withdrawal rate, often more conservative (3-3.5%) for Fat FIRE" }], example: "$150,000 / 3.5% = $4,285,714 Fat FIRE number" }],
      faqs: [
        { q: "What counts as Fat FIRE?", a: "Fat FIRE generally means retiring with $100,000+ in annual spending, maintaining or upgrading your current lifestyle rather than cutting back." },
        { q: "Why use a lower withdrawal rate for Fat FIRE?", a: "Larger portfolios often use more conservative withdrawal rates (3-3.5%) since a smaller percentage drop still represents significant dollars, and there's less appetite for risk at higher net worth." },
      ],
    },
    "barista-fire": {
      title: "Barista FIRE Inputs",
      defaults: { amount: 1500000, rate: 7, years: 15, extraField: 25000 },
      fields: [
        { key: "amount", label: "Full FIRE Number", prefix: "$", min: 100000, max: 10000000, step: 10000 },
        { key: "extraField", label: "Annual Part-Time Income", prefix: "$", min: 0, max: 100000, step: 1000 },
        { key: "rate", label: "Expected Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years to Semi-Retirement", suffix: "Years", min: 1, max: 40 },
      ],
      compute: ({ amount, extraField, rate, years, currency }) => {
        const swr = 0.04;
        const baristaNumber = (amount * swr - extraField) / swr;
        const coastNeeded = Math.max(0, baristaNumber / Math.pow(1 + rate / 100, years));
        return { metrics: [
          { label: "Barista FIRE Number", value: formatCurrency(Math.max(0, baristaNumber), currency), icon: "☕" },
          { label: "Part-Time Income Covers", value: formatCurrency(extraField, currency), sub: "Per year", icon: "💼" },
          { label: "Full FIRE Number", value: formatCurrency(amount, currency), icon: "🎯" },
          { label: "Needed Today (to Coast)", value: formatCurrency(coastNeeded, currency), icon: "🌊" },
        ]};
      },
      insights: ({ extraField, currency }) => [
        { type: "info" as const, title: "Semi-Retirement Strategy", body: `With ${formatCurrency(extraField, currency)}/year from part-time work supplementing investment income, you can reach financial flexibility sooner than full FIRE.` },
      ],
      formulas: [{ name: "Barista FIRE Number", formula: "Barista Number = (Full FIRE × SWR − Part-Time Income) / SWR", variables: [{ symbol: "SWR", meaning: "Safe withdrawal rate, typically 4%" }], example: "($1.5M × 4% − $25,000) / 4% = $875,000 Barista FIRE number" }],
      faqs: [
        { q: "What is Barista FIRE?", a: "A semi-retirement strategy where part-time work (often for benefits like health insurance) supplements a smaller investment portfolio, reducing the savings needed vs. full FIRE." },
        { q: "How is this different from Coast FIRE?", a: "Coast FIRE assumes you stop contributing but still work full-time until your portfolio grows to your number. Barista FIRE assumes you work part-time AND draw down investments simultaneously." },
      ],
    },
    "annualized-return": {
      title: "Annualized Return Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 10000, rate: 1, years: 5, extraField: 16000 },
      fields: [
        { key: "amount", label: "Initial Investment", prefix: "$", min: 100, max: 10000000, step: 100 },
        { key: "extraField", label: "Final Value", prefix: "$", min: 100, max: 10000000, step: 100 },
        { key: "years", label: "Years Held", min: 0.1, max: 50, step: 0.1 },
      ],
      compute: ({ amount, extraField, years, currency }) => {
        const totalReturn = amount > 0 ? ((extraField - amount) / amount) * 100 : 0;
        const cagr = amount > 0 && years > 0 ? (Math.pow(extraField / amount, 1 / years) - 1) * 100 : 0;
        return { metrics: [
          { label: "Annualized Return (CAGR)", value: formatPercent(cagr), icon: "📊" },
          { label: "Total Return", value: formatPercent(totalReturn), icon: "📈" },
          { label: "Total Gain", value: formatCurrency(extraField - amount, currency), icon: "💰" },
          { label: "Final Value", value: formatCurrency(extraField, currency), icon: "💵" },
        ]};
      },
      insights: ({ amount, extraField, years }) => {
        const cagr = amount > 0 && years > 0 ? (Math.pow(extraField / amount, 1 / years) - 1) * 100 : 0;
        return [{ type: "info" as const, title: "Why CAGR Matters", body: `Your CAGR of ${cagr.toFixed(2)}% normalizes returns across the ${years}-year period, making it comparable to other investments regardless of holding length.` }];
      },
      formulas: [{ name: "CAGR", formula: "CAGR = (Final / Initial)^(1/years) − 1", variables: [{ symbol: "Final", meaning: "Ending investment value" }, { symbol: "Initial", meaning: "Starting investment value" }], example: "$10,000 → $16,000 over 5 years: CAGR = (16000/10000)^(1/5) − 1 = 9.86%" }],
      faqs: [
        { q: "Why not just use total return?", a: "Total return doesn't account for time. CAGR smooths returns into an annual rate, making it possible to fairly compare investments held for different periods." },
        { q: "Does CAGR account for volatility?", a: "No, CAGR shows a smoothed average — actual year-to-year returns can vary significantly even with the same CAGR." },
      ],
    },
    "expense-ratio": {
      title: "Expense Ratio Inputs",
      defaults: { amount: 50000, rate: 7, years: 25, extraField: 0.5 },
      fields: [
        { key: "amount", label: "Investment Amount", prefix: "$", min: 100, max: 5000000, step: 1000 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "extraField", label: "Expense Ratio", suffix: "%", min: 0, max: 3, step: 0.01, tooltip: "Annual fund management fee" },
        { key: "years", label: "Investment Horizon", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, extraField, years, currency }) => {
        const netRate = rate - extraField;
        const fvWithFee = amount * Math.pow(1 + netRate / 100, years);
        const fvNoFee = amount * Math.pow(1 + rate / 100, years);
        const totalFeeCost = fvNoFee - fvWithFee;
        return { metrics: [
          { label: "Value After Fees", value: formatCurrency(fvWithFee, currency), icon: "💰" },
          { label: "Total Fee Cost", value: formatCurrency(totalFeeCost, currency), sub: `Over ${years} years`, icon: "💸" },
          { label: "Value Without Fees", value: formatCurrency(fvNoFee, currency), icon: "📈" },
          { label: "Net Annual Return", value: formatPercent(netRate), icon: "📊" },
        ]};
      },
      insights: ({ extraField, currency }) => {
        const ratio = extraField;
        return [{ type: ratio <= 0.2 ? "success" as const : ratio <= 0.7 ? "info" as const : "warning" as const, title: "Fee Impact", body: `A ${ratio}% expense ratio ${ratio <= 0.2 ? "is excellent — typical of low-cost index funds" : ratio <= 0.7 ? "is reasonable for actively managed funds" : "is high; compare against low-cost index alternatives often under 0.2%"}.` }];
      },
      formulas: [{ name: "Expense Ratio Impact", formula: "Net Return = Gross Return − Expense Ratio", variables: [{ symbol: "Expense Ratio", meaning: "Annual fund fee as % of assets" }], example: "7% return − 0.5% expense ratio = 6.5% net return, compounded over time" }],
      faqs: [
        { q: "What is a good expense ratio?", a: "Index funds typically charge 0.03-0.20%. Actively managed funds often charge 0.5-1.5%+. Even small differences compound significantly over decades." },
        { q: "How much do fees really cost over time?", a: "On $50,000 over 25 years, a 1% difference in fees can cost over $100,000 in lost growth due to compounding." },
      ],
    },
    "apr-apy": {
      title: "APR vs APY Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 10000, rate: 6, years: 1, extraField: 12 },
      fields: [
        { key: "rate", label: "APR (Nominal Rate)", suffix: "%", min: 0.1, max: 30, step: 0.05 },
        { key: "extraField", label: "Compounding Periods/Year", min: 1, max: 365, step: 1, tooltip: "12=monthly, 4=quarterly, 365=daily" },
        { key: "amount", label: "Principal (for illustration)", prefix: "$", min: 100, max: 1000000, step: 100 },
      ],
      compute: ({ rate, extraField, amount, currency }) => {
        const n = extraField || 12;
        const apy = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;
        const interestAPR = amount * (rate / 100);
        const interestAPY = amount * (apy / 100);
        return { metrics: [
          { label: "Effective APY", value: formatPercent(apy), icon: "📊" },
          { label: "Nominal APR", value: formatPercent(rate), icon: "📈" },
          { label: "Interest at APR", value: formatCurrency(interestAPR, currency), icon: "💵" },
          { label: "Interest at APY", value: formatCurrency(interestAPY, currency), icon: "💰" },
        ]};
      },
      insights: ({ rate, extraField }) => {
        const n = extraField || 12;
        const apy = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;
        return [{ type: "info" as const, title: "APR vs APY", body: `With ${n} compounding periods/year, your ${rate}% APR equals ${apy.toFixed(3)}% APY — the more frequent the compounding, the bigger the gap.` }];
      },
      formulas: [{ name: "APY from APR", formula: "APY = (1 + APR/n)^n − 1", variables: [{ symbol: "n", meaning: "Compounding periods per year" }], example: "6% APR compounded monthly: APY = (1+0.06/12)^12 − 1 = 6.17%" }],
      faqs: [
        { q: "Which rate should I use to compare accounts?", a: "Always compare APY for savings/investments (it reflects true earnings) and APR for loans (required disclosure, though APY on debt shows true cost)." },
        { q: "Why is APY always higher than APR?", a: "APY accounts for compounding — interest earning interest within the year — while APR is just the simple annual rate." },
      ],
    },
    "high-yield-savings": {
      title: "High-Yield Savings Inputs",
      defaults: { amount: 10000, rate: 4.5, years: 5, monthly: 200 },
      fields: [
        { key: "amount", label: "Initial Deposit", prefix: "$", min: 0, max: 1000000, step: 500 },
        { key: "rate", label: "APY", suffix: "%", min: 0.1, max: 8, step: 0.05 },
        { key: "monthly", label: "Monthly Deposit", prefix: "$", min: 0, max: 20000, step: 50 },
        { key: "years", label: "Time Horizon", suffix: "Years", min: 1, max: 30 },
      ],
      compute: ({ amount, rate, monthly, years, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const totalDeposited = amount + monthly * years * 12;
        return { metrics: [
          { label: "Final Balance", value: formatCurrency(fv, currency), icon: "💰" },
          { label: "Interest Earned", value: formatCurrency(fv - totalDeposited, currency), icon: "📈" },
          { label: "Total Deposited", value: formatCurrency(totalDeposited, currency), icon: "🏦" },
          { label: "APY", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ rate }) => [
        { type: rate >= 4 ? "success" as const : "info" as const, title: "Rate Check", body: `A ${rate}% APY is ${rate >= 4 ? "competitive — among the better HYSA rates available" : "below top HYSA offers; shop around for rates above 4%"}.` },
      ],
      formulas: [{ name: "Compound Savings Growth", formula: "FV = P(1+r)^n + PMT×[(1+r)^n−1]/r", variables: [{ symbol: "APY", meaning: "Annual Percentage Yield" }], example: "$10,000 + $200/month at 4.5% for 5 years grows substantially via compounding" }],
      faqs: [
        { q: "What is a high-yield savings account?", a: "An FDIC-insured savings account, usually online-only, offering significantly higher interest rates than traditional brick-and-mortar bank savings accounts." },
        { q: "Is my money safe in a HYSA?", a: "Yes, as long as the bank is FDIC-insured (or NCUA for credit unions), deposits are protected up to $250,000 per depositor, per bank." },
      ],
    },
    "fixed-deposit": {
      title: "Fixed Deposit Inputs",
      defaults: { amount: 100000, rate: 7, years: 5, extraField: 4 },
      fields: [
        { key: "amount", label: "Deposit Amount", prefix: "$", min: 1000, max: 10000000, step: 1000 },
        { key: "rate", label: "Annual Interest Rate", suffix: "%", min: 0.5, max: 12, step: 0.1 },
        { key: "years", label: "Term", suffix: "Years", min: 0.5, max: 20, step: 0.5 },
        { key: "extraField", label: "Compounding Frequency", min: 1, max: 12, step: 1, tooltip: "1=annual, 4=quarterly, 12=monthly" },
      ],
      compute: ({ amount, rate, years, extraField, currency }) => {
        const n = extraField || 4;
        const maturity = amount * Math.pow(1 + rate / 100 / n, n * years);
        return { metrics: [
          { label: "Maturity Value", value: formatCurrency(maturity, currency), icon: "💰" },
          { label: "Interest Earned", value: formatCurrency(maturity - amount, currency), icon: "📈" },
          { label: "Deposit Amount", value: formatCurrency(amount, currency), icon: "🏦" },
          { label: "Effective Yield", value: formatPercent(((maturity / amount) - 1) / years * 100), icon: "📊" },
        ]};
      },
      insights: ({ rate, years, currency, amount }) => [
        { type: "info" as const, title: "Fixed Deposit Summary", body: `Locking in ${formatCurrency(amount, currency)} at ${rate}% for ${years} years guarantees a fixed return, unlike market-linked investments.` },
      ],
      formulas: [{ name: "FD Maturity Value", formula: "Maturity = P × (1 + r/n)^(n×t)", variables: [{ symbol: "n", meaning: "Compounding frequency per year" }, { symbol: "t", meaning: "Term in years" }], example: "$100,000 at 7% quarterly compounding for 5 years = $141,478" }],
      faqs: [
        { q: "Can I withdraw a fixed deposit early?", a: "Most FDs allow premature withdrawal but with a penalty (reduced interest rate). Check your bank's specific terms." },
        { q: "Are FDs better than savings accounts?", a: "FDs typically offer higher rates in exchange for locking up funds for a fixed term, while savings accounts offer liquidity with lower rates." },
      ],
    },
    "recurring-deposit": {
      title: "Recurring Deposit Inputs",
      defaults: { amount: 0, rate: 6.5, years: 3, monthly: 5000 },
      fields: [
        { key: "monthly", label: "Monthly Deposit", prefix: "$", min: 100, max: 100000, step: 100 },
        { key: "rate", label: "Annual Interest Rate", suffix: "%", min: 0.5, max: 12, step: 0.1 },
        { key: "years", label: "Term", suffix: "Years", min: 0.5, max: 15, step: 0.5 },
      ],
      compute: ({ monthly, rate, years, currency }) => {
        const n = years * 12;
        const r = rate / 100 / 12;
        const maturity = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const totalDeposited = monthly * n;
        return { metrics: [
          { label: "Maturity Value", value: formatCurrency(maturity, currency), icon: "💰" },
          { label: "Interest Earned", value: formatCurrency(maturity - totalDeposited, currency), icon: "📈" },
          { label: "Total Deposited", value: formatCurrency(totalDeposited, currency), icon: "🏦" },
          { label: "Monthly Deposit", value: formatCurrency(monthly, currency), icon: "📅" },
        ]};
      },
      insights: ({ monthly, years, currency }) => [
        { type: "info" as const, title: "Disciplined Saving", body: `Depositing ${formatCurrency(monthly, currency)} monthly for ${years} years builds a guaranteed corpus through regular saving habits.` },
      ],
      formulas: [{ name: "RD Maturity Value", formula: "Maturity = PMT × [(1+r)^n − 1] / r × (1+r)", variables: [{ symbol: "PMT", meaning: "Monthly deposit" }, { symbol: "n", meaning: "Total months" }], example: "$5,000/month at 6.5% for 3 years = ~$198,000 maturity" }],
      faqs: [
        { q: "RD vs FD, which is better?", a: "RDs are ideal for building savings discipline with monthly deposits. FDs work best if you have a lump sum to invest at once." },
        { q: "Can I increase my monthly RD deposit?", a: "Most RD accounts require a fixed deposit amount for the chosen term. Increasing typically means opening a new RD account." },
      ],
    },
    "self-employment-tax": {
      title: "Self-Employment Tax Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 80000, rate: 15, years: 1, extraField: 20000 },
      fields: [
        { key: "amount", label: "Gross Self-Employment Income", prefix: "$", min: 0, max: 1000000, step: 1000 },
        { key: "extraField", label: "Business Expenses", prefix: "$", min: 0, max: 500000, step: 500 },
        { key: "rate", label: "Federal Income Tax Rate", suffix: "%", min: 0, max: 37, step: 1 },
      ],
      compute: ({ amount, extraField, rate, currency }) => {
        const netIncome = amount - extraField;
        const taxableSE = netIncome * 0.9235;
        const seTax = taxableSE * 0.153;
        const incomeTax = netIncome * (rate / 100);
        const totalTax = seTax + incomeTax;
        return { metrics: [
          { label: "Self-Employment Tax", value: formatCurrency(seTax, currency), sub: "15.3% (SS + Medicare)", icon: "🧾" },
          { label: "Est. Income Tax", value: formatCurrency(incomeTax, currency), icon: "📊" },
          { label: "Total Tax Owed", value: formatCurrency(totalTax, currency), icon: "💸" },
          { label: "Net Income", value: formatCurrency(netIncome - totalTax, currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, extraField, currency }) => {
        const net = amount - extraField;
        return [{ type: "info" as const, title: "Quarterly Payments", body: `On ${formatCurrency(net, currency)} net income, you likely owe quarterly estimated taxes to avoid IRS underpayment penalties.` }];
      },
      formulas: [{ name: "Self-Employment Tax", formula: "SE Tax = Net Income × 0.9235 × 15.3%", variables: [{ symbol: "0.9235", meaning: "Adjustment factor (92.35% of net income is taxable)" }, { symbol: "15.3%", meaning: "12.4% Social Security + 2.9% Medicare" }], example: "$60,000 net income: SE Tax = 60,000 × 0.9235 × 0.153 = $8,477" }],
      faqs: [
        { q: "What is self-employment tax?", a: "It covers Social Security (12.4%) and Medicare (2.9%) taxes that employers normally split with employees — self-employed individuals pay both halves (15.3% total)." },
        { q: "Can I deduct half of SE tax?", a: "Yes, you can deduct 50% of your self-employment tax from your gross income when calculating federal income tax, reducing your overall tax burden." },
      ],
    },
    "life-insurance": {
      title: "Life Insurance Needs Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 75000, rate: 1, years: 10, extraField: 150000 },
      fields: [
        { key: "amount", label: "Annual Income to Replace", prefix: "$", min: 0, max: 1000000, step: 1000 },
        { key: "years", label: "Years of Income Replacement", min: 1, max: 30, step: 1 },
        { key: "extraField", label: "Total Debts & Obligations", prefix: "$", min: 0, max: 5000000, step: 5000, tooltip: "Mortgage, loans, future education costs" },
      ],
      compute: ({ amount, years, extraField, currency }) => {
        const incomeReplacement = amount * years;
        const totalNeed = incomeReplacement + extraField;
        return { metrics: [
          { label: "Recommended Coverage", value: formatCurrency(totalNeed, currency), icon: "🛡️" },
          { label: "Income Replacement", value: formatCurrency(incomeReplacement, currency), icon: "💵" },
          { label: "Debts & Obligations", value: formatCurrency(extraField, currency), icon: "🏠" },
          { label: "Annual Income", value: formatCurrency(amount, currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, currency }) => [
        { type: "info" as const, title: "DIME Method", body: `This estimate uses the income-replacement approach. Also consider Debt, Income, Mortgage, and Education (DIME) for a comprehensive figure. Rule of thumb: 10-15x annual income (${formatCurrency(amount * 10, currency)}-${formatCurrency(amount * 15, currency)}).` },
      ],
      formulas: [{ name: "Life Insurance Need", formula: "Coverage = (Annual Income × Years) + Debts", variables: [{ symbol: "Years", meaning: "Years of income your family needs replaced" }], example: "$75,000 × 10 years + $150,000 debts = $900,000 recommended coverage" }],
      faqs: [
        { q: "Term vs whole life insurance?", a: "Term life is cheaper and covers a fixed period (e.g., 20 years) — ideal for income replacement needs. Whole life is permanent with a cash value component but costs significantly more." },
        { q: "How much life insurance do I need?", a: "Common rules of thumb suggest 10-15x your annual income, adjusted for outstanding debts, dependents' ages, and existing savings." },
      ],
    },
    "lump-sum": {
      title: "Lump Sum Investment Inputs",
      defaults: { amount: 50000, rate: 8, years: 15 },
      fields: [
        { key: "amount", label: "Lump Sum Amount", prefix: "$", min: 100, max: 10000000, step: 1000 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 20, step: 0.5 },
        { key: "years", label: "Investment Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years);
        return { metrics: [
          { label: "Future Value", value: formatCurrency(fv, currency), icon: "💰" },
          { label: "Total Growth", value: formatCurrency(fv - amount, currency), icon: "📈" },
          { label: "Growth Multiple", value: `${(fv / amount).toFixed(2)}x`, icon: "✖️" },
          { label: "Initial Investment", value: formatCurrency(amount, currency), icon: "🏦" },
        ]};
      },
      insights: ({ rate, years }) => [
        { type: "info" as const, title: "Lump Sum Power", body: `Investing the full amount upfront at ${rate}% for ${years} years lets compounding work on the entire principal from day one, often outperforming gradual investing in rising markets.` },
      ],
      formulas: [{ name: "Lump Sum Future Value", formula: "FV = PV × (1 + r)^t", variables: [{ symbol: "PV", meaning: "Present (lump sum) value" }], example: "$50,000 at 8% for 15 years = $158,627" }],
      faqs: [
        { q: "Lump sum vs dollar-cost averaging?", a: "Historically, lump sum investing outperforms DCA about 2/3 of the time since markets trend upward over time. DCA reduces timing risk and emotional stress." },
        { q: "Is lump sum investing risky?", a: "It carries more short-term volatility risk than spreading investments over time, but typically yields higher expected returns in a rising market." },
      ],
    },
    "future-value": {
      title: "Future Value Inputs",
      defaults: { amount: 10000, rate: 7, years: 20, monthly: 200 },
      fields: [
        { key: "amount", label: "Present Value", prefix: "$", min: 0, max: 10000000, step: 500 },
        { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 20000, step: 50 },
        { key: "rate", label: "Annual Return Rate", suffix: "%", min: 0.5, max: 20, step: 0.5 },
        { key: "years", label: "Time Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, years, monthly, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const totalContrib = amount + monthly * years * 12;
        return { metrics: [
          { label: "Future Value", value: formatCurrency(fv, currency), icon: "🎯" },
          { label: "Total Contributed", value: formatCurrency(totalContrib, currency), icon: "💰" },
          { label: "Growth from Interest", value: formatCurrency(fv - totalContrib, currency), icon: "📈" },
          { label: "Growth Multiple", value: `${(fv / Math.max(1, amount)).toFixed(2)}x`, icon: "✖️" },
        ]};
      },
      insights: ({ rate, years }) => [
        { type: "info" as const, title: "Future Value Projection", body: `At ${rate}% annually over ${years} years, compounding plays an increasingly large role in your total growth, especially in later years.` },
      ],
      formulas: [{ name: "Future Value with Contributions", formula: "FV = PV(1+r)^t + PMT×[(1+r)^t−1]/r", variables: [{ symbol: "PV", meaning: "Present value" }, { symbol: "PMT", meaning: "Periodic contribution" }], example: "$10,000 + $200/month at 7% for 20 years = ~$144,000" }],
      faqs: [
        { q: "What is future value used for?", a: "FV calculations project how an investment grows over time, useful for retirement planning, goal setting, and comparing investment options." },
      ],
    },
    "present-value": {
      title: "Present Value Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100000, rate: 6, years: 10 },
      fields: [
        { key: "amount", label: "Future Amount Needed", prefix: "$", min: 100, max: 50000000, step: 1000 },
        { key: "rate", label: "Discount Rate", suffix: "%", min: 0.5, max: 20, step: 0.5, tooltip: "Expected return or inflation rate" },
        { key: "years", label: "Years Until Needed", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const pv = amount / Math.pow(1 + rate / 100, years);
        return { metrics: [
          { label: "Present Value", value: formatCurrency(pv, currency), sub: "Needed today", icon: "💵" },
          { label: "Future Amount", value: formatCurrency(amount, currency), icon: "🎯" },
          { label: "Discount Applied", value: formatCurrency(amount - pv, currency), icon: "📉" },
          { label: "Discount Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ amount, rate, years, currency }) => [
        { type: "info" as const, title: "Present Value Insight", body: `To have ${formatCurrency(amount, currency)} in ${years} years at ${rate}% growth, you'd need to invest ${formatCurrency(amount / Math.pow(1 + rate / 100, years), currency)} today.` },
      ],
      formulas: [{ name: "Present Value", formula: "PV = FV / (1 + r)^t", variables: [{ symbol: "FV", meaning: "Future value needed" }, { symbol: "r", meaning: "Discount rate" }], example: "$100,000 in 10 years at 6%: PV = 100,000/1.06^10 = $55,839" }],
      faqs: [
        { q: "What is present value used for?", a: "It tells you how much a future sum is worth in today's dollars, essential for comparing investment options, loan offers, or lump sum vs. annuity decisions." },
      ],
    },
    "portfolio-allocation": {
      title: "Portfolio Allocation Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100000, rate: 70, years: 1, extraField: 30 },
      fields: [
        { key: "amount", label: "Portfolio Value", prefix: "$", min: 0, max: 50000000, step: 1000 },
        { key: "rate", label: "Stock Allocation", suffix: "%", min: 0, max: 100, step: 5 },
        { key: "extraField", label: "Bond Allocation", suffix: "%", min: 0, max: 100, step: 5 },
      ],
      compute: ({ amount, rate, extraField, currency }) => {
        const stockAmt = amount * (rate / 100);
        const bondAmt = amount * (extraField / 100);
        const cashPct = Math.max(0, 100 - rate - extraField);
        const cashAmt = amount * (cashPct / 100);
        const expectedReturn = (rate * 0.09 + extraField * 0.04 + cashPct * 0.02) / 100;
        return { metrics: [
          { label: "Stocks", value: formatCurrency(stockAmt, currency), sub: formatPercent(rate), icon: "📈" },
          { label: "Bonds", value: formatCurrency(bondAmt, currency), sub: formatPercent(extraField), icon: "🏦" },
          { label: "Cash/Other", value: formatCurrency(cashAmt, currency), sub: formatPercent(cashPct), icon: "💵" },
          { label: "Est. Blended Return", value: formatPercent(expectedReturn * 100), icon: "⚖️" },
        ]};
      },
      insights: ({ rate, extraField }) => {
        const total = rate + extraField;
        return total > 100
          ? [{ type: "warning" as const, title: "Allocation Exceeds 100%", body: "Your stock and bond percentages sum to more than 100%. Adjust so they fit within your total portfolio." }]
          : [{ type: "info" as const, title: "Risk Profile", body: `A ${rate}/${extraField} stock/bond split is ${rate >= 80 ? "aggressive" : rate >= 50 ? "moderate" : "conservative"}, common for ${rate >= 80 ? "younger investors with a long time horizon" : rate >= 50 ? "mid-career investors balancing growth and stability" : "those near or in retirement prioritizing capital preservation"}.` }];
      },
      formulas: [{ name: "Portfolio Allocation", formula: "Asset Value = Total Portfolio × Allocation%", variables: [{ symbol: "Allocation%", meaning: "Target % in each asset class" }], example: "$100,000 at 70/30 stock/bond = $70,000 stocks, $30,000 bonds" }],
      faqs: [
        { q: "What is the '100 minus age' rule?", a: "A classic guideline: subtract your age from 100 to get your stock allocation %. Many now use 110 or 120 minus age given longer life expectancies." },
        { q: "How often should I rebalance?", a: "Annually or when an asset class drifts more than 5% from target is a common approach to maintain your desired risk level." },
      ],
    },
    "traditional-ira": {
      title: "Traditional IRA Inputs",
      defaults: { amount: 5000, rate: 8, years: 30, monthly: 500, extraField: 22 },
      fields: [
        { key: "amount", label: "Current Balance", prefix: "$", min: 0, max: 500000, step: 100 },
        { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 583, step: 25, tooltip: "2024 limit: $7,000/year ($583/month)" },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years Until Retirement", suffix: "Years", min: 1, max: 50 },
        { key: "extraField", label: "Tax Rate at Withdrawal", suffix: "%", min: 10, max: 37, step: 1 },
      ],
      compute: ({ amount, rate, years, monthly, extraField, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const taxOwed = fv * (extraField / 100);
        const afterTax = fv - taxOwed;
        const contribTaxSavings = monthly * 12 * (extraField / 100);
        return { metrics: [
          { label: "Balance at Retirement", value: formatCurrency(fv, currency), icon: "🏛️" },
          { label: "Est. Tax Owed at Withdrawal", value: formatCurrency(taxOwed, currency), icon: "🧾" },
          { label: "After-Tax Value", value: formatCurrency(afterTax, currency), icon: "💰" },
          { label: "Today's Tax Savings", value: formatCurrency(contribTaxSavings, currency), sub: "Per year", icon: "💵" },
        ]};
      },
      insights: ({ extraField, monthly, currency }) => [
        { type: "info" as const, title: "Tax-Deferred Growth", body: `Your contributions reduce taxable income today (saving ${formatCurrency(monthly * 12 * (extraField / 100), currency)}/year at your bracket), but withdrawals in retirement are taxed as ordinary income.` },
      ],
      formulas: [{ name: "Traditional IRA Growth", formula: "FV = Balance×(1+r)^n + PMT×[(1+r)^n−1]/r (taxed at withdrawal)", variables: [{ symbol: "FV", meaning: "Pre-tax balance at retirement" }], example: "$500/month at 8% for 30 years = ~$735,000 pre-tax" }],
      faqs: [
        { q: "Traditional IRA vs Roth IRA?", a: "Traditional IRA: tax deduction now, taxed withdrawals later. Best if you expect to be in a lower tax bracket in retirement than now." },
        { q: "What is the 2024 IRA contribution limit?", a: "$7,000/year ($8,000 if 50+). This limit is shared across all your IRA accounts (Traditional + Roth combined)." },
      ],
    },
    "rmd": {
      title: "RMD Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 500000, rate: 1, years: 73, extraField: 26.5 },
      fields: [
        { key: "amount", label: "Account Balance (Dec 31)", prefix: "$", min: 0, max: 20000000, step: 1000 },
        { key: "years", label: "Your Age", min: 73, max: 100, step: 1 },
        { key: "extraField", label: "IRS Life Expectancy Factor", min: 1, max: 30, step: 0.1, tooltip: "From IRS Uniform Lifetime Table (e.g. age 73 = 26.5)" },
      ],
      compute: ({ amount, extraField, currency }) => {
        const rmd = extraField > 0 ? amount / extraField : 0;
        return { metrics: [
          { label: "Required Withdrawal", value: formatCurrency(rmd, currency), icon: "🏧" },
          { label: "Monthly Equivalent", value: formatCurrency(rmd / 12, currency), icon: "📅" },
          { label: "Account Balance", value: formatCurrency(amount, currency), icon: "🏛️" },
          { label: "Remaining After RMD", value: formatCurrency(amount - rmd, currency), icon: "💰" },
        ]};
      },
      insights: ({ years }) => [
        { type: "warning" as const, title: "RMD Deadline", body: `RMDs must be taken by Dec 31 each year (the first one can be delayed to April 1 of the following year). Missing the deadline incurs a 25% IRS penalty on the shortfall.${years > 73 ? "" : " RMDs begin at age 73 under current law."}` },
      ],
      formulas: [{ name: "Required Minimum Distribution", formula: "RMD = Account Balance / IRS Life Expectancy Factor", variables: [{ symbol: "Factor", meaning: "From the IRS Uniform Lifetime Table, based on age" }], example: "$500,000 / 26.5 (age 73 factor) = $18,868 RMD" }],
      faqs: [
        { q: "When do RMDs start?", a: "Age 73 for those born 1951-1959, and age 75 for those born 1960 or later, under the SECURE 2.0 Act." },
        { q: "What happens if I miss my RMD?", a: "The IRS imposes a 25% excise tax penalty on the amount not withdrawn (reduced to 10% if corrected within 2 years)." },
      ],
    },
    "debt-snowball": {
      title: "Debt Snowball Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 15000, rate: 18, years: 1, monthly: 500 },
      fields: [
        { key: "amount", label: "Total Debt Balance", prefix: "$", min: 100, max: 1000000, step: 100 },
        { key: "rate", label: "Average Interest Rate", suffix: "%", min: 0, max: 35, step: 0.5 },
        { key: "monthly", label: "Monthly Payment", prefix: "$", min: 50, max: 50000, step: 25 },
      ],
      compute: ({ amount, rate, monthly, currency }) => {
        const r = rate / 100 / 12;
        let balance = amount, months = 0, totalInterest = 0;
        while (balance > 0 && months < 600) { const ip = balance * r; totalInterest += ip; balance -= (monthly - ip); months++; }
        return { metrics: [
          { label: "Payoff Time", value: `${(months / 12).toFixed(1)} yrs`, icon: "⏱️" },
          { label: "Total Interest Paid", value: formatCurrency(totalInterest, currency), icon: "💸" },
          { label: "Total Paid", value: formatCurrency(amount + totalInterest, currency), icon: "💰" },
          { label: "Monthly Payment", value: formatCurrency(monthly, currency), icon: "💳" },
        ]};
      },
      insights: () => [
        { type: "success" as const, title: "Snowball Method", body: "List debts smallest to largest balance. Pay minimums on all, then throw extra at the smallest. Each payoff builds momentum and motivation for the next." },
      ],
      formulas: [{ name: "Debt Snowball Strategy", formula: "Pay minimums on all debts + extra toward smallest balance first", variables: [{ symbol: "Snowball", meaning: "Freed-up payment 'rolls' to the next smallest debt" }], example: "Pay off a $500 card first, then redirect that payment to the next smallest debt" }],
      faqs: [
        { q: "Snowball vs avalanche method?", a: "Snowball pays smallest balances first for psychological wins. Avalanche pays highest interest rates first, saving more money mathematically. Choose based on what keeps you motivated." },
      ],
    },
    "debt-avalanche": {
      title: "Debt Avalanche Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 15000, rate: 22, years: 1, monthly: 500 },
      fields: [
        { key: "amount", label: "Total Debt Balance", prefix: "$", min: 100, max: 1000000, step: 100 },
        { key: "rate", label: "Highest Interest Rate", suffix: "%", min: 0, max: 35, step: 0.5 },
        { key: "monthly", label: "Monthly Payment", prefix: "$", min: 50, max: 50000, step: 25 },
      ],
      compute: ({ amount, rate, monthly, currency }) => {
        const r = rate / 100 / 12;
        let balance = amount, months = 0, totalInterest = 0;
        while (balance > 0 && months < 600) { const ip = balance * r; totalInterest += ip; balance -= (monthly - ip); months++; }
        return { metrics: [
          { label: "Payoff Time", value: `${(months / 12).toFixed(1)} yrs`, icon: "⏱️" },
          { label: "Total Interest Paid", value: formatCurrency(totalInterest, currency), icon: "💸" },
          { label: "Total Paid", value: formatCurrency(amount + totalInterest, currency), icon: "💰" },
          { label: "Monthly Payment", value: formatCurrency(monthly, currency), icon: "💳" },
        ]};
      },
      insights: () => [
        { type: "success" as const, title: "Avalanche Method", body: "Pay minimums on all debts, then put extra toward the highest interest rate debt first. This minimizes total interest paid mathematically." },
      ],
      formulas: [{ name: "Debt Avalanche Strategy", formula: "Pay minimums on all debts + extra toward highest interest rate first", variables: [{ symbol: "Avalanche", meaning: "Targets the most expensive debt first to minimize total interest" }], example: "A 24% APR card gets extra payments before a 6% APR loan, even if the loan balance is smaller" }],
      faqs: [
        { q: "Why is avalanche mathematically better?", a: "By eliminating the highest-interest debt first, you reduce the total interest accrued across your entire debt portfolio faster than the snowball method." },
      ],
    },
    "revenue-growth": {
      title: "Revenue Growth Inputs",
      defaults: { amount: 500000, rate: 15, years: 5 },
      fields: [
        { key: "amount", label: "Current Annual Revenue", prefix: "$", min: 0, max: 100000000, step: 10000 },
        { key: "rate", label: "Annual Growth Rate", suffix: "%", min: -20, max: 100, step: 1 },
        { key: "years", label: "Projection Period", suffix: "Years", min: 1, max: 20 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const projected = amount * Math.pow(1 + rate / 100, years);
        return { metrics: [
          { label: "Projected Revenue", value: formatCurrency(projected, currency), sub: `In ${years} years`, icon: "📈" },
          { label: "Total Growth", value: formatCurrency(projected - amount, currency), icon: "💰" },
          { label: "Growth Multiple", value: `${(projected / Math.max(1, amount)).toFixed(2)}x`, icon: "✖️" },
          { label: "Current Revenue", value: formatCurrency(amount, currency), icon: "🏢" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "Growth Sustainability", body: `Sustaining ${rate}% annual growth is ${rate > 30 ? "very aggressive — typically only achievable short-term or for early-stage companies" : rate > 10 ? "strong and achievable for healthy growing businesses" : "modest and conservative"}.` },
      ],
      formulas: [{ name: "Revenue Projection", formula: "Future Revenue = Current Revenue × (1 + growth%)^years", variables: [{ symbol: "growth%", meaning: "Annual revenue growth rate" }], example: "$500,000 at 15% for 5 years = $1,005,690" }],
      faqs: [
        { q: "What is a healthy revenue growth rate?", a: "Varies by stage and industry: established businesses often target 10-20%, while early-stage startups may aim for 50-100%+ year over year." },
      ],
    },
    "npv": {
      title: "NPV Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100000, rate: 10, years: 5, monthly: 30000 },
      fields: [
        { key: "amount", label: "Initial Investment", prefix: "$", min: 0, max: 100000000, step: 1000 },
        { key: "monthly", label: "Annual Cash Flow", prefix: "$", min: 0, max: 10000000, step: 1000, tooltip: "Expected cash inflow per year" },
        { key: "rate", label: "Discount Rate", suffix: "%", min: 1, max: 25, step: 0.5 },
        { key: "years", label: "Project Duration", suffix: "Years", min: 1, max: 30 },
      ],
      compute: ({ amount, monthly, rate, years, currency }) => {
        let npv = -amount;
        for (let t = 1; t <= years; t++) npv += monthly / Math.pow(1 + rate / 100, t);
        const totalCashFlow = monthly * years;
        return { metrics: [
          { label: "Net Present Value", value: formatCurrency(npv, currency), icon: npv >= 0 ? "✅" : "❌" },
          { label: "Total Cash Inflow", value: formatCurrency(totalCashFlow, currency), icon: "💰" },
          { label: "Initial Investment", value: formatCurrency(amount, currency), icon: "🏦" },
          { label: "Discount Rate", value: formatPercent(rate), icon: "📊" },
        ]};
      },
      insights: ({ amount, monthly, rate, years }) => {
        let npv = -amount;
        for (let t = 1; t <= years; t++) npv += monthly / Math.pow(1 + rate / 100, t);
        return npv >= 0
          ? [{ type: "success" as const, title: "Positive NPV — Worth Pursuing", body: "The project's discounted cash flows exceed the initial investment, suggesting it creates value at this discount rate." }]
          : [{ type: "danger" as const, title: "Negative NPV — Reconsider", body: "At this discount rate, the project destroys value. Either the cash flows are too low or the required return is too high relative to expected returns." }];
      },
      formulas: [{ name: "Net Present Value", formula: "NPV = −Initial + Σ [CFₜ / (1+r)^t]", variables: [{ symbol: "CFₜ", meaning: "Cash flow in year t" }, { symbol: "r", meaning: "Discount rate" }], example: "−$100,000 + 5 years of $30,000 at 10% discount rate = positive NPV" }],
      faqs: [
        { q: "What does positive NPV mean?", a: "A positive NPV means the project is expected to generate more value than it costs, after accounting for the time value of money — generally a 'go' signal." },
        { q: "What discount rate should I use?", a: "Often your cost of capital, required rate of return, or weighted average cost of capital (WACC) for businesses." },
      ],
    },
    "irr": {
      title: "IRR Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100000, rate: 10, years: 5, monthly: 28000 },
      fields: [
        { key: "amount", label: "Initial Investment", prefix: "$", min: 0, max: 100000000, step: 1000 },
        { key: "monthly", label: "Annual Cash Flow", prefix: "$", min: 0, max: 10000000, step: 1000 },
        { key: "years", label: "Number of Years", min: 1, max: 30, step: 1 },
      ],
      compute: ({ amount, monthly, years, currency }) => {
        let low = -50, high = 100, irr = 10;
        for (let iter = 0; iter < 100; iter++) {
          const mid = (low + high) / 2;
          let npv = -amount;
          for (let t = 1; t <= years; t++) npv += monthly / Math.pow(1 + mid / 100, t);
          if (npv > 0) low = mid; else high = mid;
          irr = mid;
        }
        return { metrics: [
          { label: "Internal Rate of Return", value: formatPercent(irr), icon: "📊" },
          { label: "Total Cash Flow", value: formatCurrency(monthly * years, currency), icon: "💰" },
          { label: "Initial Investment", value: formatCurrency(amount, currency), icon: "🏦" },
          { label: "Investment Multiple", value: `${(monthly * years / Math.max(1, amount)).toFixed(2)}x`, icon: "✖️" },
        ]};
      },
      insights: ({ years }) => [
        { type: "info" as const, title: "IRR Interpretation", body: `IRR is the discount rate where NPV equals zero — compare it to your required rate of return or cost of capital to judge if this ${years}-year investment is worthwhile.` },
      ],
      formulas: [{ name: "Internal Rate of Return", formula: "IRR solves: 0 = −Initial + Σ [CFₜ / (1+IRR)^t]", variables: [{ symbol: "IRR", meaning: "The discount rate that makes NPV = 0" }], example: "Found via iteration; approximates the annualized return of an investment's cash flows" }],
      faqs: [
        { q: "IRR vs CAGR, what's the difference?", a: "CAGR assumes a single lump-sum growth. IRR accounts for multiple cash flows occurring at different times, making it better for projects with ongoing cash flows." },
        { q: "What is a good IRR?", a: "Compare against your cost of capital or alternative investment opportunities. Many investors target IRRs of 15-25%+ for higher-risk investments like private equity or real estate." },
      ],
    },
    "stock-average": {
      title: "Stock Average Price Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 150, rate: 20, years: 1, extraField: 100, monthly: 30 },
      fields: [
        { key: "amount", label: "First Purchase Price/Share", prefix: "$", min: 0.01, max: 100000, step: 0.5 },
        { key: "rate", label: "First Purchase Shares", min: 1, max: 100000, step: 1 },
        { key: "extraField", label: "Second Purchase Price/Share", prefix: "$", min: 0.01, max: 100000, step: 0.5 },
        { key: "monthly", label: "Second Purchase Shares", min: 1, max: 100000, step: 1 },
      ],
      compute: ({ amount, rate, extraField, monthly, currency }) => {
        const totalCost = amount * rate + extraField * monthly;
        const totalShares = rate + monthly;
        const avgPrice = totalShares > 0 ? totalCost / totalShares : 0;
        return { metrics: [
          { label: "Average Price/Share", value: formatCurrency(avgPrice, currency), icon: "📊" },
          { label: "Total Shares", value: totalShares.toLocaleString(), icon: "📦" },
          { label: "Total Invested", value: formatCurrency(totalCost, currency), icon: "💰" },
          { label: "Breakeven Price", value: formatCurrency(avgPrice, currency), icon: "🎯" },
        ]};
      },
      insights: ({ amount, extraField }) => [
        { type: "info" as const, title: "Dollar-Cost Averaging Effect", body: extraField < amount ? "Buying more shares at a lower price reduces your average cost basis, making it easier to return to profitability." : "Your second purchase was at a higher price, raising your average cost basis." },
      ],
      formulas: [{ name: "Average Stock Price", formula: "Avg Price = (P₁×S₁ + P₂×S₂) / (S₁+S₂)", variables: [{ symbol: "P", meaning: "Price per share" }, { symbol: "S", meaning: "Shares purchased" }], example: "100 shares at $150 + 30 shares at $100 = $138.71 average price" }],
      faqs: [
        { q: "What is averaging down?", a: "Buying more shares of a stock after its price drops, lowering your average cost basis. It can be beneficial if the stock recovers, but risky if the decline continues (catching a 'falling knife')." },
      ],
    },
    "rental-roi": {
      title: "Rental ROI Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 300000, rate: 3, years: 1, monthly: 2200, extraField: 70000 },
      fields: [
        { key: "amount", label: "Property Purchase Price", prefix: "$", min: 10000, max: 20000000, step: 5000 },
        { key: "extraField", label: "Total Cash Invested", prefix: "$", min: 1000, max: 5000000, step: 1000, tooltip: "Down payment + closing costs + repairs" },
        { key: "monthly", label: "Monthly Net Cash Flow", prefix: "$", min: -5000, max: 50000, step: 50 },
        { key: "rate", label: "Annual Appreciation", suffix: "%", min: 0, max: 15, step: 0.5 },
      ],
      compute: ({ amount, extraField, monthly, rate, currency }) => {
        const annualCashFlow = monthly * 12;
        const appreciation = amount * (rate / 100);
        const totalAnnualReturn = annualCashFlow + appreciation;
        const roi = extraField > 0 ? (totalAnnualReturn / extraField) * 100 : 0;
        return { metrics: [
          { label: "Total ROI", value: formatPercent(roi), icon: "📊" },
          { label: "Annual Cash Flow", value: formatCurrency(annualCashFlow, currency), icon: "💰" },
          { label: "Annual Appreciation", value: formatCurrency(appreciation, currency), icon: "📈" },
          { label: "Cash Invested", value: formatCurrency(extraField, currency), icon: "🏦" },
        ]};
      },
      insights: ({ extraField, monthly, amount, rate }) => {
        const roi = extraField > 0 ? (((monthly * 12) + amount * (rate / 100)) / extraField) * 100 : 0;
        return [{ type: roi >= 10 ? "success" as const : "info" as const, title: "Total Return Assessment", body: `Combining cash flow and appreciation, your total ROI is ${roi.toFixed(1)}%. ${roi >= 10 ? "This is a strong return for real estate." : "Compare against other investment options to evaluate this opportunity."}` }];
      },
      formulas: [{ name: "Total Rental ROI", formula: "ROI = (Annual Cash Flow + Appreciation) / Cash Invested × 100", variables: [{ symbol: "Cash Invested", meaning: "Down payment + closing costs + repairs" }], example: "($26,400 cash flow + $9,000 appreciation) / $70,000 invested = 50.6% ROI" }],
      faqs: [
        { q: "Should I include appreciation in ROI?", a: "It's reasonable for total return analysis, but appreciation is unrealized until sale and less certain than cash flow — many investors track them separately." },
      ],
    },
    "cash-flow": {
      title: "Rental Cash Flow Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 1800, rate: 1, years: 1, monthly: 2200, extraField: 600 },
      fields: [
        { key: "monthly", label: "Monthly Rent", prefix: "$", min: 0, max: 50000, step: 50 },
        { key: "amount", label: "Mortgage Payment (PITI)", prefix: "$", min: 0, max: 30000, step: 50 },
        { key: "extraField", label: "Other Monthly Expenses", prefix: "$", min: 0, max: 10000, step: 25, tooltip: "Maintenance, vacancy reserve, management fees" },
      ],
      compute: ({ monthly, amount, extraField, currency }) => {
        const cashFlow = monthly - amount - extraField;
        const annualCashFlow = cashFlow * 12;
        return { metrics: [
          { label: "Monthly Cash Flow", value: formatCurrency(cashFlow, currency), icon: cashFlow >= 0 ? "✅" : "⚠️" },
          { label: "Annual Cash Flow", value: formatCurrency(annualCashFlow, currency), icon: "💰" },
          { label: "Total Monthly Outflow", value: formatCurrency(amount + extraField, currency), icon: "💸" },
          { label: "Monthly Rent", value: formatCurrency(monthly, currency), icon: "🏠" },
        ]};
      },
      insights: ({ monthly, amount, extraField }) => {
        const cf = monthly - amount - extraField;
        return cf >= 0
          ? [{ type: "success" as const, title: "Positive Cash Flow", body: `This property generates ${cf.toFixed(0)}/month in positive cash flow after all expenses.` }]
          : [{ type: "warning" as const, title: "Negative Cash Flow", body: `This property costs ${Math.abs(cf).toFixed(0)}/month out of pocket. Only consider this if you're banking on significant appreciation.` }];
      },
      formulas: [{ name: "Monthly Cash Flow", formula: "Cash Flow = Rent − Mortgage (PITI) − Other Expenses", variables: [{ symbol: "PITI", meaning: "Principal, Interest, Taxes, Insurance" }], example: "$2,200 rent − $1,800 PITI − $600 expenses = −$200/month" }],
      faqs: [
        { q: "What expenses should I include?", a: "Vacancy reserve (5-10%), maintenance (1% of value/year), property management (8-10% of rent if used), and capital expenditure reserves, in addition to PITI." },
      ],
    },
    "time-value": {
      title: "Time Value of Money Inputs",
      defaults: { amount: 10000, rate: 6, years: 10 },
      fields: [
        { key: "amount", label: "Amount", prefix: "$", min: 100, max: 10000000, step: 500 },
        { key: "rate", label: "Interest/Discount Rate", suffix: "%", min: 0.5, max: 20, step: 0.5 },
        { key: "years", label: "Time Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years);
        const pv = amount / Math.pow(1 + rate / 100, years);
        return { metrics: [
          { label: "Future Value", value: formatCurrency(fv, currency), sub: "If invested today", icon: "📈" },
          { label: "Present Value", value: formatCurrency(pv, currency), sub: "If received in future", icon: "📉" },
          { label: "Amount", value: formatCurrency(amount, currency), icon: "💵" },
          { label: "Growth Factor", value: `${Math.pow(1 + rate / 100, years).toFixed(2)}x`, icon: "✖️" },
        ]};
      },
      insights: ({ rate, years }) => [
        { type: "info" as const, title: "Core Finance Principle", body: `A dollar today is worth more than a dollar in ${years} years because it can be invested at ${rate}% to grow. This is the foundation of all financial valuation.` },
      ],
      formulas: [{ name: "Time Value of Money", formula: "FV = PV(1+r)^t  ⟷  PV = FV/(1+r)^t", variables: [{ symbol: "r", meaning: "Interest or discount rate" }], example: "$10,000 at 6% for 10 years grows to $17,908 (future value)" }],
      faqs: [
        { q: "Why does money lose value over time?", a: "Due to opportunity cost (forgone investment returns) and inflation eroding purchasing power, a dollar today can do more than a dollar in the future." },
      ],
    },
    "crypto-tax": {
      title: "Crypto Tax Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 5000, rate: 15, years: 1, extraField: 12000 },
      fields: [
        { key: "amount", label: "Purchase Price (Cost Basis)", prefix: "$", min: 0, max: 10000000, step: 100 },
        { key: "extraField", label: "Sale Price", prefix: "$", min: 0, max: 10000000, step: 100 },
        { key: "rate", label: "Tax Rate", suffix: "%", min: 0, max: 37, step: 1 },
        { key: "years", label: "Holding Period", suffix: "Years", min: 0, max: 10, step: 0.1, tooltip: "1+ years = long-term capital gains rate" },
      ],
      compute: ({ amount, extraField, rate, years, currency }) => {
        const gain = extraField - amount;
        const isLongTerm = years >= 1;
        const tax = Math.max(0, gain) * (rate / 100);
        return { metrics: [
          { label: "Capital Gain", value: formatCurrency(gain, currency), icon: gain >= 0 ? "📈" : "📉" },
          { label: "Estimated Tax", value: formatCurrency(tax, currency), icon: "🧾" },
          { label: "Net Proceeds", value: formatCurrency(extraField - tax, currency), icon: "💰" },
          { label: "Gain Type", value: isLongTerm ? "Long-Term" : "Short-Term", icon: "⏱️" },
        ]};
      },
      insights: ({ years }) => [
        { type: years >= 1 ? "success" as const : "warning" as const, title: years >= 1 ? "Long-Term Rate Applies" : "Short-Term Rate Applies", body: years >= 1 ? "Holding over 1 year qualifies for lower long-term capital gains rates (0/15/20%)." : "Holding under 1 year means gains are taxed as ordinary income, often at a higher rate. Consider the tax impact before selling." },
      ],
      formulas: [{ name: "Crypto Capital Gains", formula: "Tax = (Sale − Cost Basis) × Tax Rate", variables: [{ symbol: "Cost Basis", meaning: "Original purchase price including fees" }], example: "$12,000 sale − $5,000 basis = $7,000 gain × 15% = $1,050 tax" }],
      faqs: [
        { q: "Is every crypto trade taxable?", a: "Yes, in most jurisdictions, crypto-to-crypto trades, crypto-to-fiat sales, and using crypto to buy goods are all taxable events." },
        { q: "How is crypto mining/staking taxed?", a: "Generally taxed as ordinary income at fair market value when received, then subject to capital gains tax when later sold." },
      ],
    },
    "interest-rate": {
      title: "Interest Rate Finder Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 20000, rate: 1, years: 5, extraField: 25000 },
      fields: [
        { key: "amount", label: "Loan/Deposit Amount", prefix: "$", min: 100, max: 10000000, step: 500 },
        { key: "extraField", label: "Total Repaid/Received", prefix: "$", min: 100, max: 20000000, step: 500 },
        { key: "years", label: "Term", suffix: "Years", min: 1, max: 40 },
      ],
      compute: ({ amount, extraField, years, currency }) => {
        const impliedRate = amount > 0 && years > 0 ? (Math.pow(extraField / amount, 1 / years) - 1) * 100 : 0;
        return { metrics: [
          { label: "Implied Annual Rate", value: formatPercent(impliedRate), icon: "📊" },
          { label: "Total Interest", value: formatCurrency(extraField - amount, currency), icon: "💰" },
          { label: "Principal", value: formatCurrency(amount, currency), icon: "🏦" },
          { label: "Total Repaid", value: formatCurrency(extraField, currency), icon: "💵" },
        ]};
      },
      insights: ({ years }) => [
        { type: "info" as const, title: "Rate Calculation", body: `This finds the compound annual rate implied by your principal, total repayment, and ${years}-year term — useful for comparing loan offers stated differently.` },
      ],
      formulas: [{ name: "Implied Interest Rate", formula: "r = (Total/Principal)^(1/years) − 1", variables: [{ symbol: "Total", meaning: "Total amount repaid or received" }], example: "$20,000 growing to $25,000 over 5 years implies a 4.56% annual rate" }],
      faqs: [
        { q: "Why would I need to find an implied rate?", a: "Useful when a lender states total repayment rather than a rate, or to verify the actual rate on a loan with fees baked into payments." },
      ],
    },
    "effective-interest-rate": {
      title: "Effective Interest Rate Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 10000, rate: 8, years: 1, extraField: 12 },
      fields: [
        { key: "rate", label: "Nominal (Stated) Rate", suffix: "%", min: 0.1, max: 30, step: 0.05 },
        { key: "extraField", label: "Compounding Periods/Year", min: 1, max: 365, step: 1 },
        { key: "amount", label: "Principal (for illustration)", prefix: "$", min: 100, max: 1000000, step: 100 },
      ],
      compute: ({ rate, extraField, amount, currency }) => {
        const n = extraField || 12;
        const eir = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;
        return { metrics: [
          { label: "Effective Rate", value: formatPercent(eir), icon: "📊" },
          { label: "Nominal Rate", value: formatPercent(rate), icon: "📈" },
          { label: "Difference", value: formatPercent(eir - rate), icon: "➕" },
          { label: "Annual Cost", value: formatCurrency(amount * (eir / 100), currency), icon: "💰" },
        ]};
      },
      insights: ({ rate, extraField }) => {
        const n = extraField || 12;
        const eir = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;
        return [{ type: "info" as const, title: "True Borrowing Cost", body: `Your nominal ${rate}% rate compounds to an effective ${eir.toFixed(2)}% — always compare effective rates when shopping for loans or accounts.` }];
      },
      formulas: [{ name: "Effective Interest Rate", formula: "EIR = (1 + nominal/n)^n − 1", variables: [{ symbol: "n", meaning: "Compounding periods per year" }], example: "8% nominal compounded monthly: EIR = (1+0.08/12)^12 − 1 = 8.30%" }],
      faqs: [
        { q: "Why does compounding frequency matter?", a: "More frequent compounding means interest is calculated and added more often, so the true (effective) cost or yield is higher than the stated nominal rate." },
      ],
    },
    "disability-insurance": {
      title: "Disability Insurance Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 6000, rate: 60, years: 5, extraField: 90 },
      fields: [
        { key: "amount", label: "Monthly Income", prefix: "$", min: 0, max: 100000, step: 100 },
        { key: "rate", label: "Coverage Percentage", suffix: "%", min: 40, max: 80, step: 5, tooltip: "Insurers typically cover 60-70% of income" },
        { key: "years", label: "Benefit Period", suffix: "Years", min: 1, max: 30, tooltip: "How long benefits would pay out (or 'to age 65')" },
        { key: "extraField", label: "Elimination Period", suffix: "Days", min: 0, max: 365, step: 30, tooltip: "Waiting period before benefits begin" },
      ],
      compute: ({ amount, rate, years, extraField, currency }) => {
        const monthlyBenefit = amount * (rate / 100);
        const totalBenefit = monthlyBenefit * years * 12;
        return { metrics: [
          { label: "Monthly Benefit", value: formatCurrency(monthlyBenefit, currency), icon: "🛡️" },
          { label: "Total Potential Benefit", value: formatCurrency(totalBenefit, currency), sub: `Over ${years} years`, icon: "💰" },
          { label: "Income Gap", value: formatCurrency(amount - monthlyBenefit, currency), sub: "Per month", icon: "📉" },
          { label: "Waiting Period", value: `${extraField} days`, icon: "⏱️" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "Coverage Gap", body: `With ${rate}% coverage, you'd need savings or other income to cover the remaining ${100 - rate}% of your income if disabled.` },
      ],
      formulas: [{ name: "Disability Benefit", formula: "Monthly Benefit = Income × Coverage%", variables: [{ symbol: "Coverage%", meaning: "Typically 60-70% of gross income" }], example: "$6,000/month income at 60% coverage = $3,600/month benefit" }],
      faqs: [
        { q: "Why isn't coverage 100% of income?", a: "Insurers cap coverage to maintain incentive to return to work and because benefits are often tax-free if you pay premiums with after-tax dollars." },
        { q: "Short-term vs long-term disability?", a: "Short-term typically covers 3-6 months for temporary conditions. Long-term can extend for years or until retirement age for permanent disabilities." },
      ],
    },
    "home-insurance": {
      title: "Home Insurance Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 350000, rate: 0.5, years: 1, extraField: 1500 },
      fields: [
        { key: "amount", label: "Home Replacement Value", prefix: "$", min: 50000, max: 20000000, step: 5000 },
        { key: "rate", label: "Estimated Premium Rate", suffix: "%", min: 0.1, max: 2, step: 0.05, tooltip: "Annual premium as % of home value" },
        { key: "extraField", label: "Deductible", prefix: "$", min: 250, max: 10000, step: 250 },
      ],
      compute: ({ amount, rate, extraField, currency }) => {
        const annualPremium = amount * (rate / 100);
        return { metrics: [
          { label: "Est. Annual Premium", value: formatCurrency(annualPremium, currency), icon: "🛡️" },
          { label: "Monthly Equivalent", value: formatCurrency(annualPremium / 12, currency), icon: "📅" },
          { label: "Replacement Value", value: formatCurrency(amount, currency), icon: "🏠" },
          { label: "Deductible", value: formatCurrency(extraField, currency), icon: "💳" },
        ]};
      },
      insights: ({ extraField, currency }) => [
        { type: "info" as const, title: "Deductible Tradeoff", body: `A ${formatCurrency(extraField, currency)} deductible lowers your premium but increases out-of-pocket cost per claim. Choose based on your emergency fund cushion.` },
      ],
      formulas: [{ name: "Home Insurance Premium Estimate", formula: "Annual Premium ≈ Replacement Value × Rate%", variables: [{ symbol: "Rate%", meaning: "Varies by location, home age, and risk factors" }], example: "$350,000 home at 0.5% rate = $1,750/year estimated premium" }],
      faqs: [
        { q: "What affects my home insurance rate?", a: "Location (weather/crime risk), home age and construction, claims history, credit score (in most states), and coverage limits/deductible chosen." },
        { q: "Replacement cost vs market value?", a: "Insure based on rebuild/replacement cost, not market value — land value shouldn't be included since it doesn't need to be 'rebuilt'." },
      ],
    },
    "auto-insurance": {
      title: "Auto Insurance Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 25000, rate: 5, years: 1, extraField: 1000 },
      fields: [
        { key: "amount", label: "Vehicle Value", prefix: "$", min: 1000, max: 500000, step: 1000 },
        { key: "rate", label: "Estimated Premium Rate", suffix: "%", min: 1, max: 15, step: 0.5, tooltip: "Annual premium as % of vehicle value (varies widely by driver profile)" },
        { key: "extraField", label: "Deductible", prefix: "$", min: 0, max: 5000, step: 250 },
      ],
      compute: ({ amount, rate, extraField, currency }) => {
        const annualPremium = amount * (rate / 100);
        return { metrics: [
          { label: "Est. Annual Premium", value: formatCurrency(annualPremium, currency), icon: "🚗" },
          { label: "Monthly Equivalent", value: formatCurrency(annualPremium / 12, currency), icon: "📅" },
          { label: "Vehicle Value", value: formatCurrency(amount, currency), icon: "🏷️" },
          { label: "Deductible", value: formatCurrency(extraField, currency), icon: "💳" },
        ]};
      },
      insights: () => [
        { type: "info" as const, title: "Factors That Matter Most", body: "Driving record, age, location, credit score, and coverage limits typically affect premiums more than vehicle value alone." },
      ],
      formulas: [{ name: "Auto Insurance Premium Estimate", formula: "Annual Premium ≈ Vehicle Value × Rate%", variables: [{ symbol: "Rate%", meaning: "Varies by driver risk profile and location" }], example: "$25,000 vehicle at 5% rate = $1,250/year estimated premium" }],
      faqs: [
        { q: "How can I lower my auto insurance?", a: "Raise your deductible, bundle policies, maintain a clean driving record, ask about discounts (good student, low mileage), and shop around annually." },
        { q: "Liability vs full coverage?", a: "Liability covers damage you cause to others (often legally required). Full coverage adds collision and comprehensive for your own vehicle's damage." },
      ],
    },
    "health-insurance": {
      title: "Health Insurance Affordability Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 5000, rate: 1, years: 1, monthly: 450, extraField: 6000 },
      fields: [
        { key: "monthly", label: "Monthly Premium", prefix: "$", min: 0, max: 5000, step: 25 },
        { key: "amount", label: "Annual Income", prefix: "$", min: 0, max: 1000000, step: 1000 },
        { key: "extraField", label: "Annual Out-of-Pocket Max", prefix: "$", min: 0, max: 50000, step: 500 },
      ],
      compute: ({ monthly, amount, extraField, currency }) => {
        const annualPremium = monthly * 12;
        const premiumPctIncome = amount > 0 ? (annualPremium / amount) * 100 : 0;
        const worstCaseCost = annualPremium + extraField;
        const worstCasePct = amount > 0 ? (worstCaseCost / amount) * 100 : 0;
        return { metrics: [
          { label: "Annual Premium", value: formatCurrency(annualPremium, currency), icon: "🏥" },
          { label: "% of Income (Premium)", value: formatPercent(premiumPctIncome), icon: "📊" },
          { label: "Worst-Case Annual Cost", value: formatCurrency(worstCaseCost, currency), icon: "⚠️" },
          { label: "Worst-Case % of Income", value: formatPercent(worstCasePct), icon: "📉" },
        ]};
      },
      insights: ({ amount, monthly }) => {
        const pct = amount > 0 ? ((monthly * 12) / amount) * 100 : 0;
        return [{ type: pct <= 9.5 ? "success" as const : "warning" as const, title: pct <= 9.5 ? "Within Affordability Threshold" : "Above Affordability Threshold", body: `Premiums at ${pct.toFixed(1)}% of income are ${pct <= 9.5 ? "within the ACA's 9.5% affordability benchmark — you likely don't qualify for additional subsidies via the gap." : "above the ACA's 9.5% affordability benchmark — you may qualify for premium tax credits on the marketplace."}` }];
      },
      formulas: [{ name: "Affordability Check", formula: "Affordability % = (Annual Premium / Annual Income) × 100", variables: [{ symbol: "9.5%", meaning: "ACA affordability threshold (adjusted annually)" }], example: "$5,400/year premium / $50,000 income = 10.8% (above ACA threshold)" }],
      faqs: [
        { q: "What counts as 'affordable' under the ACA?", a: "Generally, premiums for the lowest-cost plan shouldn't exceed roughly 9.5% (adjusted yearly) of household income to be considered affordable for employer coverage purposes." },
        { q: "Should I choose a high-deductible plan?", a: "HDHPs have lower premiums but higher out-of-pocket costs, and pair with HSAs for tax advantages. Best for healthy individuals who rarely need care." },
      ],
    },
    "financial-health-score": {
      title: "Financial Health Score Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 6000, rate: 25, years: 1, monthly: 1000, extraField: 30 },
      fields: [
        { key: "amount", label: "Monthly Income", prefix: "$", min: 500, max: 100000, step: 100 },
        { key: "monthly", label: "Monthly Savings", prefix: "$", min: 0, max: 50000, step: 50 },
        { key: "rate", label: "Emergency Fund (Months Covered)", min: 0, max: 12, step: 1 },
        { key: "extraField", label: "Debt-to-Income Ratio", suffix: "%", min: 0, max: 100, step: 1 },
      ],
      compute: ({ amount, monthly, rate, extraField, currency }) => {
        const savingsRate = amount > 0 ? (monthly / amount) * 100 : 0;
        const savingsScore = Math.min(100, (savingsRate / 20) * 100);
        const emergencyScore = Math.min(100, (rate / 6) * 100);
        const debtScore = Math.max(0, 100 - extraField * 2.5);
        const totalScore = Math.round((savingsScore + emergencyScore + debtScore) / 3);
        return { metrics: [
          { label: "Financial Health Score", value: `${totalScore}/100`, icon: "🩺" },
          { label: "Savings Rate", value: formatPercent(savingsRate), icon: "💰" },
          { label: "Emergency Fund", value: `${rate} months`, icon: "🛟" },
          { label: "Debt-to-Income", value: formatPercent(extraField), icon: "📊" },
        ]};
      },
      insights: ({ amount, monthly, rate, extraField, currency }) => {
        const savingsRate = amount > 0 ? (monthly / amount) * 100 : 0;
        const totalScore = Math.round((Math.min(100, (savingsRate / 20) * 100) + Math.min(100, (rate / 6) * 100) + Math.max(0, 100 - extraField * 2.5)) / 3);
        return [{ type: totalScore >= 70 ? "success" as const : totalScore >= 40 ? "info" as const : "warning" as const, title: `Score: ${totalScore}/100`, body: totalScore >= 70 ? "Strong financial foundation across savings, emergency fund, and debt management." : totalScore >= 40 ? "Solid progress, with room to improve in savings rate, emergency fund, or debt reduction." : `Focus on building your emergency fund and reducing debt — consider saving ${formatCurrency(amount * 0.2, currency)}/month (20% target).` }];
      },
      formulas: [{ name: "Financial Health Score", formula: "Score = Avg(Savings Score, Emergency Fund Score, Debt Score)", variables: [{ symbol: "Components", meaning: "20% savings rate, 6-month emergency fund, and low DTI are 'full marks' benchmarks" }], example: "Combines three pillars into a single 0-100 health score" }],
      faqs: [
        { q: "What is a good financial health score?", a: "70+ indicates strong financial habits. 40-70 is solid with room to grow. Below 40 suggests prioritizing an emergency fund and debt reduction." },
      ],
    },
    "investment-goal": {
      title: "Investment Goal Inputs",
      defaults: { amount: 100000, rate: 8, years: 10, extraField: 20000 },
      fields: [
        { key: "amount", label: "Investment Goal", prefix: "$", min: 1000, max: 50000000, step: 1000 },
        { key: "extraField", label: "Current Savings", prefix: "$", min: 0, max: 10000000, step: 1000 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 20, step: 0.5 },
        { key: "years", label: "Years to Goal", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, extraField, rate, years, currency }) => {
        const r = rate / 100 / 12;
        const n = years * 12;
        const futureCurrentValue = extraField * Math.pow(1 + rate / 100, years);
        const remainingGoal = Math.max(0, amount - futureCurrentValue);
        const monthlyNeeded = r === 0 ? remainingGoal / n : (remainingGoal * r) / (Math.pow(1 + r, n) - 1);
        return { metrics: [
          { label: "Monthly Investment Needed", value: formatCurrency(Math.max(0, monthlyNeeded), currency), icon: "🎯" },
          { label: "Goal Amount", value: formatCurrency(amount, currency), icon: "🏆" },
          { label: "Current Savings Grows To", value: formatCurrency(futureCurrentValue, currency), icon: "📈" },
          { label: "Remaining Gap", value: formatCurrency(remainingGoal, currency), icon: "📊" },
        ]};
      },
      insights: ({ amount, extraField, currency }) => [
        { type: "info" as const, title: "Goal Progress", body: `You're ${((extraField / amount) * 100).toFixed(1)}% of the way to your ${formatCurrency(amount, currency)} goal with current savings alone.` },
      ],
      formulas: [{ name: "Goal-Based Monthly Investment", formula: "PMT = (Goal − FV of Current Savings) × r / [(1+r)^n − 1]", variables: [{ symbol: "Goal", meaning: "Target investment amount" }], example: "$100,000 goal, $20,000 current, 8% return, 10 years: ~$370/month needed" }],
      faqs: [
        { q: "What if I can't afford the monthly amount needed?", a: "Consider extending your timeline, increasing your expected return (with more risk), or starting with what you can afford and increasing contributions over time." },
      ],
    },
    "dollar-cost-averaging": {
      title: "Dollar-Cost Averaging Inputs",
      defaults: { amount: 0, rate: 8, years: 10, monthly: 500 },
      fields: [
        { key: "monthly", label: "Monthly Investment", prefix: "$", min: 25, max: 50000, step: 25 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 20, step: 0.5 },
        { key: "years", label: "Investment Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ monthly, rate, years, currency }) => {
        const fv = futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const totalInvested = monthly * years * 12;
        return { metrics: [
          { label: "Future Value", value: formatCurrency(fv, currency), icon: "📈" },
          { label: "Total Invested", value: formatCurrency(totalInvested, currency), icon: "💰" },
          { label: "Total Growth", value: formatCurrency(fv - totalInvested, currency), icon: "🚀" },
          { label: "Monthly Investment", value: formatCurrency(monthly, currency), icon: "📅" },
        ]};
      },
      insights: ({ monthly, years }) => [
        { type: "info" as const, title: "Consistency Wins", body: `Investing ${monthly}/month for ${years} years smooths out market volatility by buying more shares when prices are low and fewer when high.` },
      ],
      formulas: [{ name: "DCA Future Value", formula: "FV = PMT × [(1+r)^n − 1] / r", variables: [{ symbol: "PMT", meaning: "Regular monthly investment" }], example: "$500/month at 8% for 10 years = ~$91,473" }],
      faqs: [
        { q: "What is dollar-cost averaging?", a: "Investing a fixed amount at regular intervals regardless of price, reducing the impact of volatility and removing the need to time the market." },
        { q: "Is DCA better than lump sum?", a: "Lump sum historically outperforms DCA in rising markets (about 2/3 of the time), but DCA reduces risk and emotional stress, making it easier to stick with for most investors." },
      ],
    },
    "drip": {
      title: "DRIP Inputs",
      defaults: { amount: 20000, rate: 3.5, years: 20, monthly: 100 },
      fields: [
        { key: "amount", label: "Initial Investment", prefix: "$", min: 0, max: 5000000, step: 500 },
        { key: "rate", label: "Dividend Yield", suffix: "%", min: 0.5, max: 10, step: 0.1 },
        { key: "monthly", label: "Monthly Additional Investment", prefix: "$", min: 0, max: 20000, step: 50 },
        { key: "years", label: "Reinvestment Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, monthly, years, currency }) => {
        const fv = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const totalInvested = amount + monthly * years * 12;
        return { metrics: [
          { label: "Final Value (DRIP)", value: formatCurrency(fv, currency), icon: "🔄" },
          { label: "Total Invested", value: formatCurrency(totalInvested, currency), icon: "💰" },
          { label: "Compounding Gain", value: formatCurrency(fv - totalInvested, currency), icon: "📈" },
          { label: "Final Annual Dividend", value: formatCurrency(fv * (rate / 100), currency), icon: "💵" },
        ]};
      },
      insights: ({ rate, years }) => [
        { type: "success" as const, title: "Compounding Dividends", body: `Reinvesting dividends at a ${rate}% yield over ${years} years means each dividend buys more shares, which generate more dividends — a powerful compounding loop.` },
      ],
      formulas: [{ name: "DRIP Growth", formula: "FV = P(1+y)^n + PMT×[(1+y)^n−1]/y", variables: [{ symbol: "y", meaning: "Dividend yield (reinvested)" }], example: "$20,000 at 3.5% yield reinvested for 20 years nearly doubles via compounding alone" }],
      faqs: [
        { q: "What is a DRIP?", a: "A Dividend Reinvestment Plan automatically uses cash dividends to purchase additional shares (often fractional), compounding returns without manual trading." },
        { q: "Are reinvested dividends taxed?", a: "Yes, in taxable accounts, dividends are taxed in the year received even if automatically reinvested. Tax-advantaged accounts (401k, IRA) defer or eliminate this." },
      ],
    },
    "mutual-fund": {
      title: "Mutual Fund Inputs",
      defaults: { amount: 10000, rate: 8, years: 15, monthly: 500, extraField: 0.75 },
      fields: [
        { key: "amount", label: "Lump Sum Investment", prefix: "$", min: 0, max: 5000000, step: 500 },
        { key: "monthly", label: "Monthly SIP", prefix: "$", min: 0, max: 50000, step: 50 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 20, step: 0.5 },
        { key: "extraField", label: "Expense Ratio", suffix: "%", min: 0, max: 3, step: 0.05 },
        { key: "years", label: "Investment Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, monthly, extraField, years, currency }) => {
        const netRate = rate - extraField;
        const fv = amount * Math.pow(1 + netRate / 100, years) + futureValueAnnuity(monthly, netRate / 100 / 12, years * 12);
        const totalInvested = amount + monthly * years * 12;
        return { metrics: [
          { label: "Final Value (Net of Fees)", value: formatCurrency(fv, currency), icon: "📈" },
          { label: "Total Invested", value: formatCurrency(totalInvested, currency), icon: "💰" },
          { label: "Net Annual Return", value: formatPercent(netRate), icon: "📊" },
          { label: "Total Growth", value: formatCurrency(fv - totalInvested, currency), icon: "🚀" },
        ]};
      },
      insights: ({ extraField }) => [
        { type: extraField <= 0.5 ? "success" as const : "info" as const, title: "Expense Ratio Check", body: `A ${extraField}% expense ratio is ${extraField <= 0.5 ? "competitive" : "on the higher side — compare against low-cost index fund alternatives"}.` },
      ],
      formulas: [{ name: "Mutual Fund Growth (Net of Fees)", formula: "Net Return = Gross Return − Expense Ratio", variables: [{ symbol: "Expense Ratio", meaning: "Annual fund management fee" }], example: "8% gross return − 0.75% expense ratio = 7.25% net return" }],
      faqs: [
        { q: "Active vs passive mutual funds?", a: "Active funds aim to beat the market but charge higher fees (0.5-1.5%+) and often underperform. Passive index funds track an index at lower cost (0.03-0.2%)." },
      ],
    },
    "etf": {
      title: "ETF Investment Inputs",
      defaults: { amount: 10000, rate: 9, years: 15, monthly: 400, extraField: 0.1 },
      fields: [
        { key: "amount", label: "Initial Investment", prefix: "$", min: 0, max: 5000000, step: 500 },
        { key: "monthly", label: "Monthly Investment", prefix: "$", min: 0, max: 50000, step: 50 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 20, step: 0.5 },
        { key: "extraField", label: "Expense Ratio", suffix: "%", min: 0, max: 2, step: 0.01, tooltip: "ETFs typically charge 0.03-0.5%" },
        { key: "years", label: "Investment Period", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, rate, monthly, extraField, years, currency }) => {
        const netRate = rate - extraField;
        const fv = amount * Math.pow(1 + netRate / 100, years) + futureValueAnnuity(monthly, netRate / 100 / 12, years * 12);
        const totalInvested = amount + monthly * years * 12;
        return { metrics: [
          { label: "Final Value (Net of Fees)", value: formatCurrency(fv, currency), icon: "📈" },
          { label: "Total Invested", value: formatCurrency(totalInvested, currency), icon: "💰" },
          { label: "Net Annual Return", value: formatPercent(netRate), icon: "📊" },
          { label: "Lifetime Fee Cost", value: formatCurrency(amount * Math.pow(1 + rate / 100, years) - fv, currency), icon: "💸" },
        ]};
      },
      insights: ({ extraField }) => [
        { type: "success" as const, title: "Low-Cost Advantage", body: `At ${extraField}% expense ratio, ETFs are typically far cheaper than actively managed mutual funds, preserving more of your returns over time.` },
      ],
      formulas: [{ name: "ETF Growth (Net of Fees)", formula: "Net Return = Gross Return − Expense Ratio", variables: [{ symbol: "Expense Ratio", meaning: "Typically 0.03-0.5% for ETFs vs 0.5-1.5% for active mutual funds" }], example: "9% gross − 0.1% expense ratio = 8.9% net annual return" }],
      faqs: [
        { q: "ETFs vs mutual funds?", a: "ETFs trade like stocks throughout the day and typically have lower expense ratios and better tax efficiency than traditional mutual funds." },
      ],
    },
    "inflation-adjusted-return": {
      title: "Inflation-Adjusted Return Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 10000, rate: 8, years: 1, inflation: 3 },
      fields: [
        { key: "rate", label: "Nominal Annual Return", suffix: "%", min: -10, max: 30, step: 0.5 },
        { key: "inflation", label: "Inflation Rate", suffix: "%", min: 0, max: 15, step: 0.25 },
        { key: "amount", label: "Investment Amount", prefix: "$", min: 100, max: 10000000, step: 500 },
      ],
      compute: ({ rate, inflation, amount, currency }) => {
        const realReturn = ((1 + rate / 100) / (1 + inflation / 100) - 1) * 100;
        return { metrics: [
          { label: "Real (Inflation-Adjusted) Return", value: formatPercent(realReturn), icon: "📊" },
          { label: "Nominal Return", value: formatPercent(rate), icon: "📈" },
          { label: "Inflation Rate", value: formatPercent(inflation), icon: "🔥" },
          { label: "Real Gain (1 yr)", value: formatCurrency(amount * (realReturn / 100), currency), icon: "💰" },
        ]};
      },
      insights: ({ rate, inflation }) => {
        const real = ((1 + rate / 100) / (1 + inflation / 100) - 1) * 100;
        return [{ type: real >= 0 ? "success" as const : "warning" as const, title: real >= 0 ? "Positive Real Return" : "Negative Real Return", body: real >= 0 ? `Your investment is growing ${real.toFixed(2)}% faster than inflation, genuinely increasing your purchasing power.` : `Despite a ${rate}% nominal return, inflation at ${inflation}% means your purchasing power is actually declining by ${Math.abs(real).toFixed(2)}%.` }];
      },
      formulas: [{ name: "Real Return (Fisher Equation)", formula: "Real Return = [(1 + Nominal) / (1 + Inflation)] − 1", variables: [{ symbol: "Nominal", meaning: "Stated investment return" }], example: "8% nominal, 3% inflation: Real = (1.08/1.03) − 1 = 4.85%" }],
      faqs: [
        { q: "Why does real return matter more than nominal?", a: "Nominal returns ignore inflation's erosion of purchasing power. Real return shows your actual increase in what you can buy — the figure that truly matters for long-term wealth building." },
      ],
    },
    "risk-reward": {
      title: "Risk vs Reward Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100, rate: 20, years: 1, extraField: 8, monthly: 100 },
      fields: [
        { key: "amount", label: "Entry Price", prefix: "$", min: 0.01, max: 100000, step: 0.5 },
        { key: "rate", label: "Target Gain", suffix: "%", min: 1, max: 200, step: 1 },
        { key: "extraField", label: "Stop Loss", suffix: "%", min: 1, max: 50, step: 1 },
        { key: "monthly", label: "Shares/Units", min: 1, max: 100000, step: 1 },
      ],
      compute: ({ amount, rate, extraField, monthly, currency }) => {
        const potentialGain = amount * (rate / 100) * monthly;
        const potentialLoss = amount * (extraField / 100) * monthly;
        const ratio = potentialLoss > 0 ? potentialGain / potentialLoss : 0;
        return { metrics: [
          { label: "Risk/Reward Ratio", value: `1:${ratio.toFixed(2)}`, icon: "⚖️" },
          { label: "Potential Gain", value: formatCurrency(potentialGain, currency), icon: "📈" },
          { label: "Potential Loss", value: formatCurrency(potentialLoss, currency), icon: "📉" },
          { label: "Position Size", value: formatCurrency(amount * monthly, currency), icon: "💰" },
        ]};
      },
      insights: ({ rate, extraField }) => {
        const ratio = rate / extraField;
        return [{ type: ratio >= 2 ? "success" as const : "warning" as const, title: ratio >= 2 ? "Favorable Setup" : "Weak Risk/Reward", body: `A ${ratio.toFixed(2)}:1 reward-to-risk ratio is ${ratio >= 2 ? "favorable — many traders look for at least 2:1 before entering a position" : "below the commonly recommended 2:1 minimum; reconsider your entry, target, or stop loss"}.` }];
      },
      formulas: [{ name: "Risk/Reward Ratio", formula: "Ratio = Potential Gain / Potential Loss", variables: [{ symbol: "Potential Gain", meaning: "Entry × Target% × Position Size" }], example: "$2,000 potential gain / $800 potential loss = 2.5:1 ratio" }],
      faqs: [
        { q: "What is a good risk/reward ratio?", a: "Many traders target at least 2:1 or 3:1, meaning the potential reward is 2-3x the risk, allowing profitability even with a win rate below 50%." },
      ],
    },
    "portfolio-return": {
      title: "Portfolio Return Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 100000, rate: 10, years: 1, extraField: 4, monthly: 70 },
      fields: [
        { key: "amount", label: "Portfolio Value", prefix: "$", min: 0, max: 50000000, step: 1000 },
        { key: "monthly", label: "Stock Allocation", suffix: "%", min: 0, max: 100, step: 5 },
        { key: "rate", label: "Stock Return", suffix: "%", min: -20, max: 30, step: 0.5 },
        { key: "extraField", label: "Bond Return", suffix: "%", min: -10, max: 15, step: 0.5 },
      ],
      compute: ({ amount, monthly, rate, extraField, currency }) => {
        const stockPct = monthly / 100;
        const bondPct = 1 - stockPct;
        const weightedReturn = stockPct * rate + bondPct * extraField;
        const gain = amount * (weightedReturn / 100);
        return { metrics: [
          { label: "Weighted Portfolio Return", value: formatPercent(weightedReturn), icon: "⚖️" },
          { label: "Dollar Gain/Loss", value: formatCurrency(gain, currency), icon: gain >= 0 ? "📈" : "📉" },
          { label: "Portfolio Value", value: formatCurrency(amount, currency), icon: "💰" },
          { label: "New Portfolio Value", value: formatCurrency(amount + gain, currency), icon: "🏦" },
        ]};
      },
      insights: ({ monthly }) => [
        { type: "info" as const, title: "Diversification Benefit", body: `A ${monthly}/${100 - monthly} stock/bond split balances growth potential against volatility — the weighted return reflects this blended risk profile.` },
      ],
      formulas: [{ name: "Weighted Portfolio Return", formula: "Return = (Stock% × Stock Return) + (Bond% × Bond Return)", variables: [{ symbol: "Stock%", meaning: "Allocation to stocks" }], example: "70% stocks at 10% + 30% bonds at 4% = 8.2% weighted return" }],
      faqs: [
        { q: "Why calculate a weighted return?", a: "It reflects your actual blended performance across asset classes, more useful for portfolio-level decisions than looking at each asset's return in isolation." },
      ],
    },
    "financial-independence": {
      title: "Financial Independence Inputs",
      defaults: { amount: 60000, rate: 7, years: 20, extraField: 4 },
      fields: [
        { key: "amount", label: "Annual Expenses", prefix: "$", min: 10000, max: 1000000, step: 1000 },
        { key: "extraField", label: "Safe Withdrawal Rate", suffix: "%", min: 2.5, max: 6, step: 0.1 },
        { key: "rate", label: "Expected Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years to FI", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, extraField, currency }) => {
        const fiNumber = amount / (extraField / 100);
        return { metrics: [
          { label: "FI Number", value: formatCurrency(fiNumber, currency), icon: "🔥" },
          { label: "Annual Expenses", value: formatCurrency(amount, currency), icon: "💵" },
          { label: "Monthly Passive Income Needed", value: formatCurrency(amount / 12, currency), icon: "📅" },
          { label: "Withdrawal Rate", value: formatPercent(extraField), icon: "📊" },
        ]};
      },
      insights: ({ amount, currency }) => [
        { type: "info" as const, title: "Your FI Target", body: `To cover ${formatCurrency(amount, currency)}/year in expenses indefinitely, you need a portfolio of roughly 25x your annual spending (at a 4% withdrawal rate).` },
      ],
      formulas: [{ name: "FI Number", formula: "FI Number = Annual Expenses / SWR%", variables: [{ symbol: "SWR", meaning: "Safe withdrawal rate, typically 4%" }], example: "$60,000 / 4% = $1,500,000 FI number" }],
      faqs: [
        { q: "What is financial independence?", a: "Having enough invested assets that the income generated (via withdrawals) covers your living expenses indefinitely, without needing to work." },
        { q: "Is the 4% rule still valid?", a: "It remains a widely used starting point, based on historical market data (Trinity Study). Some recommend 3-3.5% for more conservative, longer retirements." },
      ],
    },
    "retirement-age": {
      title: "Retirement Age Inputs",
      defaults: { amount: 100000, rate: 7, years: 1, monthly: 2000, extraField: 1500000 },
      fields: [
        { key: "amount", label: "Current Savings", prefix: "$", min: 0, max: 10000000, step: 1000 },
        { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 50000, step: 100 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "extraField", label: "Retirement Savings Target", prefix: "$", min: 10000, max: 50000000, step: 10000 },
      ],
      compute: ({ amount, monthly, rate, extraField, currency }) => {
        const r = rate / 100 / 12;
        let balance = amount, months = 0;
        while (balance < extraField && months < 720) { balance = balance * (1 + r) + monthly; months++; }
        return { metrics: [
          { label: "Years to Reach Goal", value: `${(months / 12).toFixed(1)} yrs`, icon: "🎂" },
          { label: "Target Amount", value: formatCurrency(extraField, currency), icon: "🎯" },
          { label: "Current Savings", value: formatCurrency(amount, currency), icon: "💰" },
          { label: "Monthly Contribution", value: formatCurrency(monthly, currency), icon: "📅" },
        ]};
      },
      insights: ({ monthly, currency }) => [
        { type: "info" as const, title: "Accelerate Your Timeline", body: `Increasing your monthly contribution from ${formatCurrency(monthly, currency)} can meaningfully shorten your years to retirement due to compounding.` },
      ],
      formulas: [{ name: "Time to Reach Retirement Goal", formula: "Iteratively: Balance = Balance×(1+r) + Contribution, until Balance ≥ Target", variables: [{ symbol: "Target", meaning: "Your retirement savings goal" }], example: "$100,000 + $2,000/month at 7% reaches $1.5M in ~21 years" }],
      faqs: [
        { q: "How can I retire sooner?", a: "Increase savings rate, reduce expenses (lowering your target number), pursue higher returns (with more risk), or delay retirement age to allow more compounding time." },
      ],
    },
    "fire-progress": {
      title: "FIRE Progress Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 350000, rate: 7, years: 1, monthly: 2500, extraField: 1500000 },
      fields: [
        { key: "amount", label: "Current Portfolio Value", prefix: "$", min: 0, max: 50000000, step: 5000 },
        { key: "extraField", label: "FIRE Target", prefix: "$", min: 10000, max: 50000000, step: 10000 },
        { key: "monthly", label: "Monthly Savings", prefix: "$", min: 0, max: 50000, step: 100 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
      ],
      compute: ({ amount, extraField, monthly, rate, currency }) => {
        const progress = extraField > 0 ? (amount / extraField) * 100 : 0;
        const remaining = Math.max(0, extraField - amount);
        const r = rate / 100 / 12;
        let balance = amount, months = 0;
        while (balance < extraField && months < 720) { balance = balance * (1 + r) + monthly; months++; }
        return { metrics: [
          { label: "FIRE Progress", value: formatPercent(Math.min(100, progress)), icon: "🔥" },
          { label: "Amount Remaining", value: formatCurrency(remaining, currency), icon: "📊" },
          { label: "Years Until FIRE", value: `${(months / 12).toFixed(1)} yrs`, icon: "⏱️" },
          { label: "Current Portfolio", value: formatCurrency(amount, currency), icon: "💰" },
        ]};
      },
      insights: ({ amount, extraField }) => {
        const progress = extraField > 0 ? (amount / extraField) * 100 : 0;
        return [{ type: progress >= 50 ? "success" as const : "info" as const, title: `${progress.toFixed(1)}% to FIRE`, body: progress >= 100 ? "You've reached your FIRE number! Time to plan your transition." : progress >= 50 ? "You're over halfway there — stay consistent and compounding will accelerate your remaining progress." : "Every contribution counts. Compounding accelerates significantly in the later years of your journey." }];
      },
      formulas: [{ name: "FIRE Progress", formula: "Progress % = (Current Portfolio / FIRE Target) × 100", variables: [{ symbol: "FIRE Target", meaning: "Your full financial independence number" }], example: "$350,000 / $1,500,000 = 23.3% progress" }],
      faqs: [
        { q: "Does progress accelerate over time?", a: "Yes — due to compounding, the dollar growth from investment returns becomes larger than your contributions in later years, a phenomenon sometimes called the 'hockey stick' of FIRE." },
      ],
    },
    "pension": {
      title: "Pension Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 80000, rate: 1.5, years: 30, extraField: 0 },
      fields: [
        { key: "amount", label: "Final Average Salary", prefix: "$", min: 10000, max: 1000000, step: 1000 },
        { key: "rate", label: "Pension Multiplier", suffix: "%", min: 0.5, max: 3, step: 0.05, tooltip: "Typically 1-2.5% per year of service" },
        { key: "years", label: "Years of Service", min: 1, max: 50, step: 1 },
        { key: "extraField", label: "Early Retirement Reduction", suffix: "%", min: 0, max: 50, step: 1 },
      ],
      compute: ({ amount, rate, years, extraField, currency }) => {
        const annualPension = amount * (rate / 100) * years * (1 - extraField / 100);
        return { metrics: [
          { label: "Annual Pension", value: formatCurrency(annualPension, currency), icon: "🏛️" },
          { label: "Monthly Pension", value: formatCurrency(annualPension / 12, currency), icon: "📅" },
          { label: "Final Avg Salary", value: formatCurrency(amount, currency), icon: "💼" },
          { label: "Replacement Ratio", value: formatPercent((annualPension / amount) * 100), icon: "📊" },
        ]};
      },
      insights: ({ years }) => [
        { type: "info" as const, title: "Service Years Matter", body: `Your pension scales directly with years of service (${years} years here) — each additional year typically increases your benefit meaningfully.` },
      ],
      formulas: [{ name: "Defined Benefit Pension", formula: "Annual Pension = Final Salary × Multiplier% × Years of Service", variables: [{ symbol: "Multiplier%", meaning: "Plan-specific accrual rate, often 1-2.5%" }], example: "$80,000 salary × 1.5% × 30 years = $36,000/year pension" }],
      faqs: [
        { q: "What is a pension multiplier?", a: "The percentage of your final salary earned per year of service, set by your specific pension plan — common values range from 1% to 2.5%." },
        { q: "How does early retirement affect my pension?", a: "Most plans reduce benefits for retiring before normal retirement age, often by a percentage per year early (e.g., 5-7% per year)." },
      ],
    },
    "social-security": {
      title: "Social Security Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 70000, rate: 1, years: 67, extraField: 2500 },
      fields: [
        { key: "amount", label: "Average Annual Income (35 yrs)", prefix: "$", min: 0, max: 500000, step: 1000 },
        { key: "years", label: "Age at Filing", min: 62, max: 70, step: 1 },
        { key: "extraField", label: "Est. Full Retirement Age Benefit", prefix: "$", min: 0, max: 10000, step: 50, tooltip: "Monthly benefit at full retirement age (~67) from your SSA statement" },
      ],
      compute: ({ years, extraField, currency }) => {
        const fra = 67;
        let adjustment = 1;
        if (years < fra) adjustment = 1 - (fra - years) * 0.06;
        else if (years > fra) adjustment = 1 + (years - fra) * 0.08;
        const monthlyBenefit = extraField * adjustment;
        return { metrics: [
          { label: "Estimated Monthly Benefit", value: formatCurrency(monthlyBenefit, currency), icon: "🏛️" },
          { label: "Annual Benefit", value: formatCurrency(monthlyBenefit * 12, currency), icon: "💰" },
          { label: "FRA Benefit", value: formatCurrency(extraField, currency), sub: "At age 67", icon: "📊" },
          { label: "Filing Age", value: `${years}`, icon: "🎂" },
        ]};
      },
      insights: ({ years }) => [
        { type: years < 67 ? "warning" as const : years > 67 ? "success" as const : "info" as const, title: years < 67 ? "Reduced Benefit" : years > 67 ? "Delayed Credits Boost" : "Full Retirement Age", body: years < 67 ? "Filing before full retirement age (67) permanently reduces your benefit by up to 30% if claimed at 62." : years > 67 ? "Delaying past full retirement age earns 8%/year in delayed retirement credits, up to age 70." : "Filing at your full retirement age gives you 100% of your earned benefit." },
      ],
      formulas: [{ name: "Social Security Benefit Adjustment", formula: "Benefit = FRA Benefit × Adjustment (−6%/yr early, +8%/yr delayed)", variables: [{ symbol: "FRA", meaning: "Full Retirement Age, currently 67 for most" }], example: "$2,500 FRA benefit filed at 70: $2,500 × 1.24 = $3,100/month" }],
      faqs: [
        { q: "When should I claim Social Security?", a: "Depends on health, other income, and longevity expectations. Delaying to 70 maximizes monthly benefit; claiming at 62 provides income sooner but permanently reduced." },
        { q: "How is my benefit calculated?", a: "Based on your highest 35 years of indexed earnings, averaged and run through a progressive formula — higher lifetime earners get a lower replacement percentage." },
      ],
    },
    "safe-withdrawal-rate": {
      title: "Safe Withdrawal Rate Inputs",
      hideChart: true, hideTable: true,
      defaults: { amount: 1000000, rate: 4, years: 30 },
      fields: [
        { key: "amount", label: "Portfolio Value", prefix: "$", min: 10000, max: 50000000, step: 10000 },
        { key: "rate", label: "Withdrawal Rate", suffix: "%", min: 2, max: 8, step: 0.1 },
        { key: "years", label: "Retirement Duration", suffix: "Years", min: 10, max: 60 },
      ],
      compute: ({ amount, rate, years, currency }) => {
        const annualWithdrawal = amount * (rate / 100);
        return { metrics: [
          { label: "Annual Withdrawal", value: formatCurrency(annualWithdrawal, currency), icon: "🏧" },
          { label: "Monthly Withdrawal", value: formatCurrency(annualWithdrawal / 12, currency), icon: "📅" },
          { label: "Portfolio Value", value: formatCurrency(amount, currency), icon: "💰" },
          { label: "Duration", value: `${years} years`, icon: "⏱️" },
        ]};
      },
      insights: ({ rate, years }) => [
        { type: rate <= 4 ? "success" as const : "warning" as const, title: rate <= 4 ? "Conservative & Sustainable" : "Higher Risk of Depletion", body: rate <= 4 ? `A ${rate}% withdrawal rate has historically had a high success rate over ${years}-year periods (based on the Trinity Study).` : `A ${rate}% withdrawal rate carries meaningfully higher risk of portfolio depletion over ${years} years, especially with poor early returns (sequence-of-returns risk).` },
      ],
      formulas: [{ name: "Safe Withdrawal Amount", formula: "Annual Withdrawal = Portfolio × SWR%", variables: [{ symbol: "SWR", meaning: "Safe withdrawal rate, often 3-4.5%" }], example: "$1,000,000 at 4% = $40,000/year sustainable withdrawal" }],
      faqs: [
        { q: "Where does the 4% rule come from?", a: "The Trinity Study (1998) found a 4% initial withdrawal, adjusted for inflation annually, succeeded in ~95% of historical 30-year periods with a 50-75% stock allocation." },
        { q: "Should I use a lower rate for longer retirements?", a: "Yes — for early retirees with 40-50+ year horizons, many recommend 3-3.5% to account for longer sequence-of-returns risk." },
      ],
    },
    "retirement-income": {
      title: "Retirement Income Inputs",
      defaults: { amount: 1200000, rate: 4, years: 25, inflation: 3 },
      fields: [
        { key: "amount", label: "Retirement Portfolio", prefix: "$", min: 10000, max: 50000000, step: 10000 },
        { key: "rate", label: "Withdrawal Rate", suffix: "%", min: 2, max: 8, step: 0.1 },
        { key: "inflation", label: "Inflation Rate", suffix: "%", min: 0, max: 8, step: 0.25 },
        { key: "years", label: "Years in Retirement", suffix: "Years", min: 5, max: 50 },
      ],
      compute: ({ amount, rate, inflation, years, currency }) => {
        const firstYearIncome = amount * (rate / 100);
        const lastYearIncome = firstYearIncome * Math.pow(1 + inflation / 100, years);
        return { metrics: [
          { label: "First-Year Income", value: formatCurrency(firstYearIncome, currency), icon: "🏖️" },
          { label: "Monthly Income (Year 1)", value: formatCurrency(firstYearIncome / 12, currency), icon: "📅" },
          { label: "Final-Year Income (Inflated)", value: formatCurrency(lastYearIncome, currency), sub: `In ${years} years`, icon: "📈" },
          { label: "Portfolio Value", value: formatCurrency(amount, currency), icon: "💰" },
        ]};
      },
      insights: ({ rate }) => [
        { type: "info" as const, title: "Inflation-Adjusted Withdrawals", body: `Your withdrawals should increase with inflation each year to maintain purchasing power, starting from ${rate}% in year one.` },
      ],
      formulas: [{ name: "Retirement Income Projection", formula: "Income(t) = Portfolio × SWR% × (1+inflation)^t", variables: [{ symbol: "SWR", meaning: "Initial safe withdrawal rate" }], example: "$1.2M at 4% = $48,000 year 1, growing with inflation each subsequent year" }],
      faqs: [
        { q: "Should my retirement income increase every year?", a: "Most withdrawal strategies adjust for inflation annually to maintain constant purchasing power, though some retirees use flexible/dynamic withdrawal strategies instead." },
      ],
    },
    "retirement-savings-gap": {
      title: "Retirement Savings Gap Inputs",
      defaults: { amount: 150000, rate: 7, years: 20, monthly: 1500, extraField: 1500000 },
      fields: [
        { key: "amount", label: "Current Retirement Savings", prefix: "$", min: 0, max: 10000000, step: 1000 },
        { key: "extraField", label: "Retirement Savings Needed", prefix: "$", min: 10000, max: 50000000, step: 10000 },
        { key: "monthly", label: "Current Monthly Contribution", prefix: "$", min: 0, max: 50000, step: 100 },
        { key: "rate", label: "Expected Annual Return", suffix: "%", min: 1, max: 15, step: 0.5 },
        { key: "years", label: "Years to Retirement", suffix: "Years", min: 1, max: 50 },
      ],
      compute: ({ amount, extraField, monthly, rate, years, currency }) => {
        const projected = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        const gap = Math.max(0, extraField - projected);
        const r = rate / 100 / 12;
        const n = years * 12;
        const additionalMonthlyNeeded = gap > 0 && n > 0 ? (gap * r) / (Math.pow(1 + r, n) - 1) : 0;
        return { metrics: [
          { label: "Projected Savings", value: formatCurrency(projected, currency), icon: "📈" },
          { label: "Savings Gap", value: formatCurrency(gap, currency), icon: gap > 0 ? "⚠️" : "✅" },
          { label: "Additional Monthly Needed", value: formatCurrency(additionalMonthlyNeeded, currency), icon: "💰" },
          { label: "Target", value: formatCurrency(extraField, currency), icon: "🎯" },
        ]};
      },
      insights: ({ amount, extraField, monthly, rate, years }) => {
        const projected = amount * Math.pow(1 + rate / 100, years) + futureValueAnnuity(monthly, rate / 100 / 12, years * 12);
        return projected >= extraField
          ? [{ type: "success" as const, title: "On Track!", body: "Your current savings rate is projected to meet or exceed your retirement goal — keep up the consistency." }]
          : [{ type: "warning" as const, title: "Gap Identified", body: "Your current trajectory falls short of your goal. Consider increasing contributions, adjusting your target, or extending your timeline." }];
      },
      formulas: [{ name: "Retirement Savings Gap", formula: "Gap = Target − Projected Savings", variables: [{ symbol: "Projected Savings", meaning: "FV of current savings + future contributions" }], example: "$1.5M target − $1.1M projected = $400,000 gap to close" }],
      faqs: [
        { q: "How do I close a retirement savings gap?", a: "Increase monthly contributions, work longer, reduce your target by lowering planned retirement spending, or pursue higher (riskier) investment returns." },
      ],
    },
  };

  return configs[id] || getDefaultConfig(id);
}

function getDefaultConfig(id: string): CalculatorConfig {
  return {
    title: "Calculator Inputs",
    defaults: { amount: 10000, rate: 8, years: 10, monthly: 1000 },
    fields: [
      { key: "amount", label: "Principal Amount", prefix: "$", min: 100, max: 1000000, step: 100, tooltip: "Initial investment or loan amount" },
      { key: "rate", label: "Annual Rate", suffix: "%", min: 0.5, max: 20, step: 0.5, tooltip: "Annual interest or return rate" },
      { key: "years", label: "Duration", suffix: "Years", min: 1, max: 40, tooltip: "Time period in years" },
      { key: "monthly", label: "Monthly Contribution", prefix: "$", min: 0, max: 10000, step: 100, tooltip: "Additional monthly amount" },
      { key: "inflation", label: "Inflation Rate", suffix: "%", min: 0, max: 10, step: 0.5, tooltip: "Expected annual inflation rate" },
    ],
    compute: ({ amount, rate, years, monthly, currency }) => {
      const fv = futureValue(amount, rate / 100, years) + futureValueAnnuity(monthly * 12, rate / 100, years);
      const totalInvested = amount + monthly * years * 12;
      const growth = fv - totalInvested;
      return { metrics: [
        { label: "Future Value", value: formatCurrency(fv, currency), icon: "🎯" },
        { label: "Total Invested", value: formatCurrency(totalInvested, currency), icon: "💰" },
        { label: "Total Growth", value: formatCurrency(growth, currency), icon: "📈" },
        { label: "Return %", value: formatPercent((growth / totalInvested) * 100), icon: "⚡" },
      ]};
    },
    insights: ({ rate, years }) => [
      { type: "info" as const, title: "Investment Summary", body: `At ${rate}% annual return over ${years} years, the power of compounding creates significant wealth growth.` },
    ],
    formulas: [{ name: "Future Value", formula: "FV = PV × (1 + r)^t + PMT × [(1 + r)^t - 1] / r", variables: [{ symbol: "PV", meaning: "Present value (initial amount)" }, { symbol: "r", meaning: "Annual interest rate" }, { symbol: "t", meaning: "Time in years" }, { symbol: "PMT", meaning: "Annual additional payment" }], example: "$10,000 at 8% for 10 years with $1,000/month = substantial growth" }],
    faqs: [
      { q: "How accurate are these calculations?", a: "Our calculators use industry-standard financial formulas. Results are estimates based on your inputs and assume constant rates. Real-world results vary based on market conditions." },
      { q: "Should I consult a financial advisor?", a: "Yes, these calculators are educational tools. For personalized financial advice, especially for major decisions, consult a certified financial planner (CFP)." },
      { q: "Are these calculations inflation-adjusted?", a: "Our calculators show nominal values by default. Use the inflation rate field where available to see real (inflation-adjusted) values." },
    ],
  };
}
