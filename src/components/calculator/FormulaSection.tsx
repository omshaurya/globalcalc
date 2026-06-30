import { Card } from "@/components/ui/Card";

export interface FormulaItem {
  name: string;
  formula: string;
  variables: { symbol: string; meaning: string }[];
  example?: string;
}

export default function FormulaSection({ formulas, title = "Formula Used" }: { formulas: FormulaItem[]; title?: string }) {
  return (
    <section className="mt-12" aria-labelledby="formula-heading">
      <h2 id="formula-heading" className="text-2xl font-bold text-[var(--foreground)] mb-6">{title}</h2>
      <div className="space-y-6">
        {formulas.map((f, i) => (
          <Card key={i}>
            <h3 className="font-semibold text-[var(--foreground)] mb-3">{f.name}</h3>
            <div className="rounded-xl bg-[var(--muted)] p-4 font-mono text-sm text-[var(--foreground)] overflow-x-auto mb-4">
              {f.formula}
            </div>
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Variables</p>
              {f.variables.map((v, j) => (
                <div key={j} className="flex items-center gap-2 text-sm">
                  <code className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-[var(--primary)] text-xs">{v.symbol}</code>
                  <span className="text-[var(--muted-foreground)]">= {v.meaning}</span>
                </div>
              ))}
            </div>
            {f.example && (
              <div className="rounded-xl border border-[var(--border)] p-3">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">Example</p>
                <p className="text-sm text-[var(--foreground)]">{f.example}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
