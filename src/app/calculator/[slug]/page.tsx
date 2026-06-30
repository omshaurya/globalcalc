import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CALCULATORS, getCalculatorBySlug } from "@/lib/calculators";
import { getCalculatorComponent } from "@/calculators/registry";
import CalculatorLayout from "@/components/calculator/CalculatorLayout";

export function generateStaticParams() {
  return CALCULATORS.map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const meta = getCalculatorBySlug(params.slug);
  if (!meta) return {};
  return {
    title: meta.seoTitle,
    description: meta.seoDescription,
    keywords: meta.keywords,
    openGraph: {
      title: meta.seoTitle,
      description: meta.seoDescription,
      type: "website",
    },
    alternates: {
      canonical: `/calculator/${meta.slug}`,
    },
  };
}

export default function CalculatorPage({ params }: { params: { slug: string } }) {
  const meta = getCalculatorBySlug(params.slug);
  if (!meta) notFound();

  const CalculatorComponent = getCalculatorComponent(params.slug);
  if (!CalculatorComponent) notFound();

  return (
    <CalculatorLayout meta={meta}>
      <CalculatorComponent meta={meta} />
    </CalculatorLayout>
  );
}
