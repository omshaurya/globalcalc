"use client";
import { Card } from "@/components/ui/Card";

export interface Insight {
  type: "success" | "warning" | "info" | "danger";
  title: string;
  body: string;
}

interface AIInsightsProps {
  insights: Insight[];
  score?: number;
  scoreLabel?: string;
}

const ICONS = { success: "✅", warning: "⚠️", info: "💡", danger: "🚨" };
const COLORS = {
  success: "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10",
  warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-900/10",
  info: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/10",
  danger: "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10",
};

export default function AIInsights({ insights, score, scoreLabel }: AIInsightsProps) {
  if (!insights.length) return null;

  return (
    <Card className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
          <span className="text-white text-base">🤖</span>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">AI Insights</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Personalized analysis based on your inputs</p>
        </div>
        {score !== undefined && (
          <div className="ml-auto text-center">
            <div className="text-2xl font-bold text-[var(--primary)]">{score}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{scoreLabel || "Score"}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className={`rounded-xl border p-4 ${COLORS[insight.type]}`}>
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5 flex-shrink-0">{ICONS[insight.type]}</span>
              <div>
                <p className="font-medium text-sm text-[var(--foreground)]">{insight.title}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{insight.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
