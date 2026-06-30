"use client";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { type CalculatorMeta } from "@/lib/calculators";
import { cagr, futureValue, formatCurrency, formatPercent } from "@/lib/formulas";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, MetricCard } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AIInsights, { type Insight } from "@/components/calculator/AIInsights";
import ExportPanel from "@/components/calculator/ExportPanel";
import FAQSection, { type FAQ } from "@/components/calculator/FAQSection";
import FormulaSection, { type FormulaItem } from "@/components/calculator/FormulaSection";

interface Props { meta: CalculatorMeta }

export default function CAGRCalculator({ meta }: Props) {
  const { currency, symbol } = useCurrency();
  const [mode, setMode] = useState<"calc-cagr" | "calc-fv">("calc-cagr");
  const [beginValue, setBeginValue] = useState(10000);
  const [endValue, setEndValue] = useState(25000);
  const [years, setYears] = useState(10);
  const [cagrRate, setCagrRate] = useState(10);

  const cagrResult = useMemo(() => cagr(beginValue, endValue, years), [beginValue, endValue, years]);
  const fvResult = useMemo(() => futureValue(beginValue, cagrRate / 100, years), [beginValue, cagrRate, years]);

  const chartData = useMemo(() => {
    const r = mode === "calc-cagr" ? cagrResult / 100 : cagrRate / 100;
    return Array.from({ length: years + 1 }, (_, i) => ({
      year: new Date().getFullYear() + i,
      value: Math.round(beginValue * Math.pow(1 + r, i)),
    }));
  }, [beginValue, cagrResult, cagrRate, years, mode]);

  const insights: Insight[] = useMemo(() => {
    const rate = mode === "calc-cagr" ? cagrResult : cagrRate;
    return [
      { type: rate > 15 ? "success" : rate > 8 ? "info" : "warning", title: `${formatPercent(rate)} CAGR`, body: `This is a ${rate > 15 ? "exceptional" : rate > 8 ? "solid" : "modest"} return. S&P 500 historical CAGR is ~10% nominal, ~7% real.` },
      { type: "info", title: "Rule of 72", body: `At ${formatPercent(rate)} CAGR, your money doubles every ${(72 / rate).toFixed(1)} years.` },
    ];
  }, [cagrResult, cagrRate, mode]);

  const faqs: FAQ[] = [
    { q: "What is CAGR?", a: "Compound Annual Growth Rate (CAGR) is the rate at which an investment would have grown if it had grown at a steady rate annually. It's the smoothed annual growth rate." },
    { q: "How is CAGR different from average return?", a: "CAGR accounts for compounding, giving the true growth rate. Average return is the arithmetic mean of annual returns. CAGR is always lower than or equal to average return due to volatility drag." },
    { q: "What is a good CAGR for stocks?", a: "S&P 500 has achieved ~10% CAGR historically. Individual stocks: 15-20%+ is excellent. Anything consistently above 20% over 10+ years is exceptional." },
    { q: "What is the limitation of CAGR?", a: "CAGR assumes smooth, consistent growth, which never happens in reality. It hides volatility. A 0% CAGR could mean flat returns OR it could hide +50% one year and -33% the next." },
  ];

  const formulas: FormulaItem[] = [
    {
      name: "CAGR Formula",
      formula: "CAGR = (End Value / Begin Value)^(1/Years) - 1",
      variables: [{ symbol: "End Value", meaning: "Final investment value" }, { symbol: "Begin Value", meaning: "Initial investment value" }, { symbol: "Years", meaning: "Number of years" }],
      example: "$10,000 growing to $25,000 in 10 years: CAGR = (25,000/10,000)^(1/10) - 1 = 9.6%",
    },
  ];

  const reset = () => { setBeginValue(10000); setEndValue(25000); setYears(10); setCagrRate(10); };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <button onClick={() => setMode("calc-cagr")} className={`rounded-xl px-4 py-2 text-sm font-medium ${mode === "calc-cagr" ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--muted)]"}`}>Calculate CAGR</button>
        <button onClick={() => setMode("calc-fv")} className={`rounded-xl px-4 py-2 text-sm font-medium ${mode === "calc-fv" ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] hover:bg-[var(--muted)]"}`}>Project with CAGR</button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 self-start">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[var(--foreground)]">Inputs</h2>
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          </div>
          <div className="space-y-4">
            <Input label="Beginning Value" prefix={symbol} type="number" value={beginValue} onChange={e => setBeginValue(Number(e.target.value))} showSlider sliderMin={100} sliderMax={1000000} />
            {mode === "calc-cagr" ? (
              <Input label="Ending Value" prefix={symbol} type="number" value={endValue} onChange={e => setEndValue(Number(e.target.value))} showSlider sliderMin={100} sliderMax={5000000} />
            ) : (
              <Input label="CAGR" suffix="%" type="number" value={cagrRate} onChange={e => setCagrRate(Number(e.target.value))} showSlider sliderMin={0.5} sliderMax={30} sliderStep={0.5} />
            )}
            <Input label="Number of Years" suffix="Years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} showSlider sliderMin={1} sliderMax={50} />
          </div>
        </Card>
        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {mode === "calc-cagr" ? (
              <>
                <MetricCard label="CAGR" value={formatPercent(cagrResult)} icon="📐" color="text-[var(--primary)]" />
                <MetricCard label="Total Return" value={formatPercent(((endValue - beginValue) / beginValue) * 100)} icon="📈" />
                <MetricCard label="Absolute Gain" value={formatCurrency(endValue - beginValue, currency)} icon="💰" />
                <MetricCard label="Doubles Every" value={`${(72 / cagrResult).toFixed(1)} yrs`} icon="⏰" />
              </>
            ) : (
              <>
                <MetricCard label="Future Value" value={formatCurrency(fvResult, currency)} icon="🎯" color="text-[var(--primary)]" />
                <MetricCard label="Total Growth" value={formatCurrency(fvResult - beginValue, currency)} icon="📈" />
                <MetricCard label="Multiplier" value={`${(fvResult / beginValue).toFixed(2)}×`} icon="⚡" />
                <MetricCard label="Return %" value={formatPercent(((fvResult - beginValue) / beginValue) * 100)} icon="💹" />
              </>
            )}
          </div>
          <Card>
            <h3 className="font-medium text-[var(--foreground)] mb-4">Growth Projection</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => formatCurrency(v, currency, true)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Legend />
                <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
      <AIInsights insights={insights} />
      <ExportPanel title={meta.name} data={mode === "calc-cagr" ? { "Begin Value": formatCurrency(beginValue, currency), "End Value": formatCurrency(endValue, currency), "Duration": `${years} years`, "CAGR": formatPercent(cagrResult), "Total Return": formatPercent(((endValue - beginValue) / beginValue) * 100) } : { "Begin Value": formatCurrency(beginValue, currency), "CAGR": formatPercent(cagrRate), "Duration": `${years} years`, "Future Value": formatCurrency(fvResult, currency) }} />
      <FormulaSection formulas={formulas} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
