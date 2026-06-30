import { type CalculatorMeta, CATEGORY_META } from "@/lib/calculators";

interface StructuredDataProps {
  meta: CalculatorMeta;
  faqs?: { q: string; a: string }[];
}

export default function StructuredData({ meta, faqs }: StructuredDataProps) {
  const baseUrl = "https://fincalcpro.com";
  const catMeta = CATEGORY_META[meta.category];

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": meta.seoTitle,
    "description": meta.seoDescription,
    "url": `${baseUrl}/calculator/${meta.slug}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": "Calculators", "item": `${baseUrl}/calculators` },
        { "@type": "ListItem", "position": 3, "name": catMeta.name, "item": `${baseUrl}/category/${meta.category}` },
        { "@type": "ListItem", "position": 4, "name": meta.name, "item": `${baseUrl}/calculator/${meta.slug}` },
      ],
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": meta.name,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "description": meta.description,
    "url": `${baseUrl}/calculator/${meta.slug}`,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1247",
      "bestRating": "5",
    },
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    </>
  );
}
