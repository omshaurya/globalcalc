"use client";
import { useState } from "react";
import { type ProjectionYear } from "@/lib/formulas";
import { formatCurrency } from "@/lib/formulas";
import { Card } from "@/components/ui/Card";

interface ProjectionTableProps {
  data: ProjectionYear[];
  title?: string;
  currency?: string;
}

const MILESTONES = [5, 10, 15, 20, 25, 30, 40];

export default function ProjectionTable({ data, title = "Future Projections", currency = "USD" }: ProjectionTableProps) {
  const [showAll, setShowAll] = useState(false);

  const milestoneData = MILESTONES.map(y => data.find(d => data.indexOf(d) === y - 1) || data[data.length - 1]).filter(Boolean) as ProjectionYear[];

  const displayed = showAll ? data : milestoneData;

  return (
    <Card className="mt-6 overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h3 className="font-semibold text-[var(--foreground)]">📅 {title}</h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-[var(--primary)] hover:underline"
        >
          {showAll ? "Show Milestones" : "Show All Years"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Year</th>
              {data[0]?.age !== undefined && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Age</th>
              )}
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Total Value</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Contributions</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Growth</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Real Value</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors">
                <td className="px-4 py-3 font-medium text-[var(--foreground)]">{row.year}</td>
                {row.age !== undefined && (
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.age}</td>
                )}
                <td className="px-4 py-3 text-right font-semibold text-[var(--primary)]">{formatCurrency(row.value, currency)}</td>
                <td className="px-4 py-3 text-right text-[var(--foreground)]">{formatCurrency(row.contributions, currency)}</td>
                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(row.interest, currency)}</td>
                <td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{formatCurrency(row.inflationAdjustedValue, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
