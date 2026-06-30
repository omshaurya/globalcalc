import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCalculatorsByCategory, CATEGORY_META, getAllCategories, type CalculatorCategory } from "@/lib/calculators";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function generateStaticParams() {
  return getAllCategories().map(category => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const meta = CATEGORY_META[params.category as CalculatorCategory];
  if (!meta) return {};
  return {
    title: `${meta.name} Calculators`,
    description: `${meta.description}. Browse ${getCalculatorsByCategory(params.category as CalculatorCategory).length} free ${meta.name.toLowerCase()} calculators.`,
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = params.category as CalculatorCategory;
  const meta = CATEGORY_META[cat];
  if (!meta) notFound();

  const calcs = getCalculatorsByCategory(cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className={`rounded-3xl bg-gradient-to-br ${meta.color} p-8 mb-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[var(--background)] opacity-85 rounded-3xl" />
        <div className="relative">
          <nav className="text-xs text-[var(--muted-foreground)] mb-4">
            <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
            {" / "}
            <Link href="/calculators" className="hover:text-[var(--foreground)]">Calculators</Link>
            {" / "}
            <span className="text-[var(--foreground)]">{meta.name}</span>
          </nav>
          <div className="text-4xl mb-3">{meta.icon}</div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{meta.name} Calculators</h1>
          <p className="text-[var(--muted-foreground)] max-w-2xl">{meta.description}</p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{calcs.length} calculators in this category</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calcs.map(calc => (
          <Link key={calc.id} href={`/calculator/${calc.slug}`} className="group">
            <Card hover className="h-full">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${calc.color} text-xl`}>{calc.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{calc.name}</h2>
                    {calc.popular && <Badge variant="success" className="text-[10px] px-1.5 py-0">Popular</Badge>}
                    {calc.featured && <Badge variant="warning" className="text-[10px] px-1.5 py-0">Featured</Badge>}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">{calc.shortDescription}</p>
                  {calc.timeToComplete && <p className="text-xs text-[var(--muted-foreground)] mt-2">⏱ {calc.timeToComplete}</p>}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
